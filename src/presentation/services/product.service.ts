import { UploadedFile } from "express-fileupload";
import { ProductModel } from "../../data";
import { CreateProductDto, CustomError, PaginationDto } from "../../domain";
import { FileUploadService } from "./file-upload.service";
import { UpdateProductDto } from "../../domain/dtos/products/update-product.dto";

export class ProductService {

    constructor(
        private readonly fileUploadService = new FileUploadService()
    ) { }

    async createProduct(createProductDto: CreateProductDto, files?: UploadedFile[]) {

        const codigoExist = await ProductModel.findOne({ codigo: createProductDto.codigo })
        if (codigoExist) throw CustomError.badRequest('Codigo already exists');

        try {

            let imageNames: string[] = [];
            if (files && files.length > 0) {
                imageNames = (await this.fileUploadService.uploadMultiple(
                    files,
                    'uploads/products',
                    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
                    createProductDto.name
                )).map(res => res.fileName);
            }
            const product = new ProductModel({
                ...createProductDto,
                img: imageNames
            });

            const savedProduct = await product.save();
            await savedProduct.populate('category');

            return savedProduct;

        } catch (error) {
            throw CustomError.internarlServer(`${error}`);
        }
    }

    async getProduct(paginationDto: PaginationDto, isAuthenticated: boolean = true) {
        const { page, limit } = paginationDto;

        try {
            const [total, products] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('category')
                    .populate('user')
            ]);


            if (!isAuthenticated) {
                return {
                    page: page,
                    limit: limit,
                    total: total,
                    products: products.map(product => ({
                        id: product._id,
                        img: product.img,
                        name: product.name,
                        title: product.title,
                        codigo: product.codigo,
                        description: product.description,
                        category: product.category,
                        available: product.available,
                    }))
                };
            }

            return {
                page: page,
                limit: limit,
                total: total,
                products: products
            };

        } catch (error) {
            throw CustomError.internarlServer('Internal server error');
        }
    }

    async updateProduct(id: string, updateProductDto: UpdateProductDto, files?: UploadedFile[]) {

        if (updateProductDto.codigo != null) {
            const codigoExist = await ProductModel.findOne({
                codigo: updateProductDto.codigo,
                _id: { $ne: id }
            });
            if (codigoExist) throw CustomError.badRequest('Código ya existe');
        }
        
        try {
            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                throw CustomError.notFound('Product not found');
            }

            let currentImages: string[] = [];
            if (updateProductDto.img) {
                if (typeof updateProductDto.img === 'string') {
                    try {
                        currentImages = JSON.parse(updateProductDto.img);
                    } catch (e) {
                        currentImages = [updateProductDto.img];
                    }
                } else if (Array.isArray(updateProductDto.img)) {
                    currentImages = updateProductDto.img;
                }
            }

            const previousImages = existingProduct.img ? existingProduct.img : [];
            const imagesToDelete = previousImages.filter(img => !currentImages.includes(img));

            let newImageNames: string[] = [];
            if (files && files.length > 0) {

                const uploaded = await this.fileUploadService.uploadMultiple(
                    files,
                    'uploads/products',
                    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
                    existingProduct.name
                );
                newImageNames = uploaded.map(res => res.fileName);
            }

            const finalImages = [...currentImages, ...newImageNames];

            const updatedProduct = await ProductModel.findByIdAndUpdate(
                id,
                {
                    ...updateProductDto,
                    img: finalImages
                },
                { new: true }
            )
                .populate('category')
                .populate('user');

            if (!updatedProduct) {
                throw CustomError.badRequest('Could not update product');
            }

            // Opcional: eliminar las imágenes físicas que ya no se usan
            // if (imagesToDelete.length > 0) {
            //     await this.fileUploadService.deleteMultiple(imagesToDelete);
            // }

            return updatedProduct;

        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw CustomError.internarlServer(`${error}`);
        }
    }

    async deleteProduct(id: string) {
        try {
            const product = await ProductModel.findByIdAndDelete(id);
            if (!product) {
                throw CustomError.notFound('Product not found');
            }
            return product;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw CustomError.internarlServer(`${error}`);
        }
    }
}
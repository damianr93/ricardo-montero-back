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

        const productExists = await ProductModel.findOne({ name: createProductDto.name });
        if (productExists) throw CustomError.badRequest('Product already exists');

        try {
            // Subir la imagen si existe
            let imageNames: string[] = [];
            if (files && files.length > 0) {
                imageNames = (await this.fileUploadService.uploadMultiple(files, 'uploads/products'))
                    .map(res => res.fileName);
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
                        description: product.description,
                        category: product.category,
                        available: product.available,
                    }))
                };
            }

            // Si el usuario está autenticado, devolvemos todos los datos
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
        try {
            // Verificar si el producto existe
            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                throw CustomError.notFound('Product not found');
            }
            const currentImages = updateProductDto.img ? updateProductDto.img : [];
            const previousImages = existingProduct.img ? existingProduct.img : [];
            const imagesToDelete = previousImages.filter(img => !currentImages.includes(img));

            let imageNames: string[] = [];

            if (files && files.length > 0) {
                const uploaded = await this.fileUploadService.uploadMultiple(files, 'uploads/products');
                imageNames = uploaded.map(res => res.fileName);
            }

            // Combinar anteriores con nuevas
            const combinedImages = [...previousImages, ...imageNames];
            const newImagenes = combinedImages.filter(img => !imagesToDelete.includes(img))
            const updatedProduct = await ProductModel.findByIdAndUpdate(
                id,
                {
                    ...updateProductDto,
                    img: newImagenes
                },
                { new: true }
            )
                .populate('category')
                .populate('user');

            if (!updatedProduct) {
                throw CustomError.badRequest('Could not update product');
            }

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
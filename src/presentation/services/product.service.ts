import { UploadedFile } from "express-fileupload";
import { ProductModel } from "../../data";
import { CreateProductDto, CustomError, PaginationDto } from "../../domain";
import { FileUploadService } from "./file-upload.service";
import { UpdateProductDto } from "../../domain/dtos/products/update-product.dto";

export class ProductService {

    constructor(
        private readonly fileUploadService = new FileUploadService()
    ) { }

    async createProduct(createProductDto: CreateProductDto, file?: UploadedFile) {

        const productExists = await ProductModel.findOne({ name: createProductDto.name });
        if (productExists) throw CustomError.badRequest('Product already exists');

        try {
            // Subir la imagen si existe
            let imageFileName: string | undefined;
            if (file) {
                const { fileName } = await this.fileUploadService.uploadSingle(file, 'uploads/products');
                imageFileName = fileName;
            }

            const product = new ProductModel({
                ...createProductDto,
                img: imageFileName
            });

            await product.save();

            return product;

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

    async updateProduct(id: string, updateProductDto: UpdateProductDto, file?: UploadedFile) {
        try {
            // Verificar si el producto existe
            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                throw CustomError.notFound('Product not found');
            }
            
            let imageUpdate = {};
            if (file) {
                const { fileName } = await this.fileUploadService.uploadSingle(file, 'uploads/products');
                imageUpdate = { img: fileName };

            }

            // Actualizar el producto con los nuevos datos y la imagen si existe
            const updatedProduct = await ProductModel.findByIdAndUpdate(
                id,
                {
                    ...updateProductDto,
                    ...imageUpdate
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
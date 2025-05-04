import { UploadedFile } from "express-fileupload";
import { ProductModel } from "../../data";
import { CreateProductDto, CustomError, PaginationDto } from "../../domain";
import { FileUploadService } from "./file-upload.service";
import { UpdateProductDto } from "../../domain/dtos/products/update-product.dto";

export class ProductService {

    constructor(
        private readonly fileUploadService = new FileUploadService()
    ){}

    async createProduct(createProductDto: CreateProductDto, file?: UploadedFile) {

        const productExists = await ProductModel.findOne({name: createProductDto.name});
        if(productExists) throw CustomError.badRequest('Product already exists');

        try {
            // Subir la imagen si existe
            let imageFileName: string | undefined;
            if (file) {
                const { fileName } = await this.fileUploadService.uploadSingle(file, '/uploads/products');
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

    async getProduct(paginationDto: PaginationDto) {

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

            // Subir imagen si se proporciona
            let imageUpdate = {};
            if (file) {
                const { fileName } = await this.fileUploadService.uploadSingle(file, '/uploads/products');
                imageUpdate = { img: fileName };
                
                // Si hay una imagen anterior, podríamos eliminarla aquí
                // Si existingProduct.img tiene valor, podríamos borrar ese archivo
                // pero primero verifica que el archivo exista
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
}
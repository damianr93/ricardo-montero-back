import { UploadedFile } from "express-fileupload";
import { ProductModel, CategoryModel } from "../../data";
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

    async importProducts(products: any[], userId: string) {
        try {
            let updated = 0;
            let notFound = 0;
            let errors: string[] = [];

            for (const productData of products) {
                try {
                    // Buscar producto existente por ID (único identificador inmutable)
                    let existingProduct = null;
                    
                    if (productData.id) {
                        existingProduct = await ProductModel.findById(productData.id);
                    } else {
                        console.log(`Error: Producto sin ID - ${productData.name}`);
                    }

                    if (existingProduct) {
                        // Buscar la categoría por nombre si viene como string
                        let categoryId = productData.category;
                        if (typeof productData.category === 'string') {
                            const category = await CategoryModel.findOne({ name: productData.category });
                            if (category) {
                                categoryId = category._id;
                            } else {
                                categoryId = existingProduct.category; // Mantener la categoría actual
                            }
                        }

                        // Preparar datos del Excel
                        const excelData = {
                            name: productData.name,
                            title: productData.title || '',
                            description: productData.description || '',
                            codigo: productData.codigo || '',
                            price: Number(productData.price),
                            available: Boolean(productData.available),
                            category: categoryId,
                            img: productData.img ? (typeof productData.img === 'string' ? productData.img.split(',').map((s: string) => s.trim()) : productData.img) : []
                        };

                        // Comparar con datos existentes para detectar cambios
                        const hasChanges = 
                            existingProduct.name !== excelData.name ||
                            existingProduct.title !== excelData.title ||
                            existingProduct.description !== excelData.description ||
                            existingProduct.codigo !== excelData.codigo ||
                            existingProduct.price !== excelData.price ||
                            existingProduct.available !== excelData.available ||
                            String(existingProduct.category) !== String(excelData.category) ||
                            JSON.stringify(existingProduct.img) !== JSON.stringify(excelData.img);

                        if (hasChanges) {
                            try {
                                const result = await ProductModel.findByIdAndUpdate(existingProduct._id, excelData, { new: true });
                                
                                if (result) {
                                    updated++;
                                }
                            } catch (updateError: any) {
                                errors.push(`Error actualizando producto "${productData.name}": ${updateError.message}`);
                            }
                        }
                    } else {
                        // Producto no encontrado - no crear nuevos, solo reportar
                        notFound++;
                        errors.push(`Producto no encontrado: "${productData.name}" (código: ${productData.codigo})`);
                    }
                } catch (error: any) {
                    errors.push(`Error procesando producto "${productData.name}": ${error.message}`);
                }
            }

            console.log(`Importación completada: ${updated} actualizados, ${notFound} no encontrados, ${products.length} total`);
            
            return {
                updated,
                notFound,
                total: products.length,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw CustomError.internarlServer(`Error importing products: ${error}`);
        }
    }
}
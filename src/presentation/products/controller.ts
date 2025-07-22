import { Request, Response } from "express";
import { CreateProductDto, CustomError, PaginationDto } from "../../domain";
import { ProductService } from "../services/product.service";
import { UploadedFile } from "express-fileupload";
import { UpdateProductDto } from "../../domain/dtos/products/update-product.dto";

export class ProductController {

    //*DI
    constructor(
        private readonly productService: ProductService,
    ) { };

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        };

        return res.status(500).json({ error: 'Internal Server Error' });
    };

    createProduct = async (req: Request, res: Response) => {

        const user = (req as any).user;
        if (!user.role || user.role[0] !== 'ADMIN_ROLE') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to create products.' });
        }

        const [error, createProductDto] = CreateProductDto.create({

            ...req.body,
            user: (req as any).user.id

        });

        if (error) return res.status(400).json(error);

        let files: UploadedFile[] = [];
        if (req.files && typeof req.files === 'object') {

            const fileFields = ['img', 'image', 'images'];

            fileFields.forEach(field => {
                const value = req.files![field];
                if (value) {
                    if (Array.isArray(value)) {
                        files.push(...value);
                    } else {
                        files.push(value);
                    }
                }
            });

            if (files.length === 0) {
                Object.values(req.files).forEach(file => {
                    if (Array.isArray(file)) {
                        files.push(...file);
                    } else {
                        files.push(file);
                    }
                });
            }
        }

        this.productService.createProduct(createProductDto!, files)
            .then(product => res.status(201).json(product))
            .catch(error => this.handleError(error, res))
    };

    getProduct = async (req: Request, res: Response) => {

        const { page = 1, limit = 1000 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit)
        if (error) return res.status(400).json({ error })

        const isAuthenticated = (req as any).user !== undefined;

        this.productService.getProduct(paginationDto!, isAuthenticated)
            .then(products => res.json(products))
            .catch(error => this.handleError(error, res))
    };


    updateProduct = async (req: Request, res: Response) => {
        const { id } = req.params;
        const user = (req as any).user;
        if (!user.role || user.role[0] !== 'ADMIN_ROLE') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to edit products.' });
        }

        const [error, updateProductDto] = UpdateProductDto.create({
            ...req.body,
            user: (req as any).user.id
        });

        if (error) return res.status(400).json(error);

        // Manejar la imagen si existe
        let files: UploadedFile[] = [];
        if (req.files && typeof req.files === 'object') {
            // Aceptar múltiples imágenes bajo el campo 'images' o 'img'
            const fileFields = ['img', 'image', 'images'];

            fileFields.forEach(field => {
                const value = req.files![field];
                if (value) {
                    if (Array.isArray(value)) {
                        files.push(...value);
                    } else {
                        files.push(value);
                    }
                }
            });

            // Si no hay coincidencias directas, tomamos todos los archivos del objeto
            if (files.length === 0) {
                Object.values(req.files).forEach(file => {
                    if (Array.isArray(file)) {
                        files.push(...file);
                    } else {
                        files.push(file);
                    }
                });
            }
        }
        this.productService.updateProduct(id, updateProductDto!, files)
            .then(product => res.json(product))
            .catch(error => this.handleError(error, res))
    };

    deleteProduct = async (req: Request, res: Response) => {
        const { id } = req.params;
        const user = (req as any).user;
        if (!user.role || user.role[0] !== 'ADMIN_ROLE') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to delete products.' });
        }

        this.productService.deleteProduct(id)
            .then(() => res.status(204).json({}))
            .catch(error => this.handleError(error, res))
    };

};
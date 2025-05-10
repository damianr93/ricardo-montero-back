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

        const [error, createProductDto] = CreateProductDto.create({

            ...req.body,
            user: (req as any).user.id

        });

        if (error) return res.status(400).json(error);

        // Manejar la imagen si existe
        let file: UploadedFile | undefined;
        if (req.files && typeof req.files === 'object') {
            // Si hay un campo específico llamado 'img' o 'image'
            if ('img' in req.files) {
                file = req.files.img as UploadedFile;
            } else if ('image' in req.files) {
                file = req.files.image as UploadedFile;
            } else {
                // Obtener el primer archivo de cualquier campo
                const fileKeys = Object.keys(req.files);
                if (fileKeys.length > 0) {
                    const firstFileField = req.files[fileKeys[0]];
                    file = Array.isArray(firstFileField) ? firstFileField[0] : firstFileField;
                }
            }
        }

        this.productService.createProduct(createProductDto!, file)
            .then(product => res.status(201).json(product))
            .catch(error => this.handleError(error, res))
    };

    getProduct = async (req: Request, res: Response) => {

        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit)
        if (error) return res.status(400).json({ error })

        const isAuthenticated = (req as any).user !== undefined;
 
        this.productService.getProduct(paginationDto!, isAuthenticated)
            .then(products => res.json(products))
            .catch(error => this.handleError(error, res))
    };


    updateProduct = async (req: Request, res: Response) => {
        const { id } = req.params;

        const [error, updateProductDto] = UpdateProductDto.create({
            ...req.body,
            user: (req as any).user.id
        });

        if (error) return res.status(400).json(error);

        // Manejar la imagen si existe
        let file: UploadedFile | undefined;
        if (req.files && typeof req.files === 'object') {
            // Si hay un campo específico llamado 'img' o 'image'
            if ('img' in req.files) {
                file = req.files.img as UploadedFile;
            } else if ('image' in req.files) {
                file = req.files.image as UploadedFile;
            } else {
                // Obtener el primer archivo de cualquier campo
                const fileKeys = Object.keys(req.files);
                if (fileKeys.length > 0) {
                    const firstFileField = req.files[fileKeys[0]];
                    file = Array.isArray(firstFileField) ? firstFileField[0] : firstFileField;
                }
            }
        }

        this.productService.updateProduct(id, updateProductDto!, file)
            .then(product => res.json(product))
            .catch(error => this.handleError(error, res))
    };

    deleteProduct = async (req: Request, res: Response) => {
        const { id } = req.params;

        this.productService.deleteProduct(id)
            .then(() => res.status(204).json({}))
            .catch(error => this.handleError(error, res))
    };

};
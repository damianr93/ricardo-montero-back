import { Request, Response } from "express";
import { CreateCategoryDto, CustomError, PaginationDto } from "../../domain";
import { CategoryService } from "../services/category.service";
import { UpdateCategoryDto } from "../../domain/dtos/category/update-category.dto";




export class CategoryController {

    //*DI
    constructor(
        private readonly categoryService: CategoryService,
    ) { };

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        };

        return res.status(500).json({ error: 'Internal Server Error' });
    };

    createCategory = async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user.role || user.role[0] !== 'ADMIN_ROLE') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to create category.' });
        }

        const [error, createCategoryDto] = CreateCategoryDto.create(req.body)
        if (error) return res.status(400).json(error)

        this.categoryService.createCategory(createCategoryDto!, (req as any).user.id)
            .then(category => res.status(201).json(category))
            .catch(error => this.handleError(error, res))
    };

    getCategory = async (req: Request, res: Response) => {

        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit)
        if (error) return res.status(400).json({ error })

        this.categoryService.getCategories(paginationDto!)
            .then(categories => res.json(categories))
            .catch(error => this.handleError(error, res))
    };

    updateCategory = async (req: Request, res: Response) => {
        const { id } = req.params
        const user = (req as any).user;
        if (!user.role || user.role[0] !== 'ADMIN_ROLE') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to update category.' });
        }

        const [error, updateCategory] = UpdateCategoryDto.update(req.body)

        if (error) return res.status(400).json(error)

        this.categoryService.updateCategory(id, updateCategory!, (req as any).user.id)
            .then(category => res.status(201).json(category))
            .catch(error => this.handleError(error, res))
    };

    deleteCategory = async (req: Request, res: Response) => {

        const { id } = req.params
        const user = (req as any).user;
        if (!user.role || user.role[0] !== 'ADMIN_ROLE') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to delete category.' });
        }


        this.categoryService.deleteCategory(id)
            .then(() => res.status(204).json({}))
            .catch(error => this.handleError(error, res))

    }

};
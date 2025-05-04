import { CategoryModel } from "../../data";
import { CreateCategoryDto, CustomError, PaginationDto, UserEntity } from "../../domain";
import { UpdateCategoryDto } from "../../domain/dtos/category/update-category.dto";



export class CategoryService {

    constructor() { }

    async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity) {

        const categoryExists = await CategoryModel.findOne({ name: createCategoryDto.name });
        if (categoryExists) throw CustomError.badRequest('category already exists');

        try {

            const category = new CategoryModel({
                ...createCategoryDto,
                user: user.id
            });

            await category.save()

            return {
                id: category.id,
                name: category.name,
                available: category.available
            };

        } catch (error) {
            throw CustomError.internarlServer(`${error}`)
        };

    };

    async getCategories(paginationDto: PaginationDto) {

        const { page, limit } = paginationDto;

        try {

            const [total, categories] = await Promise.all([
                await CategoryModel.countDocuments(),
                await CategoryModel.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
            ])

            return {
                page: page,
                limit: limit,
                total: total,

                categories: categories.map(category => ({
                    id: category.id,
                    name: category.name,
                    available: category.available
                }))

            }


        } catch (error) {

            throw CustomError.internarlServer('Internal server error');

        };

    };

    async updateCategory(id: string, udpateCategoryDto: UpdateCategoryDto, user: UserEntity) {

        const categoryExists = await CategoryModel.findById(id);
        if (!categoryExists) throw CustomError.badRequest('Category not found');

        try {
            const updatedCategory = await CategoryModel.findByIdAndUpdate(
                id,
                {
                    ...udpateCategoryDto,
                    user: user.id
                },
                { new: true }
            );

            if (!updatedCategory) throw CustomError.badRequest('Cannot update category');

            return {
                id: updatedCategory.id,
                name: updatedCategory.name,
                available: updatedCategory.available
            };

        } catch (error) {
            throw CustomError.internarlServer(`${error}`);
        }
    };

};
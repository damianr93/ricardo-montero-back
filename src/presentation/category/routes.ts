import { Router } from 'express';
import { CategoryController } from './controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { CategoryService } from '../services/category.service';

export class CategoryRoutes {


  static get routes(): Router {

    const router = Router();
    const categoryService = new CategoryService()
    const controller = new CategoryController(categoryService)
    
    // Rutas
    router.get('/', controller.getCategory);
    router.post('/', [AuthMiddleware.validateJWT] , controller.createCategory);
    router.patch('/:id', [AuthMiddleware.validateJWT] , controller.updateCategory)


    return router;
  }


}

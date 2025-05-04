import { Router } from 'express';
import { ProductController } from './controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ProductService } from '../services/product.service';


export class ProductRoutes {


  static get routes(): Router {

    const router = Router();
    const productService = new ProductService()
    const productController = new ProductController(productService)

    
    // Definir las rutas
    router.get('/', productController.getProduct);
    router.post('/', [AuthMiddleware.validateJWT], productController.createProduct);
    router.patch('/:id', [AuthMiddleware.validateJWT], productController.updateProduct);


    return router;
  }


}

import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { FileUploadController } from './controller';
import { FileUploadService } from '../services/file-upload.service';
import { FileUploadMiddleware } from '../middleware/file-upload.middleware';
import { TypeMiddleware } from '../middleware/type.middleware';

export class FileUploadRoutes {


  static get routes(): Router {

    const router = Router();
    const controller = new FileUploadController(
      new FileUploadService()
    )

    router.use(FileUploadMiddleware.containFiles);
    router.use(TypeMiddleware.validType(['users','products','categories']));

    
    // Definir las rutas
    router.post('/single/:type', controller.uploadFile);
    router.post('/multiple/:type', controller.uploadMultipleFile);


    return router;
  }


}

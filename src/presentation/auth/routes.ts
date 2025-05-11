import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService } from '../services';
import { FileUploadService } from '../services/file-upload.service';
import { AuthMiddleware } from '../middleware/auth.middleware';




export class AuthRoutes {


  static get routes(): Router {

    const router = Router();

    // const emailService = new EmailService(
    //   envs.MAILER_SERVICE,
    //   envs.MAILER_EMAIL,
    //   envs.MAILER_SECRET_KEY,
    //   envs.SEND_EMAIL
    // )

    const fileUploadService = new FileUploadService();
    const authService = new AuthService(fileUploadService) //emailService

    const controller = new AuthController(authService)

    // Definir las rutas
    router.post('/login', controller.loginUser);
    router.post('/register', controller.registerUser);
    router.patch('/update/:id', AuthMiddleware.validateJWT, controller.updateUser);
    router.put('/me', AuthMiddleware.validateJWT, controller.me);
    router.post('/logout',controller.logoutUser);

    // router.get('/validate-email/:token', controller.valitateEmail );

    return router;
  }


}


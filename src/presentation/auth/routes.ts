import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService } from '../services';
import { FileUploadService } from '../services/file-upload.service';
import { EmailService } from '../services/email.service';
import { AuthMiddleware } from '../middleware/auth.middleware';

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    const emailService = new EmailService();
    const fileUploadService = new FileUploadService();
    const authService = new AuthService(fileUploadService, emailService);
    const controller = new AuthController(authService);

    router.post('/login', controller.loginUser);
    router.post('/register', controller.registerUser);
    router.patch('/update/:id', AuthMiddleware.validateJWT, controller.updateUser);
    router.put('/me', AuthMiddleware.validateJWT, controller.me);
    router.post('/logout', controller.logoutUser);

    router.post('/forgot-password', controller.forgotPassword);
    router.post('/reset-password', controller.resetPassword);

    router.get('/approve-user/:token', controller.approveUser);
    router.get('/reject-user/:token', controller.rejectUser);

    return router;
  }
}
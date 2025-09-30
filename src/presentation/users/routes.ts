import { Router } from 'express';
import { UserController } from './controller';
import { UserService } from '../services/user.service';
import { AuthMiddleware } from '../middleware/auth.middleware';

export class UserRoutes {
  static get routes(): Router {
    const router = Router();
    
    const userService = new UserService();
    const userController = new UserController(userService);

    // Todas las rutas requieren autenticación
    router.use(AuthMiddleware.validateJWT);
    
    // Todas las rutas requieren permisos de administrador
    router.use(AuthMiddleware.requireAdmin);

    // Rutas de usuarios
    router.get('/', userController.getUsers);
    router.get('/:id', userController.getUserById);
    router.post('/', userController.createUser);
    router.patch('/:id', userController.updateUser);
    router.patch('/:id/approval', userController.updateUserApproval);
    router.delete('/:id', userController.deleteUser);

    return router;
  }
}

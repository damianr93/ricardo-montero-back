import { Router } from 'express';
import { SettingController } from './controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { SettingService } from '../services/setting.service';

export class SettingRoutes {


  static get routes(): Router {

    const router = Router();
    const settingService = new SettingService();
    const controller = new SettingController(settingService);

    // Rutas
    router.get('/', controller.getSettings);
    router.patch('/', [AuthMiddleware.validateJWT], controller.updateSettings);


    return router;
  }


}

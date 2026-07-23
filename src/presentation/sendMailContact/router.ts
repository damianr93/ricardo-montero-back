// File: src/routes/sendEmailRouter.ts
import { Router, Request, Response, NextFunction } from 'express';
import { EmailService } from '../services/email.service';
import { SettingService } from '../services/setting.service';
import { envs } from '../../config/envs';
import { SendOrderController } from './controller';
import { sendEmailLimiter } from '../middleware/rate-limit.middleware';



const emailService = new EmailService();
const settingService = new SettingService();


const controller = new SendOrderController(emailService, settingService);


const sendEmailRouter = Router();
sendEmailRouter.post(
  '/',
  sendEmailLimiter,
  (req: Request, res: Response, next: NextFunction) => {
    controller.sendOrder(req, res, next).catch(next);
  },
);

sendEmailRouter.post(
  '/contact',
  sendEmailLimiter,
  (req: Request, res: Response, next: NextFunction) => {
    controller.sendContact(req, res, next).catch(next);
  },
);


export default sendEmailRouter;
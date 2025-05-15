// File: src/routes/sendEmailRouter.ts
import { Router, Request, Response, NextFunction } from 'express';
import { EmailService } from '../services/email.service';
import { envs } from '../../config/envs';
import { SendOrderController } from './controller';



const emailService = new EmailService();


const controller = new SendOrderController(emailService);


const sendEmailRouter = Router();
sendEmailRouter.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    controller.sendOrder(req, res, next).catch(next);
  },
);

sendEmailRouter.post(
  '/contact',
  (req: Request, res: Response, next: NextFunction) => {
    controller.sendContact(req, res, next).catch(next);
  },
);


export default sendEmailRouter;
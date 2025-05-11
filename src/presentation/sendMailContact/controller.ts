// File: src/presentation/controllers/SendOrderController.ts

import { Request, Response, NextFunction } from 'express';
import { EmailService, SendMailOptions } from '../services/email.service';

export class SendOrderController {
  constructor(private readonly emailService: EmailService) {}

  sendOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, surname, phone, items, total } = req.body;

      if (!name || !phone || !Array.isArray(items) || typeof total !== 'number') {
        return res.status(400).json({ error: 'Datos incompletos o inválidos en el pedido.' });
      }

      const htmlBody = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: sans-serif; background: #f9f9f9; padding: 20px; }
            .container { max-width: 600px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
            h1 { font-size: 22px; color: #6E2864; margin-bottom: 20px; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #333; }
            .item-list { padding-left: 20px; color: #555; }
            .item-list li { margin-bottom: 6px; }
            .footer { font-size: 12px; color: #aaa; margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🛒 Nuevo pedido recibido</h1>
            <div class="field"><span class="label">Nombre:</span> ${name}</div>
            ${surname ? `<div class="field"><span class="label">Apellido:</span> ${surname}</div>` : ''}
            <div class="field"><span class="label">Teléfono:</span> ${phone}</div>
            <div class="field">
              <span class="label">Productos solicitados:</span>
              <ul class="item-list">
                ${items.map((p: any) => `
                  <li>
                    <strong>${p.title}</strong> - $${p.price}<br/>
                    <small>${p.description || ''}</small>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="field"><span class="label">Total:</span> $${total.toFixed(2)}</div>
            <div class="footer">Este mensaje fue enviado automáticamente desde Autogestión Lince SA.</div>
          </div>
        </body>
        </html>
      `;

      const sendOptions: SendMailOptions = {
        to: 'a.damianrodriguez.93@gmail.com',
        subject: `🛒 Nuevo pedido de ${name}`,
        htmlBody,
      };

      await this.emailService.sendEmail(sendOptions);
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  };
}

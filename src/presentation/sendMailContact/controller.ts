import { Request, Response, NextFunction } from "express";
import { EmailService, SendMailOptions } from "../services/email.service";

export class SendOrderController {
  constructor(private readonly emailService: EmailService) {}

  sendOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, surname, phone, items, total } = req.body;

      if (
        !name ||
        !phone ||
        !Array.isArray(items) ||
        typeof total !== "number"
      ) {
        return res
          .status(400)
          .json({ error: "Datos incompletos o inválidos en el pedido." });
      }

      const itemsHtml = items
        .map(({ product, quantity }) => {
          const productName = product.title || product.name;
          const productCode = product.codigo
            ? ` (Código: ${product.codigo})`
            : "";
          const productPrice = (product.price * quantity).toFixed(2);
          const productDescription = product.description
            ? `<br/><small>${product.description}</small>`
            : "";

          return `
        <li>
          <strong>${productName}</strong>${productCode} x${quantity} - $${productPrice}
          ${productDescription}
        </li>
      `;
        })
        .join("");

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
          .item-list li { margin-bottom: 8px; line-height: 1.4; }
          .footer { font-size: 12px; color: #aaa; margin-top: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🛒 Nuevo pedido recibido</h1>
          <div class="field"><span class="label">Nombre:</span> ${name}</div>
          ${
            surname
              ? `<div class="field"><span class="label">Apellido:</span> ${surname}</div>`
              : ""
          }
          <div class="field"><span class="label">Teléfono:</span> ${phone}</div>
          <div class="field">
            <span class="label">Productos solicitados:</span>
            <ul class="item-list">
              ${itemsHtml}
            </ul>
          </div>
          <div class="field"><span class="label">Total:</span> $${total.toFixed(
            2
          )}</div>
          <div class="footer">Este mensaje fue enviado automáticamente desde Autogestión Lince SA.</div>
        </div>
      </body>
      </html>
    `;

      const sendOptions: SendMailOptions = {
        to: 'ab.mariavirginiamontero@gmail.com',
        subject: `🛒 Nuevo pedido de ${name}`,
        htmlBody,
      };

      await this.emailService.sendEmail(sendOptions);
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  };

  sendContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, correo, localidad, telefono, empresa, mensaje } = req.body;

      if (!name || !correo || !localidad || !telefono) {
        return res
          .status(400)
          .json({ error: "Datos incompletos o inválidos en el pedido." });
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
          .message { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          .footer { font-size: 12px; color: #aaa; margin-top: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📩 Nueva consulta recibida</h1>
          <div class="field"><span class="label">Nombre:</span> ${name}</div>
          <div class="field"><span class="label">Correo:</span> ${correo}</div>
          <div class="field"><span class="label">Teléfono:</span> ${telefono}</div>
          <div class="field"><span class="label">Localidad:</span> ${localidad}</div>
          ${
            empresa
              ? `<div class="field"><span class="label">Empresa:</span> ${empresa}</div>`
              : ""
          }
          ${
            mensaje
              ? `<div class="message"><span class="label">Mensaje:</span><br>${mensaje}</div>`
              : ""
          }
          <div class="footer">Este mensaje fue enviado automáticamente desde Autogestión Lince SA.</div>
        </div>
      </body>
      </html>
    `;

      const sendOptions: SendMailOptions = {
        to: "ab.mariavirginiamontero@gmail.com",
        subject: `Nueva consulta de ${name}`,
        htmlBody,
      };

      await this.emailService.sendEmail(sendOptions);
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  };
}

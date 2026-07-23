import { Request, Response, NextFunction } from "express";
import { EmailService, SendMailOptions } from "../services/email.service";
import { SettingService } from "../services/setting.service";
import { escapeHtml, sanitizeEmailSubjectFragment } from "../../config/html.util";

export class SendOrderController {
  constructor(
    private readonly emailService: EmailService,
    private readonly settingService: SettingService,
  ) {}

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

      // Recalcular el total en el servidor: no se confía en el total del cliente
      // para validar el mínimo de compra (puede manipularse).
      const computedTotal = items.reduce(
        (sum: number, { product, quantity }: { product: any; quantity: number }) =>
          sum + (Number(product?.price) || 0) * (Number(quantity) || 0),
        0
      );

      const { minOrderAmount } = await this.settingService.getSettings();
      if (minOrderAmount > 0 && computedTotal < minOrderAmount) {
        return res.status(400).json({
          error: `El pedido no alcanza el monto mínimo de compra ($${minOrderAmount}).`,
        });
      }

      const safeName = escapeHtml(String(name));
      const safeSurname = surname != null && surname !== "" ? escapeHtml(String(surname)) : "";
      const safePhone = escapeHtml(String(phone));

      const itemsHtml = items
        .map(({ product, quantity }: { product: any; quantity: number }) => {
          const productName = product.title || product.name;
          const safeProductName = escapeHtml(String(productName ?? ""));
          const productCode = product.codigo
            ? ` (Código: ${escapeHtml(String(product.codigo))})`
            : "";
          const productPrice = (product.price * quantity).toFixed(2);
          const productDescription = product.description
            ? `<br/><small>${escapeHtml(String(product.description))}</small>`
            : "";

          return `
        <li>
          <strong>${safeProductName}</strong>${productCode} x${quantity} - $${productPrice}
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
          <div class="field"><span class="label">Nombre:</span> ${safeName}</div>
          ${
            safeSurname
              ? `<div class="field"><span class="label">Apellido:</span> ${safeSurname}</div>`
              : ""
          }
          <div class="field"><span class="label">Teléfono:</span> ${safePhone}</div>
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
        subject: `🛒 Nuevo pedido de ${sanitizeEmailSubjectFragment(String(name))}`,
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

      const safeName = escapeHtml(String(name));
      const safeCorreo = escapeHtml(String(correo));
      const safeLocalidad = escapeHtml(String(localidad));
      const safeTelefono = escapeHtml(String(telefono));
      const safeEmpresa =
        empresa != null && empresa !== "" ? escapeHtml(String(empresa)) : "";
      const safeMensaje =
        mensaje != null && mensaje !== ""
          ? escapeHtml(String(mensaje)).replace(/\n/g, "<br/>")
          : "";

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
          <div class="field"><span class="label">Nombre:</span> ${safeName}</div>
          <div class="field"><span class="label">Correo:</span> ${safeCorreo}</div>
          <div class="field"><span class="label">Teléfono:</span> ${safeTelefono}</div>
          <div class="field"><span class="label">Localidad:</span> ${safeLocalidad}</div>
          ${
            safeEmpresa
              ? `<div class="field"><span class="label">Empresa:</span> ${safeEmpresa}</div>`
              : ""
          }
          ${
            safeMensaje
              ? `<div class="message"><span class="label">Mensaje:</span><br>${safeMensaje}</div>`
              : ""
          }
          <div class="footer">Este mensaje fue enviado automáticamente desde Autogestión Lince SA.</div>
        </div>
      </body>
      </html>
    `;

      const sendOptions: SendMailOptions = {
        to: "ab.mariavirginiamontero@gmail.com",
        subject: `Nueva consulta de ${sanitizeEmailSubjectFragment(String(name))}`,
        htmlBody,
      };

      await this.emailService.sendEmail(sendOptions);
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  };
}

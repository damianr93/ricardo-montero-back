// File: src/services/email.service.ts
import nodemailer, { Transporter, SendMailOptions as NodemailerOptions } from 'nodemailer';
import { envs } from '../../config/envs';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  attachments?: NodemailerOptions['attachments'];
  replyTo?: string;
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envs.MAILER_HOST,
      auth: {
        user: envs.MAILER_EMAIL,
        pass: envs.MAILER_SECRET_KEY,
      },
    });
  }

  async sendEmail(opts: SendMailOptions): Promise<boolean> {


    const info = await this.transporter.sendMail({
      from: ` <${envs.MAILER_EMAIL}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.htmlBody,
      attachments: opts.attachments,
    });

    return true;
  }
}

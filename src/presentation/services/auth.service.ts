import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { escapeHtml } from "../../config/html.util";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";
import { UpdateUserDto } from "../../domain/dtos/auth/update.user.dto";
import { ForgotPasswordDto } from "../../domain/dtos/auth/forgot-password.dto";
import { ResetPasswordDto } from "../../domain/dtos/auth/reset-password.dto";
import { FileUploadService } from "./file-upload.service";
import { EmailService } from "./email.service";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export class AuthService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly emailService: EmailService
  ) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const normalizedEmail = registerUserDto.email.toLowerCase();

    const existUser = await UserModel.findOne({
      email: normalizedEmail,
    });
    if (existUser) throw CustomError.badRequest("Email already exists");

    try {
      const approvalToken = uuidv4();

      const user = new UserModel({
        ...registerUserDto,
        email: normalizedEmail,
        approvalToken,
      });

      user.password = bcryptAdapter.hash(registerUserDto.password);
      await user.save();

      await this.sendApprovalEmailToAdmin(user, approvalToken);

      const { password, ...userEntity } = UserEntity.fromObject(user);

      return {
        user: userEntity,
        message:
          "Usuario registrado. Pendiente de aprobación por el administrador.",
      };
    } catch (error) {
      throw CustomError.internarlServer(`${error}`);
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await UserModel.findOne({
      email: loginUserDto.email.toLowerCase(),
    });
    if (!user) throw CustomError.badRequest("Email not exists");

    if (user.approvalStatus === "PENDING") {
      throw CustomError.unauthorized(
        "Tu cuenta está pendiente de aprobación por el administrador"
      );
    }

    if (user.approvalStatus === "REJECTED") {
      throw CustomError.unauthorized(
        "Tu cuenta ha sido rechazada por el administrador"
      );
    }

    const isMatching = bcryptAdapter.compare(
      loginUserDto.password,
      user.password
    );
    if (!isMatching) throw CustomError.badRequest("Invalid password");

    const { password, ...userEntity } = UserEntity.fromObject(user);

    const token = await JwtAdapter.generateToken({ id: user.id });
    if (!token) throw CustomError.internarlServer("Error while creating JWT");

    return {
      user: userEntity,
      token: token,
    };
  }

  public async approveUser(token: string, adminEmail?: string) {
    const user = await UserModel.findOne({ approvalToken: token });
    if (!user) throw CustomError.badRequest("Token de aprobación inválido");

    if (user.approvalStatus !== "PENDING") {
      throw CustomError.badRequest("Este usuario ya ha sido procesado");
    }

    user.approvalStatus = "APPROVED";
    user.emailValidated = true;
    user.approvedAt = new Date();
    user.approvedBy = adminEmail || "Admin";
    user.approvalToken = undefined;

    await user.save();

    await this.sendApprovalConfirmationToUser(user.email, user.name, true);

    return { message: "Usuario aprobado exitosamente" };
  }

  public async rejectUser(token: string, adminEmail?: string) {
    const user = await UserModel.findOne({ approvalToken: token });
    if (!user) throw CustomError.badRequest("Token de aprobación inválido");

    if (user.approvalStatus !== "PENDING") {
      throw CustomError.badRequest("Este usuario ya ha sido procesado");
    }

    user.approvalStatus = "REJECTED";
    user.rejectedAt = new Date();
    user.rejectedBy = adminEmail || "Admin";
    user.approvalToken = undefined;

    await user.save();

    await this.sendApprovalConfirmationToUser(user.email, user.name, false);

    return { message: "Usuario rechazado exitosamente" };
  }

  private async sendApprovalEmailToAdmin(user: any, approvalToken: string) {
    const approveUrl = `${envs.WEBSERVICE_URL}/api/auth/approve-user/${approvalToken}`;
    const rejectUrl = `${envs.WEBSERVICE_URL}/api/auth/reject-user/${approvalToken}`;

    // Función helper para renderizar campos opcionales
    const renderOptionalField = (label: string, value: any) => {
      if (value !== undefined && value !== null && value !== "") {
        return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</p>`;
      }
      return "";
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .user-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .section { margin-bottom: 15px; }
                .section-title { color: #0066cc; font-weight: bold; margin-bottom: 8px; }
                .buttons { text-align: center; margin: 30px 0; }
                .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .btn-approve { background-color: #28a745; color: white; }
                .btn-reject { background-color: #dc3545; color: white; }
                .btn:hover { opacity: 0.8; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 Nuevo Usuario Registrado</h1>
                    <p>Requiere tu aprobación</p>
                </div>
                <div class="content">
                    <p>Hola Administrador,</p>
                    <p>Un nuevo usuario se ha registrado en la plataforma y requiere tu aprobación:</p>
                    
                    <div class="user-info">
                        <h3>📋 Información del Usuario</h3>
                        
                        <!-- Información básica -->
                        <div class="section">
                            <div class="section-title">Datos Básicos</div>
                            <p><strong>Nombre:</strong> ${escapeHtml(user.name)}</p>
                            <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
                            <p><strong>Fecha de registro:</strong> ${new Date().toLocaleString(
                              "es-ES"
                            )}</p>
                            <p><strong>Rol solicitado:</strong> ${
                              user.role
                                ? escapeHtml(user.role.join(", "))
                                : "No especificado"
                            }</p>
                        </div>

                        <!-- Información de empresa (si existe) -->
                        ${
                          user.razonSocial || user.CUIT
                            ? `
                        <div class="section">
                            <div class="section-title">Información de Empresa</div>
                            ${renderOptionalField(
                              "Razón Social",
                              user.razonSocial
                            )}
                            ${renderOptionalField("CUIT", user.CUIT)}
                        </div>
                        `
                            : ""
                        }

                        <!-- Información de contacto (si existe) -->
                        ${
                          user.phone ||
                          user.direccion ||
                          user.localidad ||
                          user.provincia ||
                          user.codigoPostal
                            ? `
                        <div class="section">
                            <div class="section-title">Información de Contacto</div>
                            ${renderOptionalField("Teléfono", user.phone)}
                            ${renderOptionalField("Dirección", user.direccion)}
                            ${renderOptionalField("Localidad", user.localidad)}
                            ${renderOptionalField("Provincia", user.provincia)}
                            ${renderOptionalField(
                              "Código Postal",
                              user.codigoPostal
                            )}
                        </div>
                        `
                            : ""
                        }
                    </div>

                    <p>Por favor, revisa la información y decide si aprobar o rechazar a este usuario:</p>

                    <div class="buttons">
                        <a href="${approveUrl}" class="btn btn-approve">✅ APROBAR USUARIO</a>
                        <a href="${rejectUrl}" class="btn btn-reject">❌ RECHAZAR USUARIO</a>
                    </div>

                    <p><small>⚠️ Esta decisión es irreversible. Una vez que apruebes o rechaces al usuario, se le enviará una notificación automática.</small></p>
                </div>
            </div>
        </body>
        </html>
        `;

    const options = {
      to: envs.ADMIN_EMAIL,
      subject: "🔔 Nuevo usuario requiere aprobación",
      htmlBody: html,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent)
      throw CustomError.internarlServer("Error sending approval email");

    return true;
  }

  private async sendApprovalConfirmationToUser(
    email: string,
    name: string,
    approved: boolean
  ) {
    const html = approved
      ? `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 ¡Cuenta Aprobada!</h1>
                </div>
                <div class="content">
                    <h2>Hola ${escapeHtml(name)},</h2>
                    <div class="success">
                        <p><strong>¡Excelentes noticias!</strong> Tu cuenta ha sido aprobada por nuestro administrador.</p>
                    </div>
                    <p>Ya puedes iniciar sesión en la plataforma con tus credenciales:</p>
                    <ul>
                        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
                        <li><strong>Contraseña:</strong> La que registraste</li>
                    </ul>
                    <p>¡Bienvenido a nuestra plataforma!</p>
                </div>
            </div>
        </body>
        </html>
        `
      : `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>❌ Cuenta No Aprobada</h1>
                </div>
                <div class="content">
                    <h2>Hola ${escapeHtml(name)},</h2>
                    <div class="error">
                        <p>Lamentamos informarte que tu solicitud de registro no ha sido aprobada en este momento.</p>
                    </div>
                    <p>Si tienes preguntas sobre esta decisión, puedes contactar a nuestro equipo de soporte.</p>
                    <p>Gracias por tu interés en nuestra plataforma.</p>
                </div>
            </div>
        </body>
        </html>
        `;

    const options = {
      to: email,
      subject: approved ? "🎉 Cuenta aprobada" : "❌ Cuenta no aprobada",
      htmlBody: html,
    };

    await this.emailService.sendEmail(options);
  }

  public async updateUser(userId: string, updateDto: UpdateUserDto) {
    const user = await UserModel.findById(userId);
    if (!user) throw CustomError.badRequest("User not found");

    if (updateDto.name !== undefined) user.name = updateDto.name;
    if (updateDto.role !== undefined) user.role = updateDto.role;

    await user.save();

    const { password, ...userEntity } = UserEntity.fromObject(user);
    return userEntity;
  }

  public async getUserById(id: string) {
    try {
      const user = await UserModel.findById(id).select('-password -approvalToken');
      if (!user) {
        throw CustomError.notFound('Usuario no encontrado');
      }
      return UserEntity.fromObject(user.toJSON());
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internarlServer("Error getting user");
    }
  }

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await UserModel.findOne({ email: forgotPasswordDto.email.toLowerCase() });
      
      if (!user) {
        return { message: 'Si el email existe, se enviará un enlace de recuperación' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000);

      await UserModel.findByIdAndUpdate(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      });

      const resetUrl = `${envs.FRONT_URL}/reset-password?token=${resetToken}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p>Hola ${escapeHtml(user.name)},</p>
          <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Recuperar Contraseña</a>
          </div>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Este es un email automático, por favor no respondas.</p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Recuperación de Contraseña',
        htmlBody: html
      });

      return { message: 'Si el email existe, se enviará un enlace de recuperación' };
    } catch (error) {
      throw CustomError.internarlServer('Error al procesar la solicitud de recuperación');
    }
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const user = await UserModel.findOne({
        resetPasswordToken: resetPasswordDto.token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw CustomError.badRequest('Token inválido o expirado');
      }

      const hashedPassword = bcryptAdapter.hash(resetPasswordDto.newPassword);

      await UserModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internarlServer('Error al actualizar la contraseña');
    }
  }
}

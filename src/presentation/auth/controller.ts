import { Request, Response } from "express";
import { CustomError, RegisterUserDto } from "../../domain";
import { AuthService } from "../services/auth.service";
import { LoginUserDto } from '../../domain/dtos/auth/login.user.dto';
import { UpdateUserDto } from "../../domain/dtos/auth/update.user.dto";
import { ForgotPasswordDto } from "../../domain/dtos/auth/forgot-password.dto";
import { ResetPasswordDto } from "../../domain/dtos/auth/reset-password.dto";
import { UploadedFile } from "express-fileupload";

export class AuthController {
    constructor(
        public readonly authService: AuthService
    ) { };

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    registerUser = (req: Request, res: Response) => {
        const [error, registerDto] = RegisterUserDto.create(req.body);
        if (error) return res.status(400).json({ error });

        this.authService.registerUser(registerDto!)
            .then((result) => res.json(result))
            .catch(error => this.handleError(error, res));
    }

    loginUser = (req: Request, res: Response) => {
        const [error, loginUserDto] = LoginUserDto.create(req.body);
        if (error) return res.status(400).json({ error });

        this.authService.loginUser(loginUserDto!)
            .then(({ user, token }) => {
                res.json({ 
                    user,
                    token
                });
            })
            .catch(err => this.handleError(err, res));
    }

    approveUser = (req: Request, res: Response) => {
        const { token } = req.params;
        const adminEmail = req.query.admin_email as string;

        this.authService.approveUser(token, adminEmail)
            .then((result) => {
                res.send(`
                    <html>
                        <head><title>Usuario Aprobado</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <div style="max-width: 500px; margin: 0 auto;">
                                <h1 style="color: #28a745;">✅ Usuario Aprobado</h1>
                                <p>El usuario ha sido aprobado exitosamente.</p>
                                <p>Se ha enviado una confirmación por email.</p>
                            </div>
                        </body>
                    </html>
                `);
            })
            .catch(error => this.handleError(error, res));
    }

    rejectUser = (req: Request, res: Response) => {
        const { token } = req.params;
        const adminEmail = req.query.admin_email as string;

        this.authService.rejectUser(token, adminEmail)
            .then((result) => {
                res.send(`
                    <html>
                        <head><title>Usuario Rechazado</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <div style="max-width: 500px; margin: 0 auto;">
                                <h1 style="color: #dc3545;">❌ Usuario Rechazado</h1>
                                <p>El usuario ha sido rechazado.</p>
                                <p>Se ha enviado una notificación por email.</p>
                            </div>
                        </body>
                    </html>
                `);
            })
            .catch(error => this.handleError(error, res));
    }

    updateUser = async (req: Request, res: Response) => {
        const userId = req.body.user.id as string;

        let file: UploadedFile | undefined;
        if (req.files && typeof req.files === 'object') {
            if ('file' in req.files) {
                file = req.files.file as UploadedFile;
            } else {
                const fileKeys = Object.keys(req.files);
                if (fileKeys.length > 0) {
                    const firstFileField = req.files[fileKeys[0]];
                    file = Array.isArray(firstFileField) ? firstFileField[0] : firstFileField;
                }
            }
        }

        const [dtoError, updateDto] = UpdateUserDto.create(req.body);
        if (dtoError) return res.status(400).json({ error: dtoError });

        try {
            const updated = await this.authService.updateUser(userId, updateDto!);
            res.json(updated);
        } catch (err) {
            this.handleError(err, res);
        }
    }

    me = async (req: Request, res: Response) => {
        try {
            const user = await this.authService.getUserById((req as any).user.id);
            const isAdmin = user.role.includes('ADMIN_ROLE');
            res.json({ user, isAdmin });
        } catch (err) {
            this.handleError(err, res);
        }
    };

    logoutUser = (req: Request, res: Response) => {
        res.status(200).json({ message: 'Logged out successfully' });
    };

    forgotPassword = (req: Request, res: Response) => {
        const [error, forgotPasswordDto] = ForgotPasswordDto.create(req.body);
        if (error) return res.status(400).json({ error });

        this.authService.forgotPassword(forgotPasswordDto!)
            .then((result) => res.json(result))
            .catch(error => this.handleError(error, res));
    };

    resetPassword = (req: Request, res: Response) => {
        const [error, resetPasswordDto] = ResetPasswordDto.create(req.body);
        if (error) return res.status(400).json({ error });

        this.authService.resetPassword(resetPasswordDto!)
            .then((result) => res.json(result))
            .catch(error => this.handleError(error, res));
    };
}
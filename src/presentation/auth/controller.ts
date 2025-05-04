import { Request, Response } from "express";
import { CustomError, RegisterUserDto } from "../../domain";
import { AuthService } from "../services/auth.service";
import { LoginUserDto } from '../../domain/dtos/auth/login.user.dto';
import { UpdateUserDto } from "../../domain/dtos/auth/update.user.dto";
import { UploadedFile } from "express-fileupload";



export class AuthController {

    //*DI
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
            .then((user) => res.json(user))
            .catch(error => this.handleError(error, res));

    }

    loginUser = (req: Request, res: Response) => {

        const [error, loginUserDto] = LoginUserDto.create(req.body);

        if (error) return res.status(400).json({ error });
        this.authService.loginUser(loginUserDto!)
            .then(({ user, token }) => {
                res.cookie('access_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 1000 * 60 * 60 * 24,
                    path: '/'
                });
                res.json({ user });
            })
            .catch(err => this.handleError(err, res));
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
            console.log(file)
            const updated = await this.authService.updateUser(userId, updateDto!, file);
            res.json(updated);
        } catch (err) {
            this.handleError(err, res);
        }
    }

    me = async (req: Request, res: Response) => {
        // authMiddleware ya validó la cookie y fijó req.userId
        try {
            const user = await this.authService.getUserById((req as any).user.id);
            res.json({ user });
        } catch (err) {
            this.handleError(err, res);
        }
    };

    logoutUser = (req: Request, res: Response) => {
        res
            .clearCookie('access_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            })
            .clearCookie('refresh_token')
            .status(200)
            .json({ message: 'Logged out successfully' });
    };

    // valitateEmail = (req:Request, res: Response) => {

    //     const {token} = req.params
    //     this.authService.validateEmail(token)
    //         .then(()=> res.json('Email validated'))
    //         .catch(error => this.handleError(error, res))
    // }
}
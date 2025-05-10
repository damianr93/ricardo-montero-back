import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";

export class AuthMiddleware {

    static async validateJWT(req: Request, res: Response, next: NextFunction) {
        // 1) Intenta leer la cookie
        let token = req.cookies?.access_token as string | undefined;

        // 2) Si no hay cookie, busca en el header Authorization
        if (!token) {
            const authHeader = req.header('Authorization');
            if (!authHeader) {
                return res.status(401).json({ error: 'No token provided' });
            }
            if (!authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Invalid Bearer token' });
            }
            token = authHeader.split(' ')[1];
        }

        try {
            const payload = await JwtAdapter.validateToken<{ id: string }>(token);
            if (!payload) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            const user = await UserModel.findById(payload.id);
            if (!user) {
                return res.status(401).json({ error: 'Invalid token - user not found' });
            }

            // Pongo la entidad en req (puedes usar req.user si amplías la interfaz)
            (req as any).user = UserEntity.fromObject(user);

            next();
        } catch (err) {
            console.error(err);
            res.status(401).json({ error: 'Unauthorized' });
        }
    }

    static optionalJWT = async (req: Request, res: Response, next: NextFunction) => {
       
        let token = req.cookies.access_token;

         if (!token) {
            const authHeader = req.header('Authorization');
            if (!authHeader) {
                return next();
            }
            token = authHeader.split(' ')[1];
        }

        try {
            const payload = await JwtAdapter.validateToken<{ id: string }>(token);
            if (!payload) {
                return next();
            }

            const user = await UserModel.findById(payload.id);
            if (!user) {
                return res.status(401).json({ error: 'Invalid token - user not found' });
            }

            (req as any).user = UserEntity.fromObject(user);

            next();
        } catch (err) {
            console.error(err);
            res.status(401).json({ error: 'Unauthorized' });
        }
    }
}

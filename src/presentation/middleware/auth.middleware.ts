import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";

export class AuthMiddleware {
  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid Bearer token format" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const payload = await JwtAdapter.validateToken<{ id: string }>(token);
      
      if (!payload) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const user = await UserModel.findById(payload.id);
      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid token - user not found" });
      }

      if (user.approvalStatus !== "APPROVED") {
        return res.status(401).json({ error: "Account not approved" });
      }

      (req as any).user = {
        id: payload.id,
        role: user.role,
        email: user.email,
        name: user.name,
      };

      next();
    } catch (err) {
      console.error("AuthMiddleware - JWT validation error:", err);
      res.status(401).json({ error: "Unauthorized" });
    }
  }

  static optionalJWT = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.header("Authorization");

    // Si no hay header de autorización, asignar undefined explícitamente
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      (req as any).user = undefined;
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      (req as any).user = undefined;
      return next();
    }

    try {
      const payload = await JwtAdapter.validateToken<{ id: string }>(token);
      if (!payload) {
        (req as any).user = undefined;
        return next();
      }

      const user = await UserModel.findById(payload.id);
      if (!user) {
        (req as any).user = undefined;
        return next();
      }

      if (user.approvalStatus !== "APPROVED") {
        (req as any).user = undefined;
        return next();
      }

      // Usuario autenticado exitosamente
      (req as any).user = {
        id: payload.id,
        role: user.role,
        email: user.email,
        name: user.name,
      };

      next();
    } catch (err) {
      console.error("Optional JWT validation error:", err);
      (req as any).user = undefined;
      next();
    }
  };

  static requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!user.role || !user.role.includes('ADMIN_ROLE')) {
      return res.status(403).json({ error: "Acceso denegado. Se requieren permisos de administrador." });
    }

    next();
  };
}

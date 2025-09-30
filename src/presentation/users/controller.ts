import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CustomError } from '../../domain/errors/custom.error';
import { RegisterUserDto } from '../../domain/dtos/auth/register.user.dto';
import { bcryptAdapter } from '../../config';

export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  public getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getUsers();
      res.json({ users });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  public getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      res.json({ user });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  public updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      const user = await this.userService.updateUser(id, userData);
      res.json({ user });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  public updateUserApproval = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approvalStatus } = req.body;
      const approvedBy = (req as any).user?.id;
      
      const user = await this.userService.updateUserApproval(id, approvalStatus, approvedBy);
      res.json({ user });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  public createUser = async (req: Request, res: Response) => {
    try {
      const [error, registerDto] = RegisterUserDto.create(req.body);
      if (error) {
        return res.status(400).json({ error });
      }

      const user = await this.userService.createUser(registerDto!);
      res.status(201).json({ user });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  public deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    res.status(500).json({ error: 'Internal server error' });
  };
}

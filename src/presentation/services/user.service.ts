import { UserModel } from '../../data/mongo/models/user.model';
import { UserEntity } from '../../domain/entities/user.entity';
import { CustomError } from '../../domain/errors/custom.error';
import { UpdateUserDto } from '../../domain/dtos/auth/update.user.dto';
import { RegisterUserDto } from '../../domain/dtos/auth/register.user.dto';
import { bcryptAdapter } from '../../config';

export class UserService {
  public async getUsers(): Promise<UserEntity[]> {
    try {
      const users = await UserModel.find({}).select('-password -approvalToken');
      return users.map(user => UserEntity.fromObject(user));
    } catch (error) {
      throw CustomError.internarlServer('Error al obtener usuarios');
    }
  }

  public async getUserById(id: string): Promise<UserEntity> {
    try {
      const user = await UserModel.findById(id).select('-password -approvalToken');
      if (!user) {
        throw CustomError.notFound('Usuario no encontrado');
      }
      return UserEntity.fromObject(user);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internarlServer('Error al obtener usuario');
    }
  }

  public async createUser(registerDto: RegisterUserDto): Promise<UserEntity> {
    try {
      const normalizedEmail = registerDto.email.toLowerCase();

      const existUser = await UserModel.findOne({
        email: normalizedEmail,
      });
      if (existUser) {
        throw CustomError.badRequest("Email already exists");
      }

      const user = new UserModel({
        ...registerDto,
        email: normalizedEmail,
        password: bcryptAdapter.hash(registerDto.password),
        approvalStatus: 'APPROVED', // Los usuarios creados por admin se aprueban automáticamente
        emailValidated: true,
      });

      await user.save();

      const userEntity = UserEntity.fromObject(user);
      return userEntity;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internarlServer('Error al crear usuario');
    }
  }

  public async updateUser(id: string, userData: any): Promise<UserEntity> {
    try {
      const [error, updateDto] = UpdateUserDto.create(userData);
      if (error) {
        throw CustomError.badRequest(error);
      }

      if (!updateDto) {
        throw CustomError.badRequest('Datos de actualización inválidos');
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        updateDto,
        { new: true, runValidators: true }
      ).select('-password -approvalToken');

      if (!user) {
        throw CustomError.notFound('Usuario no encontrado');
      }

      return UserEntity.fromObject(user);
    } catch (error: any) {
      if (error instanceof CustomError) throw error;
      if (error.name === 'ValidationError') {
        throw CustomError.badRequest('Datos de usuario inválidos');
      }
      throw CustomError.internarlServer('Error al actualizar usuario');
    }
  }

  public async updateUserApproval(
    id: string, 
    approvalStatus: 'APPROVED' | 'REJECTED',
    approvedBy?: string
  ): Promise<UserEntity> {
    try {
      const updateData: any = { approvalStatus };
      
      if (approvalStatus === 'APPROVED') {
        updateData.approvedAt = new Date();
        updateData.approvedBy = approvedBy;
        updateData.rejectedAt = undefined;
        updateData.rejectedBy = undefined;
      } else if (approvalStatus === 'REJECTED') {
        updateData.rejectedAt = new Date();
        updateData.rejectedBy = approvedBy;
        updateData.approvedAt = undefined;
        updateData.approvedBy = undefined;
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -approvalToken');

      if (!user) {
        throw CustomError.notFound('Usuario no encontrado');
      }

      return UserEntity.fromObject(user);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internarlServer('Error al actualizar estado de aprobación');
    }
  }

  public async deleteUser(id: string): Promise<void> {
    try {
      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
        throw CustomError.notFound('Usuario no encontrado');
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internarlServer('Error al eliminar usuario');
    }
  }
}

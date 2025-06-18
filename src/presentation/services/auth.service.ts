import { UploadedFile } from "express-fileupload";
import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { UpdateUserDto } from "../../domain/dtos/auth/update.user.dto";
import { FileUploadService } from "./file-upload.service";
// import { EmailService } from './email.service';



export class AuthService {


    constructor(

        private readonly fileUploadService: FileUploadService,
    ) { };


    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if (existUser) throw CustomError.badRequest('Email already exits');

        try {
            const user = new UserModel(registerUserDto);

            //* Enctriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password)
            await user.save();

            const token = await JwtAdapter.generateToken({ id: user.id, role: user.role });
            if (!token) throw CustomError.internarlServer('Error while creating JWT')

            // this.sendEmailValidationLink(user.email);

            const { password, ...userEntity } = UserEntity.fromObject(user)

            return {
                user: userEntity,
                token: token
            }

        } catch (error) {


            throw CustomError.internarlServer(`${error}`);

        };

    };

    public async loginUser(loginUserDto: LoginUserDto) {

        const user = await UserModel.findOne({ email: loginUserDto.email })
        if (!user) throw CustomError.badRequest('Email not exits')

        const isMatching = bcryptAdapter.compare(loginUserDto.password, user.password)
        if (!isMatching) throw CustomError.badRequest('invalid password')

        const { password, ...userEntity } = UserEntity.fromObject(user)

        const token = await JwtAdapter.generateToken({ id: user.id })
        if (!token) throw CustomError.internarlServer('Error while creating JWT')

        return {
            user: userEntity,
            token: token
        };
    };

    public async updateUser(
        userId: string,
        updateDto: UpdateUserDto,
    ) {
        const user = await UserModel.findById(userId);
        if (!user) throw CustomError.badRequest('User not found');


        // Actualiza campos opcionales
        if (updateDto.name !== undefined) user.name = updateDto.name;
        if (updateDto.role !== undefined) user.role = updateDto.role;

        await user.save();

        // Quita password antes de devolver
        const { password, ...userEntity } = UserEntity.fromObject(user);
        return userEntity;
    }

    public async getUserById (id:string) {
        try {
            const user = await UserModel.findById(id);
            return user
        } catch (error) {
            
        }
    }

    // private sendEmailValidationLink = async(email:string) => {

    //     const token = await JwtAdapter.generateToken({email});
    //     if(!token) throw CustomError.internarlServer('Error getting token');

    //     const link = `${ envs.WEBSERVICE_URL }/auth/validate-email/${token}`;

    //     const html = `
    //     <h1>Validate your email</h1>
    //     <p>Click on the following link to validate your email</>
    //     <a href="${link}">Validate your email: ${email}</a>
    //     `;

    //     const options = {
    //         to: email,
    //         subject: 'validate your email',
    //         htmlBody: html,
    //     };

    //     const isSent = await this.emailService.sendEmail(options)        
    //     if ( !isSent ) throw CustomError.internarlServer('Error sending Email')

    //     return true
    // }

    // public validateEmail = async(token:string)=> {

    //     const payload = await JwtAdapter.validateToken(token);
    //     if(!payload) throw CustomError.unauthorized('Invalid token');

    //     const {email} = payload as {email:string};
    //     if(!email) throw CustomError.internarlServer('Email not in token');

    //     const user = await UserModel.findOne({email});
    //     if(!user) throw CustomError.internarlServer('Email not exist');

    //     user.emailValidated = true;
    //     await user.save();

    //     return true;
    // }

};
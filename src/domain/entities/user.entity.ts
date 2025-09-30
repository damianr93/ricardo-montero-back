import { CustomError } from "../errors/custom.error";

export class UserEntity {

    constructor(
        public id:string,
        public name:string,
        public email:string,
        public emailValidated:boolean,
        public password:string,
        public role: string[],
        public img?:string,
        public razonSocial?:string,
        public CUIT?:string,
        public phone?:string,
        public direccion?:string,
        public localidad?:string,
        public provincia?:string,
        public codigoPostal?:number,
        public approvalStatus?:'PENDING' | 'APPROVED' | 'REJECTED',
        public approvedAt?:Date,
        public approvedBy?:string,
        public rejectedAt?:Date,
        public rejectedBy?:string,
    ){};

    static fromObject(object:{[key:string]:any}){

        const {
            id, _id, name, email, emailValidated, password, role, img,
            razonSocial, CUIT, phone, direccion, localidad, provincia, codigoPostal,
            approvalStatus, approvedAt, approvedBy, rejectedAt, rejectedBy
        } = object;
    
        if(!id && !_id) throw CustomError.badRequest('missing id');
        if(!name) throw CustomError.badRequest('missing name');
        if(!email) throw CustomError.badRequest('missing email');
        // if(emailValidated === undefined) throw CustomError.badRequest('missing emailValidated');
        if(!password && password !== undefined) throw CustomError.badRequest('missing password');
        if(!role) throw CustomError.badRequest('missing role');

        return new UserEntity(
            id || _id, 
            name, 
            email, 
            emailValidated, 
            password || '', // Usar string vacío si no hay password
            role, 
            img,
            razonSocial,
            CUIT,
            phone,
            direccion,
            localidad,
            provincia,
            codigoPostal,
            approvalStatus,
            approvedAt,
            approvedBy,
            rejectedAt,
            rejectedBy
        )

    }

}
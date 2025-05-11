import { CustomError } from "../../domain/errors/custom.error";
import { EmailService } from "./email.service";


export class AuthService {

    constructor(
        private readonly emailService:EmailService,
    ) { };



    private sendEmail = async(email:string) => {

        const html = `
        <h1>Validate your email</h1>
        <p>Click on the following link to validate your email</>
        `;

        const options = {
            to: email,
            subject: 'Nuevo contacto a traves de la web',
            htmlBody: html,
        };

        const isSent = await this.emailService.sendEmail(options)        
        if ( !isSent ) throw CustomError.internarlServer('Error sending Email')

        return true
    }

};
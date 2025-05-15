import { UploadedFile } from 'express-fileupload'
import { envs, Uuid } from '../../config'
import { CustomError } from '../../domain'
import { AwsService } from './aws.sercive';


export class FileUploadService {
    constructor(
        private readonly uuid = Uuid.v4,
        private readonly aws = new AwsService()
    ) { }

    private validateExtension(ext: string, valid: string[]) {
        if (!valid.includes(ext.toLowerCase())) {
            throw CustomError.badRequest(
                `Extensión inválida: ${ext}. Válidas: ${valid.join(', ')}`
            )
        }
    }

    /**
     * Sube un sólo fichero a S3.
     */
    async uploadSingle(
        file: UploadedFile,
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif']
    ): Promise<{ fileName: string; url: string }> {
        // 1) Validar extensión
        const ext = file.mimetype.split('/').pop() || ''
        this.validateExtension(ext, validExtensions)

        // 2) Generar key único
        const fileName = `${folder}/${this.uuid()}.${ext}`

        // 3) Subir buffer a S3
        try {
            await this.aws.uploadBuffer(fileName, file.data, file.mimetype)
        } catch (err) {
            console.error('Error subiendo a S3:', err)
            throw err
        }

        // 4) Construir URL pública (o privada según tu bucket)
        const url = `https://${envs.AWS_S3_BUCKET}.s3.${envs.AWS_REGION}.amazonaws.com/${fileName}`

        return { fileName, url }
    }

    /**
     * Sube varios ficheros en paralelo.
     */
    async uploadMultiple(
        files: UploadedFile[],
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif']
    ): Promise<Array<{ fileName: string; url: string }>> {
        return Promise.all(
            files.map(f => this.uploadSingle(f, folder, validExtensions))
        )
    }
}

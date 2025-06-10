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
        folder = 'uploads',
        validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
        productName?: string,
        index?: number
    ): Promise<{ fileName: string; url: string }> {
        // validar extensión
        const ext = (file.mimetype.split('/').pop() || '').toLowerCase();
        this.validateExtension(ext, validExtensions);

        // preparar slug + UUID
        const id = this.uuid();
        let baseName: string;
        if (productName) {
            const slug = this.slugify(productName);
            // si es array, agrega índice: e.g. “producto-1”
            baseName = index != null ? `${slug}-${index}` : slug;
        } else {
            baseName = id;
        }

        // finalmente el fileName
        const fileName = `${folder}/${baseName}-${id}.${ext}`;

        // subir y retornar
        await this.aws.uploadBuffer(fileName, file.data, file.mimetype);
        const url = `https://${envs.AWS_S3_BUCKET}.s3.${envs.AWS_REGION}.amazonaws.com/${fileName}`;
        return { fileName, url };
    }

    /**
     * Sube varios ficheros en paralelo.
     */
    async uploadMultiple(
        files: UploadedFile[],
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
        productName?: string // Hacer opcional
    ): Promise<Array<{ fileName: string; url: string }>> {
        return Promise.all(
            files.map((file, index) =>
                this.uploadSingle(
                    file,
                    folder,
                    validExtensions,
                    productName,
                    productName && files.length > 1 ? index : undefined
                )
            )
        )
    }

    /**
     * Elimina múltiples archivos de S3
     */
    async deleteMultiple(fileNames: string[]): Promise<void> {
        try {
            await Promise.all(
                fileNames.map(fileName => this.aws.deleteImage(fileName))
            )
        } catch (err) {
            console.error('Error eliminando archivos de S3:', err)
            throw err
        }
    }

    private slugify(name: string): string {
        return name
            .trim()
            .toLowerCase()
            // descompone acentos (ñ → n, á → a, etc.)
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            // convierte espacios y guiones múltiples en un solo guión
            .replace(/\s+/g, '-')
            // elimina todo lo que no sea letra, número o guión
            .replace(/[^a-z0-9\-]/g, '')
            // quita guiones al inicio o final
            .replace(/^-+|-+$/g, '');
    }
}
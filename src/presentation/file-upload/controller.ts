import { Request, Response } from 'express'
import { CustomError } from '../../domain'
import { FileUploadService } from '../services/file-upload.service'
import { UploadedFile } from 'express-fileupload'

export class FileUploadController {
    constructor(private readonly fileUploadService: FileUploadService) { }

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }

    uploadFile = async (req: Request, res: Response) => {
        try {
            const type = req.params.type
            // express-fileupload pone los ficheros en req.files
            const file = (req.files!.file as UploadedFile)
            const result = await this.fileUploadService.uploadSingle(
                file,
                `uploads/${type}`
            )
            res.json(result)
        } catch (err) {
            this.handleError(err, res)
        }
    }

    uploadMultipleFile = async (req: Request, res: Response) => {
        try {
            const type = req.params.type
            const files = (req.files!.files as UploadedFile[])
            const result = await this.fileUploadService.uploadMultiple(
                files,
                `uploads/${type}`
            )
            res.json(result)
        } catch (err) {
            this.handleError(err, res)
        }
    }
}

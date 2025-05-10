import { UploadedFile } from "express-fileupload";
import fs from "fs";
import path from "path";
import { Uuid } from "../../config";
import { CustomError } from "../../domain";

export class FileUploadService {
    constructor(
        private readonly uuid = Uuid.v4
    ) { }

    private checkFolder(folderPath: string) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }

    async uploadSingle(
        file: UploadedFile,
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif']
    ) {
        try {
            const fileExtension = file.mimetype.split('/').at(1) ?? '';

            if (!validExtensions.includes(fileExtension)) {
                throw CustomError.badRequest(
                    `Invalid extension: ${fileExtension}, valid ones: ${validExtensions.join(', ')}`
                );
            }

            const destination = path.resolve(process.cwd(), folder);
            this.checkFolder(destination);

            const fileName = `${this.uuid()}.${fileExtension}`;
            const filePath = path.join(destination, fileName);

            await new Promise((resolve, reject) => {
                file.mv(filePath, (err) => {
                    if (err) return reject(err);
                    resolve(null);
                });
            });

            return { fileName };

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async uploadMultiple(
        files: UploadedFile[],
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif']
    ) {
        const fileNames = await Promise.all(
            files.map(file => this.uploadSingle(file, folder, validExtensions))
        );

        return fileNames;
    }
}

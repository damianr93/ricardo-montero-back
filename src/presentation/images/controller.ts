import fs from 'fs';
import path from 'path';
import { Request, Response } from "express";
import { AwsService } from '../services/aws.sercive';


export class ImageController {

    private awsService: AwsService;

    constructor() {
        this.awsService = new AwsService();
    };

    getImage = (req: Request, res: Response) => {

        const { type = '', img = '' } = req.params;
        const imagePath = path.resolve(__dirname, `../../../uploads/${type}/${img}`)

        if (!fs.existsSync(imagePath)) {
            return res.status(404).send('Image not found');
        }

        res.sendFile(imagePath);

    };

    getAllImages = async (req: Request, res: Response) => {
        try {
            const { prefix, page = '1', limit = '50' } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);

            // Si se especifica paginación
            if (pageNum > 1 || limitNum < 1000) {
                // Para paginación necesitarías implementar lógica más compleja con tokens
                // Por simplicidad, usamos el método básico con offset simulado
                const allImages = await this.awsService.listImages(prefix as string);

                const startIndex = (pageNum - 1) * limitNum;
                const endIndex = startIndex + limitNum;
                const paginatedImages = allImages.slice(startIndex, endIndex);

                return res.json({
                    success: true,
                    data: {
                        images: paginatedImages,
                        pagination: {
                            currentPage: pageNum,
                            totalImages: allImages.length,
                            imagesPerPage: limitNum,
                            totalPages: Math.ceil(allImages.length / limitNum),
                            hasNextPage: endIndex < allImages.length,
                            hasPrevPage: pageNum > 1
                        }
                    }
                });
            }

            // Sin paginación - todas las imágenes
            const images = await this.awsService.listImages(prefix as string);

            res.json({
                success: true,
                data: {
                    images,
                    total: images.length
                }
            });

        } catch (error) {
            console.error('Error getting images from S3:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las imágenes',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    };

    // Método alternativo con paginación real de S3
    getAllImagesWithRealPagination = async (req: Request, res: Response) => {
        try {
            const { prefix, limit = '50', token } = req.query;

            const limitNum = parseInt(limit as string);

            const result = await this.awsService.listImagesPaginated(
                prefix as string,
                limitNum,
                token as string
            );

            res.json({
                success: true,
                data: {
                    images: result.images,
                    nextToken: result.nextToken,
                    hasMore: result.hasMore,
                    total: result.images.length
                }
            });

        } catch (error) {
            console.error('Error getting images from S3:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las imágenes',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    };

    // Método para obtener imágenes por tipo/carpeta específica
    getImagesByType = async (req: Request, res: Response) => {
        try {
            const { type } = req.params;
            const { page = '1', limit = '20' } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);

            // Buscar imágenes con el prefijo del tipo
            const prefix = type ? `${type}/` : undefined;
            const images = await this.awsService.listImages(prefix);

            // Paginación manual
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedImages = images.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: {
                    type,
                    images: paginatedImages,
                    pagination: {
                        currentPage: pageNum,
                        totalImages: images.length,
                        imagesPerPage: limitNum,
                        totalPages: Math.ceil(images.length / limitNum),
                        hasNextPage: endIndex < images.length,
                        hasPrevPage: pageNum > 1
                    }
                }
            });

        } catch (error) {
            console.error('Error getting images by type from S3:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las imágenes por tipo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    };

    deleteImage = async (req: Request, res: Response) => {
        try {
            const { key } = req.params;

            if (!key) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere el parámetro "key" con la ruta de la imagen'
                });
            }

            const result = await this.awsService.deleteImage(key);

            if (result) {
                return res.json({
                    success: true,
                    message: 'Imagen eliminada correctamente'
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la imagen'
                });
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la imagen',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    };

};
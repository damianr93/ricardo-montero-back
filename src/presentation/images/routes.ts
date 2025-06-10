import { Router } from "express";
import { ImageController } from './controller';



export class ImageRoutes {

    static get routes():Router {

        const router = Router();
        const controller = new ImageController()

        router.get('/:type/:img', controller.getImage)
        router.get('/allimageswithpagination', controller.getAllImagesWithRealPagination)
        router.delete('/images/:key', controller.deleteImage);


        return router;

    }
}
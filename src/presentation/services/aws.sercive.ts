import { PutObjectCommand, S3Client, ListObjectsV2Command, DeleteObjectCommand, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3'
import { envs } from '../../config'

export class AwsService {

  private s3Client = new S3Client({
    region: envs.AWS_REGION,
    credentials: {
      accessKeyId: envs.AWS_ACCESS_KEY_ID,
      secretAccessKey: envs.AWS_SECRET_ACCESS_KEY,
    },
  })

  /**
   * Sube un buffer directamente a S3.
   * @param key Ruta dentro del bucket (p. ej. 'uploads/imagen.png')
   * @param body Buffer con el contenido del fichero
   * @param contentType MIME type (p. ej. 'image/png')
   */
  async uploadBuffer(
    key: string,
    body: Buffer,
    contentType: string
  ): Promise<void> {
    const cmd = new PutObjectCommand({
      Bucket: envs.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      // ACL: 'public-read',
      CacheControl: 'max-age=0',
    })
    await this.s3Client.send(cmd)
  }

  /**
   * Lista TODAS las imágenes del bucket S3 usando paginación automática.
   * @param prefix Prefijo opcional para filtrar por carpeta (p. ej. 'uploads/')
   * @returns Array de objetos con información de todas las imágenes
   */
  async listImages(prefix?: string): Promise<
    {
      key: string;
      size: number;
      lastModified: Date;
      url: string;
    }[]
  > {
    const allImages: {
      key: string;
      size: number;
      lastModified: Date;
      url: string;
    }[] = [];

    let continuationToken: string | undefined = undefined;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.heic'];

    while (true) {
      const cmd = new ListObjectsV2Command({
        Bucket: envs.AWS_S3_BUCKET!,
        Prefix: prefix,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      });

      const response: ListObjectsV2CommandOutput = await this.s3Client.send(cmd);
      const contents = response.Contents ?? [];
      for (const object of contents) {
        if (!object.Key) continue;

        const ext = object.Key.toLowerCase().slice(object.Key.lastIndexOf('.'));
        if (!imageExtensions.includes(ext)) continue;

        allImages.push({
          key: object.Key,
          size: object.Size ?? 0,
          lastModified: object.LastModified ?? new Date(),
          url: `https://${envs.AWS_S3_BUCKET}.s3.${envs.AWS_REGION}.amazonaws.com/${object.Key}`,
        });
      }

      if (!response.IsTruncated) break;
      continuationToken = response.NextContinuationToken;
    }

    return allImages;
  }

  /**
   * Lista todas las imágenes del bucket S3 con paginación.
   * @param prefix Prefijo opcional para filtrar por carpeta
   * @param maxKeys Número máximo de resultados por página (default: 1000)
   * @param continuationToken Token para paginación
   * @returns Objeto con las imágenes y token de continuación
   */
  async listImagesPaginated(
    prefix?: string,
    maxKeys: number = 1000,
    continuationToken?: string
  ) {
    const cmd = new ListObjectsV2Command({
      Bucket: envs.AWS_S3_BUCKET,
      Prefix: prefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    })

    const response = await this.s3Client.send(cmd)

    if (!response.Contents) {
      return {
        images: [],
        nextToken: null,
        hasMore: false
      }
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', ".heic"]

    const images = response.Contents
      .filter(object => {
        if (!object.Key) return false
        const extension = object.Key.toLowerCase().substring(object.Key.lastIndexOf('.'))
        return imageExtensions.includes(extension)
      })
      .map(object => ({
        key: object.Key!,
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        url: `https://${envs.AWS_S3_BUCKET}.s3.${envs.AWS_REGION}.amazonaws.com/${object.Key}`,
      }))

    return {
      images,
      nextToken: response.NextContinuationToken || null,
      hasMore: response.IsTruncated || false
    }
  }

  /**
 * Elimina una imagen del bucket S3
 * @param key Ruta completa del objeto a eliminar (p. ej. 'uploads/imagen.png')
 */
  async deleteImage(key: string): Promise<boolean> {
    try {
      const cmd = new DeleteObjectCommand({
        Bucket: envs.AWS_S3_BUCKET,
        Key: key,
      });

      await this.s3Client.send(cmd);
      return true;
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      return false;
    }
  }

}
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
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
      ACL: 'public-read',
      CacheControl: 'max-age=0',
    })
    await this.s3Client.send(cmd)
  }
}

import 'dotenv/config';
import { get } from 'env-var';


export const envs = {

  FRONT_URL:get('FRONT_URL').required().asString(),

  PORT: get('PORT').required().asPortNumber(),
  MONGO_URL:get('MONGO_URL').required().asString(),
  MONGO_DB_NAME:get('MONGO_DB_NAME').required().asString(),
  
  JWT_SEED:get('JWT_SEED').required().asString(),
 
  MAILER_HOST: get('MAILER_HOST').required().asString(),
  MAILER_EMAIL: get('MAILER_EMAIL').required().asString(),
  MAILER_SECRET_KEY: get('MAILER_SECRET_KEY').required().asString(),
  SEND_EMAIL: get('SEND_EMAIL').default('false').asBool(),
  

  AWS_REGION: get('AWS_REGION').required().asString(),
  AWS_ACCESS_KEY_ID: get('AWS_ACCESS_KEY_ID').required().asString(),
  AWS_SECRET_ACCESS_KEY: get('AWS_SECRET_ACCESS_KEY').required().asString(),
  AWS_S3_BUCKET: get('AWS_S3_BUCKET').required().asString(),

  SAMESITE: get('SAMESITE').asString(),

}




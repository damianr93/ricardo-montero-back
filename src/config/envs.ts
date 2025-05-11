import 'dotenv/config';
import { get } from 'env-var';


export const envs = {

  PORT: get('PORT').required().asPortNumber(),
  MONGO_URL:get('MONGO_URL').required().asString(),
  MONGO_DB_NAME:get('MONGO_DB_NAME').required().asString(),
  
  JWT_SEED:get('JWT_SEED').required().asString(),
 
  MAILER_HOST: get('MAILER_HOST').required().asString(),
  // MAILER_PORT: get('MAILER_PORT').default('465').asPortNumber(),
  // MAILER_SECURE: get('MAILER_SECURE').default('true').asBool(),

  MAILER_EMAIL: get('MAILER_EMAIL').required().asString(),
  MAILER_SECRET_KEY: get('MAILER_SECRET_KEY').required().asString(),

  SEND_EMAIL: get('SEND_EMAIL').default('false').asBool(),
  
  // WEBSERVICE_URL:get('WEBSERVICE_URL').required().asString(),
  // SEND_EMAIL:get('SEND_EMAIL').required().default('false').asBool()

}




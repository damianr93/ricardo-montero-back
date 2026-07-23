// Stub required env vars so importing src/config/envs.ts does not throw during tests.
// dotenv does not override already-set process.env values, so these win and keep tests deterministic.
const defaults: Record<string, string> = {
  FRONT_URL: 'http://localhost:5179',
  WEBSERVICE_URL: 'http://localhost:3000',
  PORT: '3000',
  MONGO_URL: 'mongodb://localhost:27017',
  MONGO_DB_NAME: 'test',
  JWT_SEED: 'test-seed',
  MAILER_HOST: 'smtp.test',
  MAILER_EMAIL: 'test@test.com',
  MAILER_SECRET_KEY: 'secret',
  ADMIN_EMAIL: 'admin@test.com',
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'key',
  AWS_SECRET_ACCESS_KEY: 'secret',
  AWS_S3_BUCKET: 'bucket',
}

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) process.env[key] = value
}

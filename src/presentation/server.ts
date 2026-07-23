import express, { Router } from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser'
import helmet from 'helmet';
import { envs } from '../config';

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}

function corsAllowedOrigins(): string[] {
  const extra = envs.CORS_EXTRA_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [envs.FRONT_URL, ...extra];
}


export class Server {

  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, public_path = 'public' } = options;
    this.port = port;
    this.publicPath = public_path;
    this.routes = routes;
  }

  async start() {

    if (envs.TRUST_PROXY) {
      this.app.set('trust proxy', 1);
    }

    //* Middlewares
  
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }));
    this.app.use(cookieParser());
    const corsOptions = {
      origin: corsAllowedOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
    this.app.use(cors(corsOptions));

    this.app.options('*', cors(corsOptions));
    this.app.use(express.json({ limit: '50mb' })); // raw
    this.app.use(express.urlencoded({ limit: '50mb', extended: true })); // x-www-form-urlencoded
    // useTempFiles streams uploads to disk instead of buffering the whole file
    // (up to 50MB each) in RAM — the previous behaviour caused heap OOM crashes
    // when several images were uploaded at once.
    this.app.use(fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 },
      useTempFiles: true,
      tempFileDir: os.tmpdir(),
      abortOnLimit: true,
    }));

    //* Public Folder
    this.app.use(express.static(this.publicPath));

    //* Routes
    this.app.use(this.routes);

    //* SPA /^\/(?!api).*/  <== Únicamente si no empieza con la palabra api
    this.app.get('*', (req, res) => {
      const indexPath = path.join(__dirname + `../../../${this.publicPath}/index.html`);
      res.sendFile(indexPath);
    });


    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });

  }

  public close() {
    this.serverListener?.close();
  }

}

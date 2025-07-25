import express, { Router } from 'express';
import cors from 'cors';
import path from 'path';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser'
import { envs } from '../config';

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
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


    //* Middlewares
  
    this.app.use(cookieParser());
    this.app.use(cors({
      origin: envs.FRONT_URL,
      credentials: true, 
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // para los preflight
    this.app.options('*', cors({
      origin: envs.FRONT_URL,
      credentials: true
    }));
    this.app.use(express.json({ limit: '50mb' })); // raw
    this.app.use(express.urlencoded({ limit: '50mb', extended: true })); // x-www-form-urlencoded
    this.app.use(fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 },
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

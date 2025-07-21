// Third-Party Imports:
import express, { json } from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

// Middleware Imports:
import { corsMiddleware } from '../Middlewares/corsMiddleware.js';
import { sessionMiddleware } from '../Middlewares/sessionMiddleware.js';
import { refreshTokenMiddleware } from '../Middlewares/refreshTokenMiddleware.js';
import { invalidJSONMiddleware } from '../Middlewares/invalidJSONMiddleware.js';
import { captureResponseDataMiddleware } from '../Middlewares/captureResponseDataMiddleware.js';
import { checkAuthStatusMiddleware } from '../Middlewares/checkAuthStatusMiddleware.js';

import createSocketServer from "../Core/GameServer.js";

// Router Imports:
import AuthRouter from '../Routes/AuthRouter.js';
import UsersRouter from '../Routes/UsersRouter.js';
import GameRouter from '../Routes/GameRouter.js';
import GamePlayersRouter from '../Routes/GamePlayersRouter.js';

export default class App {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        createSocketServer(this.server);
        this.HOST = process.env.API_HOST ?? 'localhost';
        this.PORT = process.env.API_PORT ?? 3001;
        this.API_VERSION = process.env.API_VERSION;
        this.API_PREFIX = `/api/v${this.API_VERSION}`;
        this.IGNORED_ROUTES = [
            `${this.API_PREFIX}/auth/authenticate`,
            `${this.API_PREFIX}/auth/status`,
            `${this.API_PREFIX}/auth/confirm`,
            `${this.API_PREFIX}/auth/oauth/*`,
        ];

        this.#setupMiddleware();
        this.#setupRoutes();
    }

    startApp() {
        this.server.listen(this.PORT, () => {
            console.info(
                `Server listening on http://${this.HOST}:${this.PORT}`
            );
        });
    }

    #setupMiddleware() {
        this.app.disable('x-powered-by'); // Disable 'x-powered-by' header
        this.app.use(json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(corsMiddleware());
        this.app.use(cookieParser());
        this.app.use(sessionMiddleware());
        this.app.use(refreshTokenMiddleware(this.IGNORED_ROUTES));
        this.app.use(checkAuthStatusMiddleware(this.IGNORED_ROUTES));
        this.app.use(invalidJSONMiddleware());
        this.app.use(captureResponseDataMiddleware);
    }

    #setupRoutes() {
        this.app.use(`${this.API_PREFIX}/auth`, AuthRouter.createRouter());
        this.app.use(`${this.API_PREFIX}/users`, UsersRouter.createRouter());
        this.app.use(`${this.API_PREFIX}/games`, GameRouter.createRouter());
        this.app.use(`${this.API_PREFIX}/game-players`, GamePlayersRouter.createRouter());
    }
}

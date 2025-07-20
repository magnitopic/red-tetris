// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import AuthController from '../Controllers/AuthController.js';
import OAuthController from '../Controllers/OAuthController.js';
import { controllerDeciderMiddleware } from '../Middlewares/controllerDeciderMiddleware.js';

export default class AuthRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/status', AuthController.status);
        router.get('/confirm', AuthController.confirm);

        // POST:
        router.post('/authenticate', AuthController.authenticate);
        router.post('/logout', AuthController.logout);
        router.post('/oauth/:provider', OAuthController.handleOAuth);

        return router;
    }
}

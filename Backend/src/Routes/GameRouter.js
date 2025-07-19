// Third-Party Imports:
import { Router } from 'express';

// Local imports
import GameController from '../Controllers/GameController.js';

export default class GameRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', GameController.getAllGames);
        router.get('/:id', GameController.getGameById);

        // POST:
        router.post('/create', GameController.createOrUpdateGame);

        return router;
    }
}

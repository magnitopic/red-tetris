import { Router } from 'express';
import GamePlayersController from '../Controllers/GamePlayersController.js';

export default class GamePlayersRouter {
  static createRouter() {
    const router = Router();

    // GET:
    router.get('/top-players', GamePlayersController.getTopPlayers);
    router.get('/:gameId', GamePlayersController.getPlayersInGame); // get all players
    router.get('/:gameId/:userId', GamePlayersController.getPlayerInGame); // get userId player

    // POST:
    router.post('/', GamePlayersController.createGamePlayer);

    // PATCH:
    router.patch('/', GamePlayersController.updateGamePlayer);

    return router;
  }
}

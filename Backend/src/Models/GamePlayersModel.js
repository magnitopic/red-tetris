import Model from '../Core/Model.js';

class GamePlayersModel extends Model {
  constructor() {
    super('game_players');
  }

  // async getTopPlayer(game_id) { ... }
}

const gamePlayersModel = new GamePlayersModel();
export default gamePlayersModel;
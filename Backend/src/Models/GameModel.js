// Local Imports:
import Model from '../Core/Model.js';

class GameModel extends Model {
    constructor() {
        super('games');
    }
}

const gameModel = new GameModel();
export default gameModel;

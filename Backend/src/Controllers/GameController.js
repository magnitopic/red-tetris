import gameModel from '../Models/GameModel.js';
import StatusMessage from '../Utils/StatusMessage.js';

export default class GameController {
    static async getAllGames(req, res) {
    try {
        const games = await gameModel.getAll();

        if (!games) {
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        }

        return res.status(200).json({ data: games });
    } catch (error) {
        console.error('Error getting games:', error.message);
        return res.status(500).json({ msg: StatusMessage.UNEXPECTED_ERROR || 'Internal Server Error' });
    }
}


    static async createOrUpdateGame(req, res) {
        const input = req.body;

        try {
            const result = await gameModel.createOrUpdate({
                input,
                keyName: 'game_seed',
            });

            if (!result) return res.status(500).json({ message: 'Error saving game.' });
            return res.status(200).json(result);
        } catch (err) {
            console.error('Controller error:', err);
            return res.status(500).json({ message: 'Unexpected error.' });
        }
    }

    static async getGame(req, res) {
        const { seed } = req.params;

        const result = await gameModel.getByReference(
			{ game_seed: seed }, true
		);

		if (!result || !result.game_seed) return res.status(404).json({ msg: 'No game found' });
			return res.json(result);
    }
}
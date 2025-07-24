import gamePlayersModel from '../Models/GamePlayersModel.js';

export default class GamePlayersController {

	static async getPlayerInGame(req, res) {
		const { gameId, userId } = req.params;

		const result = await gamePlayersModel.getByReference(
			{ game_id: gameId, user_id: userId },
			true
		);

		if (!result) return res.status(404).json({ msg: 'Player not found' });
			return res.json(result);
	}

	static async getPlayersInGame(req, res) {
		const { gameId } = req.params;

		const result = await gamePlayersModel.getByReference(
			{ game_id: gameId }
		);

		if (!result) return res.status(404).json({ msg: 'No players found' });
			return res.json(result);
	}

	static async createGamePlayer(req, res) {
		const { user_id, game_id, score } = req.body;
	
		if (!user_id || !game_id) {
			return res.status(400).json({ msg: 'Missing user_id or game_id' });
		}
	
		const result = await gamePlayersModel.create({
			input: {
				user_id,
				game_id,
				score,
			}
		});
	
		if (!result) return res.status(500).json({ msg: 'Error creating player' });
		return res.json(result);
	};
	
	static async updateGamePlayer(req, res) {
		const { user_id, game_id, score } = req.body;
	
		if (!user_id || !game_id) {
			return res.status(400).json({ msg: 'Missing user_id or game_id' });
		}
	
		const result = await gamePlayersModel.updateByReference(
			{ score },
			{ user_id, game_id }
		);
	
		if (!result || result.length === 0) {
			return res.status(404).json({ msg: 'Game player not found' });
		}
	
		return res.json(result[0]);
	}
};

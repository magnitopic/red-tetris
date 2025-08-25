import path from 'path';
import gamePlayersModel from '../Models/GamePlayersModel.js';
import db from '../Utils/dataBaseConnection.js';

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

        const result = await gamePlayersModel.getByReference({
            game_id: gameId,
        });

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
            },
        });

        if (!result)
            return res.status(500).json({ msg: 'Error creating player' });
        return res.json(result);
    }

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

    static async getTopPlayers(req, res) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;
        const topPlayers = await gamePlayersModel.getTopPlayers(10);
        if (!topPlayers) {
            return res
                .status(500)
                .json({ error: 'Error retrieving Top Players' });
        }

        const playersWithProfilePictures = topPlayers.map((player) => {
            const profilePicturePath = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${player.id}/profile-picture`;
            console.log(player);
            return {
                ...player,
                profilePicture: player.profilePicture || profilePicturePath,
            };
        });

        res.json(playersWithProfilePictures);
    }

    static async getIsPlaying({username}) {
        try {
    
            const query = {
                text: `
                    SELECT EXISTS (
                        SELECT 1
                        FROM users u
                        JOIN game_players gp ON u.id = gp.user_id
                        JOIN games g ON gp.game_id = g.id
                        WHERE u.username = $1
                        AND g.finished = false
                    ) AS is_playing;
                `,
                values: [username],
            };
    
            const result = await db.query(query);
    
            const isPlaying = result.rows[0]?.is_playing ?? false;
    
            return isPlaying;
        } catch (error) {
            console.error('Error checking if user is playing:', error.message);
            return null;
        }
    }
}

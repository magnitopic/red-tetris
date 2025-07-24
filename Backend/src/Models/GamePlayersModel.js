import Model from '../Core/Model.js';

class GamePlayersModel extends Model {
  constructor() {
    super('game_players');
  }

  async getTopPlayers(limit = 10) {
    const query = {
      text: `
        SELECT u.id, u.username, u.profile_picture, SUM(gp.score) AS total_score
        FROM game_players gp
        JOIN users u ON gp.user_id = u.id
        GROUP BY u.id, u.username, u.profile_picture
        ORDER BY total_score DESC
        LIMIT $1;
      `,
      values: [limit],
    };

    try {
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting top players:', error.message);
      return null;
    }
  }
}

const gamePlayersModel = new GamePlayersModel();
export default gamePlayersModel;
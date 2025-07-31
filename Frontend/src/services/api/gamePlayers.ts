import apiRequest from "./config";

export const gamePlayersApi = {
	getRanking: async () => {
		const response = await apiRequest(`game-players/top-players`);
		return response;
	},
};

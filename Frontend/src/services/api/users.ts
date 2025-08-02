import apiRequest from "./config";

export const usersApi = {
	getMe: async () => {
		const response = await apiRequest(`users/me`);
		return response;
	},

	getPublicProfile: async (username: string) => {
		const response = await apiRequest(`users/${username}`);
		return response;
	},
};

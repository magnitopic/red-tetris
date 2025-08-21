import apiRequest, { fileUploadRequest } from "./config";

export const profileApi = {
	getPrivateProfile: async (userId: string) => {
		const response = await apiRequest(`users/me`);
		return response;
	},

	uploadProfilePicture: async (userId: string, file: File) => {
		const formData = new FormData();
		formData.append("files", file);

		return fileUploadRequest(
			`users/${userId}/profile-picture`,
			formData,
			"PUT"
		);
	},
};

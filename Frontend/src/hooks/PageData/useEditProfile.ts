import { useState } from "react";
import { profileApi } from "../../services/api/profile";

export const useEditProfile = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const uploadProfilePicture = async (userId: string, file: File) => {
		setLoading(true);
		setError(null);
		try {
			const response = await profileApi.uploadProfilePicture(
				userId,
				file
			);
			return response;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Failed to upload profile picture";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return {
		uploadProfilePicture,
		loading,
		error,
	};
};

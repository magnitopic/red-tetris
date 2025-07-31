import { useState } from "react";
import { gamePlayersApi } from "../../services/api/gamePlayers";

export const useGamePlayers = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchRanking = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await gamePlayersApi.getRanking();
			return data;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch ranking";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return { fetchRanking, loading, error };
};

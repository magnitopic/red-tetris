import React, { useState, useEffect } from "react";
import Player from "./Player";
import { useGamePlayers } from "../../hooks/PageData/useGamePlayers";
import Spinner from "../../components/common/Spinner";

const Ranking: React.FC = () => {
	const [players, setPlayers] = useState([]);
	const { fetchRanking, loading, error } = useGamePlayers();

	useEffect(() => {
		const loadRanking = async () => {
			try {
				const rankingData = await fetchRanking();
				setPlayers(rankingData || []);
			} catch (err) {
				console.error("Error fetching ranking:", err);
			}
		};
		loadRanking();
	}, []);

	if (error) {
		return (
			<section className="flex flex-1 justify-center items-center flex-col bg-background-secondary p-12 rounded-lg min-w-96">
				<h2 className="text-3xl font-bold mb-6">
					Global Player Ranking
				</h2>
				<p className="text-red-500">Error: {error}</p>
			</section>
		);
	}

	return (
		<section className="flex flex-1 justify-center items-center flex-col bg-background-secondary p-12 rounded-lg min-w-96">
			<h2 className="text-3xl font-bold mb-6">Global Player Ranking</h2>
			{loading ? (
				<Spinner />
			) : players.length > 0 ? (
				players.map((player, index) => (
					<Player
						key={player.id || index}
						playerData={player}
						id={index}
					/>
				))
			) : (
				<p className="text-gray-500">No players ranked yet.</p>
			)}
		</section>
	);
};

export default Ranking;

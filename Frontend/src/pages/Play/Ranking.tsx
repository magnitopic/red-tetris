import React from "react";
import Player from "./Player";

const Ranking: React.FC = () => {
	const players = [
		{
			username: "Magnitopic",
			profilePicture:
				"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa-z-animals.com%2Fmedia%2F2018%2F09%2FGecko-on-stump.jpg&f=1&nofb=1&ipt=a7674f3db87d9d9790dfc0d48ede82d63c978137d138523df38235841421d3f7",
			score: 1000,
		},
		{
			username: "Player 2",
			profilePicture:
				"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa-z-animals.com%2Fmedia%2F2018%2F09%2FGecko-on-stump.jpg&f=1&nofb=1&ipt=a7674f3db87d9d9790dfc0d48ede82d63c978137d138523df38235841421d3f7",
			score: 900,
		},
		{
			username: "Player 3",
			profilePicture:
				"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa-z-animals.com%2Fmedia%2F2018%2F09%2FGecko-on-stump.jpg&f=1&nofb=1&ipt=a7674f3db87d9d9790dfc0d48ede82d63c978137d138523df38235841421d3f7",
			score: 800,
		},
		{
			username: "Player 3",
			profilePicture:
				"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa-z-animals.com%2Fmedia%2F2018%2F09%2FGecko-on-stump.jpg&f=1&nofb=1&ipt=a7674f3db87d9d9790dfc0d48ede82d63c978137d138523df38235841421d3f7",
			score: 800,
		},
		{
			username: "Player 3",
			profilePicture:
				"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa-z-animals.com%2Fmedia%2F2018%2F09%2FGecko-on-stump.jpg&f=1&nofb=1&ipt=a7674f3db87d9d9790dfc0d48ede82d63c978137d138523df38235841421d3f7",
			score: 800,
		},
		{
			username: "Player 3",
			profilePicture:
				"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa-z-animals.com%2Fmedia%2F2018%2F09%2FGecko-on-stump.jpg&f=1&nofb=1&ipt=a7674f3db87d9d9790dfc0d48ede82d63c978137d138523df38235841421d3f7",
			score: 800,
		},
		{
			username: "Player 3",
			profilePicture:
				"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa-z-animals.com%2Fmedia%2F2018%2F09%2FGecko-on-stump.jpg&f=1&nofb=1&ipt=a7674f3db87d9d9790dfc0d48ede82d63c978137d138523df38235841421d3f7",
			score: 800,
		},
	];
	return (
		<section className="flex flex-1 justify-center items-center flex-col bg-background-secondary p-12 rounded-lg min-w-96">
			<h2 className="text-3xl font-bold mb-6">Global Player Ranking</h2>
			{players.length > 0 ? (
				players.map((player, index) => (
					<Player key={index} playerData={player} id={index} />
				))
			) : (
				<p className="text-gray-500">No players ranked yet.</p>
			)}
		</section>
	);
};

export default Ranking;

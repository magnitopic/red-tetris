import React from "react";
import RegularButton from "../../components/common/RegularButton";

const HostScreen: React.FC = ({ currentPlayers, seed, socket, setPlaying }) => {
	return (
		<main className="flex flex-1 justify-center items-center flex-col w-full my-10">
			<h1 className="text-4xl font-bold mb-4">You are the game host!</h1>
			<p className="mb-4">
				Share the game code with your friends to play together.
			</p>
			<section className="flex justify-center items-center flex-col bg-background-secondary p-10 rounded-lg w-fit">
				<p className="text-lg font-semibold mb-2">Game Code:</p>
				<div className="bg-black p-3 rounded-lg">
					<span className="text-xl font-bold">{seed}</span>
				</div>
				<p className="text-sm text-gray-500 mt-2">
					Share this code with your friends!
				</p>

				<p className="text-lg font-semibold mt-2">
					Connected players: {currentPlayers.length}
				</p>
			</section>
			<section className="mt-8">
				<RegularButton
					value="Start Game"
					type="button"
					callback={() => {
						console.log("I wanna start!!!");
						
						socket.emit("start_game");
					}}
				/>
			</section>
		</main>
	);
};

export default HostScreen;

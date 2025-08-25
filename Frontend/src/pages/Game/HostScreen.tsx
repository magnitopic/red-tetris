import React from "react";
import RegularButton from "../../components/common/RegularButton";

interface Player {
	id: string;
	name: string;
}

interface HostScreenProps {
	currentPlayers: Player[];
	seed: string;
	socket: any;
	setPlaying: (playing: boolean) => void;
	userId: string;
}

const HostScreen: React.FC<HostScreenProps> = ({
	currentPlayers,
	seed,
	socket,
	setPlaying,
	userId,
}) => {
	return (
		<main
			className="flex flex-1 justify-center items-center flex-col w-full my-10"
			data-testid="host-screen"
		>
			<section className="flex justify-center items-center flex-col p-10 w-full text-center">
				<h1 className="text-4xl font-bold mb-4">
					You are the game host!
				</h1>
				<p>Share the game code with your friends to play together.</p>
				<p className="mb-4 ">
					Or try reaching the top score by yourself!
				</p>
			</section>
			<section className="flex justify-center items-center flex-col bg-background-secondary p-10 rounded-lg w-fit">
				<p className="text-lg font-semibold mb-2">Game Code:</p>
				<div className="bg-black p-3 rounded-lg">
					<span className="text-xl font-bold">{seed}</span>
				</div>
				<p className="text-sm text-gray-500 mt-2">
					Share this code with your friends!
				</p>

				<p className="text-lg font-semibold mt-2">
					Connected players: {currentPlayers?.length || 0}
				</p>
			</section>
			<section className="mt-8">
				<RegularButton
					value="Start Game"
					type="button"
					callback={() => {
						socket.emit("start_game", {
							userId: userId,
						});
					}}
				/>
			</section>
		</main>
	);
};

export default HostScreen;

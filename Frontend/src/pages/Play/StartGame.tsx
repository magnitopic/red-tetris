import React from "react";
import FormInput from "../../components/common/FormInput";
import RegularButton from "../../components/common/RegularButton";

const StartGame: React.FC = () => {
	const [gameCode, setGameCode] = React.useState("");
	return (
		<section className="flex flex-1 justify-center items-center flex-col bg-background-secondary p-10 rounded-lg w-full">
			<h2 className="text-3xl font-bold mb-6">Start playing!</h2>
			<p className="text-font-secondary mb-4">
				Either create a new game or join an existing one
			</p>

			<div className="mb-10">
				<RegularButton
					value="Create Game"
					disabled={false}
					alternative={true}
					onClick={() => {
						// Logic to create a new game
					}}
				/>
			</div>

			<details className="mb-10 bg-primary-monochromatic text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300">
				<summary className="cursor-pointer text-lg font-semibold mb-2">
					Join an existing game!
				</summary>
				<div className="flex flex-col gap-4 items-center">
					<FormInput
						placeholder="Enter game code"
						name="gameCode"
						value={gameCode}
						onChange={(e) => setGameCode(e.target.value)}
					/>
					<RegularButton
						value="Join Game"
						disabled={false}
						onClick={() => {
							// Logic to join the game using gameCode
						}}
					/>
				</div>
			</details>
		</section>
	);
};

export default StartGame;

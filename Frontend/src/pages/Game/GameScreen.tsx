/* import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext"; */
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ExitModal from "./ExitModal";

import { usersApi } from "../../services/api/users";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 22;

interface GameState {
	board: number[][];
	currentPiece: {
		shape: number[][];
		x: number;
		y: number;
		color: number;
	} | null;
	gameOver: boolean;
}

const COLORS: { [key: number]: string } = {
	1: "bg-cyan-500 border-cyan-700", // I
	2: "bg-blue-600 border-blue-700", // J
	3: "bg-orange-500 border-orange-700", // L
	4: "bg-yellow-400 border-yellow-600", // O
	5: "bg-green-500 border-green-700", // S
	6: "bg-purple-500 border-purple-700", // T
	7: "bg-red-500 border-red-700", // Z
	8: "bg-gray-500 border-gray-700", // Garbage
};

interface Spectrum {
	state: GameState;
	playerName: string;
}

const index: React.FC = ({ socket, spectrums, gameState }) => {
	const [playerName, setPlayerName] = useState("Guest");
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await usersApi.getMe();
				if (response.msg?.username) {
					setPlayerName(response.msg.username);
					setUserId(response.msg.id);
				}
			} catch (e) {
				console.error("Error fetching user:", e);
			}
		};
		fetchUser();
	}, []);

	useEffect(() => {
		console.log("reload");
	}, [gameState, spectrums]);

	if (!gameState) {
		return (
			<div className="text-center mt-10 text-xl text-gray-500">
				Loading game...
			</div>
		);
	}

	const { board, currentPiece, gameOver } = gameState;

	const boardWithPiece = board.map((row: any) => [...row]);

	if (!gameOver && currentPiece) {
		currentPiece.shape.forEach((row: any[], dy: any) => {
			row.forEach((cell, dx) => {
				if (cell) {
					const x = currentPiece.x + dx;
					const y = currentPiece.y + dy;
					if (
						y >= 0 &&
						y < BOARD_HEIGHT &&
						x >= 0 &&
						x < BOARD_WIDTH
					) {
						boardWithPiece[y][x] = cell;
					}
				}
			});
		});
	}

	return (
		<div className="flex justify-center mt-8">
			{/*Main Board */}
			<div
				className="grid grid-cols-10 gap-0.5 bg-primary-dark p-1 rounded"
				style={{ width: 300, height: 660 }}
			>
				{boardWithPiece.flat().map((cell, idx) => {
					const y = Math.floor(idx / BOARD_WIDTH);
					return (
						<div
							key={idx}
							className={`w-7 h-7 ${
								cell
									? `${
											COLORS[cell] ||
											"bg-white border-white"
									  }`
									: y < 2
									? ""
									: "bg-gray-900 border border-gray-700"
							}`}
						/>
					);
				})}
			</div>{" "}
			{/* End Main Board */}
			<div className="flex flex-col gap-2 m-4 w-[180px]">
				{" "}
				{/* Spectrums Boards */}
				{Object.entries(spectrums).map(([id, spec]) => {
					if (
						!Array.isArray(spec.state?.board) ||
						!Array.isArray(spec.state.board[0])
					) {
						return null;
					}

					return (
						<div key={id} className="border p-1">
							<div className="text-md text-center text-gray-100 mb-1">
								{spec.playerName}
							</div>
							<div className="grid grid-cols-10 gap-0.5">
								{spec.state.board.flat().map((cell, idx) => {
									const y = Math.floor(idx / BOARD_WIDTH);
									return (
										<div
											key={idx}
											className={`w-3 h-3 ${
												cell
													? `${
															COLORS[cell] ||
															"bg-white border-white"
													  }`
													: y < 2
													? ""
													: "bg-gray-900 border border-gray-700"
											}`}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>{" "}
			{
				gameOver && (
					<ExitModal userScore={gameState.score} />
				)
			}
		</div>
	);
};

export default index;

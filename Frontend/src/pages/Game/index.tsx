/* import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext"; */
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 22;

const COLORS: { [key: number]: string } = {
	1: "bg-cyan-500 border-cyan-700", // I
	2: "bg-blue-600 border-blue-700", // J
	3: "bg-orange-500 border-orange-700", // L
	4: "bg-yellow-400 border-yellow-600", // O
	5: "bg-green-500 border-green-700", // S
	6: "bg-purple-500 border-purple-700", // T
	7: "bg-red-500 border-red-700", // Z
};

const index: React.FC = () => {
	const [gameState, setGameState] = useState(null);

	useEffect(() => {
		const socket = io("http://localhost:3001");

		socket.on("connect", () => {
			console.log("Connected to server");
		});

		socket.emit("join_room", {
			room: "room123",
			playerName: "Alex",
			BOARD_WIDTH,
			BOARD_HEIGHT,
		});

		socket.on("joined_room", ({ host, players }) => {
			console.log(`Is host: ${host}`);
			console.log(`Current players: ${players}`);
		});

		socket.emit("start_game");

		socket.on("game_state", (state: GameState) => {
			setGameState(state);
		});

		// Events
		const onKeyDown = (e: KeyboardEvent) => {
			if (!socket) return;
			if (e.key === "ArrowLeft") socket.emit("move_left");
			if (e.key === "ArrowRight") socket.emit("move_right");
			if (e.key === "ArrowUp") socket.emit("rotate");
			if (e.key === "ArrowDown") socket.emit("soft_drop");
			if (e.key === " ") socket.emit("hard_drop");
			if (e.key === "Escape") socket.disconnect();
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			socket.disconnect();
			window.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	if (!gameState) {
		return (
			<div className="text-center mt-10 text-xl text-gray-500">
				Loading game...
			</div>
		);
	}

	const { board, currentPiece, gameOver } = gameState;

	const boardWithPiece = board.map((row) => [...row]);

	if (!gameOver && currentPiece) {
		currentPiece.shape.forEach((row, dy) => {
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
			<div
				className="grid grid-cols-10 gap-0.5 bg-gray-500 p-1 rounded"
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
									? "bg-gray-900/10 border border-gray-700/50"
									: "bg-gray-900 border border-gray-700"
							}`}
						/>
					);
				})}
			</div>
			{gameOver && (
				<div className="mt-4 text-red-600 text-2xl font-bold">
					Game Over
				</div>
			)}
		</div>
	);
};

export default index;

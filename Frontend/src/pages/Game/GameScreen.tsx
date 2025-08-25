import { useState, useEffect } from "react";
import ExitModal from "./ExitModal";
import Board from "./Board";
import { useBreakpoints } from "../../hooks/useBreakpoints";

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

interface Spectrum {
	state: GameState;
	playerName: string;
}

const index: React.FC = ({ socket, spectrums, gameState }) => {
	const [playerName, setPlayerName] = useState("Guest");
	const [userId, setUserId] = useState(null);
	const { isMobile, isTablet, isDesktop } = useBreakpoints();

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
		// Prevent default space key behavior
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space") {
				e.preventDefault();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	if (!gameState) {
		return (
			<div className="text-center mt-10 text-xl text-gray-500">
				Loading game...
			</div>
		);
	}

	// Defensive: fallback to [] if board is undefined
	const { board = [], currentPiece, gameOver } = gameState;

	// Defensive: fallback to [] if board is not an array
	const boardWithPiece = Array.isArray(board)
		? board.map((row: any) => [...row])
		: [];

	// Don't render main board if it not created
	const shouldRenderMainBoard =
		Array.isArray(boardWithPiece) && boardWithPiece.length > 0;

	if (!gameOver && currentPiece && Array.isArray(currentPiece.shape)) {
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

	return isTablet || isDesktop ? (
		<div className="flex flex-row gap-4 p-4" data-testid="game-screen">
			<div className="flex-1 grid grid-cols-3 grid-rows-3 gap-4 flex-wrap ">
				{Object.entries(spectrums).map(([id, spec], index: number) => {
					const spectrumBoard = Array.isArray(spec.state?.board)
						? spec.state.board
						: [];
					if (index / 2 === 0 && spectrumBoard.length > 0) {
						return (
							<Board
								key={id}
								state={spectrumBoard}
								score={spec.state?.score}
								playerName={spec.playerName}
							/>
						);
					}
				})}
			</div>
			<div className="flex-1">
				{shouldRenderMainBoard && (
					<Board
						state={boardWithPiece}
						playerName={playerName}
						score={gameState.score}
						isMain={true}
					/>
				)}
			</div>
			<div className="flex-1 grid grid-cols-3 grid-rows-3 gap-4">
				{Object.entries(spectrums).map(([id, spec], index: number) => {
					const spectrumBoard = Array.isArray(spec.state?.board)
						? spec.state.board
						: [];
					if (index / 2 !== 0 && spectrumBoard.length > 0) {
						return (
							<Board
								key={id}
								state={spectrumBoard}
								score={spec.state?.score}
								playerName={spec.playerName}
							/>
						);
					}
				})}
			</div>
			{gameOver && <ExitModal userScore={gameState.score} />}
		</div>
	) : (
		<div
			className="flex flex-col items-center p-4"
			data-testid="game-screen"
		>
			{shouldRenderMainBoard && (
				<Board
					state={boardWithPiece}
					playerName={playerName}
					score={gameState.score}
					isMain={true}
				/>
			)}
			<div className="flex flex-row gap-4 mt-4 flex-wrap justify-center">
				{Object.entries(spectrums).map(([id, spec], index: number) => {
					const spectrumBoard = Array.isArray(spec.state?.board)
						? spec.state.board
						: [];
					if (spectrumBoard.length > 0) {
						return (
							<Board
								key={id}
								state={spectrumBoard}
								score={spec.state?.score}
								playerName={spec.playerName}
							/>
						);
					}
				})}
			</div>
			{gameOver && <ExitModal userScore={gameState.score} />}
		</div>
	);
};

export default index;

import React from "react";

interface BoardProps {
	state: number[][];
	playerName: string;
	score: number;
	isMain?: boolean; // for styling
}

const Board: React.FC<BoardProps> = ({
	state,
	playerName,
	score,
	isMain = false,
}) => {
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
		8: "bg-gray-500 border-gray-700", // Garbage
	};

	return (
		<div className="border p-3 flex flex-col items-center">
			<p className="text-center text-2xl font-bold">{playerName}</p>
			<p className="text-center text-2xl font-bold">{score}</p>
			<div
				className={`grid grid-cols-10 gap-0.5 ${
					isMain ? "bg-primary-dark p-1 rounded" : ""
				}`}
				style={isMain ? { width: 300, height: 660 } : {}}
			>
				{state.flat().map((cell, idx) => {
					const y = Math.floor(idx / BOARD_WIDTH);
					return (
						<div
							key={idx}
							className={`${isMain ? "w-7 h-7" : "w-3 h-3"} ${
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
};

export default Board;

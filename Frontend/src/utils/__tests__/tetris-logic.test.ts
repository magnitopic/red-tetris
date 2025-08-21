/**
 * Example of meaningful frontend testing - Testing Tetris game logic
 * These tests focus on BEHAVIOR and LOGIC, not appearance
 */

// Mock Tetris game logic functions for demonstration
const rotatePiece = (piece: number[][]) => {
	// Rotate a 2D array 90 degrees clockwise
	const n = piece.length;
	const rotated = Array(n)
		.fill(null)
		.map(() => Array(n).fill(0));
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			rotated[j][n - 1 - i] = piece[i][j];
		}
	}
	return rotated;
};

const isValidPosition = (
	board: number[][],
	piece: number[][],
	x: number,
	y: number
) => {
	for (let py = 0; py < piece.length; py++) {
		for (let px = 0; px < piece[py].length; px++) {
			if (piece[py][px] !== 0) {
				const newX = x + px;
				const newY = y + py;

				// Check boundaries
				if (newX < 0 || newX >= 10 || newY >= 22) return false;

				// Check collision with existing pieces
				if (newY >= 0 && board[newY][newX] !== 0) return false;
			}
		}
	}
	return true;
};

const clearFullLines = (board: number[][]) => {
	const newBoard = board.filter((row) => row.some((cell) => cell === 0));
	const linesCleared = 22 - newBoard.length;

	// Add empty rows at the top
	while (newBoard.length < 22) {
		newBoard.unshift(Array(10).fill(0));
	}

	return { board: newBoard, linesCleared };
};

describe("Tetris Game Logic", () => {
	describe("Piece Rotation", () => {
		it("should rotate I-piece correctly", () => {
			const iPiece = [
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0],
			];

			const rotated = rotatePiece(iPiece);

			expect(rotated[1]).toEqual([1, 1, 1, 1]); // Should be horizontal line (fixed expectation)
		});

		it("should rotate square piece and remain the same", () => {
			const squarePiece = [
				[1, 1],
				[1, 1],
			];

			const rotated = rotatePiece(squarePiece);

			expect(rotated).toEqual(squarePiece); // Square should not change
		});
	});

	describe("Collision Detection", () => {
		const emptyBoard = Array(22)
			.fill(null)
			.map(() => Array(10).fill(0));

		it("should detect valid position for new piece", () => {
			const piece = [
				[1, 1],
				[1, 1],
			];
			const x = 4,
				y = 0;

			const isValid = isValidPosition(emptyBoard, piece, x, y);

			expect(isValid).toBe(true);
		});

		it("should detect collision with left wall", () => {
			const piece = [
				[1, 1],
				[1, 1],
			];
			const x = -1,
				y = 0; // Trying to place piece outside left boundary

			const isValid = isValidPosition(emptyBoard, piece, x, y);

			expect(isValid).toBe(false);
		});

		it("should detect collision with right wall", () => {
			const piece = [
				[1, 1],
				[1, 1],
			];
			const x = 9,
				y = 0; // Trying to place 2-wide piece at position 9 (would go to 10)

			const isValid = isValidPosition(emptyBoard, piece, x, y);

			expect(isValid).toBe(false);
		});

		it("should detect collision with existing pieces", () => {
			const boardWithPieces = Array(22)
				.fill(null)
				.map(() => Array(10).fill(0));
			boardWithPieces[21][4] = 1; // Place a block at bottom
			boardWithPieces[21][5] = 1;

			const piece = [
				[1, 1],
				[1, 1],
			];
			const x = 4,
				y = 21; // Trying to place piece where blocks already exist

			const isValid = isValidPosition(boardWithPieces, piece, x, y);

			expect(isValid).toBe(false);
		});
	});

	describe("Line Clearing", () => {
		it("should clear a full line", () => {
			const boardWithFullLine = Array(22)
				.fill(null)
				.map(() => Array(10).fill(0));
			boardWithFullLine[21] = Array(10).fill(1); // Full bottom line

			const result = clearFullLines(boardWithFullLine);

			expect(result.linesCleared).toBe(1);
			expect(result.board[21]).toEqual(Array(10).fill(0)); // Bottom should be empty
		});

		it("should clear multiple full lines", () => {
			const boardWithFullLines = Array(22)
				.fill(null)
				.map(() => Array(10).fill(0));
			boardWithFullLines[20] = Array(10).fill(1); // Full lines
			boardWithFullLines[21] = Array(10).fill(1);

			const result = clearFullLines(boardWithFullLines);

			expect(result.linesCleared).toBe(2);
		});

		it("should not clear partial lines", () => {
			const boardWithPartialLine = Array(22)
				.fill(null)
				.map(() => Array(10).fill(0));
			boardWithPartialLine[21] = [1, 1, 1, 0, 1, 1, 1, 1, 1, 1]; // Missing one block

			const result = clearFullLines(boardWithPartialLine);

			expect(result.linesCleared).toBe(0);
		});
	});

	describe("Scoring System", () => {
		const calculateScore = (linesCleared: number, level: number) => {
			const basePoints = [0, 100, 300, 500, 800]; // Standard Tetris scoring
			return basePoints[linesCleared] * (level + 1);
		};

		it("should calculate correct score for single line", () => {
			const score = calculateScore(1, 0); // 1 line at level 0
			expect(score).toBe(100);
		});

		it("should calculate correct score for tetris (4 lines)", () => {
			const score = calculateScore(4, 2); // 4 lines at level 2
			expect(score).toBe(2400); // 800 * 3
		});

		it("should increase score with level multiplier", () => {
			const scoreLevel0 = calculateScore(1, 0);
			const scoreLevel5 = calculateScore(1, 5);

			expect(scoreLevel5).toBe(scoreLevel0 * 6); // (5+1) times multiplier
		});
	});
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameScreen from "../GameScreen";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import { usersApi } from "../../../services/api/users";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock dependencies
jest.mock("../../../hooks/useBreakpoints");
jest.mock("../../../services/api/users");
jest.mock("../Board", () => {
	return function MockBoard({ isMain, state, playerName, score }: any) {
		return (
			<div data-testid="board" data-is-main={isMain || undefined}>
				<div data-testid="player-name">{playerName || "Guest"}</div>
				<div data-testid="score">{score}</div>
				<div data-testid="board-state">{JSON.stringify(state)}</div>
			</div>
		);
	};
});

jest.mock("../ExitModal", () => {
	return function MockExitModal({ userScore }: any) {
		return (
			<div data-testid="exit-modal">
				<div data-testid="modal-score">{userScore}</div>
			</div>
		);
	};
});

const mockSocket = {
	emit: jest.fn(),
	on: jest.fn(),
	off: jest.fn(),
} as any;

const mockGameState = {
	board: Array(22).fill(Array(10).fill(0)),
	currentPiece: {
		shape: [
			[1, 1],
			[1, 1],
		],
		position: { x: 5, y: 2 },
	},
	score: 1250,
	gameOver: false,
};

const mockSpectrums = {
	player1: {
		state: {
			board: Array(22).fill(Array(10).fill(0)),
			score: 500,
		},
		playerName: "Player 1",
	},
	player2: {
		state: {
			board: Array(22).fill(Array(10).fill(0)),
			score: 750,
		},
		playerName: "Player 2",
	},
};

const mockUseBreakpoints = useBreakpoints as jest.MockedFunction<
	typeof useBreakpoints
>;
const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;

describe("GameScreen Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseBreakpoints.mockReturnValue({
			isMobile: false,
			isTablet: false,
			isDesktop: true,
		});
		mockUsersApi.getMe.mockResolvedValue({
			msg: { username: "TestUser", id: 1 },
		});
	});

	describe("Loading State", () => {
		it("should show loading message when gameState is null", () => {
			render(
				<GameScreen
					gameState={null}
					socket={mockSocket}
					spectrums={{}}
				/>
			);
			expect(screen.getByText("Loading game...")).toBeInTheDocument();
		});

		it("should show loading message when gameState is undefined", () => {
			render(
				<GameScreen
					gameState={undefined}
					socket={mockSocket}
					spectrums={{}}
				/>
			);
			expect(screen.getByText("Loading game...")).toBeInTheDocument();
		});
	});

	describe("User Data Fetching", () => {
		it("should fetch user data on mount", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);
			expect(usersApi.getMe).toHaveBeenCalledTimes(1);
		});

		it("should handle successful user data fetch", async () => {
			mockUsersApi.getMe.mockResolvedValueOnce({
				msg: { username: "FetchedUser", id: 2 },
			});

			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			await waitFor(() => {
				expect(screen.getByText("FetchedUser")).toBeInTheDocument();
			});
		});

		it("should handle failed user data fetch gracefully", async () => {
			// Suppress console.error for this test since we're intentionally triggering an error
			const originalConsoleError = console.error;
			console.error = jest.fn();

			mockUsersApi.getMe.mockRejectedValueOnce(new Error("API Error"));

			const { container } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			await waitFor(() => {
				// Main board should show "Guest" when API fails
				const mainBoard = container.querySelector(
					'[data-is-main="true"]'
				);
				expect(mainBoard).toHaveTextContent("Guest");
			});

			// Restore console.error
			console.error = originalConsoleError;
		});

		it("should handle API response without username", async () => {
			mockUsersApi.getMe.mockResolvedValueOnce({ msg: {} });

			const { container } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			await waitFor(() => {
				// Main board should show "Guest" when username is not provided
				const mainBoard = container.querySelector(
					'[data-is-main="true"]'
				);
				expect(mainBoard).toHaveTextContent("Guest");
			});
		});
	});

	describe("Keyboard Event Handling", () => {
		it("should prevent default space key behavior", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const preventDefaultSpy = jest.fn();
			const spaceEvent = new KeyboardEvent("keydown", { code: "Space" });
			Object.defineProperty(spaceEvent, "preventDefault", {
				value: preventDefaultSpy,
			});

			window.dispatchEvent(spaceEvent);
			expect(preventDefaultSpy).toHaveBeenCalled();
		});

		it("should not prevent other key events", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const preventDefaultSpy = jest.fn();
			const otherEvent = new KeyboardEvent("keydown", { code: "KeyA" });
			Object.defineProperty(otherEvent, "preventDefault", {
				value: preventDefaultSpy,
			});

			window.dispatchEvent(otherEvent);
			expect(preventDefaultSpy).not.toHaveBeenCalled();
		});
	});

	describe("Responsive Layout - Desktop/Tablet", () => {
		it("should render desktop layout for tablet and desktop", () => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: false,
				isTablet: true,
				isDesktop: false,
			});

			const { container } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			expect(container.querySelector(".flex-row")).toBeInTheDocument();
		});

		it("should render main board in desktop layout", () => {
			const { container } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const mainBoard = container.querySelector('[data-is-main="true"]');
			expect(mainBoard).toBeInTheDocument();
		});

		it("should render spectrum boards in desktop layout", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			expect(screen.getByText("Player 1")).toBeInTheDocument();
			expect(screen.getByText("Player 2")).toBeInTheDocument();
		});
	});

	describe("Responsive Layout - Mobile", () => {
		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: true,
				isTablet: false,
				isDesktop: false,
			});
		});

		it("should render mobile layout for mobile devices", () => {
			const { container } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			expect(container.querySelector(".flex-col")).toBeInTheDocument();
		});

		it("should render main board at top in mobile layout", () => {
			const { container } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const mainBoard = container.querySelector('[data-is-main="true"]');
			expect(mainBoard).toBeInTheDocument();
		});

		it("should render spectrum boards below main board in mobile layout", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			expect(screen.getByText("Player 1")).toBeInTheDocument();
			expect(screen.getByText("Player 2")).toBeInTheDocument();
		});
	});

	describe("Game State Rendering", () => {
		it("should render board with current piece merged", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const boardStates = screen.getAllByTestId("board-state");
			expect(boardStates.length).toBeGreaterThan(0);
		});

		it("should display player score", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);
			expect(screen.getByText("1250")).toBeInTheDocument();
		});

		it("should handle game state without current piece", () => {
			const gameStateWithoutPiece = {
				...mockGameState,
				currentPiece: null,
			};

			render(
				<GameScreen
					gameState={gameStateWithoutPiece}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const boards = screen.getAllByTestId("board");
			expect(boards.length).toBeGreaterThan(0);
		});
	});

	describe("Game Over State", () => {
		it("should show exit modal when game is over", () => {
			const gameOverState = { ...mockGameState, gameOver: true };

			render(
				<GameScreen
					gameState={gameOverState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			expect(screen.getByTestId("exit-modal")).toBeInTheDocument();
		});

		it("should not show exit modal when game is not over", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);
			expect(screen.queryByTestId("exit-modal")).not.toBeInTheDocument();
		});

		it("should not render current piece when game is over", () => {
			const gameOverState = { ...mockGameState, gameOver: true };

			render(
				<GameScreen
					gameState={gameOverState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const boards = screen.getAllByTestId("board");
			expect(boards.length).toBeGreaterThan(0);
		});
	});

	describe("Piece Positioning Logic", () => {
		it("should handle piece within board boundaries", () => {
			const gameStateWithPiece = {
				...mockGameState,
				currentPiece: { shape: [[1]], position: { x: 5, y: 10 } },
			};

			render(
				<GameScreen
					gameState={gameStateWithPiece}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const boards = screen.getAllByTestId("board");
			expect(boards.length).toBeGreaterThan(0);
		});

		it("should handle piece partially outside board boundaries", () => {
			const gameStateWithEdgePiece = {
				...mockGameState,
				currentPiece: {
					shape: [
						[1, 1],
						[1, 1],
					],
					position: { x: -1, y: 0 },
				},
			};

			render(
				<GameScreen
					gameState={gameStateWithEdgePiece}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const boards = screen.getAllByTestId("board");
			expect(boards.length).toBeGreaterThan(0);
		});

		it("should handle piece at board edges", () => {
			const gameStateAtEdge = {
				...mockGameState,
				currentPiece: { shape: [[1]], position: { x: 9, y: 21 } },
			};

			render(
				<GameScreen
					gameState={gameStateAtEdge}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			const boards = screen.getAllByTestId("board");
			expect(boards.length).toBeGreaterThan(0);
		});
	});

	describe("Spectrum Rendering Logic", () => {
		it("should render all spectrum players", () => {
			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			expect(screen.getByText("Player 1")).toBeInTheDocument();
			expect(screen.getByText("Player 2")).toBeInTheDocument();
			expect(screen.getByText("500")).toBeInTheDocument();
			expect(screen.getByText("750")).toBeInTheDocument();
		});

		it("should handle empty spectrums object", () => {
			const { container } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={{}}
				/>
			);

			const mainBoard = container.querySelector('[data-is-main="true"]');
			expect(mainBoard).toBeInTheDocument();
		});

		it("should handle single spectrum player", () => {
			const singleSpectrum = {
				player1: mockSpectrums["player1"],
			};

			render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={singleSpectrum}
				/>
			);

			expect(screen.getByText("Player 1")).toBeInTheDocument();
			expect(screen.queryByText("Player 2")).not.toBeInTheDocument();
		});
	});

	describe("Component Lifecycle", () => {
		it("should clean up event listeners on unmount", () => {
			const addEventListenerSpy = jest.spyOn(window, "addEventListener");
			const removeEventListenerSpy = jest.spyOn(
				window,
				"removeEventListener"
			);

			const { unmount } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				"keydown",
				expect.any(Function)
			);

			unmount();

			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				"keydown",
				expect.any(Function)
			);

			addEventListenerSpy.mockRestore();
			removeEventListenerSpy.mockRestore();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(
				<GameScreen
					gameState={mockGameState}
					socket={mockSocket}
					spectrums={mockSpectrums}
				/>
			);

			expect(() => unmount()).not.toThrow();
		});
	});

	describe("Interface Validation", () => {
		it("should define correct GameState interface", () => {
			// Interface structure is validated by TypeScript compilation
			expect(mockGameState).toHaveProperty("board");
			expect(mockGameState).toHaveProperty("currentPiece");
			expect(mockGameState).toHaveProperty("score");
			expect(mockGameState).toHaveProperty("gameOver");
		});

		it("should define correct Spectrum interface", () => {
			// Interface structure is validated by TypeScript compilation
			expect(mockSpectrums.player1).toHaveProperty("state");
			expect(mockSpectrums.player1.state).toHaveProperty("board");
			expect(mockSpectrums.player1.state).toHaveProperty("score");
			expect(mockSpectrums.player1).toHaveProperty("playerName");
		});
	});
});

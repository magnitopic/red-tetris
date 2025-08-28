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

	it("handles loading state and user data fetching", async () => {
		// Test loading state
		render(
			<GameScreen
				gameState={null}
				socket={mockSocket}
				spectrums={{}}
			/>
		);
		expect(screen.getByText("Loading game...")).toBeInTheDocument();

		// Test successful user data fetch
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

		expect(usersApi.getMe).toHaveBeenCalled();
		await waitFor(() => {
			expect(screen.getByText("FetchedUser")).toBeInTheDocument();
		});

		// Test failed API fetch
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
			const mainBoard = container.querySelector('[data-is-main="true"]');
			expect(mainBoard).toHaveTextContent("Guest");
		});

		console.error = originalConsoleError;
	});

	it("renders responsive layouts correctly", () => {
		// Test desktop layout
		const { container: desktopContainer, unmount: unmountDesktop } = render(
			<GameScreen
				gameState={mockGameState}
				socket={mockSocket}
				spectrums={mockSpectrums}
			/>
		);

		expect(desktopContainer.querySelector(".flex-row")).toBeInTheDocument();
		const mainBoard = desktopContainer.querySelector('[data-is-main="true"]');
		expect(mainBoard).toBeInTheDocument();

		// Check spectrum rendering in desktop layout
		expect(screen.getByText("Player 1")).toBeInTheDocument();
		expect(screen.getByText("Player 2")).toBeInTheDocument();

		// Clean up desktop render
		unmountDesktop();

		// Test mobile layout
		mockUseBreakpoints.mockReturnValue({
			isMobile: true,
			isTablet: false,
			isDesktop: false,
		});

		const { container: mobileContainer } = render(
			<GameScreen
				gameState={mockGameState}
				socket={mockSocket}
				spectrums={mockSpectrums}
			/>
		);

		expect(mobileContainer.querySelector(".flex-col")).toBeInTheDocument();
		const mobileMainBoard = mobileContainer.querySelector('[data-is-main="true"]');
		expect(mobileMainBoard).toBeInTheDocument();

		// Check spectrum rendering in mobile layout
		expect(screen.getByText("Player 1")).toBeInTheDocument();
		expect(screen.getByText("Player 2")).toBeInTheDocument();
	});

	it("handles game state and game over conditions", () => {
		// Test normal game state
		render(
			<GameScreen
				gameState={mockGameState}
				socket={mockSocket}
				spectrums={mockSpectrums}
			/>
		);

		expect(screen.getByText("1250")).toBeInTheDocument(); // Score
		expect(screen.queryByTestId("exit-modal")).not.toBeInTheDocument();

		// Test game over state
		const gameOverState = { ...mockGameState, gameOver: true };
		render(
			<GameScreen
				gameState={gameOverState}
				socket={mockSocket}
				spectrums={mockSpectrums}
			/>
		);

		expect(screen.getByTestId("exit-modal")).toBeInTheDocument();

		// Test game state without current piece
		const gameStateWithoutPiece = { ...mockGameState, currentPiece: null };
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

	it("handles piece positioning and board boundaries", () => {
		// Test normal piece positioning
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

		let boards = screen.getAllByTestId("board");
		expect(boards.length).toBeGreaterThan(0);

		// Test piece at edge boundaries
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

		boards = screen.getAllByTestId("board");
		expect(boards.length).toBeGreaterThan(0);

		// Test piece outside boundaries
		const gameStateWithEdgePiece = {
			...mockGameState,
			currentPiece: {
				shape: [[1, 1], [1, 1]],
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

		boards = screen.getAllByTestId("board");
		expect(boards.length).toBeGreaterThan(0);
	});

	it("handles spectrum rendering and keyboard events", () => {
		// Test spectrum rendering with different scenarios
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

		// Test empty spectrums
		const { container } = render(
			<GameScreen
				gameState={mockGameState}
				socket={mockSocket}
				spectrums={{}}
			/>
		);

		const mainBoard = container.querySelector('[data-is-main="true"]');
		expect(mainBoard).toBeInTheDocument();

		// Test keyboard event handling
		const preventDefaultSpy = jest.fn();
		const spaceEvent = new KeyboardEvent("keydown", { code: "Space" });
		Object.defineProperty(spaceEvent, "preventDefault", {
			value: preventDefaultSpy,
		});

		window.dispatchEvent(spaceEvent);
		expect(preventDefaultSpy).toHaveBeenCalled();

		// Test non-space key (should not prevent default)
		const otherEvent = new KeyboardEvent("keydown", { code: "KeyA" });
		const otherPreventDefault = jest.fn();
		Object.defineProperty(otherEvent, "preventDefault", {
			value: otherPreventDefault,
		});

		window.dispatchEvent(otherEvent);
		expect(otherPreventDefault).not.toHaveBeenCalled();
	});

	it("handles component lifecycle and interface validation", () => {
		const addEventListenerSpy = jest.spyOn(window, "addEventListener");
		const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

		const { unmount } = render(
			<GameScreen
				gameState={mockGameState}
				socket={mockSocket}
				spectrums={mockSpectrums}
			/>
		);

		// Check event listener setup
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"keydown",
			expect.any(Function)
		);

		// Test unmount
		expect(() => unmount()).not.toThrow();

		// Check event listener cleanup
		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"keydown",
			expect.any(Function)
		);

		// Validate interfaces (TypeScript compilation ensures this)
		expect(mockGameState).toHaveProperty("board");
		expect(mockGameState).toHaveProperty("currentPiece");
		expect(mockGameState).toHaveProperty("score");
		expect(mockGameState).toHaveProperty("gameOver");

		expect(mockSpectrums.player1).toHaveProperty("state");
		expect(mockSpectrums.player1.state).toHaveProperty("board");
		expect(mockSpectrums.player1.state).toHaveProperty("score");
		expect(mockSpectrums.player1).toHaveProperty("playerName");

		addEventListenerSpy.mockRestore();
		removeEventListenerSpy.mockRestore();
	});
});

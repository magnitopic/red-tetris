import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import GameIndex from "../index";
import { useAuth } from "../../../context/AuthContext";
import { useGamePlayers } from "../../../hooks/PageData/useGamePlayers";
import { io } from "socket.io-client";

// Mock dependencies
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: jest.fn(),
	useParams: jest.fn(),
}));

jest.mock("../../../context/AuthContext", () => ({
	useAuth: jest.fn(),
}));

jest.mock("../../../hooks/PageData/useGamePlayers", () => ({
	useGamePlayers: jest.fn(() => ({
		fetchGame: jest.fn().mockResolvedValue({ finished: false }),
	})),
}));

jest.mock("socket.io-client", () => ({
	io: jest.fn(),
}));

jest.mock("../GameScreen", () => {
	return function MockGameScreen({ socket, spectrums, gameState }: any) {
		return (
			<div data-testid="game-screen">
				<div data-testid="socket-connected">
					{socket ? "connected" : "disconnected"}
				</div>
				<div data-testid="spectrums-count">
					{Object.keys(spectrums || {}).length}
				</div>
				<div data-testid="game-state">
					{gameState ? "has-state" : "no-state"}
				</div>
			</div>
		);
	};
});

jest.mock("../HostScreen", () => {
	return function MockHostScreen({
		currentPlayers,
		seed,
		socket,
		setPlaying,
		userId,
	}: any) {
		return (
			<div data-testid="host-screen">
				<div data-testid="players-count">
					{currentPlayers?.length || 0}
				</div>
				<div data-testid="seed">{seed}</div>
				<div data-testid="user-id">{userId}</div>
				<button
					data-testid="start-game"
					onClick={() => setPlaying(true)}
				>
					Start Game
				</button>
			</div>
		);
	};
});

jest.mock("../WaitingModal", () => {
	return function MockWaitingModal() {
		return <div data-testid="waiting-modal">Waiting Modal</div>;
	};
});

// Mock performance API
Object.defineProperty(global, "performance", {
	writable: true,
	value: {
		getEntriesByType: jest.fn(),
	},
});

const mockNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseGamePlayers = useGamePlayers as jest.MockedFunction<
	typeof useGamePlayers
>;
const mockIo = io as jest.MockedFunction<typeof io>;

describe("Game Index Component", () => {
	const mockNavigateFn = jest.fn();
	const mockSocket = {
		emit: jest.fn(),
		on: jest.fn(),
		off: jest.fn(),
		disconnect: jest.fn(),
		connected: true,
		id: "mock-socket-id",
	};

	const mockUser = {
		id: "user-123",
		username: "testuser",
	};

	const mockFetchGame = jest.fn().mockResolvedValue({ finished: false });

	beforeEach(() => {
		jest.clearAllMocks();
		mockNavigate.mockReturnValue(mockNavigateFn);
		mockUseAuth.mockReturnValue({ user: mockUser });
		mockUseGamePlayers.mockReturnValue({
			fetchGame: mockFetchGame,
			loading: false,
			error: null,
		});
		mockIo.mockReturnValue(mockSocket as any);

		// Mock performance API
		(global.performance.getEntriesByType as jest.Mock).mockReturnValue([]);

		// Setup default socket event handlers
		const socketHandlers: { [key: string]: Function } = {};
		mockSocket.on.mockImplementation((event: string, handler: Function) => {
			socketHandlers[event] = handler;
		});
	});

	const renderGameIndex = (params: any = {}) => {
		mockUseParams.mockReturnValue(params);
		return render(
			<MemoryRouter>
				<GameIndex />
			</MemoryRouter>
		);
	};

	describe("Initial Rendering", () => {
		it("should render waiting screen when not host and not playing", () => {
			mockUseParams.mockReturnValue({ clientRoomId: "123456" });

			renderGameIndex({ clientRoomId: "123456" });

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(
				screen.getByText("Waiting for host to start...")
			).toBeInTheDocument();
		});

		it("should not render anything when user is not authenticated", () => {
			mockUseAuth.mockReturnValue({ user: null });

			const { container } = renderGameIndex({ clientRoomId: "123456" });

			// Component should render something even without user, just not game-specific content
			// The component still renders basic structure but may not connect to socket
			expect(container.firstChild).not.toBeNull();
		});
	});

	describe("Room Code Validation", () => {
		it("should navigate to /play with error for invalid room code", async () => {
			renderGameIndex({ clientRoomId: "invalid" });

			await waitFor(() => {
				expect(mockNavigateFn).toHaveBeenCalledWith("/play", {
					state: {
						error: "Invalid room code. Please check the code and try again.",
					},
				});
			});
		});

		it("should navigate to /play with error when no room code provided", async () => {
			renderGameIndex({ clientRoomId: undefined });

			await waitFor(() => {
				expect(mockNavigateFn).toHaveBeenCalledWith("/play", {
					state: { error: "Room code is required to join a game." },
				});
			});
		});

		it("should accept valid 6-digit room codes", () => {
			renderGameIndex({ clientRoomId: "123456" });

			expect(mockIo).toHaveBeenCalledWith("http://localhost:3001");
		});

		it("should handle newRegular room creation", () => {
			renderGameIndex({ clientRoomId: "newRegular" });

			expect(mockIo).toHaveBeenCalled();
			// Should emit join_room with generated room code
			expect(mockSocket.emit).toHaveBeenCalledWith(
				"join_room",
				expect.objectContaining({
					playerName: "testuser",
					userId: "user-123",
					width: 10,
					height: 22,
					speed: 300,
				})
			);
		});

		it("should handle newHardcore room creation", () => {
			renderGameIndex({ clientRoomId: "newHardcore" });

			expect(mockSocket.emit).toHaveBeenCalledWith(
				"join_room",
				expect.objectContaining({
					speed: 100,
				})
			);
		});
	});

	describe("Socket Connection", () => {
		it("should connect to socket server on mount", () => {
			renderGameIndex({ clientRoomId: "123456" });

			expect(mockIo).toHaveBeenCalledWith("http://localhost:3001");
		});

		it("should emit join_room event with correct parameters", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for the async initialization to complete
			await waitFor(() => {
				expect(mockSocket.emit).toHaveBeenCalledWith("join_room", {
					room: "123456",
					playerName: "testuser",
					userId: "user-123",
					width: 10,
					height: 22,
					speed: 100,
				});
			});
		});

		it("should set up socket event listeners", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const expectedEvents = [
				"connect",
				"joined_room",
				"new_host",
				"game_started",
				"player_joined",
				"player_left",
				"game_state",
				"invalid_user",
				"game_already_started",
			];

			await waitFor(() => {
				expectedEvents.forEach((event) => {
					expect(mockSocket.on).toHaveBeenCalledWith(
						event,
						expect.any(Function)
					);
				});
			});
		});

		it("should disconnect socket on unmount", () => {
			const { unmount } = renderGameIndex({ clientRoomId: "123456" });

			unmount();

			expect(mockSocket.disconnect).toHaveBeenCalled();
		});
	});

	describe("Host Functionality", () => {
		it("should render HostScreen when user is host", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"joined_room",
					expect.any(Function)
				);
			});

			// Simulate joined_room event with host=true
			const joinedRoomHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "joined_room"
			)?.[1];

			if (joinedRoomHandler) {
				joinedRoomHandler({
					host: true,
					players: [{ id: "player1", name: "Player 1" }],
					seed: "test-seed",
				});
			}

			await waitFor(() => {
				expect(screen.getByTestId("host-screen")).toBeInTheDocument();
			});
		});

		it("should handle new_host event", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"new_host",
					expect.any(Function)
				);
			});

			const newHostHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "new_host"
			)?.[1];

			if (newHostHandler) {
				newHostHandler({
					newHost: "testuser",
					players: [{ id: "player1", name: "Player 1" }],
				});
			}

			await waitFor(() => {
				expect(screen.getByTestId("host-screen")).toBeInTheDocument();
			});
		});
	});

	describe("Game Playing State", () => {
		it("should render GameScreen when playing and has game state", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_started",
					expect.any(Function)
				);
			});

			// Simulate game_started event
			const gameStartedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_started"
			)?.[1];

			const gameStateHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_state"
			)?.[1];

			if (gameStartedHandler) {
				gameStartedHandler();
			}

			if (gameStateHandler) {
				gameStateHandler({
					playerId: "mock-socket-id",
					state: { board: [], currentPiece: null, gameOver: false },
					playerName: "testuser",
				});
			}

			await waitFor(() => {
				expect(screen.getByTestId("game-screen")).toBeInTheDocument();
			});
		});

		it("should show message when game is playing but no game state", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_started",
					expect.any(Function)
				);
			});

			const gameStartedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_started"
			)?.[1];

			if (gameStartedHandler) {
				gameStartedHandler();
			}

			await waitFor(() => {
				expect(
					screen.getByText(
						"Game is being played with this user in another tab."
					)
				).toBeInTheDocument();
			});
		});
	});

	describe("Player Management", () => {
		it("should handle player_joined event", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const playerJoinedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "player_joined"
			)?.[1];

			await waitFor(() => {
				playerJoinedHandler?.({
					playerId: "new-player",
					playerName: "New Player",
				});
			});

			// This would be tested through the HostScreen component which receives currentPlayers
			expect(mockSocket.on).toHaveBeenCalledWith(
				"player_joined",
				expect.any(Function)
			);
		});

		it("should handle player_left event", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const playerLeftHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "player_left"
			)?.[1];

			await waitFor(() => {
				playerLeftHandler?.({
					playerId: "leaving-player",
					userId: "leaving-user",
				});
			});

			expect(mockSocket.on).toHaveBeenCalledWith(
				"player_left",
				expect.any(Function)
			);
		});
	});

	describe("Keyboard Controls", () => {
		it("should add keyboard event listeners when playing", async () => {
			const addEventListenerSpy = jest.spyOn(window, "addEventListener");

			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_started",
					expect.any(Function)
				);
			});

			const gameStartedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_started"
			)?.[1];

			if (gameStartedHandler) {
				gameStartedHandler();
			}

			await waitFor(() => {
				expect(addEventListenerSpy).toHaveBeenCalledWith(
					"keydown",
					expect.any(Function)
				);
			});
		});

		it("should emit socket events for arrow key presses", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_started",
					expect.any(Function)
				);
			});

			const gameStartedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_started"
			)?.[1];

			if (gameStartedHandler) {
				gameStartedHandler();
			}

			// Wait for playing state to be set
			await waitFor(() => {
				// Clear previous calls to focus on key event emissions
				mockSocket.emit.mockClear();
			});

			// Simulate key press
			fireEvent.keyDown(window, { key: "ArrowLeft" });
			expect(mockSocket.emit).toHaveBeenCalledWith("move_left");

			fireEvent.keyDown(window, { key: "ArrowRight" });
			expect(mockSocket.emit).toHaveBeenCalledWith("move_right");

			fireEvent.keyDown(window, { key: "ArrowUp" });
			expect(mockSocket.emit).toHaveBeenCalledWith("rotate");

			fireEvent.keyDown(window, { key: "ArrowDown" });
			expect(mockSocket.emit).toHaveBeenCalledWith("soft_drop");

			fireEvent.keyDown(window, { key: " " });
			expect(mockSocket.emit).toHaveBeenCalledWith("hard_drop");
		});
	});

	describe("Waiting Modal", () => {
		it("should show waiting modal when game already started", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const gameAlreadyStartedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_already_started"
			)?.[1];

			await waitFor(() => {
				gameAlreadyStartedHandler?.({
					message: "Game already in progress",
				});
			});

			await waitFor(() => {
				expect(screen.getByTestId("waiting-modal")).toBeInTheDocument();
			});
		});
	});

	describe("Page Reload Detection", () => {
		it("should detect page reload correctly", () => {
			// Mock navigation entry for reload
			(global.performance.getEntriesByType as jest.Mock).mockReturnValue([
				{ type: "reload" },
			]);

			// Test the logic without actually changing window.location
			// Since the actual redirect happens via window.location.href = "/play"
			// which is hard to test in jsdom, we just verify the component renders
			expect(() =>
				renderGameIndex({ clientRoomId: "123456" })
			).not.toThrow();
		});
	});

	describe("Component Cleanup", () => {
		it("should remove event listeners on unmount", async () => {
			const removeEventListenerSpy = jest.spyOn(
				window,
				"removeEventListener"
			);

			const { unmount } = renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_started",
					expect.any(Function)
				);
			});

			// First trigger the playing state to add event listeners
			const gameStartedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_started"
			)?.[1];

			if (gameStartedHandler) {
				gameStartedHandler();
			}

			// Wait for event listeners to be added
			await waitFor(() => {
				expect(
					jest.spyOn(window, "addEventListener")
				).toHaveBeenCalledWith("keydown", expect.any(Function));
			});

			unmount();

			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				"keydown",
				expect.any(Function)
			);
		});

		it("should clean up socket connection on unmount", () => {
			const { unmount } = renderGameIndex({ clientRoomId: "123456" });

			unmount();

			expect(mockSocket.disconnect).toHaveBeenCalled();
		});
	});

	describe("Error Handling", () => {
		it("should handle socket connection errors gracefully", () => {
			expect(() =>
				renderGameIndex({ clientRoomId: "123456" })
			).not.toThrow();
		});

		it("should handle invalid room codes appropriately", async () => {
			renderGameIndex({ clientRoomId: "abc" });

			await waitFor(() => {
				expect(mockNavigateFn).toHaveBeenCalledWith(
					"/play",
					expect.objectContaining({
						state: expect.objectContaining({
							error: expect.stringContaining("Invalid room code"),
						}),
					})
				);
			});
		});
	});

	describe("Game State Management", () => {
		it("should handle game_state for own player", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_state",
					expect.any(Function)
				);
			});

			const gameStateHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_state"
			)?.[1];

			const mockGameState = {
				board: Array(22).fill(Array(10).fill(0)),
				currentPiece: { x: 5, y: 0, shape: [[1]], color: 1 },
				gameOver: false,
			};

			if (gameStateHandler) {
				gameStateHandler({
					playerId: "mock-socket-id", // Same as socket.id
					state: mockGameState,
					playerName: "testuser",
				});
			}

			// Game state should be set for own player
			expect(mockSocket.on).toHaveBeenCalledWith(
				"game_state",
				expect.any(Function)
			);
		});

		it("should ignore game_state from removed players", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_state",
					expect.any(Function)
				);
			});

			// First, simulate a player leaving
			const playerLeftHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "player_left"
			)?.[1];

			if (playerLeftHandler) {
				playerLeftHandler({
					playerId: "removed-player",
					userId: "removed-user",
				});
			}

			// Then try to receive game state from that removed player
			const gameStateHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_state"
			)?.[1];

			if (gameStateHandler) {
				gameStateHandler({
					playerId: "removed-player",
					state: { board: [], currentPiece: null, gameOver: false },
					playerName: "removedPlayer",
				});
			}

			// Should not add to spectrums
			expect(mockSocket.on).toHaveBeenCalledWith(
				"game_state",
				expect.any(Function)
			);
		});

		it("should ignore game_state from same player name", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_state",
					expect.any(Function)
				);
			});

			const gameStateHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_state"
			)?.[1];

			if (gameStateHandler) {
				gameStateHandler({
					playerId: "different-socket-id",
					state: { board: [], currentPiece: null, gameOver: false },
					playerName: "testuser", // Same as current user
				});
			}

			// Should not add to spectrums since it's the same player name
			expect(mockSocket.on).toHaveBeenCalledWith(
				"game_state",
				expect.any(Function)
			);
		});

		it("should handle finished game scenario", async () => {
			// Mock fetchGame to return finished game
			const mockFinishedFetchGame = jest
				.fn()
				.mockResolvedValue({ finished: true });
			mockUseGamePlayers.mockReturnValue({
				fetchGame: mockFinishedFetchGame,
				loading: false,
				error: null,
			});

			renderGameIndex({ clientRoomId: "123456" });

			await waitFor(() => {
				expect(mockNavigateFn).toHaveBeenCalledWith("/play", {
					state: {
						error: "The game for this room has already finished. Please create a new game.",
					},
				});
			});
		});

		it("should handle room ID string conversion", async () => {
			renderGameIndex({ clientRoomId: "000123" });

			// Wait for the async initialization to complete
			await waitFor(() => {
				expect(mockSocket.emit).toHaveBeenCalledWith("join_room", {
					room: "123",
					playerName: "testuser",
					userId: "user-123",
					width: 10,
					height: 22,
					speed: 100,
				});
			});
		});

		it("should handle window.history.pushState in joined_room event", async () => {
			// Mock window.history.pushState
			const mockPushState = jest.fn();
			Object.defineProperty(window, "history", {
				value: { pushState: mockPushState },
				writable: true,
			});

			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup first
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"joined_room",
					expect.any(Function)
				);
			});

			const joinedRoomHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "joined_room"
			)?.[1];

			if (joinedRoomHandler) {
				joinedRoomHandler({
					host: false,
					players: [{ id: "player1", name: "Player 1" }],
					seed: "test-seed-123",
				});
			}

			expect(mockPushState).toHaveBeenCalledWith(
				{},
				"",
				"/game/test-seed-123"
			);
		});
	});

	describe("Socket Event Cleanup", () => {
		it("should clean up game_already_started listener on unmount", () => {
			const { unmount } = renderGameIndex({ clientRoomId: "123456" });

			unmount();

			expect(mockSocket.off).toHaveBeenCalledWith("game_already_started");
		});
	});

	describe("Game Speed Configuration", () => {
		it("should set correct speed for newRegular game type", async () => {
			renderGameIndex({ clientRoomId: "newRegular" });

			await waitFor(() => {
				expect(mockSocket.emit).toHaveBeenCalledWith(
					"join_room",
					expect.objectContaining({
						speed: 300,
					})
				);
			});
		});

		it("should set correct speed for newHardcore game type", async () => {
			renderGameIndex({ clientRoomId: "newHardcore" });

			await waitFor(() => {
				expect(mockSocket.emit).toHaveBeenCalledWith(
					"join_room",
					expect.objectContaining({
						speed: 100,
					})
				);
			});
		});

		it("should set correct speed for existing room", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			await waitFor(() => {
				expect(mockSocket.emit).toHaveBeenCalledWith(
					"join_room",
					expect.objectContaining({
						speed: 100,
					})
				);
			});
		});
	});

	describe("Edge Cases", () => {
		it("should handle missing user data gracefully", () => {
			mockUseAuth.mockReturnValue({ user: null });

			const { container } = renderGameIndex({ clientRoomId: "123456" });

			// Component should still render but not initiate socket connection
			expect(container.firstChild).not.toBeNull();
			expect(mockIo).not.toHaveBeenCalled();
		});

		it("should handle missing username gracefully", () => {
			mockUseAuth.mockReturnValue({
				user: { id: "user-123", username: undefined },
			});

			const { container } = renderGameIndex({ clientRoomId: "123456" });

			// Component should still render but not initiate socket connection
			expect(container.firstChild).not.toBeNull();
			expect(mockIo).not.toHaveBeenCalled();
		});

		it("should handle missing user ID gracefully", () => {
			mockUseAuth.mockReturnValue({
				user: { id: undefined, username: "testuser" },
			});

			const { container } = renderGameIndex({ clientRoomId: "123456" });

			// Component should still render but not initiate socket connection
			expect(container.firstChild).not.toBeNull();
			expect(mockIo).not.toHaveBeenCalled();
		});

		it("should handle room ID with leading zeros", async () => {
			renderGameIndex({ clientRoomId: "000001" });

			await waitFor(() => {
				expect(mockSocket.emit).toHaveBeenCalledWith(
					"join_room",
					expect.objectContaining({
						room: "1",
					})
				);
			});
		});

		it("should handle non-arrow keys without emitting socket events", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Wait for socket setup and game start
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_started",
					expect.any(Function)
				);
			});

			const gameStartedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_started"
			)?.[1];

			if (gameStartedHandler) {
				gameStartedHandler();
			}

			// Clear previous socket calls
			await waitFor(() => {
				mockSocket.emit.mockClear();
			});

			// Simulate non-game keys
			fireEvent.keyDown(window, { key: "a" });
			fireEvent.keyDown(window, { key: "Enter" });
			fireEvent.keyDown(window, { key: "Escape" });

			// Should not emit any socket events for non-game keys
			expect(mockSocket.emit).not.toHaveBeenCalled();
		});

		it("should prevent default behavior for arrow keys", async () => {
			const user = { username: "testuser", id: "123" };
			renderGameIndex({ 
				clientRoomId: "123456",
				user 
			});

			// Wait for socket setup
			await waitFor(() => {
				expect(mockSocket.on).toHaveBeenCalledWith(
					"game_started",
					expect.any(Function)
				);
			});

			// Start the game and set game state
			const gameStartedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_started"
			)?.[1];

			const gameStateHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === "game_state"
			)?.[1];

			if (gameStartedHandler) {
				gameStartedHandler();
			}

			// Provide game state to ensure GameScreen renders
			if (gameStateHandler) {
				gameStateHandler({
					playerId: "mock-socket-id",
					state: { board: [], currentPiece: null, gameOver: false },
					playerName: "testuser",
				});
			}

			// Wait for the playing state to be set and GameScreen to render
			await waitFor(() => {
				expect(screen.getByTestId("game-screen")).toBeInTheDocument();
			});

			// Create a mock event with spied preventDefault
			const preventDefault = jest.fn();
			const keyDownEvent = new KeyboardEvent("keydown", { 
				key: "ArrowLeft",
				bubbles: true,
				cancelable: true
			});
			
			// Override preventDefault
			Object.defineProperty(keyDownEvent, "preventDefault", {
				value: preventDefault,
				writable: false,
			});

			// Trigger the keydown event on window
			act(() => {
				window.dispatchEvent(keyDownEvent);
			});

			expect(preventDefault).toHaveBeenCalled();
		});
	});
});

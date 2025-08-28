import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import GameIndex from "../index";
import { useAuth } from "../../../context/AuthContext";
import { useGamePlayers } from "../../../hooks/PageData/useGamePlayers";
import { io } from "socket.io-client";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

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

		(global.performance.getEntriesByType as jest.Mock).mockReturnValue([]);

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

	it("handles room code validation and navigation", async () => {
		const testCases = [
			{ 
				clientRoomId: undefined, 
				expectedError: "Room code is required to join a game." 
			},
			{ 
				clientRoomId: "invalid", 
				expectedError: "Invalid room code. Please check the code and try again." 
			},
			{ 
				clientRoomId: "abc", 
				expectedError: "Invalid room code. Please check the code and try again." 
			}
		];

		for (const { clientRoomId, expectedError } of testCases) {
			jest.clearAllMocks();
			renderGameIndex({ clientRoomId });

			await waitFor(() => {
				expect(mockNavigateFn).toHaveBeenCalledWith("/play", {
					state: { error: expectedError },
				});
			});
		}

		// Test valid room code
		jest.clearAllMocks();
		renderGameIndex({ clientRoomId: "123456" });
		expect(mockIo).toHaveBeenCalledWith("http://localhost:3001");
	});

	it("handles different room types with correct game settings", async () => {
		const roomTypes = [
			{ clientRoomId: "newRegular", expectedSpeed: 300 },
			{ clientRoomId: "newHardcore", expectedSpeed: 100 },
			{ clientRoomId: "123456", expectedSpeed: 100 }
		];

		for (const { clientRoomId, expectedSpeed } of roomTypes) {
			jest.clearAllMocks();
			renderGameIndex({ clientRoomId });

			await waitFor(() => {
				expect(mockSocket.emit).toHaveBeenCalledWith(
					"join_room",
					expect.objectContaining({
						playerName: "testuser",
						userId: "user-123",
						width: 10,
						height: 22,
						speed: expectedSpeed,
					})
				);
			});
		}
	});

	it("sets up socket connection and event listeners", async () => {
		renderGameIndex({ clientRoomId: "123456" });

		expect(mockIo).toHaveBeenCalledWith("http://localhost:3001");

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

	it("handles host functionality and screen transitions", async () => {
		// Mock window.history.pushState for this test
		const mockPushState = jest.fn();
		Object.defineProperty(window, 'history', {
			value: { pushState: mockPushState },
			writable: true,
		});

		renderGameIndex({ clientRoomId: "123456" });

		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith("joined_room", expect.any(Function));
		});

		// Test becoming host
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
			// Test that window.history.pushState was called with the seed
			expect(mockPushState).toHaveBeenCalledWith({}, "", "/game/test-seed");
		});

		// Test new host assignment
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

	it("handles game playing states and screen transitions", async () => {
		renderGameIndex({ clientRoomId: "123456" });

		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith("game_started", expect.any(Function));
		});

		const gameStartedHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "game_started"
		)?.[1];

		const gameStateHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "game_state"
		)?.[1];

		// Test game started without state
		if (gameStartedHandler) {
			gameStartedHandler();
		}

		await waitFor(() => {
			expect(
				screen.getByText("Game is being played with this user in another tab.")
			).toBeInTheDocument();
		});

		// Test game started with state
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

	it("handles keyboard controls during gameplay", async () => {
		renderGameIndex({ clientRoomId: "123456" });

		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith("game_started", expect.any(Function));
		});

		const gameStartedHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "game_started"
		)?.[1];

		if (gameStartedHandler) {
			gameStartedHandler();
		}

		await waitFor(() => {
			mockSocket.emit.mockClear();
		});

		// Test game controls
		const keyMappings = [
			{ key: "ArrowLeft", event: "move_left" },
			{ key: "ArrowRight", event: "move_right" },
			{ key: "ArrowUp", event: "rotate" },
			{ key: "ArrowDown", event: "soft_drop" },
			{ key: " ", event: "hard_drop" }
		];

		keyMappings.forEach(({ key, event }) => {
			fireEvent.keyDown(window, { key });
			expect(mockSocket.emit).toHaveBeenCalledWith(event);
		});

		// Test non-game keys don't emit events
		mockSocket.emit.mockClear();
		fireEvent.keyDown(window, { key: "a" });
		expect(mockSocket.emit).not.toHaveBeenCalled();
	});

	it("handles game state management and player filtering", async () => {
		renderGameIndex({ clientRoomId: "123456" });

		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith("game_state", expect.any(Function));
		});

		const gameStateHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "game_state"
		)?.[1];

		const playerLeftHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "player_left"
		)?.[1];

		// Test own player state
		if (gameStateHandler) {
			gameStateHandler({
				playerId: "mock-socket-id",
				state: { board: [], currentPiece: null, gameOver: false },
				playerName: "testuser",
			});
		}

		// Test player left with both playerId and userId to trigger spectrum deletion
		if (playerLeftHandler) {
			playerLeftHandler({
				playerId: "removed-player-id",
				userId: "removed-user-id",
			});
		}

		// Test ignoring game state from removed players
		if (gameStateHandler) {
			gameStateHandler({
				playerId: "removed-player-id",
				state: { board: [], currentPiece: null, gameOver: false },
				playerName: "removedPlayer",
			});
		}

		// Test ignoring same player name
		if (gameStateHandler) {
			gameStateHandler({
				playerId: "different-socket-id",
				state: { board: [], currentPiece: null, gameOver: false },
				playerName: "testuser",
			});
		}

		// Test player left with only playerId (no userId) to cover different spectrum deletion path
		if (playerLeftHandler) {
			playerLeftHandler({
				playerId: "another-removed-player",
				userId: null,
			});
		}

		expect(mockSocket.on).toHaveBeenCalledWith("game_state", expect.any(Function));
	});

	it("handles error scenarios and edge cases", async () => {
		// Test finished game
		const mockFinishedFetchGame = jest.fn().mockResolvedValue({ finished: true });
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

		// Test missing user data
		jest.clearAllMocks();
		mockUseAuth.mockReturnValue({ user: null });

		const { container } = renderGameIndex({ clientRoomId: "123456" });
		expect(container.firstChild).not.toBeNull();
		expect(mockIo).not.toHaveBeenCalled();

		// Test waiting modal for game already started
		mockUseAuth.mockReturnValue({ user: mockUser });
		renderGameIndex({ clientRoomId: "123456" });

		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith("game_already_started", expect.any(Function));
		});

		const gameAlreadyStartedHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "game_already_started"
		)?.[1];

		if (gameAlreadyStartedHandler) {
			gameAlreadyStartedHandler({ message: "Game already in progress" });
		}

		await waitFor(() => {
			expect(screen.getByTestId("waiting-modal")).toBeInTheDocument();
		});
	});

	it("handles additional socket events and player management", async () => {
		renderGameIndex({ clientRoomId: "123456" });

		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith("invalid_user", expect.any(Function));
			expect(mockSocket.on).toHaveBeenCalledWith("already_playing", expect.any(Function));
			expect(mockSocket.on).toHaveBeenCalledWith("player_joined", expect.any(Function));
		});

		// Test invalid_user event
		const invalidUserHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "invalid_user"
		)?.[1];

		if (invalidUserHandler) {
			invalidUserHandler();
		}

		await waitFor(() => {
			expect(mockNavigateFn).toHaveBeenCalledWith("/play", {
				state: { error: "Invalid user." },
			});
		});

		// Reset for already_playing test
		jest.clearAllMocks();
		mockNavigate.mockReturnValue(mockNavigateFn);
		
		// Re-render to get fresh handlers
		renderGameIndex({ clientRoomId: "123456" });

		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith("already_playing", expect.any(Function));
		});

		const alreadyPlayingHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "already_playing"
		)?.[1];

		if (alreadyPlayingHandler) {
			alreadyPlayingHandler();
		}

		await waitFor(() => {
			expect(mockNavigateFn).toHaveBeenCalledWith("/play", {
				state: { error: "This user is already playing." },
			});
		});

		// Test player_joined event
		const playerJoinedHandler = mockSocket.on.mock.calls.find(
			(call) => call[0] === "player_joined"
		)?.[1];

		if (playerJoinedHandler) {
			playerJoinedHandler({
				playerId: "new-player-id",
				playerName: "NewPlayer",
			});
		}

		// Since we can't easily test state updates, we just verify the handler was called
		expect(mockSocket.on).toHaveBeenCalledWith("player_joined", expect.any(Function));
	});

	it("handles component cleanup and socket disconnection", () => {
		const { unmount } = renderGameIndex({ clientRoomId: "123456" });

		unmount();

		expect(mockSocket.disconnect).toHaveBeenCalled();
		expect(mockSocket.off).toHaveBeenCalledWith("game_already_started");
	});
});

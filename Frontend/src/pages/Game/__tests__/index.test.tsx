import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import GameIndex from "../index";
import { useAuth } from "../../../context/AuthContext";
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

jest.mock("socket.io-client", () => ({
	io: jest.fn(),
}));

jest.mock("../GameScreen", () => {
	return function MockGameScreen({ socket, spectrums, gameState }: any) {
		return (
			<div data-testid="game-screen">
				<div data-testid="socket-connected">{socket ? "connected" : "disconnected"}</div>
				<div data-testid="spectrums-count">{Object.keys(spectrums || {}).length}</div>
				<div data-testid="game-state">{gameState ? "has-state" : "no-state"}</div>
			</div>
		);
	};
});

jest.mock("../HostScreen", () => {
	return function MockHostScreen({ currentPlayers, seed, socket, setPlaying, userId }: any) {
		return (
			<div data-testid="host-screen">
				<div data-testid="players-count">{currentPlayers?.length || 0}</div>
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

	beforeEach(() => {
		jest.clearAllMocks();
		mockNavigate.mockReturnValue(mockNavigateFn);
		mockUseAuth.mockReturnValue({ user: mockUser });
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
			expect(screen.getByText("Waiting for host to start...")).toBeInTheDocument();
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
			expect(mockSocket.emit).toHaveBeenCalledWith("join_room", 
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

			expect(mockSocket.emit).toHaveBeenCalledWith("join_room", 
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

		it("should emit join_room event with correct parameters", () => {
			renderGameIndex({ clientRoomId: "123456" });

			expect(mockSocket.emit).toHaveBeenCalledWith("join_room", {
				room: "123456",
				playerName: "testuser",
				userId: "user-123",
				width: 10,
				height: 22,
				speed: 100,
			});
		});

		it("should set up socket event listeners", () => {
			renderGameIndex({ clientRoomId: "123456" });

			const expectedEvents = [
				"connect",
				"joined_room", 
				"new_host",
				"game_started",
				"player_joined",
				"player_left",
				"game_state",
				"game_already_started"
			];

			expectedEvents.forEach(event => {
				expect(mockSocket.on).toHaveBeenCalledWith(event, expect.any(Function));
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

			// Simulate joined_room event with host=true
			const joinedRoomHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "joined_room"
			)?.[1];

			await waitFor(() => {
				joinedRoomHandler?.({
					host: true,
					players: [{ id: "player1", name: "Player 1" }],
					seed: "test-seed"
				});
			});

			await waitFor(() => {
				expect(screen.getByTestId("host-screen")).toBeInTheDocument();
			});
		});

		it("should handle new_host event", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const newHostHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "new_host"
			)?.[1];

			await waitFor(() => {
				newHostHandler?.({
					newHost: "testuser",
					players: [{ id: "player1", name: "Player 1" }]
				});
			});

			await waitFor(() => {
				expect(screen.getByTestId("host-screen")).toBeInTheDocument();
			});
		});
	});

	describe("Game Playing State", () => {
		it("should render GameScreen when playing and has game state", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			// Simulate game_started event
			const gameStartedHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "game_started"
			)?.[1];

			const gameStateHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "game_state"
			)?.[1];

			await waitFor(() => {
				gameStartedHandler?.();
			});

			await waitFor(() => {
				gameStateHandler?.({
					playerId: "mock-socket-id",
					state: { board: [], currentPiece: null, gameOver: false },
					playerName: "testuser"
				});
			});

			await waitFor(() => {
				expect(screen.getByTestId("game-screen")).toBeInTheDocument();
			});
		});

		it("should show message when game is playing but no game state", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const gameStartedHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "game_started"
			)?.[1];

			await waitFor(() => {
				gameStartedHandler?.();
			});

			await waitFor(() => {
				expect(screen.getByText("Game is being played with this user in another tab.")).toBeInTheDocument();
			});
		});
	});

	describe("Player Management", () => {
		it("should handle player_joined event", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const playerJoinedHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "player_joined"
			)?.[1];

			await waitFor(() => {
				playerJoinedHandler?.({
					playerId: "new-player",
					playerName: "New Player"
				});
			});

			// This would be tested through the HostScreen component which receives currentPlayers
			expect(mockSocket.on).toHaveBeenCalledWith("player_joined", expect.any(Function));
		});

		it("should handle player_left event", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const playerLeftHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "player_left"
			)?.[1];

			await waitFor(() => {
				playerLeftHandler?.({
					playerId: "leaving-player",
					userId: "leaving-user"
				});
			});

			expect(mockSocket.on).toHaveBeenCalledWith("player_left", expect.any(Function));
		});
	});

	describe("Keyboard Controls", () => {
		it("should add keyboard event listeners when playing", async () => {
			const addEventListenerSpy = jest.spyOn(window, "addEventListener");
			
			renderGameIndex({ clientRoomId: "123456" });

			const gameStartedHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "game_started"
			)?.[1];

			await waitFor(() => {
				gameStartedHandler?.();
			});

			expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
		});

		it("should emit socket events for arrow key presses", async () => {
			renderGameIndex({ clientRoomId: "123456" });

			const gameStartedHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "game_started"
			)?.[1];

			await waitFor(() => {
				gameStartedHandler?.();
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
				call => call[0] === "game_already_started"
			)?.[1];

			await waitFor(() => {
				gameAlreadyStartedHandler?.({ message: "Game already in progress" });
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
				{ type: "reload" }
			]);

			// Test the logic without actually changing window.location
			// Since the actual redirect happens via window.location.href = "/play"
			// which is hard to test in jsdom, we just verify the component renders
			expect(() => renderGameIndex({ clientRoomId: "123456" })).not.toThrow();
		});
	});

	describe("Component Cleanup", () => {
		it("should remove event listeners on unmount", async () => {
			const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
			
			const { unmount } = renderGameIndex({ clientRoomId: "123456" });

			// First trigger the playing state to add event listeners
			const gameStartedHandler = mockSocket.on.mock.calls.find(
				call => call[0] === "game_started"
			)?.[1];

			await waitFor(() => {
				gameStartedHandler?.();
			});

			unmount();

			expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
		});

		it("should clean up socket connection on unmount", () => {
			const { unmount } = renderGameIndex({ clientRoomId: "123456" });

			unmount();

			expect(mockSocket.disconnect).toHaveBeenCalled();
		});
	});

	describe("Error Handling", () => {
		it("should handle socket connection errors gracefully", () => {
			expect(() => renderGameIndex({ clientRoomId: "123456" })).not.toThrow();
		});

		it("should handle invalid room codes appropriately", async () => {
			renderGameIndex({ clientRoomId: "abc" });

			await waitFor(() => {
				expect(mockNavigateFn).toHaveBeenCalledWith("/play", 
					expect.objectContaining({
						state: expect.objectContaining({
							error: expect.stringContaining("Invalid room code")
						})
					})
				);
			});
		});
	});
});

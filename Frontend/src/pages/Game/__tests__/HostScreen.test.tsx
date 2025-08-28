import { render, screen, fireEvent } from "@testing-library/react";
import HostScreen from "../HostScreen";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock the RegularButton component
jest.mock("../../../components/common/RegularButton", () => {
	return function MockRegularButton({ value, callback, type }: any) {
		return (
			<button
				data-testid="start-game-button"
				type={type}
				onClick={callback}
			>
				{value}
			</button>
		);
	};
});

describe("HostScreen Component", () => {
	const mockSocket = {
		emit: jest.fn(),
		on: jest.fn(),
		off: jest.fn(),
		disconnect: jest.fn(),
	};

	const defaultProps = {
		currentPlayers: [
			{ id: "1", name: "Player 1" },
			{ id: "2", name: "Player 2" },
		],
		seed: "123456",
		socket: mockSocket,
		setPlaying: jest.fn(),
		userId: "user-123",
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders host screen with correct content and structure", () => {
		render(<HostScreen {...defaultProps} />);

		// Check main content
		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByText("You are the game host!")).toBeInTheDocument();
		expect(screen.getByText("Share the game code with your friends to play together.")).toBeInTheDocument();
		expect(screen.getByText("Or try reaching the top score by yourself!")).toBeInTheDocument();

		// Check game code display
		expect(screen.getByText("Game Code:")).toBeInTheDocument();
		expect(screen.getByText("123456")).toBeInTheDocument();
		expect(screen.getByText("Share this code with your friends!")).toBeInTheDocument();

		// Check player count and start button
		expect(screen.getByText("Connected players: 2")).toBeInTheDocument();
		expect(screen.getByTestId("start-game-button")).toBeInTheDocument();
		expect(screen.getByText("Start Game")).toBeInTheDocument();

		// Check semantic structure
		const main = screen.getByRole("main");
		expect(main).toHaveClass("flex", "flex-1", "justify-center", "items-center", "flex-col", "w-full", "my-10");
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("You are the game host!");
	});

	it("handles different player counts correctly", () => {
		// Test with single player
		const singlePlayerProps = {
			...defaultProps,
			currentPlayers: [{ id: "1", name: "Player 1" }],
		};
		const { rerender } = render(<HostScreen {...singlePlayerProps} />);
		expect(screen.getByText("Connected players: 1")).toBeInTheDocument();

		// Test with no players
		rerender(<HostScreen {...defaultProps} currentPlayers={[]} />);
		expect(screen.getByText("Connected players: 0")).toBeInTheDocument();

		// Test with multiple players
		const multiplePlayersProps = {
			...defaultProps,
			currentPlayers: [
				{ id: "1", name: "Player 1" },
				{ id: "2", name: "Player 2" },
				{ id: "3", name: "Player 3" },
				{ id: "4", name: "Player 4" },
			],
		};
		rerender(<HostScreen {...multiplePlayersProps} />);
		expect(screen.getByText("Connected players: 4")).toBeInTheDocument();

		// Test with undefined players (edge case)
		rerender(<HostScreen {...defaultProps} currentPlayers={undefined} />);
		expect(screen.getByText("Connected players: 0")).toBeInTheDocument();
	});

	it("handles different game codes and displays correctly", () => {
		const { rerender } = render(<HostScreen {...defaultProps} />);
		expect(screen.getByText("123456")).toBeInTheDocument();

		// Test different game code
		rerender(<HostScreen {...defaultProps} seed="789012" />);
		expect(screen.getByText("789012")).toBeInTheDocument();
		expect(screen.queryByText("123456")).not.toBeInTheDocument();

		// Test empty game code
		rerender(<HostScreen {...defaultProps} seed="" />);
		expect(screen.getByText("Game Code:")).toBeInTheDocument();

		// Test long game code
		rerender(<HostScreen {...defaultProps} seed="123456789012" />);
		expect(screen.getByText("123456789012")).toBeInTheDocument();

		// Test special characters in game code
		rerender(<HostScreen {...defaultProps} seed="ABC-123" />);
		expect(screen.getByText("ABC-123")).toBeInTheDocument();
	});

	it("handles start game functionality correctly", () => {
		const { unmount } = render(<HostScreen {...defaultProps} />);

		const startButton = screen.getByTestId("start-game-button");
		fireEvent.click(startButton);

		expect(mockSocket.emit).toHaveBeenCalledWith("start_game", {
			userId: "user-123",
		});

		// Test multiple clicks
		fireEvent.click(startButton);
		fireEvent.click(startButton);

		expect(mockSocket.emit).toHaveBeenCalledTimes(3);
		expect(mockSocket.emit).toHaveBeenNthCalledWith(2, "start_game", {
			userId: "user-123",
		});

		// Clean up and test with different userId
		unmount();
		jest.clearAllMocks();

		const customUserProps = {
			...defaultProps,
			userId: "different-user-id",
		};
		
		render(<HostScreen {...customUserProps} />);
		const newStartButton = screen.getByTestId("start-game-button");
		fireEvent.click(newStartButton);

		expect(mockSocket.emit).toHaveBeenCalledWith("start_game", {
			userId: "different-user-id",
		});
	});

	it("handles styling and accessibility correctly", () => {
		render(<HostScreen {...defaultProps} />);

		// Check game code container styling
		const gameCodeSection = screen.getByText("Game Code:").closest("section");
		expect(gameCodeSection).toHaveClass(
			"flex", "justify-center", "items-center", "flex-col",
			"bg-background-secondary", "p-10", "rounded-lg", "w-fit"
		);

		// Check game code display styling
		const gameCodeDisplay = screen.getByText("123456").parentElement;
		expect(gameCodeDisplay).toHaveClass("bg-black", "p-3", "rounded-lg");
		const gameCodeSpan = screen.getByText("123456");
		expect(gameCodeSpan).toHaveClass("text-xl", "font-bold");

		// Check instructional text styling
		const instructionText = screen.getByText("Share this code with your friends!");
		expect(instructionText).toHaveClass("text-sm", "text-gray-500", "mt-2");

		// Check accessibility
		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		expect(screen.getByRole("button")).toBeInTheDocument();
		expect(screen.getByRole("button")).toHaveTextContent("Start Game");
	});

	it("handles edge cases and component lifecycle", () => {
		// Test with missing socket
		const propsWithoutSocket = { ...defaultProps, socket: null };
		const { unmount: unmount1 } = render(<HostScreen {...propsWithoutSocket} />);
		expect(screen.getByRole("main")).toBeInTheDocument();
		unmount1();

		// Test with missing userId
		const { unmount: unmount2 } = render(<HostScreen {...defaultProps} userId={undefined} />);
		const startButton = screen.getByTestId("start-game-button");
		fireEvent.click(startButton);
		expect(mockSocket.emit).toHaveBeenCalledWith("start_game", { userId: undefined });

		// Test component unmounting
		expect(() => unmount2()).not.toThrow();

		// Test with special characters in player names
		const specialPlayersProps = {
			...defaultProps,
			currentPlayers: [
				{ id: "1", name: "Player@1" },
				{ id: "2", name: "Player#2" },
			],
		};
		const { unmount: unmount3 } = render(<HostScreen {...specialPlayersProps} />);
		expect(screen.getByText("Connected players: 2")).toBeInTheDocument();

		// Clean up and test with large player list
		unmount3();
		const manyPlayers = Array.from({ length: 10 }, (_, i) => ({
			id: `player-${i}`,
			name: `Player ${i}`,
		}));
		const { unmount: unmount4 } = render(<HostScreen {...defaultProps} currentPlayers={manyPlayers} />);
		expect(screen.getByText("Connected players: 10")).toBeInTheDocument();

		// Test consistent rendering across multiple renders
		unmount4();
		render(<HostScreen {...defaultProps} />);
		expect(screen.getByText("You are the game host!")).toBeInTheDocument();
	});
});

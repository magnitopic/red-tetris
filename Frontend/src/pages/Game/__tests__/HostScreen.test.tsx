import { render, screen, fireEvent } from "@testing-library/react";
import HostScreen from "../HostScreen";

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

	describe("Rendering", () => {
		it("should render the host screen correctly", () => {
			render(<HostScreen {...defaultProps} />);

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(
				screen.getByText("You are the game host!")
			).toBeInTheDocument();
			expect(
				screen.getByText(
					"Share the game code with your friends to play together."
				)
			).toBeInTheDocument();
			expect(
				screen.getByText("Or try reaching the top score by yourself!")
			).toBeInTheDocument();
		});

		it("should display the game code correctly", () => {
			render(<HostScreen {...defaultProps} />);

			expect(screen.getByText("Game Code:")).toBeInTheDocument();
			expect(screen.getByText("123456")).toBeInTheDocument();
			expect(
				screen.getByText("Share this code with your friends!")
			).toBeInTheDocument();
		});

		it("should display the connected players count", () => {
			render(<HostScreen {...defaultProps} />);

			expect(
				screen.getByText("Connected players: 2")
			).toBeInTheDocument();
		});

		it("should render the start game button", () => {
			render(<HostScreen {...defaultProps} />);

			expect(screen.getByTestId("start-game-button")).toBeInTheDocument();
			expect(screen.getByText("Start Game")).toBeInTheDocument();
		});
	});

	describe("Player Count Display", () => {
		it("should display correct count for single player", () => {
			const singlePlayerProps = {
				...defaultProps,
				currentPlayers: [{ id: "1", name: "Player 1" }],
			};

			render(<HostScreen {...singlePlayerProps} />);

			expect(
				screen.getByText("Connected players: 1")
			).toBeInTheDocument();
		});

		it("should display correct count for no players", () => {
			const noPlayersProps = {
				...defaultProps,
				currentPlayers: [],
			};

			render(<HostScreen {...noPlayersProps} />);

			expect(
				screen.getByText("Connected players: 0")
			).toBeInTheDocument();
		});

		it("should display correct count for multiple players", () => {
			const multiplePlayersProps = {
				...defaultProps,
				currentPlayers: [
					{ id: "1", name: "Player 1" },
					{ id: "2", name: "Player 2" },
					{ id: "3", name: "Player 3" },
					{ id: "4", name: "Player 4" },
				],
			};

			render(<HostScreen {...multiplePlayersProps} />);

			expect(
				screen.getByText("Connected players: 4")
			).toBeInTheDocument();
		});
	});

	describe("Game Code Display", () => {
		it("should display different game codes correctly", () => {
			const { rerender } = render(<HostScreen {...defaultProps} />);

			expect(screen.getByText("123456")).toBeInTheDocument();

			rerender(<HostScreen {...defaultProps} seed="789012" />);

			expect(screen.getByText("789012")).toBeInTheDocument();
			expect(screen.queryByText("123456")).not.toBeInTheDocument();
		});

		it("should handle empty game code", () => {
			const emptyCodeProps = {
				...defaultProps,
				seed: "",
			};

			render(<HostScreen {...emptyCodeProps} />);

			expect(screen.getByText("Game Code:")).toBeInTheDocument();
			// The empty span should still be present
			expect(
				screen.getByText("Game Code:").closest("section")
			).toBeInTheDocument();
		});

		it("should handle long game codes", () => {
			const longCodeProps = {
				...defaultProps,
				seed: "123456789012",
			};

			render(<HostScreen {...longCodeProps} />);

			expect(screen.getByText("123456789012")).toBeInTheDocument();
		});
	});

	describe("Start Game Functionality", () => {
		it("should emit start_game event when start button is clicked", () => {
			render(<HostScreen {...defaultProps} />);

			const startButton = screen.getByTestId("start-game-button");
			fireEvent.click(startButton);

			expect(mockSocket.emit).toHaveBeenCalledWith("start_game", {
				userId: "user-123",
			});
		});

		it("should emit event with correct userId", () => {
			const customUserProps = {
				...defaultProps,
				userId: "different-user-id",
			};

			render(<HostScreen {...customUserProps} />);

			const startButton = screen.getByTestId("start-game-button");
			fireEvent.click(startButton);

			expect(mockSocket.emit).toHaveBeenCalledWith("start_game", {
				userId: "different-user-id",
			});
		});

		it("should handle multiple button clicks", () => {
			render(<HostScreen {...defaultProps} />);

			const startButton = screen.getByTestId("start-game-button");

			fireEvent.click(startButton);
			fireEvent.click(startButton);
			fireEvent.click(startButton);

			expect(mockSocket.emit).toHaveBeenCalledTimes(3);
			expect(mockSocket.emit).toHaveBeenNthCalledWith(1, "start_game", {
				userId: "user-123",
			});
			expect(mockSocket.emit).toHaveBeenNthCalledWith(2, "start_game", {
				userId: "user-123",
			});
			expect(mockSocket.emit).toHaveBeenNthCalledWith(3, "start_game", {
				userId: "user-123",
			});
		});
	});

	describe("Component Structure", () => {
		it("should have correct semantic structure", () => {
			render(<HostScreen {...defaultProps} />);

			const main = screen.getByRole("main");
			expect(main).toHaveClass(
				"flex",
				"flex-1",
				"justify-center",
				"items-center",
				"flex-col",
				"w-full",
				"my-10"
			);

			const sections = main.querySelectorAll("section");
			expect(sections).toHaveLength(3);
		});

		it("should have correct heading hierarchy", () => {
			render(<HostScreen {...defaultProps} />);

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveTextContent("You are the game host!");
			expect(heading).toHaveClass("text-4xl", "font-bold", "mb-4");
		});

		it("should have proper text center alignment", () => {
			render(<HostScreen {...defaultProps} />);

			const sections = screen
				.getByRole("main")
				.querySelectorAll("section");
			expect(sections[0]).toHaveClass("text-center");
		});
	});

	describe("Styling", () => {
		it("should have correct game code container styling", () => {
			render(<HostScreen {...defaultProps} />);

			const gameCodeSection = screen
				.getByText("Game Code:")
				.closest("section");
			expect(gameCodeSection).toHaveClass(
				"flex",
				"justify-center",
				"items-center",
				"flex-col",
				"bg-background-secondary",
				"p-10",
				"rounded-lg",
				"w-fit"
			);
		});

		it("should have correct game code display styling", () => {
			render(<HostScreen {...defaultProps} />);

			const gameCodeDisplay = screen.getByText("123456").parentElement;
			expect(gameCodeDisplay).toHaveClass(
				"bg-black",
				"p-3",
				"rounded-lg"
			);

			const gameCodeSpan = screen.getByText("123456");
			expect(gameCodeSpan).toHaveClass("text-xl", "font-bold");
		});

		it("should have correct instructional text styling", () => {
			render(<HostScreen {...defaultProps} />);

			const instructionText = screen.getByText(
				"Share this code with your friends!"
			);
			expect(instructionText).toHaveClass(
				"text-sm",
				"text-gray-500",
				"mt-2"
			);
		});
	});

	describe("Accessibility", () => {
		it("should have proper semantic HTML structure", () => {
			render(<HostScreen {...defaultProps} />);

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { level: 1 })
			).toBeInTheDocument();
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		it("should have accessible button text", () => {
			render(<HostScreen {...defaultProps} />);

			const button = screen.getByRole("button");
			expect(button).toHaveTextContent("Start Game");
		});

		it("should have descriptive text content", () => {
			render(<HostScreen {...defaultProps} />);

			expect(
				screen.getByText("You are the game host!")
			).toBeInTheDocument();
			expect(
				screen.getByText(
					"Share the game code with your friends to play together."
				)
			).toBeInTheDocument();
			expect(
				screen.getByText("Or try reaching the top score by yourself!")
			).toBeInTheDocument();
		});
	});

	describe("Props Handling", () => {
		it("should handle missing currentPlayers gracefully", () => {
			const propsWithoutPlayers = {
				...defaultProps,
				currentPlayers: undefined,
			};

			// Should render without crashing and show 0 players
			render(<HostScreen {...propsWithoutPlayers} />);
			expect(
				screen.getByText("Connected players: 0")
			).toBeInTheDocument();
		});

		it("should handle missing socket gracefully during render", () => {
			const propsWithoutSocket = {
				...defaultProps,
				socket: null,
			};

			// Should render without crashing
			expect(() =>
				render(<HostScreen {...propsWithoutSocket} />)
			).not.toThrow();
		});

		it("should handle missing userId", () => {
			const propsWithoutUserId = {
				...defaultProps,
				userId: undefined,
			};

			render(<HostScreen {...propsWithoutUserId} />);

			const startButton = screen.getByTestId("start-game-button");
			fireEvent.click(startButton);

			expect(mockSocket.emit).toHaveBeenCalledWith("start_game", {
				userId: undefined,
			});
		});
	});

	describe("Component Behavior", () => {
		it("should render consistently across multiple renders", () => {
			const { rerender } = render(<HostScreen {...defaultProps} />);

			expect(
				screen.getByText("You are the game host!")
			).toBeInTheDocument();

			rerender(<HostScreen {...defaultProps} />);

			expect(
				screen.getByText("You are the game host!")
			).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(<HostScreen {...defaultProps} />);

			expect(() => unmount()).not.toThrow();
		});

		it("should update display when props change", () => {
			const { rerender } = render(<HostScreen {...defaultProps} />);

			expect(
				screen.getByText("Connected players: 2")
			).toBeInTheDocument();

			rerender(
				<HostScreen
					{...defaultProps}
					currentPlayers={[{ id: "1", name: "Player 1" }]}
				/>
			);

			expect(
				screen.getByText("Connected players: 1")
			).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle special characters in game code", () => {
			const specialCharProps = {
				...defaultProps,
				seed: "ABC-123",
			};

			render(<HostScreen {...specialCharProps} />);

			expect(screen.getByText("ABC-123")).toBeInTheDocument();
		});

		it("should handle players with special characters in names", () => {
			const specialPlayersProps = {
				...defaultProps,
				currentPlayers: [
					{ id: "1", name: "Player@1" },
					{ id: "2", name: "Player#2" },
				],
			};

			// Should render without errors
			expect(() =>
				render(<HostScreen {...specialPlayersProps} />)
			).not.toThrow();
			expect(
				screen.getByText("Connected players: 2")
			).toBeInTheDocument();
		});

		it("should handle extremely long player lists", () => {
			const manyPlayers = Array.from({ length: 100 }, (_, i) => ({
				id: `player-${i}`,
				name: `Player ${i}`,
			}));

			const manyPlayersProps = {
				...defaultProps,
				currentPlayers: manyPlayers,
			};

			render(<HostScreen {...manyPlayersProps} />);

			expect(
				screen.getByText("Connected players: 100")
			).toBeInTheDocument();
		});
	});
});

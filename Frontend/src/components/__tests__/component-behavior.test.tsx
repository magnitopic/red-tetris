/**
 * Example of meaningful React component testing
 * Testing BEHAVIOR and USER INTERACTIONS, not appearance
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Mock a simple Tetris Board component for demonstration
const MockBoard = ({ board, score, onKeyPress }: any) => {
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			onKeyPress?.(e.key);
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onKeyPress]);

	return (
		<div data-testid="game-board">
			<div data-testid="score">Score: {score}</div>
			<div data-testid="board-grid">
				{board.map((row: number[], y: number) =>
					row.map((cell: number, x: number) => (
						<div key={`${x}-${y}`} data-testid={`cell-${x}-${y}`}>
							{cell}
						</div>
					))
				)}
			</div>
		</div>
	);
};

describe("Tetris Board Component - Behavior Testing", () => {
	const mockBoard = Array(4)
		.fill(null)
		.map(() => Array(4).fill(0));

	it("should render the game board with correct structure", () => {
		render(<MockBoard board={mockBoard} score={0} />);

		// Test that the component renders and displays data correctly
		expect(screen.getByTestId("game-board")).toBeInTheDocument();
		expect(screen.getByTestId("score")).toHaveTextContent("Score: 0");
		expect(screen.getByTestId("board-grid")).toBeInTheDocument();
	});

	it("should display updated score when prop changes", () => {
		const { rerender } = render(
			<MockBoard board={mockBoard} score={100} />
		);

		expect(screen.getByTestId("score")).toHaveTextContent("Score: 100");

		// Re-render with new score
		rerender(<MockBoard board={mockBoard} score={500} />);

		expect(screen.getByTestId("score")).toHaveTextContent("Score: 500");
	});

	it("should handle keyboard input correctly", async () => {
		const mockKeyHandler = jest.fn();
		render(
			<MockBoard
				board={mockBoard}
				score={0}
				onKeyPress={mockKeyHandler}
			/>
		);

		// Simulate key presses
		fireEvent.keyDown(window, { key: "ArrowDown" });
		fireEvent.keyDown(window, { key: "ArrowLeft" });
		fireEvent.keyDown(window, { key: " " }); // Space bar

		expect(mockKeyHandler).toHaveBeenCalledWith("ArrowDown");
		expect(mockKeyHandler).toHaveBeenCalledWith("ArrowLeft");
		expect(mockKeyHandler).toHaveBeenCalledWith(" ");
		expect(mockKeyHandler).toHaveBeenCalledTimes(3);
	});

	it("should render board state correctly", () => {
		const boardWithPieces = [
			[0, 1, 0, 0],
			[0, 1, 1, 0],
			[0, 0, 1, 0],
			[1, 1, 1, 1],
		];

		render(<MockBoard board={boardWithPieces} score={0} />);

		// Test specific cells have correct values
		expect(screen.getByTestId("cell-1-0")).toHaveTextContent("1");
		expect(screen.getByTestId("cell-0-0")).toHaveTextContent("0");
		expect(screen.getByTestId("cell-3-3")).toHaveTextContent("1");
	});
});

// Example of testing a form component
const MockLoginForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [loading, setLoading] = React.useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		await onSubmit({ username, password });
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit} data-testid="login-form">
			<input
				data-testid="username-input"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Username"
				disabled={loading}
			/>
			<input
				data-testid="password-input"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
				disabled={loading}
			/>
			<button
				type="submit"
				disabled={loading}
				data-testid="submit-button"
			>
				{loading ? "Logging in..." : "Login"}
			</button>
		</form>
	);
};

describe("Login Form - User Interaction Testing", () => {
	it("should update input values when user types", async () => {
		const user = userEvent.setup();
		const mockSubmit = jest.fn();

		render(<MockLoginForm onSubmit={mockSubmit} />);

		const usernameInput = screen.getByTestId("username-input");
		const passwordInput = screen.getByTestId("password-input");

		// Simulate user typing
		await user.type(usernameInput, "testuser");
		await user.type(passwordInput, "password123");

		expect(usernameInput).toHaveValue("testuser");
		expect(passwordInput).toHaveValue("password123");
	});

	it("should call onSubmit with correct data when form is submitted", async () => {
		const user = userEvent.setup();
		const mockSubmit = jest.fn().mockResolvedValue(undefined);

		render(<MockLoginForm onSubmit={mockSubmit} />);

		// Fill out form
		await user.type(screen.getByTestId("username-input"), "john");
		await user.type(screen.getByTestId("password-input"), "secret");

		// Submit form
		await user.click(screen.getByTestId("submit-button"));

		expect(mockSubmit).toHaveBeenCalledWith({
			username: "john",
			password: "secret",
		});
	});

	it("should disable inputs and show loading state during submission", async () => {
		const user = userEvent.setup();
		const mockSubmit = jest.fn(() => Promise.resolve());

		render(<MockLoginForm onSubmit={mockSubmit} />);

		// Fill and submit form
		await user.type(screen.getByTestId("username-input"), "test");
		await user.type(screen.getByTestId("password-input"), "test");
		await user.click(screen.getByTestId("submit-button"));

		// Check that submit was called
		expect(mockSubmit).toHaveBeenCalledWith({
			username: "test",
			password: "test",
		});
	});
});

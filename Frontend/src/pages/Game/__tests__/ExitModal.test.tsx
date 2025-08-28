import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExitModal from "../ExitModal";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock the Modal component
jest.mock("../../../components/common/Modal", () => {
	return function MockModal({
		isOpen,
		children,
	}: {
		isOpen: boolean;
		children: React.ReactNode;
	}) {
		return isOpen ? <div data-testid="mock-modal">{children}</div> : null;
	};
});

// Mock the RegularButton component
jest.mock("../../../components/common/RegularButton", () => {
	return function MockRegularButton({
		value,
		callback,
	}: {
		value: string;
		callback?: () => void;
	}) {
		return (
			<button data-testid="mock-regular-button" onClick={callback}>
				{value}
			</button>
		);
	};
});

// Mock console.error to avoid JSDOM navigation warnings
const originalConsoleError = console.error;
beforeAll(() => {
	console.error = jest.fn();
});

afterAll(() => {
	console.error = originalConsoleError;
});

describe("ExitModal Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders modal with game over content and correct score", () => {
		const userScore = 1250;
		render(<ExitModal userScore={userScore} />);

		// Check modal structure and content
		expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
		expect(screen.getByText("Game Over!")).toBeInTheDocument();
		expect(screen.getByText(`Final score: ${userScore}`)).toBeInTheDocument();
		
		// Check button
		const button = screen.getByTestId("mock-regular-button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Back to lobby");
	});

	it("handles different score values correctly", () => {
		const { rerender } = render(<ExitModal userScore={0} />);
		expect(screen.getByText("Final score: 0")).toBeInTheDocument();

		rerender(<ExitModal userScore={999999} />);
		expect(screen.getByText("Final score: 999999")).toBeInTheDocument();

		rerender(<ExitModal userScore={-100} />);
		expect(screen.getByText("Final score: -100")).toBeInTheDocument();

		rerender(<ExitModal userScore={123.45} />);
		expect(screen.getByText("Final score: 123.45")).toBeInTheDocument();
	});

	it("has proper accessibility and styling", () => {
		render(<ExitModal userScore={1250} />);

		// Check semantic structure
		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toHaveTextContent("Game Over!");
		expect(heading).toHaveClass("text-3xl", "font-bold");

		const scoreText = screen.getByText("Final score: 1250");
		expect(scoreText).toHaveClass("text-xl");
		expect(scoreText.tagName.toLowerCase()).toBe("p");

		// Check button interaction
		const button = screen.getByRole("button");
		expect(() => fireEvent.click(button)).not.toThrow();
	});

	it("handles component lifecycle properly", () => {
		const { unmount, rerender } = render(<ExitModal userScore={1250} />);

		// Verify initial render
		expect(screen.getByText("Game Over!")).toBeInTheDocument();

		// Test rerender
		rerender(<ExitModal userScore={5000} />);
		expect(screen.getByText("Final score: 5000")).toBeInTheDocument();
		expect(screen.queryByText("Final score: 1250")).not.toBeInTheDocument();

		// Test unmount
		expect(() => unmount()).not.toThrow();
	});
});

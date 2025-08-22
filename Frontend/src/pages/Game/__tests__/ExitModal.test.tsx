import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExitModal from "../ExitModal";

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
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render the exit modal correctly", () => {
			render(<ExitModal userScore={1250} />);

			// Check if modal is rendered
			expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
		});

		it("should display 'Game Over!' title", () => {
			render(<ExitModal userScore={1250} />);

			const title = screen.getByText("Game Over!");
			expect(title).toBeInTheDocument();
			expect(title.tagName.toLowerCase()).toBe("h2");
		});

		it("should display the user score", () => {
			const userScore = 1250;
			render(<ExitModal userScore={userScore} />);

			expect(
				screen.getByText(`Final score: ${userScore}`)
			).toBeInTheDocument();
		});

		it("should display the 'Back to lobby' button", () => {
			render(<ExitModal userScore={1250} />);

			const button = screen.getByTestId("mock-regular-button");
			expect(button).toBeInTheDocument();
			expect(button).toHaveTextContent("Back to lobby");
		});

		it("should have correct container structure", () => {
			const { container } = render(<ExitModal userScore={1250} />);

			const mainDiv = container.firstChild;
			expect(mainDiv).toBeInTheDocument();

			const modal = screen.getByTestId("mock-modal");
			expect(modal).toBeInTheDocument();
		});
	});

	describe("Score Display", () => {
		it("should display score of 0 correctly", () => {
			render(<ExitModal userScore={0} />);

			expect(screen.getByText("Final score: 0")).toBeInTheDocument();
		});

		it("should display large scores correctly", () => {
			const largeScore = 999999;
			render(<ExitModal userScore={largeScore} />);

			expect(
				screen.getByText(`Final score: ${largeScore}`)
			).toBeInTheDocument();
		});

		it("should display negative scores correctly", () => {
			const negativeScore = -100;
			render(<ExitModal userScore={negativeScore} />);

			expect(
				screen.getByText(`Final score: ${negativeScore}`)
			).toBeInTheDocument();
		});

		it("should display decimal scores correctly", () => {
			const decimalScore = 1250.5;
			render(<ExitModal userScore={decimalScore} />);

			expect(
				screen.getByText(`Final score: ${decimalScore}`)
			).toBeInTheDocument();
		});
	});

	describe("Modal Behavior", () => {
		it("should always render modal as open", () => {
			render(<ExitModal userScore={1250} />);

			// Modal should always be open (isOpen={true} is hardcoded)
			expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
		});

		it("should contain modal content within proper structure", () => {
			render(<ExitModal userScore={1250} />);

			const modal = screen.getByTestId("mock-modal");
			const contentDiv = modal.querySelector(
				"div.p-10.flex.items-center.justify-center.flex-col.gap-10"
			);

			expect(contentDiv).toBeInTheDocument();
		});
	});

	describe("Styling", () => {
		it("should have correct title styling", () => {
			render(<ExitModal userScore={1250} />);

			const title = screen.getByText("Game Over!");
			expect(title).toHaveClass("text-3xl", "font-bold");
		});

		it("should have correct score text styling", () => {
			render(<ExitModal userScore={1250} />);

			const scoreText = screen.getByText("Final score: 1250");
			expect(scoreText).toHaveClass("text-xl");
			expect(scoreText.tagName.toLowerCase()).toBe("p");
		});

		it("should have correct content container styling", () => {
			const { container } = render(<ExitModal userScore={1250} />);

			const contentContainer = container.querySelector(
				"div.p-10.flex.items-center.justify-center.flex-col.gap-10"
			);
			expect(contentContainer).toBeInTheDocument();
			expect(contentContainer).toHaveClass(
				"p-10",
				"flex",
				"items-center",
				"justify-center",
				"flex-col",
				"gap-10"
			);
		});
	});

	describe("Button Interaction", () => {
		it("should render button correctly", () => {
			render(<ExitModal userScore={1250} />);

			const button = screen.getByTestId("mock-regular-button");
			expect(button).toBeInTheDocument();
			expect(button).toHaveTextContent("Back to lobby");
		});

		it("should handle button clicks without error", () => {
			render(<ExitModal userScore={1250} />);

			const button = screen.getByTestId("mock-regular-button");

			// Should not throw error when clicked
			expect(() => {
				fireEvent.click(button);
			}).not.toThrow();
		});

		it("should pass correct props to RegularButton", () => {
			render(<ExitModal userScore={1250} />);

			const button = screen.getByTestId("mock-regular-button");
			expect(button).toHaveTextContent("Back to lobby");
		});
	});

	describe("Component Structure", () => {
		it("should have elements in correct order", () => {
			render(<ExitModal userScore={1250} />);

			const modal = screen.getByTestId("mock-modal");
			const children = modal.querySelectorAll("h2, p, button");

			expect(children).toHaveLength(3);
			expect(children[0]).toHaveTextContent("Game Over!");
			expect(children[1]).toHaveTextContent("Final score: 1250");
			expect(children[2]).toHaveTextContent("Back to lobby");
		});

		it("should maintain proper semantic structure", () => {
			render(<ExitModal userScore={1250} />);

			// Should have proper heading hierarchy
			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toHaveTextContent("Game Over!");

			// Should have button for interaction
			const button = screen.getByRole("button");
			expect(button).toHaveTextContent("Back to lobby");
		});
	});

	describe("Accessibility", () => {
		it("should have proper heading structure", () => {
			render(<ExitModal userScore={1250} />);

			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toBeInTheDocument();
			expect(heading).toHaveTextContent("Game Over!");
		});

		it("should have clickable button", () => {
			render(<ExitModal userScore={1250} />);

			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});

		it("should have descriptive text content", () => {
			render(<ExitModal userScore={1250} />);

			// Score information should be clear
			expect(screen.getByText("Final score: 1250")).toBeInTheDocument();

			// Action should be clear
			expect(screen.getByText("Back to lobby")).toBeInTheDocument();
		});
	});

	describe("Props Handling", () => {
		it("should handle userScore prop correctly", () => {
			const { rerender } = render(<ExitModal userScore={100} />);
			expect(screen.getByText("Final score: 100")).toBeInTheDocument();

			rerender(<ExitModal userScore={500} />);
			expect(screen.getByText("Final score: 500")).toBeInTheDocument();
			expect(
				screen.queryByText("Final score: 100")
			).not.toBeInTheDocument();
		});

		it("should handle userScore prop updates", () => {
			const { rerender } = render(<ExitModal userScore={0} />);
			expect(screen.getByText("Final score: 0")).toBeInTheDocument();

			rerender(<ExitModal userScore={9999} />);
			expect(screen.getByText("Final score: 9999")).toBeInTheDocument();
		});
	});

	describe("Component Behavior", () => {
		it("should render consistently across multiple renders", () => {
			const { rerender } = render(<ExitModal userScore={1250} />);

			expect(screen.getByText("Game Over!")).toBeInTheDocument();
			expect(screen.getByText("Final score: 1250")).toBeInTheDocument();
			expect(
				screen.getByTestId("mock-regular-button")
			).toBeInTheDocument();

			rerender(<ExitModal userScore={1250} />);

			expect(screen.getByText("Game Over!")).toBeInTheDocument();
			expect(screen.getByText("Final score: 1250")).toBeInTheDocument();
			expect(
				screen.getByTestId("mock-regular-button")
			).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(<ExitModal userScore={1250} />);

			expect(screen.getByText("Game Over!")).toBeInTheDocument();

			// Should not throw error when unmounting
			expect(() => unmount()).not.toThrow();
		});
	});

	describe("Edge Cases", () => {
		it("should handle extremely large scores", () => {
			const largeScore = Number.MAX_SAFE_INTEGER;
			render(<ExitModal userScore={largeScore} />);

			expect(
				screen.getByText(`Final score: ${largeScore}`)
			).toBeInTheDocument();
		});

		it("should handle floating point scores", () => {
			const floatScore = 123.456789;
			render(<ExitModal userScore={floatScore} />);

			expect(
				screen.getByText(`Final score: ${floatScore}`)
			).toBeInTheDocument();
		});

		it("should handle zero score", () => {
			render(<ExitModal userScore={0} />);

			expect(screen.getByText("Final score: 0")).toBeInTheDocument();
		});
	});
});

import React from "react";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import MsgCard from "../MsgCard";

// Mock timers for testing duration and animation
jest.useFakeTimers();

describe("MsgCard Component", () => {
	afterEach(() => {
		jest.clearAllTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	describe("Rendering", () => {
		it("should render success message correctly", () => {
			render(
				<MsgCard
					type="success"
					message="Operation completed successfully!"
				/>
			);

			expect(screen.getByText("Success")).toBeInTheDocument();
			expect(
				screen.getByText("Operation completed successfully!")
			).toBeInTheDocument();
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		it("should render error message correctly", () => {
			render(<MsgCard type="error" message="Something went wrong!" />);

			expect(screen.getByText("Error")).toBeInTheDocument();
			expect(
				screen.getByText("Something went wrong!")
			).toBeInTheDocument();
		});

		it("should render warning message correctly", () => {
			render(
				<MsgCard type="warning" message="Please check your input!" />
			);

			expect(screen.getByText("Warning")).toBeInTheDocument();
			expect(
				screen.getByText("Please check your input!")
			).toBeInTheDocument();
		});

		it("should render info message correctly", () => {
			render(<MsgCard type="info" message="Here is some information!" />);

			expect(screen.getByText("Info")).toBeInTheDocument();
			expect(
				screen.getByText("Here is some information!")
			).toBeInTheDocument();
		});
	});

	describe("Styling", () => {
		it("should apply correct CSS classes for success type", () => {
			render(<MsgCard type="success" message="Success message" />);

			const messageCard = screen
				.getByText("Success message")
				.closest("div")?.parentElement;
			expect(messageCard).toHaveClass(
				"bg-green-50",
				"text-green-700",
				"border-green-200"
			);
		});

		it("should apply correct CSS classes for error type", () => {
			render(<MsgCard type="error" message="Error message" />);

			const messageCard = screen
				.getByText("Error message")
				.closest("div")?.parentElement;
			expect(messageCard).toHaveClass(
				"bg-red-50",
				"text-red-700",
				"border-red-200"
			);
		});

		it("should apply correct CSS classes for warning type", () => {
			render(<MsgCard type="warning" message="Warning message" />);

			const messageCard = screen
				.getByText("Warning message")
				.closest("div")?.parentElement;
			expect(messageCard).toHaveClass(
				"bg-yellow-50",
				"text-yellow-700",
				"border-yellow-200"
			);
		});

		it("should apply correct CSS classes for info type", () => {
			render(<MsgCard type="info" message="Info message" />);

			const messageCard = screen
				.getByText("Info message")
				.closest("div")?.parentElement;
			expect(messageCard).toHaveClass(
				"bg-blue-50",
				"text-blue-700",
				"border-blue-200"
			);
		});

		it("should have correct base styling classes", () => {
			render(<MsgCard type="success" message="Test message" />);

			const messageCard = screen
				.getByText("Test message")
				.closest("div")?.parentElement;
			expect(messageCard).toHaveClass(
				"z-50",
				"rounded",
				"py-4",
				"px-8",
				"fixed",
				"bottom-4",
				"right-4",
				"shadow-lg",
				"flex",
				"items-center",
				"transition-all",
				"duration-500"
			);
		});
	});

	describe("Close functionality", () => {
		it("should call onClose when close button is clicked", async () => {
			const mockOnClose = jest.fn();
			render(
				<MsgCard
					type="success"
					message="Test message"
					onClose={mockOnClose}
				/>
			);

			const closeButton = screen.getByRole("button");
			fireEvent.click(closeButton);

			// Fast-forward through the fade-out animation
			await act(async () => {
				jest.advanceTimersByTime(500);
			});

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});

		it("should show close button with correct symbol", () => {
			render(<MsgCard type="success" message="Test message" />);

			const closeButton = screen.getByRole("button");
			expect(closeButton).toHaveTextContent("×");
		});

		it("should apply fade-out animation when closing", () => {
			render(<MsgCard type="success" message="Test message" />);

			const messageCard = screen
				.getByText("Test message")
				.closest("div")?.parentElement;
			const closeButton = screen.getByRole("button");

			// Initially should not have fade-out classes
			expect(messageCard).toHaveClass("opacity-100");
			expect(messageCard).not.toHaveClass(
				"opacity-0",
				"translate-x-full"
			);

			fireEvent.click(closeButton);

			// After clicking close, should have fade-out classes
			expect(messageCard).toHaveClass("opacity-0", "translate-x-full");
		});
	});

	describe("Auto-close functionality", () => {
		it("should auto-close after default duration (5000ms)", async () => {
			const mockOnClose = jest.fn();
			render(
				<MsgCard
					type="success"
					message="Test message"
					onClose={mockOnClose}
				/>
			);

			// Fast-forward through default duration + fade-out
			await act(async () => {
				jest.advanceTimersByTime(5500);
			});

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});

		it("should auto-close after custom duration", async () => {
			const mockOnClose = jest.fn();
			render(
				<MsgCard
					type="success"
					message="Test message"
					duration={2000}
					onClose={mockOnClose}
				/>
			);

			// Fast-forward through custom duration + fade-out
			await act(async () => {
				jest.advanceTimersByTime(2500);
			});

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});

		it("should not call onClose if no onClose prop provided", async () => {
			render(
				<MsgCard
					type="success"
					message="Test message"
					duration={1000}
				/>
			);

			// Should not throw error when no onClose is provided
			await act(async () => {
				expect(() => {
					jest.advanceTimersByTime(1500);
				}).not.toThrow();
			});
		});
	});

	describe("Component lifecycle", () => {
		it("should not render when isVisible becomes false", async () => {
			render(
				<MsgCard
					type="success"
					message="Test message"
					duration={1000}
				/>
			);

			expect(screen.getByText("Test message")).toBeInTheDocument();

			// Fast-forward past duration + fade-out
			await act(async () => {
				jest.advanceTimersByTime(1500);
			});

			// Component should be removed from DOM
			await waitFor(() => {
				expect(
					screen.queryByText("Test message")
				).not.toBeInTheDocument();
			});
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(
				<MsgCard type="success" message="Test message" />
			);

			// Should not throw error when unmounting
			expect(() => unmount()).not.toThrow();
		});
	});

	describe("Message content", () => {
		it("should handle long messages correctly", () => {
			const longMessage =
				"This is a very long message that should wrap properly and be displayed correctly in the message card component without breaking the layout.";

			render(<MsgCard type="info" message={longMessage} />);

			expect(screen.getByText(longMessage)).toBeInTheDocument();

			const messageElement = screen.getByText(longMessage);
			expect(messageElement).toHaveClass("text-wrap");
		});

		it("should handle empty messages", () => {
			render(<MsgCard type="success" message="" />);

			expect(screen.getByText("Success")).toBeInTheDocument();
			// For empty message, just check that the component renders without error
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		it("should handle special characters in messages", () => {
			const specialMessage = "Message with special chars: @#$%^&*()!";

			render(<MsgCard type="error" message={specialMessage} />);

			expect(screen.getByText(specialMessage)).toBeInTheDocument();
		});
	});
});

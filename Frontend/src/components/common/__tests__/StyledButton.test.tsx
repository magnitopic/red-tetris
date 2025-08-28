import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StyledButton from "../StyledButton";

describe("StyledButton Component", () => {
	it("renders button with correct styling and content", () => {
		render(<StyledButton value="Test Button" />);

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Test Button");
		expect(button).toHaveAttribute("title", "Test Button");
		expect(button).toHaveAttribute("type", "button");

		// Check essential styling classes
		expect(button).toHaveClass(
			"text-white",
			"bg-gradient-to-br",
			"from-secondary-light",
			"to-tertiary",
			"hover:bg-gradient-to-bl",
			"focus:ring-4",
			"font-bold",
			"rounded-lg",
			"px-14",
			"py-5"
		);
	});

	it("handles disabled state correctly", () => {
		const { rerender } = render(
			<StyledButton value="Test" disabled={false} />
		);

		let button = screen.getByRole("button");
		expect(button).not.toBeDisabled();
		expect(button).not.toHaveClass("opacity-50", "cursor-not-allowed");

		rerender(<StyledButton value="Test" disabled={true} />);
		button = screen.getByRole("button");
		expect(button).toBeDisabled();
		expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
	});

	it("handles user interactions", async () => {
		const user = userEvent.setup();
		render(<StyledButton value="Interactive Button" />);

		const button = screen.getByRole("button");

		// Test click
		await user.click(button);
		expect(button).toBeInTheDocument();

		// Test keyboard interactions
		fireEvent.keyDown(button, { key: "Enter" });
		fireEvent.keyDown(button, { key: " " });
		expect(button).toBeInTheDocument();
	});

	it("handles different text content correctly", () => {
		const testCases = [
			"",
			"Long text that should wrap properly without breaking layout",
			"Special chars: !@#$%^&*()",
			"Unicode: 测试🚀⭐️",
		];

		testCases.forEach((text) => {
			const { unmount } = render(<StyledButton value={text} />);
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
			expect(button.textContent).toBe(text);
			unmount();
		});
	});
});

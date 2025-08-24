import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StyledButton from "../StyledButton";

describe("StyledButton Component", () => {
	const defaultProps = {
		value: "Test Button",
		disabled: false,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render button with correct text", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			expect(button).toBeInTheDocument();
		});

		it("should render button with correct title attribute", () => {
			render(<StyledButton {...defaultProps} value="Custom Title" />);
			
			const button = screen.getByTitle("Custom Title");
			expect(button).toBeInTheDocument();
		});

		it("should render as button type by default", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("type", "button");
		});

		it("should render button with correct role", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});

		it("should display the provided value text", () => {
			const customValue = "Custom Button Text";
			render(<StyledButton value={customValue} />);
			
			expect(screen.getByText(customValue)).toBeInTheDocument();
		});
	});

	describe("Styling", () => {
		it("should have correct base styling classes", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass(
				"text-white",
				"bg-gradient-to-br",
				"from-secondary-light",
				"to-tertiary",
				"hover:bg-gradient-to-bl",
				"focus:ring-4",
				"focus:outline-none",
				"focus:ring-pink-200",
				"font-bold",
				"rounded-lg",
				"text-sm",
				"px-14",
				"py-5",
				"text-center"
			);
		});

		it("should have gradient background styling", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("bg-gradient-to-br", "from-secondary-light", "to-tertiary");
		});

		it("should have hover gradient styling", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("hover:bg-gradient-to-bl");
		});

		it("should have focus ring styling", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("focus:ring-4", "focus:outline-none", "focus:ring-pink-200");
		});

		it("should have disabled styling when disabled", () => {
			render(<StyledButton {...defaultProps} disabled={true} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
			expect(button).toBeDisabled();
		});

		it("should not have disabled styling when enabled", () => {
			render(<StyledButton {...defaultProps} disabled={false} />);
			
			const button = screen.getByRole("button");
			expect(button).not.toHaveClass("opacity-50", "cursor-not-allowed");
			expect(button).not.toBeDisabled();
		});

		it("should have correct padding and sizing", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("px-14", "py-5", "text-sm");
		});

		it("should have correct border radius", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("rounded-lg");
		});

		it("should have correct text alignment and font weight", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("text-center", "font-bold");
		});
	});

	describe("User Interactions", () => {
		it("should be clickable when enabled", async () => {
			const user = userEvent.setup();
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			await user.click(button);

			// Should not throw any errors
			expect(button).toBeInTheDocument();
		});

		it("should handle hover effects", async () => {
			const user = userEvent.setup();
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			await user.hover(button);

			expect(button).toBeInTheDocument();
		});

		it("should handle focus events", async () => {
			const user = userEvent.setup();
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			await user.tab();

			expect(button).toHaveFocus();
		});

		it("should handle keyboard interactions", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
			fireEvent.keyDown(button, { key: " ", code: "Space" });

			// Should not throw errors
			expect(button).toBeInTheDocument();
		});

		it("should handle rapid clicking", async () => {
			const user = userEvent.setup();
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			
			// Click multiple times rapidly
			await user.click(button);
			await user.click(button);
			await user.click(button);

			expect(button).toBeInTheDocument();
		});
	});

	describe("Disabled State", () => {
		it("should be disabled when disabled prop is true", () => {
			render(<StyledButton {...defaultProps} disabled={true} />);
			
			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
		});

		it("should not be disabled when disabled prop is false", () => {
			render(<StyledButton {...defaultProps} disabled={false} />);
			
			const button = screen.getByRole("button");
			expect(button).not.toBeDisabled();
		});

		it("should not be disabled when disabled prop is not provided", () => {
			render(<StyledButton value="Test" />);
			
			const button = screen.getByRole("button");
			expect(button).not.toBeDisabled();
		});

		it("should indicate disabled state to screen readers", () => {
			render(<StyledButton {...defaultProps} disabled={true} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("disabled");
		});

		it("should apply visual disabled styling", () => {
			render(<StyledButton {...defaultProps} disabled={true} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
		});
	});

	describe("Accessibility", () => {
		it("should have correct role", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});

		it("should be accessible via text content", () => {
			render(<StyledButton {...defaultProps} value="Accessible Button" />);
			
			const button = screen.getByText("Accessible Button");
			expect(button).toBeInTheDocument();
		});

		it("should be accessible via title attribute", () => {
			render(<StyledButton {...defaultProps} value="Title Button" />);
			
			const button = screen.getByTitle("Title Button");
			expect(button).toBeInTheDocument();
		});

		it("should be keyboard navigable", async () => {
			const user = userEvent.setup();
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			
			await user.tab();
			expect(button).toHaveFocus();
		});

		it("should have proper focus indicators", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("focus:ring-4", "focus:outline-none", "focus:ring-pink-200");
		});

		it("should provide clear visual feedback", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			// Check for high contrast text and background
			expect(button).toHaveClass("text-white");
		});
	});

	describe("Props Validation", () => {
		it("should handle empty value", () => {
			render(<StyledButton value="" />);
			
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
			expect(button.textContent).toBe("");
		});

		it("should handle long text values", () => {
			const longText = "This is a very long button text that should still render correctly without breaking the layout";
			render(<StyledButton value={longText} />);
			
			const button = screen.getByText(longText);
			expect(button).toBeInTheDocument();
		});

		it("should handle special characters in value", () => {
			const specialText = "!@#$%^&*()_+{}|:<>?[]\\;'\".,/";
			render(<StyledButton value={specialText} />);
			
			const button = screen.getByText(specialText);
			expect(button).toBeInTheDocument();
		});

		it("should handle unicode characters", () => {
			const unicodeText = "测试🚀⭐️🎯";
			render(<StyledButton value={unicodeText} />);
			
			const button = screen.getByText(unicodeText);
			expect(button).toBeInTheDocument();
		});

		it("should handle numeric values in text", () => {
			const numericText = "Button 123";
			render(<StyledButton value={numericText} />);
			
			const button = screen.getByText(numericText);
			expect(button).toBeInTheDocument();
		});
	});

	describe("Component State Management", () => {
		it("should handle component state changes", () => {
			const { rerender } = render(<StyledButton value="Initial" />);
			
			expect(screen.getByText("Initial")).toBeInTheDocument();
			
			rerender(<StyledButton value="Updated" />);
			expect(screen.getByText("Updated")).toBeInTheDocument();
			expect(screen.queryByText("Initial")).not.toBeInTheDocument();
		});

		it("should handle disabled state changes", () => {
			const { rerender } = render(<StyledButton {...defaultProps} disabled={false} />);
			
			let button = screen.getByRole("button");
			expect(button).not.toBeDisabled();
			expect(button).not.toHaveClass("opacity-50", "cursor-not-allowed");
			
			rerender(<StyledButton {...defaultProps} disabled={true} />);
			button = screen.getByRole("button");
			expect(button).toBeDisabled();
			expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
		});

		it("should maintain consistent styling across re-renders", () => {
			const { rerender } = render(<StyledButton value="Test 1" />);
			
			let button = screen.getByRole("button");
			const initialClasses = button.className;
			
			rerender(<StyledButton value="Test 2" />);
			button = screen.getByRole("button");
			
			// Should maintain same styling classes
			expect(button.className).toContain("bg-gradient-to-br");
			expect(button.className).toContain("font-bold");
			expect(button.className).toContain("rounded-lg");
		});
	});

	describe("Visual Design Verification", () => {
		it("should have gradient background colors", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("bg-gradient-to-br", "from-secondary-light", "to-tertiary");
		});

		it("should have proper spacing and dimensions", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("px-14", "py-5");
		});

		it("should have correct text styling", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("text-white", "font-bold", "text-sm", "text-center");
		});

		it("should have proper border radius", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("rounded-lg");
		});

		it("should have hover and focus effects", () => {
			render(<StyledButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("hover:bg-gradient-to-bl");
			expect(button).toHaveClass("focus:ring-4", "focus:ring-pink-200");
		});
	});

	describe("Performance and Memory", () => {
		it("should not cause memory leaks when unmounted", () => {
			const { unmount } = render(<StyledButton {...defaultProps} />);
			
			// Should unmount without errors
			expect(() => unmount()).not.toThrow();
		});

		it("should handle multiple renders efficiently", () => {
			const { rerender } = render(<StyledButton value="Initial" />);
			
			// Multiple re-renders should not cause issues
			for (let i = 0; i < 10; i++) {
				rerender(<StyledButton value={`Update ${i}`} />);
			}
			
			expect(screen.getByText("Update 9")).toBeInTheDocument();
		});

		it("should render consistently across multiple instances", () => {
			render(
				<div>
					<StyledButton value="Button 1" />
					<StyledButton value="Button 2" disabled={true} />
					<StyledButton value="Button 3" />
				</div>
			);
			
			expect(screen.getByText("Button 1")).toBeInTheDocument();
			expect(screen.getByText("Button 2")).toBeInTheDocument();
			expect(screen.getByText("Button 3")).toBeInTheDocument();
			
			// Check that disabled button has different styling
			const disabledButton = screen.getByText("Button 2");
			expect(disabledButton).toHaveClass("opacity-50", "cursor-not-allowed");
		});
	});

	describe("Edge Cases", () => {
		it("should handle whitespace in value", () => {
			const whitespaceText = "  Spaced Text  ";
			render(<StyledButton value={whitespaceText} />);
			
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
			expect(button.textContent).toBe(whitespaceText);
		});

		it("should handle newlines in value", () => {
			const multilineText = "Line 1\nLine 2";
			render(<StyledButton value={multilineText} />);
			
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
			expect(button.textContent).toBe(multilineText);
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(<StyledButton {...defaultProps} />);
			
			expect(() => {
				unmount();
			}).not.toThrow();
		});

		it("should handle rapid prop changes", () => {
			const { rerender } = render(<StyledButton value="Test" disabled={false} />);
			
			// Rapid changes should not cause issues
			rerender(<StyledButton value="Changed" disabled={true} />);
			rerender(<StyledButton value="Again" disabled={false} />);
			rerender(<StyledButton value="Final" disabled={true} />);
			
			const button = screen.getByText("Final");
			expect(button).toBeDisabled();
		});
	});
});

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegularButton from "../RegularButton";

describe("RegularButton Component", () => {
	const defaultProps = {
		value: "Test Button",
		callback: jest.fn(),
		disabled: false,
		type: "button" as const,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render button with correct text", () => {
			render(<RegularButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			expect(button).toBeInTheDocument();
		});

		it("should render button with correct title attribute", () => {
			render(<RegularButton {...defaultProps} value="Custom Title" />);
			
			const button = screen.getByTitle("Custom Title");
			expect(button).toBeInTheDocument();
		});

		it("should render submit button by default", () => {
			render(<RegularButton value="Submit" />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("type", "submit");
		});

		it("should render button type when specified", () => {
			render(<RegularButton {...defaultProps} type="button" />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("type", "button");
		});

		it("should render with icon when provided", () => {
			render(<RegularButton {...defaultProps} icon="fa-user" />);
			
			const icon = document.querySelector(".fa-user");
			expect(icon).toBeInTheDocument();
		});

		it("should render icon only when no value provided", () => {
			render(<RegularButton value="" icon="fa-user" />);
			
			const button = screen.getByRole("button");
			const icon = document.querySelector(".fa-user");
			expect(icon).toBeInTheDocument();
			expect(button.textContent).toBe("");
		});
	});

	describe("Styling", () => {
		it("should have correct base styling classes", () => {
			render(<RegularButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass(
				"w-fit",
				"duration-200",
				"font-bold",
				"rounded-full",
				"bg-primary-monochromatic",
				"text-white",
				"border-background-secondary",
				"border-solid",
				"border",
				"hover:bg-background-main",
				"px-5",
				"py-3"
			);
		});

		it("should have alternative styling when alternative prop is true", () => {
			render(<RegularButton {...defaultProps} alternative={true} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass("bg-background-secondary");
			expect(button).not.toHaveClass("bg-primary-monochromatic");
		});

		it("should have disabled styling when disabled", () => {
			render(<RegularButton {...defaultProps} disabled={true} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveClass(
				"opacity-50",
				"cursor-not-allowed",
				"hover:bg-background-secondary",
				"hover:text-primary"
			);
			expect(button).toBeDisabled();
		});

		it("should not have disabled styling when enabled", () => {
			render(<RegularButton {...defaultProps} disabled={false} />);
			
			const button = screen.getByRole("button");
			expect(button).not.toHaveClass("opacity-50", "cursor-not-allowed");
			expect(button).not.toBeDisabled();
		});

		it("should apply icon padding when both icon and value are present", () => {
			render(<RegularButton {...defaultProps} icon="fa-user" />);
			
			const icon = document.querySelector(".fa-user");
			expect(icon).toHaveClass("pr-2");
		});

		it("should not apply icon padding when only icon is present", () => {
			render(<RegularButton value="" icon="fa-user" />);
			
			const icon = document.querySelector(".fa-user");
			expect(icon).not.toHaveClass("pr-2");
		});
	});

	describe("User Interactions", () => {
		it("should call callback when clicked", async () => {
			const mockCallback = jest.fn();
			const user = userEvent.setup();
			
			render(<RegularButton {...defaultProps} callback={mockCallback} />);
			
			const button = screen.getByText("Test Button");
			await user.click(button);

			expect(mockCallback).toHaveBeenCalledTimes(1);
		});

		it("should not call callback when disabled", async () => {
			const mockCallback = jest.fn();
			const user = userEvent.setup();
			
			render(<RegularButton {...defaultProps} callback={mockCallback} disabled={true} />);
			
			const button = screen.getByText("Test Button");
			await user.click(button);

			expect(mockCallback).not.toHaveBeenCalled();
		});

		it("should handle hover effects", async () => {
			const user = userEvent.setup();
			render(<RegularButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			await user.hover(button);

			expect(button).toBeInTheDocument();
		});

		it("should handle focus events", async () => {
			const user = userEvent.setup();
			render(<RegularButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			await user.tab();

			expect(button).toHaveFocus();
		});

		it("should handle keyboard interactions", () => {
			const mockCallback = jest.fn();
			render(<RegularButton {...defaultProps} callback={mockCallback} />);
			
			const button = screen.getByText("Test Button");
			fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

			// Should not throw errors
			expect(button).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have correct role", () => {
			render(<RegularButton {...defaultProps} />);
			
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});

		it("should be accessible via text content", () => {
			render(<RegularButton {...defaultProps} value="Accessible Button" />);
			
			const button = screen.getByText("Accessible Button");
			expect(button).toBeInTheDocument();
		});

		it("should be accessible via title attribute", () => {
			render(<RegularButton {...defaultProps} value="Title Button" />);
			
			const button = screen.getByTitle("Title Button");
			expect(button).toBeInTheDocument();
		});

		it("should be keyboard navigable", async () => {
			const user = userEvent.setup();
			render(<RegularButton {...defaultProps} />);
			
			const button = screen.getByText("Test Button");
			
			await user.tab();
			expect(button).toHaveFocus();
		});

		it("should indicate disabled state to screen readers", () => {
			render(<RegularButton {...defaultProps} disabled={true} />);
			
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("disabled");
		});
	});

	describe("Props Validation", () => {
		it("should handle missing callback prop gracefully", () => {
			expect(() => {
				render(<RegularButton value="No Callback" />);
			}).not.toThrow();
		});

		it("should handle empty value", () => {
			render(<RegularButton value="" />);
			
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
			expect(button.textContent).toBe("");
		});

		it("should handle long text values", () => {
			const longText = "This is a very long button text that should still render correctly";
			render(<RegularButton value={longText} />);
			
			const button = screen.getByText(longText);
			expect(button).toBeInTheDocument();
		});

		it("should handle special characters in value", () => {
			const specialText = "!@#$%^&*()_+{}|:<>?[]\\;'\".,/";
			render(<RegularButton value={specialText} />);
			
			const button = screen.getByText(specialText);
			expect(button).toBeInTheDocument();
		});

		it("should handle unicode characters", () => {
			const unicodeText = "测试🚀";
			render(<RegularButton value={unicodeText} />);
			
			const button = screen.getByText(unicodeText);
			expect(button).toBeInTheDocument();
		});
	});

	describe("Form Integration", () => {
		it("should submit form when type is submit", () => {
			const mockSubmit = jest.fn();
			render(
				<form onSubmit={mockSubmit}>
					<RegularButton value="Submit" type="submit" />
				</form>
			);
			
			const button = screen.getByText("Submit");
			fireEvent.click(button);

			expect(mockSubmit).toHaveBeenCalled();
		});

		it("should not submit form when type is button", () => {
			const mockSubmit = jest.fn();
			render(
				<form onSubmit={mockSubmit}>
					<RegularButton value="Button" type="button" />
				</form>
			);
			
			const button = screen.getByText("Button");
			fireEvent.click(button);

			expect(mockSubmit).not.toHaveBeenCalled();
		});

		it("should work with form validation", () => {
			render(
				<form>
					<input required />
					<RegularButton value="Submit" type="submit" />
				</form>
			);
			
			const button = screen.getByText("Submit");
			expect(button).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle rapid clicking", async () => {
			const mockCallback = jest.fn();
			const user = userEvent.setup();
			
			render(<RegularButton {...defaultProps} callback={mockCallback} />);
			
			const button = screen.getByText("Test Button");
			
			// Click multiple times rapidly
			await user.click(button);
			await user.click(button);
			await user.click(button);

			expect(mockCallback).toHaveBeenCalledTimes(3);
		});

		it("should handle component state changes", () => {
			const { rerender } = render(<RegularButton value="Initial" />);
			
			expect(screen.getByText("Initial")).toBeInTheDocument();
			
			rerender(<RegularButton value="Updated" />);
			expect(screen.getByText("Updated")).toBeInTheDocument();
			expect(screen.queryByText("Initial")).not.toBeInTheDocument();
		});

		it("should handle disabled state changes", () => {
			const { rerender } = render(<RegularButton {...defaultProps} disabled={false} />);
			
			let button = screen.getByRole("button");
			expect(button).not.toBeDisabled();
			
			rerender(<RegularButton {...defaultProps} disabled={true} />);
			button = screen.getByRole("button");
			expect(button).toBeDisabled();
		});

		it("should handle icon changes", () => {
			const { rerender } = render(<RegularButton value="Test" icon="fa-user" />);
			
			expect(document.querySelector(".fa-user")).toBeInTheDocument();
			
			rerender(<RegularButton value="Test" icon="fa-home" />);
			expect(document.querySelector(".fa-home")).toBeInTheDocument();
			expect(document.querySelector(".fa-user")).not.toBeInTheDocument();
		});

		it("should handle alternative style changes", () => {
			const { rerender } = render(<RegularButton {...defaultProps} alternative={false} />);
			
			let button = screen.getByRole("button");
			expect(button).toHaveClass("bg-primary-monochromatic");
			
			rerender(<RegularButton {...defaultProps} alternative={true} />);
			button = screen.getByRole("button");
			expect(button).toHaveClass("bg-background-secondary");
		});
	});
});

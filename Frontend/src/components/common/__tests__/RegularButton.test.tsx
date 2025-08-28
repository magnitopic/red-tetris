import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegularButton from "../RegularButton";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

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

	it("renders with correct content and attributes", () => {
		render(<RegularButton {...defaultProps} value="Custom Title" />);

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Custom Title");
		expect(button).toHaveAttribute("title", "Custom Title");
		expect(button).toHaveAttribute("type", "button");

		// Test icon rendering
		const { rerender } = render(
			<RegularButton {...defaultProps} icon="fa-user" />
		);
		const icon = document.querySelector(".fa-user");
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveClass("pr-2"); // Icon padding when both icon and value present

		// Test icon only (no padding)
		rerender(<RegularButton value="" icon="fa-user" />);
		const iconOnly = document.querySelector(".fa-user");
		expect(iconOnly).not.toHaveClass("pr-2");
	});

	it("applies correct styling based on props", () => {
		const { rerender } = render(<RegularButton {...defaultProps} />);

		const button = screen.getByRole("button");

		// Base styling
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

		// Alternative styling
		rerender(<RegularButton {...defaultProps} alternative={true} />);
		expect(button).toHaveClass("bg-background-secondary");
		expect(button).not.toHaveClass("bg-primary-monochromatic");

		// Disabled styling
		rerender(<RegularButton {...defaultProps} disabled={true} />);
		expect(button).toHaveClass(
			"opacity-50",
			"cursor-not-allowed",
			"hover:bg-background-secondary",
			"hover:text-primary"
		);
		expect(button).toBeDisabled();

		// Enabled styling
		rerender(<RegularButton {...defaultProps} disabled={false} />);
		expect(button).not.toHaveClass("opacity-50", "cursor-not-allowed");
		expect(button).not.toBeDisabled();
	});

	it("handles user interactions correctly", async () => {
		const mockCallback = jest.fn();
		const user = userEvent.setup();

		const { rerender } = render(
			<RegularButton {...defaultProps} callback={mockCallback} />
		);

		const button = screen.getByRole("button");

		// Click interaction
		await user.click(button);
		expect(mockCallback).toHaveBeenCalledTimes(1);

		// Tab navigation
		await user.tab();
		expect(button).toBeInTheDocument();

		// Hover (should not throw errors)
		await user.hover(button);
		expect(button).toBeInTheDocument();

		// Keyboard events (should not throw errors)
		fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
		expect(button).toBeInTheDocument();

		// Disabled state should not trigger callback
		mockCallback.mockClear();
		rerender(
			<RegularButton
				{...defaultProps}
				callback={mockCallback}
				disabled={true}
			/>
		);
		await user.click(button);
		expect(mockCallback).not.toHaveBeenCalled();
	});

	it("handles form integration and submission", async () => {
		const mockSubmit = jest.fn();
		const user = userEvent.setup();

		// Test button type attributes instead of actual form submission to avoid jsdom limitations
		const { rerender } = render(
			<form onSubmit={mockSubmit}>
				<RegularButton value="Submit" type="submit" />
			</form>
		);

		let button = screen.getByText("Submit");
		expect(button).toHaveAttribute("type", "submit");

		// Test button type
		rerender(
			<form onSubmit={mockSubmit}>
				<RegularButton value="Button" type="button" />
			</form>
		);

		button = screen.getByText("Button");
		expect(button).toHaveAttribute("type", "button");

		// Test that button clicks work without form submission (avoid jsdom requestSubmit issue)
		const mockCallback = jest.fn();
		rerender(
			<RegularButton
				value="Click Test"
				type="button"
				callback={mockCallback}
			/>
		);

		button = screen.getByText("Click Test");
		await user.click(button);
		expect(mockCallback).toHaveBeenCalledTimes(1);

		// Default type should be submit
		const { container } = render(<RegularButton value="Default" />);
		const defaultButton = container.querySelector("button");
		expect(defaultButton).toHaveAttribute("type", "submit");
	});

	it("handles edge cases and special content", () => {
		// Empty value
		render(<RegularButton value="" />);
		let button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button.textContent).toBe("");

		// Long text
		const longText =
			"This is a very long button text that should still render correctly";
		render(<RegularButton value={longText} />);
		expect(screen.getByText(longText)).toBeInTheDocument();

		// Special characters
		const specialText = "!@#$%^&*()_+{}|:<>?[]\\;'\".,/";
		render(<RegularButton value={specialText} />);
		expect(screen.getByText(specialText)).toBeInTheDocument();

		// Unicode characters
		const unicodeText = "测试🚀";
		render(<RegularButton value={unicodeText} />);
		expect(screen.getByText(unicodeText)).toBeInTheDocument();

		// Missing callback should not crash
		expect(() => {
			render(<RegularButton value="No Callback" />);
		}).not.toThrow();
	});
});

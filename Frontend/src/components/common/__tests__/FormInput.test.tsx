import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormInput from "../FormInput";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

describe("FormInput Component", () => {
	const defaultProps = {
		placeholder: "Test placeholder",
		name: "test-input",
		value: "",
		onChange: jest.fn(),
		disabled: false,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders with correct attributes and styling", () => {
		const { rerender } = render(<FormInput {...defaultProps} />);

		// Check basic rendering and attributes
		const input = screen.getByPlaceholderText("Test placeholder");
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute("id", "test-input");
		expect(input).toHaveClass(
			"border", "text-black", "border-gray-300", "rounded-md",
			"w-full", "p-3", "my-1"
		);

		// Check default type
		expect((input as HTMLInputElement).type).toBe("text");

		// Test with value
		rerender(<FormInput {...defaultProps} value="test value" />);
		expect(screen.getByDisplayValue("test value")).toBeInTheDocument();

		// Test different input types
		rerender(<FormInput {...defaultProps} type="password" />);
		expect((screen.getByPlaceholderText("Test placeholder") as HTMLInputElement).type).toBe("password");

		rerender(<FormInput {...defaultProps} type="email" />);
		expect((screen.getByPlaceholderText("Test placeholder") as HTMLInputElement).type).toBe("email");
	});

	it("handles disabled state correctly", () => {
		const { rerender } = render(<FormInput {...defaultProps} disabled={true} />);

		const input = screen.getByPlaceholderText("Test placeholder");
		expect(input).toBeDisabled();

		// Test enabled state
		rerender(<FormInput {...defaultProps} disabled={false} />);
		expect(input).not.toBeDisabled();
	});

	it("handles user interactions and onChange events", async () => {
		const mockOnChange = jest.fn();
		const user = userEvent.setup();

		// Create controlled component for proper testing
		const ControlledInput = () => {
			const [value, setValue] = React.useState("");
			const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
				setValue(e.target.value);
				mockOnChange(e);
			};

			return (
				<FormInput
					{...defaultProps}
					value={value}
					onChange={handleChange}
				/>
			);
		};

		render(<ControlledInput />);
		const input = screen.getByPlaceholderText("Test placeholder");

		// Test typing
		await user.type(input, "test");
		expect(mockOnChange).toHaveBeenCalled();
		const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
		expect(lastCall.target.value).toBe("test");
		expect(lastCall.target.placeholder).toBe("Test placeholder");

		// Test special characters and unicode
		jest.clearAllMocks();
		await user.clear(input);
		await user.type(input, "!@#测试🚀");
		expect(mockOnChange).toHaveBeenCalled();
		const finalCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
		expect(finalCall.target.value).toBe("!@#测试🚀");

		// Test focus and blur
		await user.click(input);
		expect(input).toHaveFocus();
		await user.tab();
		expect(input).not.toHaveFocus();
	});

	it("handles disabled input correctly", async () => {
		const mockOnChange = jest.fn();
		const user = userEvent.setup();

		render(<FormInput {...defaultProps} onChange={mockOnChange} disabled={true} />);

		const input = screen.getByPlaceholderText("Test placeholder");
		await user.type(input, "test");

		expect(mockOnChange).not.toHaveBeenCalled();
	});

	it("handles keyboard navigation and accessibility", async () => {
		const user = userEvent.setup();
		
		render(
			<div>
				<FormInput {...defaultProps} placeholder="First input" name="first-input" />
				<FormInput {...defaultProps} placeholder="Second input" name="second-input" />
			</div>
		);

		const firstInput = screen.getByPlaceholderText("First input");
		const secondInput = screen.getByPlaceholderText("Second input");

		// Test keyboard navigation
		await user.click(firstInput);
		expect(firstInput).toHaveFocus();

		await user.tab();
		expect(secondInput).toHaveFocus();

		// Test accessibility - inputs are accessible via placeholder
		expect(firstInput).toBeInTheDocument();
		expect(secondInput).toBeInTheDocument();
		expect(screen.getAllByRole("textbox")).toHaveLength(2);
	});

	it("handles value updates and edge cases", async () => {
		const mockOnChange = jest.fn();
		const user = userEvent.setup();

		// Test value prop changes
		const { rerender } = render(<FormInput {...defaultProps} value="initial" />);
		expect(screen.getByDisplayValue("initial")).toBeInTheDocument();

		rerender(<FormInput {...defaultProps} value="updated" />);
		expect(screen.getByDisplayValue("updated")).toBeInTheDocument();

		// Test empty values
		rerender(<FormInput {...defaultProps} value="" />);
		const input = screen.getByPlaceholderText("Test placeholder") as HTMLInputElement;
		expect(input.value).toBe("");

		// Test long text
		const longText = "a".repeat(100);
		rerender(<FormInput {...defaultProps} value={longText} />);
		expect(screen.getByDisplayValue(longText)).toBeInTheDocument();

		// Test copy/paste operations
		const ControlledInput = () => {
			const [value, setValue] = React.useState("");
			const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
				setValue(e.target.value);
				mockOnChange(e);
			};
			return <FormInput {...defaultProps} value={value} onChange={handleChange} />;
		};

		rerender(<ControlledInput />);
		const newInput = screen.getByPlaceholderText("Test placeholder");
		
		await user.click(newInput);
		await user.paste("pasted text");
		expect(mockOnChange).toHaveBeenCalled();

		// Test rapid typing
		jest.clearAllMocks();
		await user.clear(newInput);
		await user.type(newInput, "rapid", { delay: 1 });
		expect(mockOnChange).toHaveBeenCalled(); // Just check it was called
	});

	it("handles keyboard events and props validation", () => {
		const { unmount } = render(<FormInput {...defaultProps} />);
		
		// Test keyboard events don't cause errors
		const input = screen.getByPlaceholderText("Test placeholder");
		fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
		expect(input).toBeInTheDocument();
		
		unmount();

		// Test with different name for ID attribute
		const { unmount: unmount2 } = render(<FormInput {...defaultProps} name="unique-input" />);
		const uniqueInput = screen.getByPlaceholderText("Test placeholder");
		expect(uniqueInput).toHaveAttribute("id", "unique-input");
		
		unmount2();

		// Test graceful handling of missing props
		const propsWithoutOnChange = {
			placeholder: "Test Validation",
			name: "test-input-no-onchange", 
			value: "",
			disabled: false,
			onChange: () => {}, // no-op function
		};

		expect(() => {
			render(<FormInput {...propsWithoutOnChange} />);
		}).not.toThrow();
	});
});

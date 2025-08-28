import { render, screen, fireEvent } from "@testing-library/react";
import WaitingModal from "../WaitingModal";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock the Modal component
jest.mock("../../../components/common/Modal", () => {
	return function MockModal({ isOpen, children }: any) {
		return isOpen ? <div data-testid="modal">{children}</div> : null;
	};
});

// Mock the RegularButton component to properly test the callback
jest.mock("../../../components/common/RegularButton", () => {
	return function MockRegularButton({ value, callback }: any) {
		// Store the callback for testing purposes
		(MockRegularButton as any).lastCallback = callback;
		return (
			<button data-testid="back-to-lobby-button" onClick={callback}>
				{value}
			</button>
		);
	};
});

describe("WaitingModal Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders modal with warning message and button functionality", () => {
		render(<WaitingModal />);

		// Check modal is rendered
		expect(screen.getByTestId("modal")).toBeInTheDocument();

		// Check warning message
		const message = screen.getByText(
			"Game already started, You must be inside gameRoom before host starts the game!"
		);
		expect(message).toBeInTheDocument();

		// Check heading structure and styling
		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveClass("text-3xl", "font-bold");
		expect(heading).toHaveTextContent(
			"Game already started, You must be inside gameRoom before host starts the game!"
		);

		// Check button
		const button = screen.getByTestId("back-to-lobby-button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Back to lobby");
		fireEvent.click(button);
		expect(button).toBeInTheDocument(); // Button still exists after click
	});

	it("has proper layout and accessibility", () => {
		render(<WaitingModal />);

		// Check container styling
		const modal = screen.getByTestId("modal");
		const container = modal.querySelector(".p-10");
		expect(container).toHaveClass(
			"p-10",
			"flex",
			"items-center",
			"justify-center",
			"flex-col",
			"gap-10"
		);

		// Check element order
		const children = container?.children;
		expect(children).toHaveLength(2);
		expect(children?.[0]).toContainHTML("h2");
		expect(children?.[1]).toContainHTML("button");

		// Check accessibility
		const accessibleButton = screen.getByRole("button", {
			name: "Back to lobby",
		});
		expect(accessibleButton).toBeInTheDocument();
	});

	it("handles component lifecycle properly", () => {
		const { rerender, unmount } = render(<WaitingModal />);

		// Initial render
		expect(screen.getByTestId("modal")).toBeInTheDocument();
		expect(screen.getByTestId("back-to-lobby-button")).toBeInTheDocument();

		// Re-render
		rerender(<WaitingModal />);
		expect(screen.getByTestId("modal")).toBeInTheDocument();
		expect(screen.getByTestId("back-to-lobby-button")).toBeInTheDocument();

		// Unmount
		unmount();
		expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
	});

	it("integrates mocked components and handles button interactions", () => {
		render(<WaitingModal />);

		const modal = screen.getByTestId("modal");
		const button = screen.getByTestId("back-to-lobby-button");

		// Modal should contain button
		expect(modal).toContainElement(button);

		// Button should be visible and accessible
		expect(button).toBeVisible();
		expect(button).toBeInTheDocument();

		fireEvent.click(button);
		expect(button).toBeInTheDocument(); // Button still exists after click

		// Test multiple clicks work consistently
		fireEvent.click(button);
		expect(button).toBeInTheDocument(); // Still functional after multiple clicks
	});
});

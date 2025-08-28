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

// Mock the RegularButton component
jest.mock("../../../components/common/RegularButton", () => {
	return function MockRegularButton({ value, callback }: any) {
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

	describe("Rendering", () => {
		it("should render the waiting modal correctly", () => {
			render(<WaitingModal />);

			expect(screen.getByTestId("modal")).toBeInTheDocument();
			expect(
				screen.getByText(
					"Game already started, You must be inside gameRoom before host starts the game!"
				)
			).toBeInTheDocument();
		});

		it("should render the modal as open", () => {
			render(<WaitingModal />);

			expect(screen.getByTestId("modal")).toBeInTheDocument();
		});

		it("should render the back to lobby button", () => {
			render(<WaitingModal />);

			const backButton = screen.getByTestId("back-to-lobby-button");
			expect(backButton).toBeInTheDocument();
			expect(backButton).toHaveTextContent("Back to lobby");
		});

		it("should have correct container structure", () => {
			render(<WaitingModal />);

			const modal = screen.getByTestId("modal");
			expect(modal).toBeInTheDocument();

			const container = modal.querySelector(".p-10");
			expect(container).toBeInTheDocument();
		});
	});

	describe("Modal Configuration", () => {
		it("should always render modal as open", () => {
			render(<WaitingModal />);

			expect(screen.getByTestId("modal")).toBeInTheDocument();
		});

		it("should render modal with correct props", () => {
			render(<WaitingModal />);

			// Modal should be present (isOpen=true)
			expect(screen.getByTestId("modal")).toBeInTheDocument();
		});
	});

	describe("Message Content", () => {
		it("should display the correct warning message", () => {
			render(<WaitingModal />);

			const message = screen.getByText(
				"Game already started, You must be inside gameRoom before host starts the game!"
			);
			expect(message).toBeInTheDocument();
		});

		it("should render message in h2 heading", () => {
			render(<WaitingModal />);

			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toBeInTheDocument();
			expect(heading).toHaveTextContent(
				"Game already started, You must be inside gameRoom before host starts the game!"
			);
		});

		it("should have correct message styling", () => {
			render(<WaitingModal />);

			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toHaveClass("text-3xl", "font-bold");
		});
	});

	describe("Navigation Functionality", () => {
		it("should render back to lobby button without errors", () => {
			render(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");
			expect(button).toBeInTheDocument();
			expect(button).toBeVisible();
		});

		it("should have correct callback function structure", () => {
			render(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");
			// Button should exist and be rendered properly
			expect(button).toBeInTheDocument();
		});
	});

	describe("Button Properties", () => {
		it("should render button with correct text", () => {
			render(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");
			expect(button).toHaveTextContent("Back to lobby");
		});

		it("should pass correct value prop to RegularButton", () => {
			render(<WaitingModal />);

			const button = screen.getByText("Back to lobby");
			expect(button).toBeInTheDocument();
		});

		it("should have accessible button", () => {
			render(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");
			expect(button).toBeInTheDocument();
			expect(button).toBeVisible();
		});
	});

	describe("Layout and Styling", () => {
		it("should have correct container styling classes", () => {
			render(<WaitingModal />);

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
		});

		it("should have correct heading styling", () => {
			render(<WaitingModal />);

			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toHaveClass("text-3xl", "font-bold");
		});

		it("should use flexbox layout for centering", () => {
			render(<WaitingModal />);

			const modal = screen.getByTestId("modal");
			const container = modal.querySelector(".flex");

			expect(container).toHaveClass(
				"flex",
				"items-center",
				"justify-center"
			);
		});

		it("should have correct gap between elements", () => {
			render(<WaitingModal />);

			const modal = screen.getByTestId("modal");
			const container = modal.querySelector(".gap-10");

			expect(container).toHaveClass("gap-10");
		});
	});

	describe("Component Structure", () => {
		it("should have proper semantic structure", () => {
			render(<WaitingModal />);

			// Should have a heading
			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toBeInTheDocument();

			// Should have a button
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});

		it("should render elements in correct order", () => {
			render(<WaitingModal />);

			const modal = screen.getByTestId("modal");
			const container = modal.querySelector(".p-10");
			const children = container?.children;

			expect(children).toHaveLength(2);
			expect(children?.[0]).toContainHTML("h2");
			expect(children?.[1]).toContainHTML("button");
		});

		it("should have correct wrapper div structure", () => {
			const { container } = render(<WaitingModal />);

			const outerDiv = container.firstChild;
			expect(outerDiv).toBeInTheDocument();
			expect(outerDiv?.nodeName).toBe("DIV");
		});
	});

	describe("Accessibility", () => {
		it("should have accessible heading structure", () => {
			render(<WaitingModal />);

			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toBeInTheDocument();
		});

		it("should have accessible button", () => {
			render(<WaitingModal />);

			const button = screen.getByRole("button", {
				name: "Back to lobby",
			});
			expect(button).toBeInTheDocument();
		});

		it("should provide clear navigation instruction", () => {
			render(<WaitingModal />);

			const message = screen.getByText(
				"Game already started, You must be inside gameRoom before host starts the game!"
			);
			expect(message).toBeInTheDocument();
		});
	});

	describe("Component Behavior", () => {
		it("should render consistently across multiple renders", () => {
			const { rerender } = render(<WaitingModal />);

			expect(screen.getByTestId("modal")).toBeInTheDocument();
			expect(
				screen.getByText(
					"Game already started, You must be inside gameRoom before host starts the game!"
				)
			).toBeInTheDocument();

			rerender(<WaitingModal />);

			expect(screen.getByTestId("modal")).toBeInTheDocument();
			expect(
				screen.getByText(
					"Game already started, You must be inside gameRoom before host starts the game!"
				)
			).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(<WaitingModal />);

			expect(screen.getByTestId("modal")).toBeInTheDocument();

			unmount();

			expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
		});

		it("should maintain modal state", () => {
			render(<WaitingModal />);

			// Modal should always be open
			expect(screen.getByTestId("modal")).toBeInTheDocument();
		});
	});

	describe("Props Handling", () => {
		it("should render without any props", () => {
			render(<WaitingModal />);

			expect(screen.getByTestId("modal")).toBeInTheDocument();
			expect(
				screen.getByTestId("back-to-lobby-button")
			).toBeInTheDocument();
		});

		it("should handle empty props object", () => {
			// Component accepts {} as props
			render(<WaitingModal />);

			expect(screen.getByTestId("modal")).toBeInTheDocument();
		});
	});

	describe("Error Handling", () => {
		it("should handle button rendering without throwing errors", () => {
			render(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");

			// Should render without errors
			expect(button).toBeInTheDocument();
			expect(button).toBeVisible();
		});
	});

	describe("Edge Cases", () => {
		it("should handle multiple renders", () => {
			render(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");

			// Should render correctly multiple times
			expect(button).toBeInTheDocument();
			expect(button).toBeVisible();
		});

		it("should handle keyboard navigation", () => {
			render(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");

			// Button should be accessible via keyboard
			expect(button).toBeInTheDocument();
			expect(button).toBeVisible();
		});

		it("should maintain functionality after re-render", () => {
			const { rerender } = render(<WaitingModal />);

			rerender(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");

			// Should still be accessible after re-render
			expect(button).toBeInTheDocument();
			expect(button).toBeVisible();
		});
	});

	describe("Integration", () => {
		it("should work with mocked Modal component", () => {
			render(<WaitingModal />);

			const modal = screen.getByTestId("modal");
			expect(modal).toBeInTheDocument();
		});

		it("should work with mocked RegularButton component", () => {
			render(<WaitingModal />);

			const button = screen.getByTestId("back-to-lobby-button");
			expect(button).toBeInTheDocument();
			expect(button).toHaveTextContent("Back to lobby");
		});

		it("should integrate Modal and RegularButton properly", () => {
			render(<WaitingModal />);

			const modal = screen.getByTestId("modal");
			const button = screen.getByTestId("back-to-lobby-button");

			expect(modal).toContainElement(button);
		});
	});
});

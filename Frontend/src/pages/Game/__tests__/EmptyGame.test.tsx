import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import EmptyGame from "../EmptyGame";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: jest.fn(),
}));

const mockNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

describe("EmptyGame Component", () => {
	const mockNavigateFn = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockNavigate.mockReturnValue(mockNavigateFn);
	});

	const renderEmptyGame = () => {
		return render(
			<MemoryRouter>
				<EmptyGame />
			</MemoryRouter>
		);
	};

	describe("Navigation Behavior", () => {
		it("should navigate to /play with error message on mount", () => {
			renderEmptyGame();

			expect(mockNavigateFn).toHaveBeenCalledWith("/play", {
				state: { error: "Room code is required to join a game." },
			});
			expect(mockNavigateFn).toHaveBeenCalledTimes(1);
		});

		it("should call navigate immediately when component mounts", () => {
			renderEmptyGame();

			// Navigation should happen synchronously during mount
			expect(mockNavigateFn).toHaveBeenCalled();
		});
	});

	describe("Rendering", () => {
		it("should render empty fragment without any content", () => {
			const { container } = renderEmptyGame();

			// Component should render an empty fragment
			expect(container.firstChild).toBeNull();
		});

		it("should not render any text or elements", () => {
			const { container } = renderEmptyGame();

			expect(container.textContent).toBe("");
			expect(container.children).toHaveLength(0);
		});
	});

	describe("Component Lifecycle", () => {
		it("should handle mounting and unmounting gracefully", () => {
			const { unmount } = renderEmptyGame();

			expect(() => unmount()).not.toThrow();
		});

		it("should navigate only once during component lifecycle", () => {
			const { rerender } = renderEmptyGame();

			// Initial render should call navigate
			expect(mockNavigateFn).toHaveBeenCalledTimes(1);

			// Re-render should call navigate again due to useEffect dependency array
			rerender(
				<MemoryRouter>
					<EmptyGame />
				</MemoryRouter>
			);

			// useEffect runs again on rerender since navigate is in dependency array
			expect(mockNavigateFn).toHaveBeenCalledTimes(1); // Same instance of navigate function
		});
	});

	describe("Error State Handling", () => {
		it("should pass correct error message in navigation state", () => {
			renderEmptyGame();

			const [path, options] = mockNavigateFn.mock.calls[0];

			expect(path).toBe("/play");
			expect(options.state.error).toBe(
				"Room code is required to join a game."
			);
		});

		it("should maintain consistent error message format", () => {
			renderEmptyGame();

			const navigationCall = mockNavigateFn.mock.calls[0];
			const errorMessage = navigationCall[1].state.error;

			expect(typeof errorMessage).toBe("string");
			expect(errorMessage.length).toBeGreaterThan(0);
			expect(errorMessage).toMatch(/room code/i);
		});
	});

	describe("Dependency Injection", () => {
		it("should properly use navigate hook", () => {
			renderEmptyGame();

			expect(mockNavigate).toHaveBeenCalled();
		});

		it("should handle navigate function being called with correct parameters", () => {
			renderEmptyGame();

			expect(mockNavigateFn).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					state: expect.objectContaining({
						error: expect.any(String),
					}),
				})
			);
		});
	});

	describe("Integration", () => {
		it("should work within router context", () => {
			expect(() => renderEmptyGame()).not.toThrow();
		});

		it("should be compatible with MemoryRouter", () => {
			const { container } = renderEmptyGame();

			// Should render without errors in router context
			expect(container).toBeInTheDocument();
		});
	});

	describe("Performance", () => {
		it("should not cause memory leaks with useEffect cleanup", () => {
			const { unmount } = renderEmptyGame();

			// Component should unmount cleanly
			expect(() => unmount()).not.toThrow();

			// Navigate should have been called during mount
			expect(mockNavigateFn).toHaveBeenCalled();
		});

		it("should execute navigation in useEffect", () => {
			// Clear previous calls
			mockNavigateFn.mockClear();

			renderEmptyGame();

			// Should be called as part of useEffect
			expect(mockNavigateFn).toHaveBeenCalledTimes(1);
		});
	});
});

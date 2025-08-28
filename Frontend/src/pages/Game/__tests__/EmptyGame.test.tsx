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

	it("redirects to /play with error message and renders nothing", () => {
		const { container } = renderEmptyGame();

		// Should navigate with correct parameters
		expect(mockNavigateFn).toHaveBeenCalledWith("/play", {
			state: { error: "Room code is required to join a game." },
		});
		expect(mockNavigateFn).toHaveBeenCalledTimes(1);

		// Should render empty fragment
		expect(container.firstChild).toBeNull();
		expect(container.textContent).toBe("");
	});

	it("handles component lifecycle properly", () => {
		const { unmount, rerender } = renderEmptyGame();

		// Initial navigation
		expect(mockNavigateFn).toHaveBeenCalledTimes(1);

		// Component should unmount without errors
		expect(() => unmount()).not.toThrow();

		// Re-render test
		renderEmptyGame();
		expect(mockNavigateFn).toHaveBeenCalledTimes(2);
	});

	it("uses navigate hook correctly", () => {
		renderEmptyGame();

		expect(mockNavigate).toHaveBeenCalled();
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

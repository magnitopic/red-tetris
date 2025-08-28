import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlayIndex from "../index";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock MsgCard component to test interaction
jest.mock("../../../components/common/MsgCard", () => {
	return function MockMsgCard({
		type,
		message,
		onClose,
	}: {
		type: string;
		message: string;
		onClose: () => void;
	}) {
		return (
			<div data-testid="msg-card" data-type={type}>
				<span data-testid="message">{message}</span>
				<button data-testid="close-button" onClick={onClose}>
					Close
				</button>
			</div>
		);
	};
});

// Mock the child components
jest.mock("../StartGame", () => {
	return function MockStartGame() {
		return <div data-testid="start-game">Start Playing</div>;
	};
});

jest.mock("../Ranking", () => {
	return function MockRanking() {
		return <div data-testid="ranking">Global Player Ranking</div>;
	};
});

describe("PlayIndex", () => {
	// Mock window.history.replaceState
	const mockReplaceState = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		// Mock window.history.replaceState
		Object.defineProperty(window, "history", {
			value: {
				replaceState: mockReplaceState,
			},
			writable: true,
		});
	});

	const renderPlayIndex = (initialEntries = ["/play"]) => {
		return render(
			<MemoryRouter initialEntries={initialEntries}>
				<PlayIndex />
			</MemoryRouter>
		);
	};

	it("should render layout and handle basic error state management", async () => {
		// Test basic layout without error
		renderPlayIndex();

		const main = screen.getByRole("main");
		expect(main).toBeInTheDocument();
		expect(main).toHaveClass(
			"flex",
			"flex-1",
			"justify-center",
			"items-center",
			"flex-col"
		);

		// Test container structure and child components
		const container = document.querySelector(".container.max-w-4xl");
		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("start-game")).toBeInTheDocument();
		expect(screen.getByTestId("ranking")).toBeInTheDocument();

		// Should not show MsgCard when no error
		expect(screen.queryByTestId("msg-card")).not.toBeInTheDocument();
		expect(mockReplaceState).not.toHaveBeenCalled();
	});

	it("should handle error messages and message lifecycle", async () => {
		const errorMessage = "Something went wrong";

		renderPlayIndex([
			{ pathname: "/play", state: { error: errorMessage } },
		]);

		// Test that MsgCard is displayed with error
		await waitFor(() => {
			expect(screen.getByTestId("msg-card")).toBeInTheDocument();
		});

		const msgCard = screen.getByTestId("msg-card");
		expect(msgCard).toHaveAttribute("data-type", "error");
		expect(screen.getByTestId("message")).toHaveTextContent(errorMessage);

		// Test that window.history.replaceState was called to clear state
		expect(mockReplaceState).toHaveBeenCalledWith({}, document.title);

		// Test onClose functionality - clicking close button should remove message
		const closeButton = screen.getByTestId("close-button");
		fireEvent.click(closeButton);

		// Message should be removed from DOM
		await waitFor(() => {
			expect(screen.queryByTestId("msg-card")).not.toBeInTheDocument();
		});
	});

	it("should handle complex error scenarios and edge cases", async () => {
		// Test with empty error string - should NOT show message card because empty string is falsy
		const { unmount } = renderPlayIndex([
			{ pathname: "/play", state: { error: "" } },
		]);

		// Empty string should not trigger the message card since if (location.state?.error) is falsy for ""
		expect(screen.queryByTestId("msg-card")).not.toBeInTheDocument();
		expect(mockReplaceState).not.toHaveBeenCalled();

		unmount();

		// Test with a meaningful error message to verify it still works
		renderPlayIndex([
			{ pathname: "/play", state: { error: "Real error message" } },
		]);

		await waitFor(() => {
			expect(screen.getByTestId("msg-card")).toBeInTheDocument();
			expect(screen.getByTestId("message")).toHaveTextContent(
				"Real error message"
			);
		});

		expect(mockReplaceState).toHaveBeenCalledWith({}, document.title);

		// Close message and test multiple error handling
		fireEvent.click(screen.getByTestId("close-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("msg-card")).not.toBeInTheDocument();
		});
	});

	it("should handle key generation and component re-rendering", async () => {
		const errorMessage = "Key test error";

		// Mock Date.now to control key generation
		const mockDateNow = jest
			.spyOn(Date, "now")
			.mockReturnValueOnce(12345)
			.mockReturnValueOnce(67890);

		// First render
		const { unmount: unmount1 } = renderPlayIndex([
			{ pathname: "/play", state: { error: errorMessage } },
		]);

		await waitFor(() => {
			expect(screen.getByTestId("msg-card")).toBeInTheDocument();
		});

		// Close first message
		fireEvent.click(screen.getByTestId("close-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("msg-card")).not.toBeInTheDocument();
		});

		unmount1();

		// Second render with same error but different key - tests component lifecycle
		renderPlayIndex([
			{ pathname: "/play", state: { error: errorMessage } },
		]);

		await waitFor(() => {
			expect(screen.getByTestId("msg-card")).toBeInTheDocument();
			expect(screen.getByTestId("message")).toHaveTextContent(
				errorMessage
			);
		});

		// Verify Date.now was called for key generation
		expect(mockDateNow).toHaveBeenCalledTimes(2);

		mockDateNow.mockRestore();
	});
});

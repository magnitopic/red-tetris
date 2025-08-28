import React from "react";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import MsgCard from "../MsgCard";

jest.useFakeTimers();

describe("MsgCard Component", () => {
	afterEach(() => {
		jest.clearAllTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	it("renders different message types with correct styling and content", () => {
		const testCases = [
			{ type: "success", label: "Success", classes: ["bg-green-50", "text-green-700", "border-green-200"] },
			{ type: "error", label: "Error", classes: ["bg-red-50", "text-red-700", "border-red-200"] },
			{ type: "warning", label: "Warning", classes: ["bg-yellow-50", "text-yellow-700", "border-yellow-200"] },
			{ type: "info", label: "Info", classes: ["bg-blue-50", "text-blue-700", "border-blue-200"] }
		];

		testCases.forEach(({ type, label, classes }) => {
			const { unmount } = render(<MsgCard type={type as any} message={`${type} message`} />);
			
			expect(screen.getByText(label)).toBeInTheDocument();
			expect(screen.getByText(`${type} message`)).toBeInTheDocument();
			expect(screen.getByRole("button")).toBeInTheDocument();
			
			const messageCard = screen.getByText(`${type} message`).closest("div")?.parentElement;
			expect(messageCard).toHaveClass(...classes);
			
			unmount();
		});
	});

	it("handles close functionality and animations", async () => {
		const mockOnClose = jest.fn();
		render(<MsgCard type="success" message="Test message" onClose={mockOnClose} />);

		const closeButton = screen.getByRole("button");
		const messageCard = screen.getByText("Test message").closest("div")?.parentElement;

		expect(closeButton).toHaveTextContent("×");
		expect(messageCard).toHaveClass("opacity-100");

		fireEvent.click(closeButton);

		expect(messageCard).toHaveClass("opacity-0", "translate-x-full");

		await act(async () => {
			jest.advanceTimersByTime(500);
		});

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it("handles auto-close with default and custom durations", async () => {
		const mockOnClose = jest.fn();
		
		// Test default duration
		const { unmount } = render(<MsgCard type="success" message="Test 1" onClose={mockOnClose} />);
		
		await act(async () => {
			jest.advanceTimersByTime(5500);
		});
		
		expect(mockOnClose).toHaveBeenCalledTimes(1);
		unmount();

		// Test custom duration
		mockOnClose.mockClear();
		render(<MsgCard type="success" message="Test 2" duration={2000} onClose={mockOnClose} />);
		
		await act(async () => {
			jest.advanceTimersByTime(2500);
		});
		
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it("handles visibility changes and component lifecycle", async () => {
		render(<MsgCard type="success" message="Test message" duration={1000} />);

		expect(screen.getByText("Test message")).toBeInTheDocument();

		await act(async () => {
			jest.advanceTimersByTime(1500);
		});

		await waitFor(() => {
			expect(screen.queryByText("Test message")).not.toBeInTheDocument();
		});
	});
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "../Modal";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

describe("Modal Component", () => {
	const mockChildren = (
		<div data-testid="modal-content">Test Modal Content</div>
	);

	it("should render modal when isOpen is true", () => {
		render(<Modal isOpen={true}>{mockChildren}</Modal>);

		// Modal should be visible
		expect(screen.getByTestId("modal-content")).toBeInTheDocument();

		// Check for modal structure elements
		const modalOverlay = screen
			.getByTestId("modal-content")
			.closest(".fixed");
		expect(modalOverlay).toBeInTheDocument();
		expect(modalOverlay).toHaveClass("fixed", "inset-0", "z-50");
	});

	it("should not render modal when isOpen is false", () => {
		render(<Modal isOpen={false}>{mockChildren}</Modal>);

		// Modal should not be in the DOM
		expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
	});

	it("should render children content correctly", () => {
		const customContent = (
			<div data-testid="custom-content">
				<h2>Custom Title</h2>
				<p>Custom description text</p>
				<button>Custom Button</button>
			</div>
		);

		render(<Modal isOpen={true}>{customContent}</Modal>);

		// All custom content should be rendered
		expect(screen.getByTestId("custom-content")).toBeInTheDocument();
		expect(screen.getByText("Custom Title")).toBeInTheDocument();
		expect(screen.getByText("Custom description text")).toBeInTheDocument();
		expect(screen.getByText("Custom Button")).toBeInTheDocument();
	});

	it("should have correct CSS classes for styling", () => {
		render(<Modal isOpen={true}>{mockChildren}</Modal>);

		const modalContent = screen.getByTestId("modal-content");
		const modalContainer = modalContent.closest(
			".relative.w-full.max-w-xl"
		);
		const modalBackground = modalContent.closest(
			".relative.rounded-xl.shadow-lg.bg-background-secondary"
		);

		// Check that modal container has correct classes
		expect(modalContainer).toBeInTheDocument();

		// Check that modal background has styling classes
		expect(modalBackground).toBeInTheDocument();
		expect(modalBackground).toHaveClass(
			"relative",
			"rounded-xl",
			"shadow-lg",
			"bg-background-secondary"
		);
	});

	it("should prevent click propagation on modal content", () => {
		const mockOverlayClick = jest.fn();

		render(
			<div onClick={mockOverlayClick}>
				<Modal isOpen={true}>
					<div data-testid="modal-content">Modal Content</div>
				</Modal>
			</div>
		);

		const modalContent = screen.getByTestId("modal-content");
		const modalContainer = modalContent.closest(
			".relative.w-full.max-w-xl"
		);

		// Click on modal content should not trigger overlay click
		fireEvent.click(modalContainer!);
		expect(mockOverlayClick).not.toHaveBeenCalled();
	});

	it("should handle complex children components", () => {
		const ComplexChild = () => (
			<div data-testid="complex-child">
				<header>
					<h1>Modal Header</h1>
					<button data-testid="close-btn">×</button>
				</header>
				<main>
					<form data-testid="modal-form">
						<input type="text" placeholder="Name" />
						<textarea placeholder="Message"></textarea>
						<button type="submit">Submit</button>
					</form>
				</main>
				<footer>
					<button>Cancel</button>
					<button>Save</button>
				</footer>
			</div>
		);

		render(
			<Modal isOpen={true}>
				<ComplexChild />
			</Modal>
		);

		// All parts of complex component should render
		expect(screen.getByTestId("complex-child")).toBeInTheDocument();
		expect(screen.getByText("Modal Header")).toBeInTheDocument();
		expect(screen.getByTestId("close-btn")).toBeInTheDocument();
		expect(screen.getByTestId("modal-form")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Message")).toBeInTheDocument();
		expect(screen.getByText("Submit")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
		expect(screen.getByText("Save")).toBeInTheDocument();
	});

	it("should toggle visibility when isOpen prop changes", () => {
		const { rerender } = render(
			<Modal isOpen={false}>{mockChildren}</Modal>
		);

		// Initially not visible
		expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();

		// Re-render with isOpen=true
		rerender(<Modal isOpen={true}>{mockChildren}</Modal>);

		// Now should be visible
		expect(screen.getByTestId("modal-content")).toBeInTheDocument();

		// Re-render with isOpen=false again
		rerender(<Modal isOpen={false}>{mockChildren}</Modal>);

		// Should be hidden again
		expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
	});

	it("should handle empty children", () => {
		render(<Modal isOpen={true}>{null}</Modal>);

		// Modal container should still render even with null children
		const modalOverlay = document.querySelector(".fixed.inset-0.z-50");
		expect(modalOverlay).toBeInTheDocument();
	});

	it("should have backdrop blur and dark overlay styling", () => {
		render(<Modal isOpen={true}>{mockChildren}</Modal>);

		const modalOverlay = screen
			.getByTestId("modal-content")
			.closest(".fixed");
		expect(modalOverlay).toHaveClass("bg-black/60", "backdrop-blur-sm");
	});
});

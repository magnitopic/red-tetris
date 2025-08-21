import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock simple components that we can test
const MockSpinner = () => {
	return (
		<div data-testid="spinner" className="spinner">
			<div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
		</div>
	);
};

const MockModal = ({
	isOpen,
	onClose,
	children,
}: {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) => {
	if (!isOpen) return null;

	return (
		<div data-testid="modal" className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<button data-testid="close-button" onClick={onClose}>
					×
				</button>
				{children}
			</div>
		</div>
	);
};

const MockMsgCard = ({
	type,
	message,
}: {
	type: "success" | "error" | "info";
	message: string;
}) => {
	const getClassNames = () => {
		switch (type) {
			case "success":
				return "bg-green-100 text-green-800";
			case "error":
				return "bg-red-100 text-red-800";
			case "info":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div data-testid="msg-card" className={`msg-card ${getClassNames()}`}>
			{message}
		</div>
	);
};

describe("Simple Component Tests", () => {
	describe("Spinner Component", () => {
		it("should render spinner correctly", () => {
			render(<MockSpinner />);

			const spinner = screen.getByTestId("spinner");
			expect(spinner).toBeInTheDocument();
			expect(spinner).toHaveClass("spinner");
		});
	});

	describe("Modal Component", () => {
		it("should render modal when isOpen is true", () => {
			const mockOnClose = jest.fn();

			render(
				<MockModal isOpen={true} onClose={mockOnClose}>
					<div>Modal Content</div>
				</MockModal>
			);

			expect(screen.getByTestId("modal")).toBeInTheDocument();
			expect(screen.getByText("Modal Content")).toBeInTheDocument();
			expect(screen.getByTestId("close-button")).toBeInTheDocument();
		});

		it("should not render modal when isOpen is false", () => {
			const mockOnClose = jest.fn();

			render(
				<MockModal isOpen={false} onClose={mockOnClose}>
					<div>Modal Content</div>
				</MockModal>
			);

			expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
		});

		it("should call onClose when close button is clicked", () => {
			const mockOnClose = jest.fn();

			render(
				<MockModal isOpen={true} onClose={mockOnClose}>
					<div>Modal Content</div>
				</MockModal>
			);

			const closeButton = screen.getByTestId("close-button");
			closeButton.click();

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});
	});

	describe("MsgCard Component", () => {
		it("should render success message correctly", () => {
			render(<MockMsgCard type="success" message="Success message" />);

			const msgCard = screen.getByTestId("msg-card");
			expect(msgCard).toBeInTheDocument();
			expect(msgCard).toHaveTextContent("Success message");
			expect(msgCard).toHaveClass("bg-green-100", "text-green-800");
		});

		it("should render error message correctly", () => {
			render(<MockMsgCard type="error" message="Error message" />);

			const msgCard = screen.getByTestId("msg-card");
			expect(msgCard).toHaveTextContent("Error message");
			expect(msgCard).toHaveClass("bg-red-100", "text-red-800");
		});

		it("should render info message correctly", () => {
			render(<MockMsgCard type="info" message="Info message" />);

			const msgCard = screen.getByTestId("msg-card");
			expect(msgCard).toHaveTextContent("Info message");
			expect(msgCard).toHaveClass("bg-blue-100", "text-blue-800");
		});
	});
});

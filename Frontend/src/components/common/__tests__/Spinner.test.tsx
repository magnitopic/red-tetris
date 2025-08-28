import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Spinner from "../Spinner";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

describe("Spinner Component", () => {
	it("renders with correct structure and accessibility", () => {
		render(<Spinner />);

		// Check basic structure
		const statusElement = screen.getByRole("status");
		expect(statusElement).toBeInTheDocument();
		
		const svgElement = statusElement.querySelector("svg");
		expect(svgElement).toBeInTheDocument();
		expect(svgElement).toHaveAttribute("aria-hidden", "true");
		
		// Check accessibility
		const screenReaderText = screen.getByText("Loading...");
		expect(screenReaderText).toBeInTheDocument();
		expect(screenReaderText).toHaveClass("sr-only");
	});

	it("has correct styling and animation classes", () => {
		render(<Spinner />);

		const statusElement = screen.getByRole("status");
		const container = statusElement.parentElement;
		expect(container).toHaveClass("text-center");

		const svgElement = statusElement.querySelector("svg");
		expect(svgElement).toHaveClass(
			"inline",
			"w-8",
			"h-8",
			"text-gray-200",
			"animate-spin",
			"fill-tertiary"
		);
	});

	it("contains correct SVG structure and paths", () => {
		render(<Spinner />);

		const svgElement = screen.getByRole("status").querySelector("svg");
		const paths = svgElement?.querySelectorAll("path");

		expect(paths).toHaveLength(2);
		expect(paths?.[0]).toHaveAttribute("fill", "currentColor");
		expect(paths?.[1]).toHaveAttribute("fill", "currentFill");
		
		// Verify path data exists for circular spinner
		expect(paths?.[0]).toHaveAttribute("d");
		expect(paths?.[1]).toHaveAttribute("d");
	});
});

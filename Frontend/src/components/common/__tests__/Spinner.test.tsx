import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Spinner from "../Spinner";

describe("Spinner Component", () => {
	describe("Rendering", () => {
		it("should render spinner correctly", () => {
			render(<Spinner />);

			// Check for the status role element
			const statusElement = screen.getByRole("status");
			expect(statusElement).toBeInTheDocument();

			// Check for the SVG element
			const svgElement = screen.getByRole("status").querySelector("svg");
			expect(svgElement).toBeInTheDocument();

			// Check for screen reader text
			expect(screen.getByText("Loading...")).toBeInTheDocument();
		});

		it("should have correct accessibility attributes", () => {
			render(<Spinner />);

			const statusElement = screen.getByRole("status");
			expect(statusElement).toBeInTheDocument();

			const svgElement = statusElement.querySelector("svg");
			expect(svgElement).toHaveAttribute("aria-hidden", "true");

			const screenReaderText = screen.getByText("Loading...");
			expect(screenReaderText).toHaveClass("sr-only");
		});
	});

	describe("Styling", () => {
		it("should have correct container styling", () => {
			render(<Spinner />);

			const statusElement = screen.getByRole("status");
			const container = statusElement.parentElement;
			expect(container).toHaveClass("text-center");
		});

		it("should have correct SVG styling classes", () => {
			render(<Spinner />);

			const svgElement = screen.getByRole("status").querySelector("svg");
			expect(svgElement).toHaveClass(
				"inline",
				"w-8",
				"h-8",
				"text-gray-200",
				"animate-spin",
				"fill-tertiary"
			);
		});

		it("should have correct SVG attributes", () => {
			render(<Spinner />);

			const svgElement = screen.getByRole("status").querySelector("svg");
			expect(svgElement).toHaveAttribute("viewBox", "0 0 100 101");
			expect(svgElement).toHaveAttribute("fill", "none");
			expect(svgElement).toHaveAttribute(
				"xmlns",
				"http://www.w3.org/2000/svg"
			);
		});
	});

	describe("SVG Structure", () => {
		it("should contain correct SVG paths", () => {
			render(<Spinner />);

			const svgElement = screen.getByRole("status").querySelector("svg");
			const paths = svgElement?.querySelectorAll("path");

			expect(paths).toHaveLength(2);

			// Check first path (background circle)
			const backgroundPath = paths?.[0];
			expect(backgroundPath).toHaveAttribute("fill", "currentColor");

			// Check second path (spinning indicator)
			const indicatorPath = paths?.[1];
			expect(indicatorPath).toHaveAttribute("fill", "currentFill");
		});

		it("should have correct path data for circular spinner", () => {
			render(<Spinner />);

			const svgElement = screen.getByRole("status").querySelector("svg");
			const paths = svgElement?.querySelectorAll("path");

			// Verify that paths have the correct d attributes (basic check for presence)
			expect(paths?.[0]).toHaveAttribute("d");
			expect(paths?.[1]).toHaveAttribute("d");

			// Check that the paths contain circular movement data
			const backgroundPathData = paths?.[0]?.getAttribute("d");
			const indicatorPathData = paths?.[1]?.getAttribute("d");

			expect(backgroundPathData).toContain("M100 50.5908C100 78.2051");
			expect(indicatorPathData).toContain(
				"M93.9676 39.0409C96.393 38.4038"
			);
		});
	});

	describe("Animation", () => {
		it("should have spin animation class", () => {
			render(<Spinner />);

			const svgElement = screen.getByRole("status").querySelector("svg");
			expect(svgElement).toHaveClass("animate-spin");
		});

		it("should maintain animation properties in CSS", () => {
			render(<Spinner />);

			const svgElement = screen.getByRole("status").querySelector("svg");

			// Check that the element has the animate-spin class which should be handled by CSS
			expect(svgElement).toHaveClass("animate-spin");

			// In a real browser, this would actually animate, but in tests we just check the class
			expect(svgElement?.classList.contains("animate-spin")).toBe(true);
		});
	});

	describe("Component behavior", () => {
		it("should render consistently across multiple renders", () => {
			const { rerender } = render(<Spinner />);

			// First render
			expect(screen.getByRole("status")).toBeInTheDocument();
			expect(screen.getByText("Loading...")).toBeInTheDocument();

			// Re-render
			rerender(<Spinner />);

			// Should still be there
			expect(screen.getByRole("status")).toBeInTheDocument();
			expect(screen.getByText("Loading...")).toBeInTheDocument();
		});

		it("should not accept any props (component is self-contained)", () => {
			// This component doesn't accept props, so we test that it renders the same regardless
			const { container: container1 } = render(<Spinner />);
			const { container: container2 } = render(<Spinner />);

			expect(container1.innerHTML).toBe(container2.innerHTML);
		});

		it("should be properly unmountable", () => {
			const { unmount } = render(<Spinner />);

			expect(screen.getByRole("status")).toBeInTheDocument();

			// Should unmount without errors
			expect(() => unmount()).not.toThrow();

			// Should no longer be in document
			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should be accessible to screen readers", () => {
			render(<Spinner />);

			// Should have proper role
			expect(screen.getByRole("status")).toBeInTheDocument();

			// Should have hidden SVG for screen readers
			const svgElement = screen.getByRole("status").querySelector("svg");
			expect(svgElement).toHaveAttribute("aria-hidden", "true");

			// Should have visible text for screen readers
			const loadingText = screen.getByText("Loading...");
			expect(loadingText).toBeInTheDocument();
			expect(loadingText).toHaveClass("sr-only");
		});

		it("should not interfere with keyboard navigation", () => {
			render(<Spinner />);

			// Spinner should not be focusable
			const container = screen.getByRole("status").closest("div");
			expect(container).not.toHaveAttribute("tabindex");

			const svgElement = screen.getByRole("status").querySelector("svg");
			expect(svgElement).not.toHaveAttribute("tabindex");
		});
	});
});

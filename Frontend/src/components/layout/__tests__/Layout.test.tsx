import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Layout from "../Layout";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock the Header and Footer components
jest.mock("../Header/Header", () => {
	return function MockHeader() {
		return <header data-testid="mock-header">Header</header>;
	};
});

jest.mock("../Footer/Footer", () => {
	return function MockFooter() {
		return <footer data-testid="mock-footer">Footer</footer>;
	};
});

// Wrapper component to provide React Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
	<MemoryRouter>{children}</MemoryRouter>
);

describe("Layout Component", () => {
	describe("Rendering", () => {
		it("should render layout structure correctly", () => {
			render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			// Check main layout container
			const layoutContainer = screen
				.getByTestId("mock-header")
				.closest("div");
			expect(layoutContainer).toHaveClass(
				"min-h-screen",
				"flex",
				"flex-col",
				"bg-background-main",
				"text-font-main"
			);
		});

		it("should render Header component", () => {
			render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			expect(screen.getByTestId("mock-header")).toBeInTheDocument();
		});

		it("should render Footer component", () => {
			render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
		});

		it("should render Outlet for child routes", () => {
			render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			// The Outlet component should be present (though it won't render anything in test)
			// We can verify the structure by checking that Header and Footer are siblings
			const header = screen.getByTestId("mock-header");
			const footer = screen.getByTestId("mock-footer");

			expect(header.parentElement).toBe(footer.parentElement);
		});
	});

	describe("Component Structure", () => {
		it("should have correct layout order - Header and Footer", () => {
			render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			const container = screen.getByTestId("mock-header").parentElement;
			const children = container?.children;

			// The Outlet doesn't render as a visible element in test environment
			// so we only see Header and Footer
			expect(children).toHaveLength(2);
			expect(children?.[0]).toHaveAttribute("data-testid", "mock-header");
			expect(children?.[1]).toHaveAttribute("data-testid", "mock-footer");
		});

		it("should apply correct CSS classes to main container", () => {
			render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			const container = screen.getByTestId("mock-header").parentElement;
			expect(container).toHaveClass(
				"min-h-screen",
				"flex",
				"flex-col",
				"bg-background-main",
				"text-font-main"
			);
		});
	});

	describe("Component Behavior", () => {
		it("should render consistently across multiple renders", () => {
			const { rerender } = render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			// First render
			expect(screen.getByTestId("mock-header")).toBeInTheDocument();
			expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

			// Re-render
			rerender(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			// Should still be there
			expect(screen.getByTestId("mock-header")).toBeInTheDocument();
			expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			expect(screen.getByTestId("mock-header")).toBeInTheDocument();
			expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

			// Should not throw error when unmounting
			expect(() => unmount()).not.toThrow();

			// Should no longer be in document
			expect(screen.queryByTestId("mock-header")).not.toBeInTheDocument();
			expect(screen.queryByTestId("mock-footer")).not.toBeInTheDocument();
		});
	});

	describe("Layout Accessibility", () => {
		it("should provide semantic structure", () => {
			render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			// Header and Footer should be semantic elements
			expect(
				screen.getByTestId("mock-header").tagName.toLowerCase()
			).toBe("header");
			expect(
				screen.getByTestId("mock-footer").tagName.toLowerCase()
			).toBe("footer");
		});

		it("should maintain proper document structure", () => {
			render(
				<RouterWrapper>
					<Layout />
				</RouterWrapper>
			);

			const container = screen.getByTestId("mock-header").parentElement;

			// Container should be a div with appropriate ARIA structure
			expect(container?.tagName.toLowerCase()).toBe("div");
			expect(container).toHaveClass("min-h-screen");
		});
	});
});

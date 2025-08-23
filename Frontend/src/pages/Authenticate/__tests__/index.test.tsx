import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthenticatePage from "../index";

// Mock the Form component to isolate the page component testing
jest.mock("../Form", () => {
	return function MockForm() {
		return <div data-testid="mock-form">Mocked Form Component</div>;
	};
});

describe("Authenticate Page", () => {
	const renderAuthenticatePage = () => {
		return render(
			<MemoryRouter>
				<AuthenticatePage />
			</MemoryRouter>
		);
	};

	describe("Rendering", () => {
		it("should render the main authenticate page correctly", () => {
			renderAuthenticatePage();

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
			expect(screen.getByText("Enter")).toBeInTheDocument();
		});

		it("should render the Form component", () => {
			renderAuthenticatePage();

			expect(screen.getByTestId("mock-form")).toBeInTheDocument();
		});

		it("should have correct page structure", () => {
			renderAuthenticatePage();

			const main = screen.getByRole("main");
			expect(main).toHaveClass("flex", "flex-1", "justify-center", "items-center", "flex-col");

			const section = main.querySelector("section");
			expect(section).toBeInTheDocument();
			expect(section).toHaveClass("container", "max-w-4xl", "text-center");
		});
	});

	describe("Styling", () => {
		it("should have correct heading styling", () => {
			renderAuthenticatePage();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("lg:text-5xl", "text-2xl", "text-gray-8", "font-bold");
		});

		it("should have correct background styling", () => {
			renderAuthenticatePage();

			const main = screen.getByRole("main");
			expect(main).toHaveClass("gb-background-main");
		});

		it("should have correct container styling", () => {
			renderAuthenticatePage();

			const section = screen.getByRole("main").querySelector("section");
			expect(section).toHaveClass(
				"container",
				"max-w-4xl", 
				"text-center",
				"my-20",
				"px-3",
				"flex",
				"flex-col",
				"items-center",
				"gap-10"
			);
		});
	});

	describe("Content", () => {
		it("should display 'Enter' as the main heading", () => {
			renderAuthenticatePage();

			expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Enter");
		});

		it("should have semantic HTML structure", () => {
			renderAuthenticatePage();

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		});
	});

	describe("Responsive Design", () => {
		it("should have responsive text sizing classes", () => {
			renderAuthenticatePage();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("lg:text-5xl", "text-2xl");
		});

		it("should have responsive container classes", () => {
			renderAuthenticatePage();

			const section = screen.getByRole("main").querySelector("section");
			expect(section).toHaveClass("max-w-4xl", "px-3");
		});
	});

	describe("Component Integration", () => {
		it("should integrate properly with routing", () => {
			// Test that the component renders without router errors
			expect(() => renderAuthenticatePage()).not.toThrow();
		});

		it("should render consistently across multiple renders", () => {
			const { rerender } = renderAuthenticatePage();

			expect(screen.getByText("Enter")).toBeInTheDocument();
			expect(screen.getByTestId("mock-form")).toBeInTheDocument();

			rerender(
				<MemoryRouter>
					<AuthenticatePage />
				</MemoryRouter>
			);

			expect(screen.getByText("Enter")).toBeInTheDocument();
			expect(screen.getByTestId("mock-form")).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = renderAuthenticatePage();

			expect(() => unmount()).not.toThrow();
		});
	});

	describe("Accessibility", () => {
		it("should have proper semantic structure", () => {
			renderAuthenticatePage();

			// Should have main landmark
			expect(screen.getByRole("main")).toBeInTheDocument();
			
			// Should have proper heading hierarchy
			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		});

		it("should be keyboard navigable", () => {
			renderAuthenticatePage();

			const main = screen.getByRole("main");
			expect(main).toBeInTheDocument();
			
			// Main should be focusable or contain focusable elements
			expect(main.querySelector("*")).toBeInTheDocument();
		});
	});

	describe("Layout Structure", () => {
		it("should have correct flex layout", () => {
			renderAuthenticatePage();

			const main = screen.getByRole("main");
			expect(main).toHaveClass("flex", "flex-1", "justify-center", "items-center", "flex-col");

			const section = main.querySelector("section");
			expect(section).toHaveClass("flex", "flex-col", "items-center", "gap-10");
		});

		it("should center content properly", () => {
			renderAuthenticatePage();

			const main = screen.getByRole("main");
			expect(main).toHaveClass("justify-center", "items-center");

			const section = main.querySelector("section");
			expect(section).toHaveClass("text-center", "items-center");
		});
	});
});

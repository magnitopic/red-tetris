import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../index";

describe("NotFound Page", () => {
	const renderNotFound = () => {
		return render(
			<MemoryRouter>
				<NotFound />
			</MemoryRouter>
		);
	};

	describe("Rendering", () => {
		it("should render the 404 page correctly", () => {
			renderNotFound();

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
			expect(screen.getByText("404 - Page Not Found :(")).toBeInTheDocument();
		});

		it("should render the error message", () => {
			renderNotFound();

			expect(screen.getByText("Sorry, the page you are looking for could not be found.")).toBeInTheDocument();
		});

		it("should render the back to home link", () => {
			renderNotFound();

			const link = screen.getByRole("link");
			expect(link).toBeInTheDocument();
			expect(link).toHaveTextContent("Go back to Home");
		});
	});

	describe("Layout Structure", () => {
		it("should have correct main container styling", () => {
			renderNotFound();

			const main = screen.getByRole("main");
			expect(main).toHaveClass("flex", "flex-col", "items-center", "justify-center", "flex-grow", "px-2");
		});
	});

	describe("Content Styling", () => {
		it("should have correct 404 heading styling", () => {
			renderNotFound();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("text-4xl", "font-bold");
		});

		it("should have correct error message text styling", () => {
			renderNotFound();

			const errorMessage = screen.getByText("Sorry, the page you are looking for could not be found.");
			expect(errorMessage).toHaveClass("mt-4");
		});

		it("should have correct link styling", () => {
			renderNotFound();

			const link = screen.getByRole("link");
			expect(link).toHaveClass("mt-6", "text-primary", "underline");
		});
	});

	describe("Navigation", () => {
		it("should link to home page", () => {
			renderNotFound();

			const link = screen.getByRole("link");
			expect(link).toHaveAttribute("href", "/");
		});

		it("should have correct link text", () => {
			renderNotFound();

			const link = screen.getByRole("link");
			expect(link).toHaveTextContent("Go back to Home");
		});
	});

	describe("Accessibility", () => {
		it("should have proper semantic structure", () => {
			renderNotFound();

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
			expect(screen.getByRole("link")).toBeInTheDocument();
		});

		it("should have proper heading hierarchy", () => {
			renderNotFound();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveTextContent("404");
		});

		it("should have descriptive link text", () => {
			renderNotFound();

			const link = screen.getByRole("link");
			expect(link).toHaveAccessibleName("Go back to Home");
		});
	});

	describe("Responsive Design", () => {
		it("should have responsive text sizing classes for heading", () => {
			renderNotFound();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("text-4xl", "font-bold");
		});

		it("should have responsive container classes", () => {
			renderNotFound();

			const main = screen.getByRole("main");
			expect(main).toHaveClass("px-2");
		});
	});

	describe("Error Page Functionality", () => {
		it("should provide clear error indication", () => {
			renderNotFound();

			expect(screen.getByText("404 - Page Not Found :(")).toBeInTheDocument();
			expect(screen.getByText("Sorry, the page you are looking for could not be found.")).toBeInTheDocument();
		});

		it("should provide navigation back to safety", () => {
			renderNotFound();

			const link = screen.getByRole("link");
			expect(link).toHaveAttribute("href", "/");
			expect(link).toHaveTextContent("Go back to Home");
		});
	});

	describe("Component Integration", () => {
		it("should integrate properly with routing", () => {
			expect(() => renderNotFound()).not.toThrow();
		});

		it("should render consistently across multiple renders", () => {
			const { rerender } = renderNotFound();

			expect(screen.getByText("404 - Page Not Found :(")).toBeInTheDocument();

			rerender(
				<MemoryRouter>
					<NotFound />
				</MemoryRouter>
			);

			expect(screen.getByText("404 - Page Not Found :(")).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = renderNotFound();

			expect(() => unmount()).not.toThrow();
		});
	});

	describe("Text Content", () => {
		it("should display 404 status code", () => {
			renderNotFound();

			expect(screen.getByText("404 - Page Not Found :(")).toBeInTheDocument();
		});

		it("should display helpful error message", () => {
			renderNotFound();

			expect(screen.getByText("Sorry, the page you are looking for could not be found.")).toBeInTheDocument();
		});

		it("should display navigation instruction", () => {
			renderNotFound();

			expect(screen.getByText("Go back to Home")).toBeInTheDocument();
		});
	});

	describe("Element Order", () => {
		it("should render elements in correct order", () => {
			renderNotFound();

			const main = screen.getByRole("main");
			const children = Array.from(main.children);

			// Check order: heading, message, link
			expect(children[0]).toContainElement(screen.getByRole("heading"));
			expect(children[1]).toHaveTextContent("Sorry, the page you are looking for could not be found.");
			expect(children[2]).toContainElement(screen.getByRole("link"));
		});
	});

	describe("Link Behavior", () => {
		it("should render as React Router Link", () => {
			renderNotFound();

			const link = screen.getByRole("link");
			expect(link).toBeInTheDocument();
			// React Router Link should render as an anchor tag
			expect(link.tagName).toBe("A");
		});
	});

	describe("Visual Design", () => {
		it("should have proper spacing between elements", () => {
			renderNotFound();

			const main = screen.getByRole("main");
			const heading = screen.getByRole("heading");
			const paragraph = screen.getByText("Sorry, the page you are looking for could not be found.");
			const link = screen.getByRole("link");
			
			expect(paragraph).toHaveClass("mt-4");
			expect(link).toHaveClass("mt-6");
		});

		it("should have proper margin and padding", () => {
			renderNotFound();

			const main = screen.getByRole("main");
			expect(main).toHaveClass("px-2");
		});
	});

	describe("Error Page Standards", () => {
		it("should follow HTTP status code convention", () => {
			renderNotFound();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveTextContent("404 - Page Not Found :(");
		});

		it("should provide user-friendly explanation", () => {
			renderNotFound();

			const message = screen.getByText("Sorry, the page you are looking for could not be found.");
			expect(message).toBeInTheDocument();
		});

		it("should offer recovery action", () => {
			renderNotFound();

			const link = screen.getByRole("link");
			expect(link).toHaveAttribute("href", "/");
		});
	});
});

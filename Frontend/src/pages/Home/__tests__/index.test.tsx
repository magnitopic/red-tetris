import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../index";

// Mock the StyledButton component
jest.mock("../../../components/common/StyledButton", () => {
	return function MockStyledButton({ value }: { value: string }) {
		return <button data-testid="styled-button">{value}</button>;
	};
});

describe("Home Page", () => {
	const renderHome = () => {
		return render(
			<MemoryRouter>
				<Home />
			</MemoryRouter>
		);
	};

	describe("Rendering", () => {
		it("should render the home page correctly", () => {
			renderHome();

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
			expect(screen.getByText("Welcome to Red Tetris!")).toBeInTheDocument();
		});

		it("should render the logo image", () => {
			renderHome();

			const logo = screen.getByAltText("");
			expect(logo).toBeInTheDocument();
			expect(logo).toHaveAttribute("src", "/logo.png");
			expect(logo).toHaveClass("max-w-40");
		});

		it("should render the description text", () => {
			renderHome();

			expect(screen.getByText("Online multiplayer Tetris game.")).toBeInTheDocument();
		});

		it("should render the start playing button", () => {
			renderHome();

			const button = screen.getByTestId("styled-button");
			expect(button).toBeInTheDocument();
			expect(button).toHaveTextContent("Start playing");
		});

		it("should have a link to the play page", () => {
			renderHome();

			const link = screen.getByRole("link");
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute("href", "/play");
		});
	});

	describe("Layout Structure", () => {
		it("should have correct main container styling", () => {
			renderHome();

			const main = screen.getByRole("main");
			expect(main).toHaveClass("flex", "flex-1", "justify-center", "items-center", "flex-col");
		});

		it("should have correct section container styling", () => {
			renderHome();

			const main = screen.getByRole("main");
			const section = main.querySelector("section");
			
			expect(section).toHaveClass("container", "max-w-4xl", "text-center", "my-20", "px-3");
		});

		it("should have correct inner content container styling", () => {
			renderHome();

			const main = screen.getByRole("main");
			const contentDiv = main.querySelector("section > div");
			
			expect(contentDiv).toHaveClass("flex", "justify-center", "items-center", "flex-col", "gap-10");
		});
	});

	describe("Content Styling", () => {
		it("should have correct heading styling", () => {
			renderHome();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("lg:text-5xl", "text-2xl", "text-gray-8");
		});

		it("should have correct description text styling", () => {
			renderHome();

			const description = screen.getByText("Online multiplayer Tetris game.");
			expect(description).toHaveClass("text-gray-5", "text-lg");
		});
	});

	describe("Navigation", () => {
		it("should wrap the button in a link to /play", () => {
			renderHome();

			const link = screen.getByRole("link");
			const button = screen.getByTestId("styled-button");
			
			expect(link).toContainElement(button);
			expect(link.getAttribute("href")).toBe("/play");
		});
	});

	describe("Accessibility", () => {
		it("should have proper semantic structure", () => {
			renderHome();

			expect(screen.getByRole("main")).toBeInTheDocument();
			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
			expect(screen.getByRole("link")).toBeInTheDocument();
		});

		it("should have proper heading hierarchy", () => {
			renderHome();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveTextContent("Welcome to Red Tetris!");
		});

		it("should have accessible image", () => {
			renderHome();

			const logo = screen.getByAltText("");
			expect(logo).toBeInTheDocument();
			// Note: alt="" is intentional for decorative images
		});
	});

	describe("Responsive Design", () => {
		it("should have responsive text sizing classes", () => {
			renderHome();

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("lg:text-5xl", "text-2xl");
		});

		it("should have responsive container classes", () => {
			renderHome();

			const main = screen.getByRole("main");
			const section = main.querySelector("section");
			
			expect(section).toHaveClass("max-w-4xl", "px-3");
		});
	});

	describe("Component Integration", () => {
		it("should integrate properly with routing", () => {
			expect(() => renderHome()).not.toThrow();
		});

		it("should render consistently across multiple renders", () => {
			const { rerender } = renderHome();

			expect(screen.getByText("Welcome to Red Tetris!")).toBeInTheDocument();

			rerender(
				<MemoryRouter>
					<Home />
				</MemoryRouter>
			);

			expect(screen.getByText("Welcome to Red Tetris!")).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = renderHome();

			expect(() => unmount()).not.toThrow();
		});
	});

	describe("Image Handling", () => {
		it("should render logo with correct attributes", () => {
			renderHome();

			const logo = screen.getByAltText("");
			expect(logo).toHaveAttribute("src", "/logo.png");
			expect(logo).toHaveAttribute("alt", "");
			expect(logo).toHaveClass("max-w-40");
		});
	});

	describe("Text Content", () => {
		it("should display welcome message", () => {
			renderHome();

			expect(screen.getByText("Welcome to Red Tetris!")).toBeInTheDocument();
		});

		it("should display game description", () => {
			renderHome();

			expect(screen.getByText("Online multiplayer Tetris game.")).toBeInTheDocument();
		});

		it("should display call-to-action button text", () => {
			renderHome();

			expect(screen.getByTestId("styled-button")).toHaveTextContent("Start playing");
		});
	});

	describe("Element Order", () => {
		it("should render elements in correct order", () => {
			renderHome();

			const main = screen.getByRole("main");
			const contentDiv = main.querySelector("section > div");
			const children = Array.from(contentDiv?.children || []);

			// Check order: logo, heading, description, link
			expect(children[0]).toContainElement(screen.getByAltText(""));
			expect(children[1]).toContainElement(screen.getByRole("heading"));
			expect(children[2]).toHaveTextContent("Online multiplayer Tetris game.");
			expect(children[3]).toContainElement(screen.getByRole("link"));
		});
	});
});

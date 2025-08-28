import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../index";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

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

	it("renders home page with correct content and structure", () => {
		const { unmount } = renderHome();

		// Check main content elements
		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		expect(screen.getByText("Welcome to Red Tetris!")).toBeInTheDocument();
		expect(screen.getByText("Online multiplayer Tetris game.")).toBeInTheDocument();

		// Check logo
		const logo = screen.getByAltText("");
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute("src", "/logo.png");
		expect(logo).toHaveClass("max-w-40");

		// Check button and link
		const button = screen.getByTestId("styled-button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Start playing");

		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/play");
		expect(link).toContainElement(button);

		unmount();
	});

	it("has correct layout and styling structure", () => {
		const { unmount } = renderHome();

		// Check main container styling
		const main = screen.getByRole("main");
		expect(main).toHaveClass("flex", "flex-1", "justify-center", "items-center", "flex-col");

		// Check section container styling
		const section = main.querySelector("section");
		expect(section).toHaveClass("container", "max-w-4xl", "text-center", "my-20", "px-3");

		// Check inner content container styling
		const contentDiv = main.querySelector("section > div");
		expect(contentDiv).toHaveClass("flex", "justify-center", "items-center", "flex-col", "gap-10");

		// Check heading styling
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveClass("lg:text-5xl", "text-2xl", "text-gray-8");

		// Check description text styling
		const description = screen.getByText("Online multiplayer Tetris game.");
		expect(description).toHaveClass("text-gray-5", "text-lg");

		unmount();
	});

	it("has proper accessibility and semantic structure", () => {
		const { unmount } = renderHome();

		// Check semantic HTML structure
		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		expect(screen.getByRole("link")).toBeInTheDocument();

		// Check heading hierarchy and content
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveTextContent("Welcome to Red Tetris!");

		// Check accessible image (decorative with empty alt)
		const logo = screen.getByAltText("");
		expect(logo).toHaveAttribute("alt", "");

		unmount();
	});

	it("handles responsive design and element ordering", () => {
		const { unmount } = renderHome();

		// Check responsive text sizing classes
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveClass("lg:text-5xl", "text-2xl");

		// Check responsive container classes
		const main = screen.getByRole("main");
		const section = main.querySelector("section");
		expect(section).toHaveClass("max-w-4xl", "px-3");

		// Check element order: logo, heading, description, link
		const contentDiv = main.querySelector("section > div");
		const children = Array.from(contentDiv?.children || []);

		expect(children[0]).toContainElement(screen.getByAltText(""));
		expect(children[1]).toContainElement(screen.getByRole("heading"));
		expect(children[2]).toHaveTextContent("Online multiplayer Tetris game.");
		expect(children[3]).toContainElement(screen.getByRole("link"));

		unmount();
	});

	it("handles component lifecycle and integration", () => {
		// Test component integration with routing and unmounting
		const { unmount } = renderHome();
		expect(screen.getByText("Welcome to Red Tetris!")).toBeInTheDocument();
		expect(screen.getByText("Online multiplayer Tetris game.")).toBeInTheDocument();
		expect(screen.getByTestId("styled-button")).toHaveTextContent("Start playing");
		
		// Test graceful unmounting
		expect(() => unmount()).not.toThrow();
	});
});

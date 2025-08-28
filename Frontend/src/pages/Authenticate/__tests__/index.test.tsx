import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthenticatePage from "../index";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

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

	it("renders with correct structure and content", () => {
		renderAuthenticatePage();

		// Basic structure and content
		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		expect(screen.getByText("Enter")).toBeInTheDocument();
		expect(screen.getByTestId("mock-form")).toBeInTheDocument();

		// Semantic structure
		const main = screen.getByRole("main");
		const section = main.querySelector("section");
		expect(section).toBeInTheDocument();
	});

	it("has correct styling and layout classes", () => {
		renderAuthenticatePage();

		// Main layout
		const main = screen.getByRole("main");
		expect(main).toHaveClass(
			"flex",
			"flex-1",
			"justify-center",
			"items-center",
			"flex-col",
			"gb-background-main"
		);

		// Section layout
		const section = main.querySelector("section");
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

		// Heading styling (including responsive)
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveClass(
			"lg:text-5xl",
			"text-2xl",
			"text-gray-8",
			"font-bold"
		);
	});

	it("integrates properly with routing", () => {
		// Should render without router errors
		expect(() => renderAuthenticatePage()).not.toThrow();

		// Should maintain consistent rendering
		expect(screen.getByText("Enter")).toBeInTheDocument();
		expect(screen.getByTestId("mock-form")).toBeInTheDocument();
	});
});

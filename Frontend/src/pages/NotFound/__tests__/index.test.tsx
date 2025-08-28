import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../index";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

describe("NotFound Page", () => {
	const renderNotFound = () =>
		render(
			<MemoryRouter>
				<NotFound />
			</MemoryRouter>
		);

	it("renders main elements and content", () => {
		renderNotFound();
		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			"404 - Page Not Found :("
		);
		expect(
			screen.getByText(
				"Sorry, the page you are looking for could not be found."
			)
		).toBeInTheDocument();
		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveTextContent("Go back to Home");
		expect(link).toHaveAttribute("href", "/");
	});

	it("has basic accessibility structure", () => {
		renderNotFound();
		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		expect(screen.getByRole("link")).toBeInTheDocument();
	});
});

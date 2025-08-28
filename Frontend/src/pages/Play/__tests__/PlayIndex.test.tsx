import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlayIndex from "../index";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

describe("PlayIndex", () => {
	it("renders main layout structure", () => {
		render(
			<MemoryRouter>
				<PlayIndex />
			</MemoryRouter>
		);

		const main = screen.getByRole("main");
		expect(main).toBeInTheDocument();
		expect(main).toHaveClass(
			"flex",
			"flex-1",
			"justify-center",
			"items-center",
			"flex-col"
		);
	});

	it("renders container with correct classes", () => {
		const { container } = render(
			<MemoryRouter>
				<PlayIndex />
			</MemoryRouter>
		);

		expect(
			container.querySelector(".container.max-w-4xl")
		).toBeInTheDocument();
	});

	it("shows error message when passed via location state", () => {
		const errorMessage = "Something went wrong";

		render(
			<MemoryRouter
				initialEntries={[
					{ pathname: "/play", state: { error: errorMessage } },
				]}
			>
				<PlayIndex />
			</MemoryRouter>
		);

		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	it("does not show error message when no error in location state", () => {
		render(
			<MemoryRouter>
				<PlayIndex />
			</MemoryRouter>
		);

		// Should not show any error message
		expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
	});

	it("renders both child components sections", () => {
		render(
			<MemoryRouter>
				<PlayIndex />
			</MemoryRouter>
		);

		// Should contain content from StartGame and Ranking components
		expect(screen.getByText(/start playing/i)).toBeInTheDocument();
		expect(screen.getByText(/global player ranking/i)).toBeInTheDocument();
	});
});

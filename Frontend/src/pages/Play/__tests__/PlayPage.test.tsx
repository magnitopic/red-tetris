import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlayIndex from "../index";

describe("PlayPage", () => {
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

	it("renders page content sections", () => {
		render(
			<MemoryRouter>
				<PlayIndex />
			</MemoryRouter>
		);

		// Should contain main headings from child components
		expect(screen.getByText(/start playing/i)).toBeInTheDocument();
		expect(screen.getByText(/global player ranking/i)).toBeInTheDocument();
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

		expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
	});

	it("has proper responsive layout classes", () => {
		const { container } = render(
			<MemoryRouter>
				<PlayIndex />
			</MemoryRouter>
		);

		expect(container.querySelector(".flex-wrap")).toBeInTheDocument();
		expect(container.querySelector(".gap-10")).toBeInTheDocument();
	});
});

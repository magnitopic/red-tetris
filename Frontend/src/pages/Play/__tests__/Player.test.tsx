import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Player from "../Player";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

describe("Player", () => {
	const mockPlayer = { username: "Alice", score: 42, id: "1" };

	it("renders player info and score", () => {
		render(
			<MemoryRouter>
				<Player playerData={mockPlayer} id={0} />
			</MemoryRouter>
		);
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("applies correct text size for different ranks", () => {
		// Test rank 0 (first place)
		const { container: container1 } = render(
			<MemoryRouter>
				<Player playerData={mockPlayer} id={0} />
			</MemoryRouter>
		);
		expect(container1.querySelector(".text-2xl")).toBeInTheDocument();

		// Test rank 1 (second place)
		const { container: container2 } = render(
			<MemoryRouter>
				<Player playerData={mockPlayer} id={1} />
			</MemoryRouter>
		);
		expect(container2.querySelector(".text-xl")).toBeInTheDocument();

		// Test rank 2+ (other places)
		const { container: container3 } = render(
			<MemoryRouter>
				<Player playerData={mockPlayer} id={2} />
			</MemoryRouter>
		);
		expect(container3.querySelector(".text-base")).toBeInTheDocument();
	});

	it("renders with correct border styling", () => {
		const { container } = render(
			<MemoryRouter>
				<Player playerData={mockPlayer} id={0} />
			</MemoryRouter>
		);
		expect(container.querySelector(".border-b")).toBeInTheDocument();
	});
});

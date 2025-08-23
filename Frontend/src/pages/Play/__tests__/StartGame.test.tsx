import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StartGame from "../StartGame";

describe("StartGame", () => {
	it("renders main heading", () => {
		render(<StartGame />);
		expect(screen.getByText(/start playing!/i)).toBeInTheDocument();
	});

	it("renders instruction text", () => {
		render(<StartGame />);
		expect(
			screen.getByText(/either create a new game/i)
		).toBeInTheDocument();
	});

	it("renders create game buttons", () => {
		render(<StartGame />);
		expect(screen.getByText(/create regular game/i)).toBeInTheDocument();
		expect(screen.getByText(/create hardcore game/i)).toBeInTheDocument();
	});

	it("renders join game section", () => {
		render(<StartGame />);
		expect(screen.getByText(/join an existing game/i)).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/enter game code/i)
		).toBeInTheDocument();
		expect(screen.getByText(/join game/i)).toBeInTheDocument();
	});

	it("updates game code input value", () => {
		render(<StartGame />);
		const input = screen.getByPlaceholderText(
			/enter game code/i
		) as HTMLInputElement;
		fireEvent.change(input, { target: { value: "ABCD" } });
		expect(input.value).toBe("ABCD");
	});

	it("renders with correct section styling", () => {
		const { container } = render(<StartGame />);
		expect(
			container.querySelector(".bg-background-secondary")
		).toBeInTheDocument();
	});
});

import React from "react";
import { render, screen } from "@testing-library/react";
import Board from "../Board";

describe("Board Component", () => {
	const mockState = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 1, 1, 1, 1, 0, 0, 0, 0], // I piece
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 2, 2, 2, 0, 0, 0, 0, 0, 0], // J piece
		[0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	];

	it("should render player name and score", () => {
		render(
			<Board
				state={mockState}
				playerName="TestPlayer"
				score={1500}
				isMain={false}
			/>
		);

		expect(screen.getByText("TestPlayer")).toBeInTheDocument();
		expect(screen.getByText("1500")).toBeInTheDocument();
	});

	it("should render the game board with correct structure", () => {
		render(
			<Board
				state={mockState}
				playerName="TestPlayer"
				score={1500}
				isMain={false}
			/>
		);

		// Should render 220 cells (10x22 grid)
		const boardContainer =
			screen.getByText("TestPlayer").nextElementSibling
				?.nextElementSibling;
		expect(boardContainer?.children).toHaveLength(220);
	});

	it("should apply main board styling when isMain is true", () => {
		render(
			<Board
				state={mockState}
				playerName="MainPlayer"
				score={2000}
				isMain={true}
			/>
		);

		const boardContainer =
			screen.getByText("MainPlayer").nextElementSibling
				?.nextElementSibling;
		expect(boardContainer).toHaveClass("bg-primary-dark");
	});

	it("should not apply main board styling when isMain is false", () => {
		render(
			<Board
				state={mockState}
				playerName="SidePlayer"
				score={500}
				isMain={false}
			/>
		);

		const boardContainer =
			screen.getByText("SidePlayer").nextElementSibling
				?.nextElementSibling;
		expect(boardContainer).not.toHaveClass("bg-primary-dark");
	});

	it("should handle empty board state", () => {
		const emptyState = Array(22)
			.fill(null)
			.map(() => Array(10).fill(0));

		render(
			<Board
				state={emptyState}
				playerName="EmptyPlayer"
				score={0}
				isMain={false}
			/>
		);

		expect(screen.getByText("EmptyPlayer")).toBeInTheDocument();
		expect(screen.getByText("0")).toBeInTheDocument();
	});

	it("should render different tetromino colors correctly", () => {
		const colorTestState = Array(22)
			.fill(null)
			.map(() => Array(10).fill(0));
		// Add different piece types
		colorTestState[5][3] = 1; // I piece - cyan
		colorTestState[5][4] = 2; // J piece - blue
		colorTestState[5][5] = 3; // L piece - orange
		colorTestState[5][6] = 4; // O piece - yellow

		const { container } = render(
			<Board
				state={colorTestState}
				playerName="ColorTest"
				score={100}
				isMain={false}
			/>
		);

		// Check that different colored cells exist
		expect(container.querySelector(".bg-cyan-500")).toBeInTheDocument();
		expect(container.querySelector(".bg-blue-600")).toBeInTheDocument();
		expect(container.querySelector(".bg-orange-500")).toBeInTheDocument();
		expect(container.querySelector(".bg-yellow-400")).toBeInTheDocument();
	});
});

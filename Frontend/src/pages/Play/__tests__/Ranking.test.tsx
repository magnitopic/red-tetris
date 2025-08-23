import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Ranking from "../Ranking";

// Mock the entire hook module with the correct path
jest.mock("../../../hooks/PageData/useGamePlayers", () => ({
	useGamePlayers: jest.fn(),
}));

import { useGamePlayers } from "../../../hooks/PageData/useGamePlayers";
const mockUseGamePlayers = useGamePlayers as jest.MockedFunction<
	typeof useGamePlayers
>;

describe("Ranking", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders ranking heading", () => {
		mockUseGamePlayers.mockReturnValue({
			fetchRanking: jest.fn().mockResolvedValue([]),
			loading: false,
			error: null,
		});

		render(
			<MemoryRouter>
				<Ranking />
			</MemoryRouter>
		);

		expect(screen.getByText(/global player ranking/i)).toBeInTheDocument();
	});

	it("shows loading state", () => {
		mockUseGamePlayers.mockReturnValue({
			fetchRanking: jest.fn(),
			loading: true,
			error: null,
		});

		render(
			<MemoryRouter>
				<Ranking />
			</MemoryRouter>
		);

		// Should show spinner (actual component, not mocked)
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows error message", () => {
		mockUseGamePlayers.mockReturnValue({
			fetchRanking: jest.fn(),
			loading: false,
			error: "Network error",
		});

		render(
			<MemoryRouter>
				<Ranking />
			</MemoryRouter>
		);

		expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
	});

	it("shows no players message when empty", async () => {
		mockUseGamePlayers.mockReturnValue({
			fetchRanking: jest.fn().mockResolvedValue([]),
			loading: false,
			error: null,
		});

		render(
			<MemoryRouter>
				<Ranking />
			</MemoryRouter>
		);

		await waitFor(() => {
			expect(
				screen.getByText(/no players ranked yet/i)
			).toBeInTheDocument();
		});
	});

	it("renders with correct section styling", () => {
		mockUseGamePlayers.mockReturnValue({
			fetchRanking: jest.fn().mockResolvedValue([]),
			loading: false,
			error: null,
		});

		const { container } = render(
			<MemoryRouter>
				<Ranking />
			</MemoryRouter>
		);

		expect(
			container.querySelector(".bg-background-secondary")
		).toBeInTheDocument();
	});
});

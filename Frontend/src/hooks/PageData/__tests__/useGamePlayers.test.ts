import { renderHook, act } from "@testing-library/react";
import { useGamePlayers } from "../useGamePlayers";
import { gamePlayersApi } from "../../../services/api/gamePlayers";

// Mock the game players API
jest.mock("../../../services/api/gamePlayers");
const mockGamePlayersApi = gamePlayersApi as jest.Mocked<typeof gamePlayersApi>;

describe("useGamePlayers", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should initialize with correct default values", () => {
		const { result } = renderHook(() => useGamePlayers());

		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
		expect(typeof result.current.fetchRanking).toBe("function");
		expect(typeof result.current.fetchGame).toBe("function");
	});

	describe("fetchRanking", () => {
		it("should handle successful ranking fetch and various data types", async () => {
			// Test with normal ranking data
			const mockRankingData = [
				{ id: "1", username: "player1", score: 1000, rank: 1 },
				{ id: "2", username: "Ñoël-player", score: 800, rank: 2 },
				{ id: "3", username: "玩家", score: 600, rank: 3 },
			];
			const mockResponse = { success: true, msg: mockRankingData };
			mockGamePlayersApi.getRanking.mockResolvedValueOnce(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let rankingResult;
			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(mockGamePlayersApi.getRanking).toHaveBeenCalledWith();
			expect(rankingResult).toEqual(mockResponse);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);

			// Test with empty data
			const emptyResponse = { success: true, msg: [] };
			mockGamePlayersApi.getRanking.mockResolvedValueOnce(emptyResponse);

			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(rankingResult).toEqual(emptyResponse);

			// Test with null/undefined data
			const nullResponse = { success: true, msg: null };
			mockGamePlayersApi.getRanking.mockResolvedValueOnce(nullResponse);

			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(rankingResult).toEqual(nullResponse);
		});

		it("should handle errors and error state management", async () => {
			const { result } = renderHook(() => useGamePlayers());

			// Test Error instance
			const errorMessage = "Failed to fetch ranking";
			const mockError = new Error(errorMessage);
			mockGamePlayersApi.getRanking.mockRejectedValueOnce(mockError);

			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow(errorMessage);
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(errorMessage);

			// Test non-Error instance
			const mockErrorObj = { status: 500, message: "Internal server error" };
			mockGamePlayersApi.getRanking.mockRejectedValueOnce(mockErrorObj);

			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow("Failed to fetch ranking");
			});

			expect(result.current.error).toBe("Failed to fetch ranking");

			// Test error state clears on successful fetch
			const mockData = [{ id: "1", username: "player1", score: 100 }];
			const mockResponse = { success: true, msg: mockData };
			mockGamePlayersApi.getRanking.mockResolvedValueOnce(mockResponse);

			let rankingResult;
			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(result.current.error).toBe(null);
			expect(rankingResult).toEqual(mockResponse);
		});
	});

	describe("fetchGame", () => {
		it("should handle successful game fetch with different states and room IDs", async () => {
			const { result } = renderHook(() => useGamePlayers());

			// Test active game
			const mockGameData = {
				id: "123456",
				finished: false,
				players: ["player1", "player2"],
				startTime: new Date().toISOString(),
			};
			const mockResponse = { success: true, msg: mockGameData };
			mockGamePlayersApi.getGame.mockResolvedValueOnce(mockResponse);

			let gameResult;
			await act(async () => {
				gameResult = await result.current.fetchGame("123456");
			});

			expect(mockGamePlayersApi.getGame).toHaveBeenCalledWith("123456");
			expect(gameResult).toEqual(mockResponse);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);

			// Test finished game
			const finishedGameData = {
				id: "789012",
				finished: true,
				endTime: new Date().toISOString(),
				winner: "player1",
			};
			const finishedResponse = { success: true, msg: finishedGameData };
			mockGamePlayersApi.getGame.mockResolvedValueOnce(finishedResponse);

			await act(async () => {
				gameResult = await result.current.fetchGame("789012");
			});

			expect(mockGamePlayersApi.getGame).toHaveBeenCalledWith("789012");
			expect(gameResult).toEqual(finishedResponse);
		});

		it("should handle game fetch errors", async () => {
			const { result } = renderHook(() => useGamePlayers());

			// Test Error instance
			const errorMessage = "Game not found";
			const mockError = new Error(errorMessage);
			mockGamePlayersApi.getGame.mockRejectedValueOnce(mockError);

			await act(async () => {
				await expect(result.current.fetchGame("123456")).rejects.toThrow(errorMessage);
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(errorMessage);

			// Test non-Error instance
			const mockErrorObj = { status: 404, message: "Not found" };
			mockGamePlayersApi.getGame.mockRejectedValueOnce(mockErrorObj);

			await act(async () => {
				await expect(result.current.fetchGame("123456")).rejects.toThrow("Failed to fetch game data");
			});

			expect(result.current.error).toBe("Failed to fetch game data");
		});
	});

	it("should handle state management and multiple instances", () => {
		const { result: result1 } = renderHook(() => useGamePlayers());
		const { result: result2 } = renderHook(() => useGamePlayers());

		// Test independent state
		expect(result1.current.loading).toBe(false);
		expect(result2.current.loading).toBe(false);
		expect(result1.current.error).toBe(null);
		expect(result2.current.error).toBe(null);
	});
});

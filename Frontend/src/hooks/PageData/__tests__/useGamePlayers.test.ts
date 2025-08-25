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

	describe("Initial state", () => {
		it("should initialize with correct default values", () => {
			const { result } = renderHook(() => useGamePlayers());

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);
			expect(typeof result.current.fetchRanking).toBe("function");
			expect(typeof result.current.fetchGame).toBe("function");
		});
	});

	describe("fetchRanking", () => {
		it("should handle successful ranking fetch", async () => {
			const mockRankingData = [
				{ id: "1", username: "player1", score: 1000, rank: 1 },
				{ id: "2", username: "player2", score: 800, rank: 2 },
				{ id: "3", username: "player3", score: 600, rank: 3 },
			];
			const mockResponse = { success: true, msg: mockRankingData };
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let rankingResult;
			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(mockGamePlayersApi.getRanking).toHaveBeenCalledWith();
			expect(rankingResult).toEqual(mockResponse);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);
		});

		it("should handle API error with Error instance", async () => {
			const errorMessage = "Failed to fetch ranking";
			const mockError = new Error(errorMessage);
			mockGamePlayersApi.getRanking.mockRejectedValue(mockError);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow(
					errorMessage
				);
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(errorMessage);
		});

		it("should handle API error without Error instance", async () => {
			const mockError = { status: 500, message: "Internal server error" };
			mockGamePlayersApi.getRanking.mockRejectedValue(mockError);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow(
					"Failed to fetch ranking"
				);
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe("Failed to fetch ranking");
		});

		it("should clear error state before new fetch", async () => {
			// First fetch fails
			const mockError = new Error("Fetch failed");
			mockGamePlayersApi.getRanking.mockRejectedValueOnce(mockError);

			const { result } = renderHook(() => useGamePlayers());

			// First fetch with error
			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow(
					"Fetch failed"
				);
			});

			expect(result.current.error).toBe("Fetch failed");

			// Second fetch succeeds
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
		it("should handle successful game fetch", async () => {
			const mockGameData = {
				id: "123456",
				finished: false,
				players: ["player1", "player2"],
				startTime: new Date().toISOString(),
			};
			const mockResponse = { success: true, msg: mockGameData };
			mockGamePlayersApi.getGame.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let gameResult;
			await act(async () => {
				gameResult = await result.current.fetchGame("123456");
			});

			expect(mockGamePlayersApi.getGame).toHaveBeenCalledWith("123456");
			expect(gameResult).toEqual(mockResponse);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);
		});

		it("should handle API error with Error instance", async () => {
			const errorMessage = "Game not found";
			const mockError = new Error(errorMessage);
			mockGamePlayersApi.getGame.mockRejectedValue(mockError);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await expect(
					result.current.fetchGame("123456")
				).rejects.toThrow(errorMessage);
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(errorMessage);
		});

		it("should handle API error without Error instance", async () => {
			const mockError = { status: 404, message: "Not found" };
			mockGamePlayersApi.getGame.mockRejectedValue(mockError);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await expect(
					result.current.fetchGame("123456")
				).rejects.toThrow("Failed to fetch game data");
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe("Failed to fetch game data");
		});

		it("should handle different room IDs", async () => {
			const mockGameData1 = { id: "123456", finished: false };
			const mockGameData2 = { id: "789012", finished: true };
			const mockResponse1 = { success: true, msg: mockGameData1 };
			const mockResponse2 = { success: true, msg: mockGameData2 };

			mockGamePlayersApi.getGame
				.mockResolvedValueOnce(mockResponse1)
				.mockResolvedValueOnce(mockResponse2);

			const { result } = renderHook(() => useGamePlayers());

			let result1, result2;
			await act(async () => {
				result1 = await result.current.fetchGame("123456");
			});

			await act(async () => {
				result2 = await result.current.fetchGame("789012");
			});

			expect(mockGamePlayersApi.getGame).toHaveBeenCalledWith("123456");
			expect(mockGamePlayersApi.getGame).toHaveBeenCalledWith("789012");
			expect(result1).toEqual(mockResponse1);
			expect(result2).toEqual(mockResponse2);
		});

		it("should handle game with finished status", async () => {
			const mockGameData = {
				id: "123456",
				finished: true,
				endTime: new Date().toISOString(),
				winner: "player1",
			};
			const mockResponse = { success: true, msg: mockGameData };
			mockGamePlayersApi.getGame.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let gameResult;
			await act(async () => {
				gameResult = await result.current.fetchGame("123456");
			});

			expect(gameResult).toEqual(mockResponse);
		});
	});

	describe("Data handling", () => {
		it("should handle empty ranking data", async () => {
			const mockResponse = { success: true, msg: [] };
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let rankingResult;
			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(rankingResult).toEqual(mockResponse);
		});

		it("should handle large ranking datasets", async () => {
			const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
				id: `player${i}`,
				username: `user${i}`,
				score: 1000 - i,
				rank: i + 1,
			}));
			const mockResponse = { success: true, msg: largeDataset };
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let rankingResult;
			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(rankingResult).toEqual(mockResponse);
		});

		it("should handle ranking data with special characters", async () => {
			const mockData = [
				{ id: "1", username: "user_123", score: 500 },
				{ id: "2", username: "Ñoël-player", score: 400 },
				{ id: "3", username: "玩家", score: 300 },
			];
			const mockResponse = { success: true, msg: mockData };
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let rankingResult;
			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(rankingResult).toEqual(mockResponse);
		});

		it("should handle ranking data with missing fields", async () => {
			const mockData = [
				{ id: "1", username: "player1" }, // missing score
				{ username: "player2", score: 100 }, // missing id
				{ id: "3", score: 200 }, // missing username
			];
			const mockResponse = { success: true, msg: mockData };
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let rankingResult;
			await act(async () => {
				rankingResult = await result.current.fetchRanking();
			});

			expect(rankingResult).toEqual(mockResponse);
		});
	});

	describe("State management", () => {
		it("should maintain independent state across multiple instances", () => {
			const { result: result1 } = renderHook(() => useGamePlayers());
			const { result: result2 } = renderHook(() => useGamePlayers());

			expect(result1.current.loading).toBe(false);
			expect(result2.current.loading).toBe(false);
			expect(result1.current.error).toBe(null);
			expect(result2.current.error).toBe(null);
		});

		it("should reset loading state after error", async () => {
			const mockError = new Error("Fetch failed");
			mockGamePlayersApi.getRanking.mockRejectedValue(mockError);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow(
					"Fetch failed"
				);
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe("Fetch failed");
		});
	});

	describe("API interaction", () => {
		it("should call API without parameters", async () => {
			const mockResponse = { success: true, msg: [] };
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await result.current.fetchRanking();
			});

			expect(mockGamePlayersApi.getRanking).toHaveBeenCalledWith();
			expect(mockGamePlayersApi.getRanking).toHaveBeenCalledTimes(1);
		});

		it("should return API response data", async () => {
			const mockResponse = {
				success: true,
				msg: [
					{ id: "1", username: "player1", score: 1000 },
					{ id: "2", username: "player2", score: 800 },
				],
			};
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let fetchResult;
			await act(async () => {
				fetchResult = await result.current.fetchRanking();
			});

			expect(fetchResult).toEqual(mockResponse);
		});
	});

	describe("Multiple calls", () => {
		it("should handle multiple consecutive calls", async () => {
			const mockData1 = [{ id: "1", username: "player1", score: 100 }];
			const mockData2 = [{ id: "2", username: "player2", score: 200 }];
			const mockResponse1 = { success: true, msg: mockData1 };
			const mockResponse2 = { success: true, msg: mockData2 };

			mockGamePlayersApi.getRanking
				.mockResolvedValueOnce(mockResponse1)
				.mockResolvedValueOnce(mockResponse2);

			const { result } = renderHook(() => useGamePlayers());

			let result1, result2;
			await act(async () => {
				result1 = await result.current.fetchRanking();
			});

			await act(async () => {
				result2 = await result.current.fetchRanking();
			});

			expect(result1).toEqual(mockResponse1);
			expect(result2).toEqual(mockResponse2);
			expect(mockGamePlayersApi.getRanking).toHaveBeenCalledTimes(2);
		});
	});

	describe("Error scenarios", () => {
		it("should handle network timeout errors", async () => {
			const timeoutError = new Error("Request timeout");
			mockGamePlayersApi.getRanking.mockRejectedValue(timeoutError);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow(
					"Request timeout"
				);
			});

			expect(result.current.error).toBe("Request timeout");
		});

		it("should handle HTTP status errors", async () => {
			const httpError = new Error("HTTP 404: Not Found");
			mockGamePlayersApi.getRanking.mockRejectedValue(httpError);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow(
					"HTTP 404: Not Found"
				);
			});

			expect(result.current.error).toBe("HTTP 404: Not Found");
		});

		it("should handle malformed response errors", async () => {
			const jsonError = new Error("Invalid JSON response");
			mockGamePlayersApi.getRanking.mockRejectedValue(jsonError);

			const { result } = renderHook(() => useGamePlayers());

			await act(async () => {
				await expect(result.current.fetchRanking()).rejects.toThrow(
					"Invalid JSON response"
				);
			});

			expect(result.current.error).toBe("Invalid JSON response");
		});
	});

	describe("Edge cases", () => {
		it("should handle API returning null", async () => {
			const mockResponse = { success: true, msg: null };
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let fetchResult;
			await act(async () => {
				fetchResult = await result.current.fetchRanking();
			});

			expect(fetchResult).toEqual(mockResponse);
		});

		it("should handle API returning undefined", async () => {
			const mockResponse = { success: true, msg: undefined };
			mockGamePlayersApi.getRanking.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useGamePlayers());

			let fetchResult;
			await act(async () => {
				fetchResult = await result.current.fetchRanking();
			});

			expect(fetchResult).toEqual(mockResponse);
		});
	});
});

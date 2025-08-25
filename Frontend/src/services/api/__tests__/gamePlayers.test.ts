import { gamePlayersApi } from "../gamePlayers";
import apiRequest from "../config";

// Mock the config module
jest.mock("../config");
const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("gamePlayersApi", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getRanking", () => {
		it("should fetch ranking data successfully", async () => {
			const mockResponse = {
				success: true,
				msg: [
					{
						id: "1",
						username: "player1",
						profilePicture: "http://example.com/pic1.jpg",
						score: 1500,
					},
					{
						id: "2",
						username: "player2",
						profilePicture: "http://example.com/pic2.jpg",
						score: 1200,
					},
					{
						id: "3",
						username: "player3",
						profilePicture: "http://example.com/pic3.jpg",
						score: 1000,
					},
				],
			};

			mockApiRequest.mockResolvedValue(mockResponse);

			const result = await gamePlayersApi.getRanking();

			expect(mockApiRequest).toHaveBeenCalledWith("game-players/top-players");
			expect(result).toEqual(mockResponse);
		});

		it("should handle errors when fetching ranking", async () => {
			const mockError = new Error("Failed to fetch ranking");
			mockApiRequest.mockRejectedValue(mockError);

			await expect(gamePlayersApi.getRanking()).rejects.toThrow(
				"Failed to fetch ranking"
			);
			expect(mockApiRequest).toHaveBeenCalledWith("game-players/top-players");
		});

		it("should handle empty ranking response", async () => {
			const mockResponse = {
				success: true,
				msg: [],
			};

			mockApiRequest.mockResolvedValue(mockResponse);

			const result = await gamePlayersApi.getRanking();

			expect(mockApiRequest).toHaveBeenCalledWith("game-players/top-players");
			expect(result).toEqual(mockResponse);
		});

		it("should handle server error responses", async () => {
			const mockError = {
				status: 500,
				message: "Internal server error",
			};
			mockApiRequest.mockRejectedValue(mockError);

			await expect(gamePlayersApi.getRanking()).rejects.toEqual(mockError);
			expect(mockApiRequest).toHaveBeenCalledWith("game-players/top-players");
		});

		it("should handle network timeout errors", async () => {
			const mockError = new Error("Network timeout");
			mockApiRequest.mockRejectedValue(mockError);

			await expect(gamePlayersApi.getRanking()).rejects.toThrow(
				"Network timeout"
			);
			expect(mockApiRequest).toHaveBeenCalledWith("game-players/top-players");
		});

		it("should use correct API endpoint", async () => {
			const mockResponse = { success: true, msg: [] };
			mockApiRequest.mockResolvedValue(mockResponse);

			await gamePlayersApi.getRanking();

			expect(mockApiRequest).toHaveBeenCalledWith("game-players/top-players");
			expect(mockApiRequest).toHaveBeenCalledTimes(1);
		});
	});

	describe("getGame", () => {
		it("should fetch game data successfully", async () => {
			const roomId = "123456";
			const mockResponse = {
				success: true,
				msg: {
					id: "game-1",
					game_seed: roomId,
					finished: false,
					created_at: "2025-08-25T10:00:00Z",
					updated_at: "2025-08-25T10:00:00Z",
				},
			};

			mockApiRequest.mockResolvedValue(mockResponse);

			const result = await gamePlayersApi.getGame(roomId);

			expect(mockApiRequest).toHaveBeenCalledWith(`games/${roomId}`);
			expect(result).toEqual(mockResponse);
		});

		it("should handle errors when fetching game", async () => {
			const roomId = "123456";
			const mockError = new Error("Game not found");
			mockApiRequest.mockRejectedValue(mockError);

			await expect(gamePlayersApi.getGame(roomId)).rejects.toThrow(
				"Game not found"
			);
			expect(mockApiRequest).toHaveBeenCalledWith(`games/${roomId}`);
		});

		it("should handle different room IDs correctly", async () => {
			const roomIds = ["123456", "789012", "555555"];
			const mockResponse = { success: true, msg: { finished: false } };
			
			mockApiRequest.mockResolvedValue(mockResponse);

			for (const roomId of roomIds) {
				await gamePlayersApi.getGame(roomId);
				expect(mockApiRequest).toHaveBeenCalledWith(`games/${roomId}`);
			}

			expect(mockApiRequest).toHaveBeenCalledTimes(3);
		});

		it("should handle finished game response", async () => {
			const roomId = "123456";
			const mockResponse = {
				success: true,
				msg: {
					id: "game-1",
					game_seed: roomId,
					finished: true,
					created_at: "2025-08-25T10:00:00Z",
					updated_at: "2025-08-25T11:00:00Z",
					winner: "player1",
				},
			};

			mockApiRequest.mockResolvedValue(mockResponse);

			const result = await gamePlayersApi.getGame(roomId);

			expect(mockApiRequest).toHaveBeenCalledWith(`games/${roomId}`);
			expect(result).toEqual(mockResponse);
			expect(result.msg.finished).toBe(true);
		});

		it("should handle 404 errors for non-existent games", async () => {
			const roomId = "999999";
			const mockError = {
				status: 404,
				message: "Game not found",
			};
			mockApiRequest.mockRejectedValue(mockError);

			await expect(gamePlayersApi.getGame(roomId)).rejects.toEqual(mockError);
			expect(mockApiRequest).toHaveBeenCalledWith(`games/${roomId}`);
		});

		it("should handle invalid room ID format", async () => {
			const invalidRoomId = "invalid";
			const mockError = {
				status: 400,
				message: "Invalid room ID format",
			};
			mockApiRequest.mockRejectedValue(mockError);

			await expect(gamePlayersApi.getGame(invalidRoomId)).rejects.toEqual(mockError);
			expect(mockApiRequest).toHaveBeenCalledWith(`games/${invalidRoomId}`);
		});

		it("should handle server error responses", async () => {
			const roomId = "123456";
			const mockError = {
				status: 500,
				message: "Internal server error",
			};
			mockApiRequest.mockRejectedValue(mockError);

			await expect(gamePlayersApi.getGame(roomId)).rejects.toEqual(mockError);
			expect(mockApiRequest).toHaveBeenCalledWith(`games/${roomId}`);
		});

		it("should handle network timeout errors", async () => {
			const roomId = "123456";
			const mockError = new Error("Network timeout");
			mockApiRequest.mockRejectedValue(mockError);

			await expect(gamePlayersApi.getGame(roomId)).rejects.toThrow(
				"Network timeout"
			);
			expect(mockApiRequest).toHaveBeenCalledWith(`games/${roomId}`);
		});

		it("should handle special characters in room ID", async () => {
			const roomId = "12-34_56";
			const mockResponse = { success: true, msg: { finished: false } };
			mockApiRequest.mockResolvedValue(mockResponse);

			await gamePlayersApi.getGame(roomId);

			expect(mockApiRequest).toHaveBeenCalledWith(`games/${roomId}`);
		});

		it("should handle empty room ID", async () => {
			const roomId = "";
			const mockResponse = { success: true, msg: { finished: false } };
			mockApiRequest.mockResolvedValue(mockResponse);

			await gamePlayersApi.getGame(roomId);

			expect(mockApiRequest).toHaveBeenCalledWith("games/");
		});
	});

	describe("API integration", () => {
		it("should use the same apiRequest function for both methods", async () => {
			const mockResponse = { success: true, msg: [] };
			mockApiRequest.mockResolvedValue(mockResponse);

			await gamePlayersApi.getRanking();
			await gamePlayersApi.getGame("123456");

			expect(mockApiRequest).toHaveBeenCalledTimes(2);
			expect(mockApiRequest).toHaveBeenCalledWith("game-players/top-players");
			expect(mockApiRequest).toHaveBeenCalledWith("games/123456");
		});

		it("should handle concurrent requests", async () => {
			const mockResponse1 = { success: true, msg: [] };
			const mockResponse2 = { success: true, msg: { finished: false } };
			
			mockApiRequest
				.mockResolvedValueOnce(mockResponse1)
				.mockResolvedValueOnce(mockResponse2);

			const [rankingResult, gameResult] = await Promise.all([
				gamePlayersApi.getRanking(),
				gamePlayersApi.getGame("123456"),
			]);

			expect(rankingResult).toEqual(mockResponse1);
			expect(gameResult).toEqual(mockResponse2);
			expect(mockApiRequest).toHaveBeenCalledTimes(2);
		});

		it("should handle mixed success and error responses", async () => {
			const mockRankingResponse = { success: true, msg: [] };
			const mockGameError = new Error("Game not found");
			
			mockApiRequest
				.mockResolvedValueOnce(mockRankingResponse)
				.mockRejectedValueOnce(mockGameError);

			const rankingResult = await gamePlayersApi.getRanking();
			
			expect(rankingResult).toEqual(mockRankingResponse);
			await expect(gamePlayersApi.getGame("invalid")).rejects.toThrow("Game not found");
		});
	});

	describe("Edge cases", () => {
		it("should handle null response from API", async () => {
			mockApiRequest.mockResolvedValue(null);

			const result = await gamePlayersApi.getRanking();

			expect(result).toBeNull();
		});

		it("should handle undefined response from API", async () => {
			mockApiRequest.mockResolvedValue(undefined);

			const result = await gamePlayersApi.getGame("123456");

			expect(result).toBeUndefined();
		});

		it("should handle malformed JSON responses", async () => {
			const malformedError = new SyntaxError("Unexpected token in JSON");
			mockApiRequest.mockRejectedValue(malformedError);

			await expect(gamePlayersApi.getRanking()).rejects.toThrow(
				"Unexpected token in JSON"
			);
		});

		it("should handle very long room IDs", async () => {
			const longRoomId = "a".repeat(1000);
			const mockResponse = { success: true, msg: { finished: false } };
			mockApiRequest.mockResolvedValue(mockResponse);

			await gamePlayersApi.getGame(longRoomId);

			expect(mockApiRequest).toHaveBeenCalledWith(`games/${longRoomId}`);
		});
	});
});

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
		it("fetches ranking data and handles responses correctly", async () => {
			// Test successful response with player data
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
			expect(mockApiRequest).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockResponse);

			// Test empty ranking response
			const emptyResponse = { success: true, msg: [] };
			mockApiRequest.mockResolvedValue(emptyResponse);
			const emptyResult = await gamePlayersApi.getRanking();
			expect(emptyResult).toEqual(emptyResponse);

			// Test null/undefined responses
			mockApiRequest.mockResolvedValue(null);
			expect(await gamePlayersApi.getRanking()).toBeNull();

			mockApiRequest.mockResolvedValue(undefined);
			expect(await gamePlayersApi.getRanking()).toBeUndefined();
		});

		it("handles various error types correctly", async () => {
			// Test network errors
			const networkError = new Error("Failed to fetch ranking");
			mockApiRequest.mockRejectedValue(networkError);
			await expect(gamePlayersApi.getRanking()).rejects.toThrow("Failed to fetch ranking");

			// Test server errors
			const serverError = { status: 500, message: "Internal server error" };
			mockApiRequest.mockRejectedValue(serverError);
			await expect(gamePlayersApi.getRanking()).rejects.toEqual(serverError);

			// Test timeout errors
			const timeoutError = new Error("Network timeout");
			mockApiRequest.mockRejectedValue(timeoutError);
			await expect(gamePlayersApi.getRanking()).rejects.toThrow("Network timeout");

			// Test malformed JSON
			const jsonError = new SyntaxError("Unexpected token in JSON");
			mockApiRequest.mockRejectedValue(jsonError);
			await expect(gamePlayersApi.getRanking()).rejects.toThrow("Unexpected token in JSON");
		});
	});

	describe("getGame", () => {
		it("fetches game data with correct room IDs and handles responses", async () => {
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

			// Test finished game response
			const finishedResponse = {
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

			mockApiRequest.mockResolvedValue(finishedResponse);
			const finishedResult = await gamePlayersApi.getGame(roomId);
			expect(finishedResult).toEqual(finishedResponse);
			expect(finishedResult.msg.finished).toBe(true);

			// Test different room IDs
			const roomIds = ["789012", "555555", "12-34_56"];
			const mockGenericResponse = { success: true, msg: { finished: false } };
			mockApiRequest.mockResolvedValue(mockGenericResponse);

			for (const id of roomIds) {
				await gamePlayersApi.getGame(id);
				expect(mockApiRequest).toHaveBeenCalledWith(`games/${id}`);
			}
		});

		it("handles edge cases and special room ID formats", async () => {
			const mockResponse = { success: true, msg: { finished: false } };
			mockApiRequest.mockResolvedValue(mockResponse);

			// Test empty room ID
			await gamePlayersApi.getGame("");
			expect(mockApiRequest).toHaveBeenCalledWith("games/");

			// Test very long room ID
			const longRoomId = "a".repeat(1000);
			await gamePlayersApi.getGame(longRoomId);
			expect(mockApiRequest).toHaveBeenCalledWith(`games/${longRoomId}`);

			// Test null/undefined responses
			mockApiRequest.mockResolvedValue(null);
			expect(await gamePlayersApi.getGame("123456")).toBeNull();

			mockApiRequest.mockResolvedValue(undefined);
			expect(await gamePlayersApi.getGame("123456")).toBeUndefined();
		});

		it("handles various error scenarios correctly", async () => {
			const roomId = "123456";

			// Test general errors
			const gameError = new Error("Game not found");
			mockApiRequest.mockRejectedValue(gameError);
			await expect(gamePlayersApi.getGame(roomId)).rejects.toThrow("Game not found");

			// Test 404 errors
			const notFoundError = { status: 404, message: "Game not found" };
			mockApiRequest.mockRejectedValue(notFoundError);
			await expect(gamePlayersApi.getGame("999999")).rejects.toEqual(notFoundError);

			// Test 400 errors for invalid room ID
			const invalidError = { status: 400, message: "Invalid room ID format" };
			mockApiRequest.mockRejectedValue(invalidError);
			await expect(gamePlayersApi.getGame("invalid")).rejects.toEqual(invalidError);

			// Test server errors
			const serverError = { status: 500, message: "Internal server error" };
			mockApiRequest.mockRejectedValue(serverError);
			await expect(gamePlayersApi.getGame(roomId)).rejects.toEqual(serverError);

			// Test timeout errors
			const timeoutError = new Error("Network timeout");
			mockApiRequest.mockRejectedValue(timeoutError);
			await expect(gamePlayersApi.getGame(roomId)).rejects.toThrow("Network timeout");
		});
	});

	describe("API integration and concurrent operations", () => {
		it("handles API integration and concurrent requests correctly", async () => {
			// Test that both methods use the same apiRequest function
			const mockRankingResponse = { success: true, msg: [] };
			const mockGameResponse = { success: true, msg: { finished: false } };

			mockApiRequest.mockResolvedValue(mockRankingResponse);
			await gamePlayersApi.getRanking();

			mockApiRequest.mockResolvedValue(mockGameResponse);
			await gamePlayersApi.getGame("123456");

			expect(mockApiRequest).toHaveBeenCalledTimes(2);
			expect(mockApiRequest).toHaveBeenCalledWith("game-players/top-players");
			expect(mockApiRequest).toHaveBeenCalledWith("games/123456");

			// Test concurrent requests
			jest.clearAllMocks();
			mockApiRequest
				.mockResolvedValueOnce(mockRankingResponse)
				.mockResolvedValueOnce(mockGameResponse);

			const [rankingResult, gameResult] = await Promise.all([
				gamePlayersApi.getRanking(),
				gamePlayersApi.getGame("123456"),
			]);

			expect(rankingResult).toEqual(mockRankingResponse);
			expect(gameResult).toEqual(mockGameResponse);
			expect(mockApiRequest).toHaveBeenCalledTimes(2);

			// Test mixed success and error responses
			const mockError = new Error("Game not found");
			mockApiRequest
				.mockResolvedValueOnce(mockRankingResponse)
				.mockRejectedValueOnce(mockError);

			const successResult = await gamePlayersApi.getRanking();
			expect(successResult).toEqual(mockRankingResponse);

			await expect(gamePlayersApi.getGame("invalid")).rejects.toThrow("Game not found");
		});
	});
});

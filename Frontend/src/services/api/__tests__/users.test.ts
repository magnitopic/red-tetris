import { usersApi } from "../users";
import apiRequest from "../config";

// Mock the config module
jest.mock("../config");
const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("usersApi", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getMe", () => {
		it("should fetch current user data successfully", async () => {
			const mockResponse = {
				msg: {
					id: "1",
					username: "testuser",
					email: "test@example.com",
				},
			};

			mockApiRequest.mockResolvedValue(mockResponse);

			const result = await usersApi.getMe();

			expect(mockApiRequest).toHaveBeenCalledWith("users/me");
			expect(result).toEqual(mockResponse);
		});

		it("should handle errors when fetching current user", async () => {
			const mockError = new Error("Failed to fetch user");
			mockApiRequest.mockRejectedValue(mockError);

			await expect(usersApi.getMe()).rejects.toThrow(
				"Failed to fetch user"
			);
			expect(mockApiRequest).toHaveBeenCalledWith("users/me");
		});
	});

	describe("getPublicProfile", () => {
		it("should fetch public profile successfully", async () => {
			const mockResponse = {
				msg: {
					id: "1",
					username: "testuser",
					first_name: "Test",
					last_name: "User",
					biography: "Test bio",
				},
			};

			mockApiRequest.mockResolvedValue(mockResponse);

			const result = await usersApi.getPublicProfile("testuser");

			expect(mockApiRequest).toHaveBeenCalledWith("users/testuser");
			expect(result).toEqual(mockResponse);
		});

		it("should handle errors when fetching public profile", async () => {
			const mockError = new Error("User not found");
			mockApiRequest.mockRejectedValue(mockError);

			await expect(
				usersApi.getPublicProfile("nonexistent")
			).rejects.toThrow("User not found");
			expect(mockApiRequest).toHaveBeenCalledWith("users/nonexistent");
		});

		it("should handle different usernames correctly", async () => {
			const mockResponse = { msg: { username: "different-user" } };
			mockApiRequest.mockResolvedValue(mockResponse);

			await usersApi.getPublicProfile("different-user");

			expect(mockApiRequest).toHaveBeenCalledWith("users/different-user");
		});
	});
});

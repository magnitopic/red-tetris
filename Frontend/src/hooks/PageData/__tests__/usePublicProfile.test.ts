import { renderHook, waitFor } from "@testing-library/react";
import { usePublicProfile } from "../usePublicProfile";
import { usersApi } from "../../../services/api/users";

// Mock the users API
jest.mock("../../../services/api/users");
const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;

describe("usePublicProfile", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Initial state", () => {
		it("should initialize with correct default values", () => {
			const { result } = renderHook(() => usePublicProfile("testuser"));

			expect(result.current.profile).toBe(null);
			expect(result.current.loading).toBe(true); // Should be true since it auto-fetches
			expect(result.current.error).toBe(null);
			expect(result.current.notFound).toBe(false);
		});

		it("should not fetch when username is empty", () => {
			const { result } = renderHook(() => usePublicProfile(""));

			expect(mockUsersApi.getPublicProfile).not.toHaveBeenCalled();
			expect(result.current.loading).toBe(false);
		});

		it("should not fetch when username is null", () => {
			const { result } = renderHook(() => usePublicProfile(null));

			expect(mockUsersApi.getPublicProfile).not.toHaveBeenCalled();
			expect(result.current.loading).toBe(false);
		});

		it("should not fetch when username is undefined", () => {
			const { result } = renderHook(() => usePublicProfile(undefined));

			expect(mockUsersApi.getPublicProfile).not.toHaveBeenCalled();
			expect(result.current.loading).toBe(false);
		});
	});

	describe("Successful profile fetch", () => {
		it("should fetch public profile data successfully", async () => {
			const mockProfileData = {
				id: "user123",
				username: "testuser",
				profilePicture: "http://example.com/avatar.jpg",
				joinedAt: "2024-01-01T00:00:00Z",
				stats: { gamesPlayed: 50, highScore: 1000 },
			};
			const mockResponse = { success: true, msg: mockProfileData };
			mockUsersApi.getPublicProfile.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => usePublicProfile("testuser"));

			// Wait for the profile to be fetched
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(mockUsersApi.getPublicProfile).toHaveBeenCalledWith(
				"testuser"
			);
			expect(result.current.profile).toEqual(mockProfileData);
			expect(result.current.error).toBe(null);
			expect(result.current.notFound).toBe(false);
		});

		it("should handle profile data with minimal fields", async () => {
			const minimalProfile = { id: "user123", username: "testuser" };
			const mockResponse = { success: true, msg: minimalProfile };
			mockUsersApi.getPublicProfile.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => usePublicProfile("testuser"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toEqual(minimalProfile);
			expect(result.current.notFound).toBe(false);
		});
	});

	describe("404 Not Found handling", () => {
		it("should set notFound to true when user is not found (404 error)", async () => {
			const notFoundError = { status: 404, message: "User not found" };
			mockUsersApi.getPublicProfile.mockRejectedValue(notFoundError);

			const { result } = renderHook(() =>
				usePublicProfile("nonexistentuser")
			);

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toBe(null);
			expect(result.current.error).toBe("Failed to fetch profile"); // Hook sets generic error message
			expect(result.current.notFound).toBe(true);
		});

		it("should handle 404 error with Error instance", async () => {
			const notFoundError = new Error("User not found");
			notFoundError.status = 404;
			mockUsersApi.getPublicProfile.mockRejectedValue(notFoundError);

			const { result } = renderHook(() =>
				usePublicProfile("nonexistentuser")
			);

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.notFound).toBe(true);
			expect(result.current.error).toBe("User not found");
		});
	});

	describe("Error handling (non-404)", () => {
		it("should handle API error with Error instance (non-404)", async () => {
			const errorMessage = "Server internal error";
			const mockError = new Error(errorMessage);
			mockUsersApi.getPublicProfile.mockRejectedValue(mockError);

			const { result } = renderHook(() => usePublicProfile("testuser"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toBe(null);
			expect(result.current.error).toBe(errorMessage);
			expect(result.current.notFound).toBe(false);
		});

		it("should handle API error without Error instance (non-404)", async () => {
			const mockError = { status: 500, message: "Internal server error" };
			mockUsersApi.getPublicProfile.mockRejectedValue(mockError);

			const { result } = renderHook(() => usePublicProfile("testuser"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toBe(null);
			expect(result.current.error).toBe("Failed to fetch profile");
			expect(result.current.notFound).toBe(false);
		});
	});

	describe("Username changes", () => {
		it("should refetch when username changes", async () => {
			const profile1 = { id: "user1", username: "user1" };
			const profile2 = { id: "user2", username: "user2" };

			mockUsersApi.getPublicProfile
				.mockResolvedValueOnce({ success: true, msg: profile1 })
				.mockResolvedValueOnce({ success: true, msg: profile2 });

			const { result, rerender } = renderHook(
				({ username }) => usePublicProfile(username),
				{ initialProps: { username: "user1" } }
			);

			// Wait for first profile to load
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});
			expect(result.current.profile).toEqual(profile1);

			// Change username
			rerender({ username: "user2" });

			// Wait for second profile to load
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toEqual(profile2);
			expect(mockUsersApi.getPublicProfile).toHaveBeenCalledTimes(2);
			expect(mockUsersApi.getPublicProfile).toHaveBeenNthCalledWith(
				1,
				"user1"
			);
			expect(mockUsersApi.getPublicProfile).toHaveBeenNthCalledWith(
				2,
				"user2"
			);
		});

		it("should reset all states when username changes", async () => {
			const notFoundError = { status: 404 };
			const validProfile = { id: "user2", username: "validuser" };

			mockUsersApi.getPublicProfile
				.mockRejectedValueOnce(notFoundError)
				.mockResolvedValueOnce({ success: true, msg: validProfile });

			const { result, rerender } = renderHook(
				({ username }) => usePublicProfile(username),
				{ initialProps: { username: "notfound" } }
			);

			// Wait for 404 error
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});
			expect(result.current.notFound).toBe(true);

			// Change to valid user
			rerender({ username: "validuser" });

			// Wait for successful fetch
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toEqual(validProfile);
			expect(result.current.error).toBe(null);
			expect(result.current.notFound).toBe(false);
		});
	});
});

import { renderHook, waitFor } from "@testing-library/react";
import { useProfile } from "../useProfile";
import { profileApi } from "../../../services/api/profile";

// Mock the profile API
jest.mock("../../../services/api/profile");
const mockProfileApi = profileApi as jest.Mocked<typeof profileApi>;

describe("useProfile", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Initial state", () => {
		it("should initialize with correct default values when userId provided", () => {
			const { result } = renderHook(() => useProfile("user123"));

			expect(result.current.profile).toBe(null);
			expect(result.current.loading).toBe(true); // Should be true since it auto-fetches
			expect(result.current.error).toBe(null);
		});

		it("should not fetch when userId is empty", () => {
			const { result } = renderHook(() => useProfile(""));

			expect(mockProfileApi.getPrivateProfile).not.toHaveBeenCalled();
			expect(result.current.loading).toBe(false);
		});

		it("should not fetch when userId is null", () => {
			const { result } = renderHook(() => useProfile(null));

			expect(mockProfileApi.getPrivateProfile).not.toHaveBeenCalled();
			expect(result.current.loading).toBe(false);
		});

		it("should not fetch when userId is undefined", () => {
			const { result } = renderHook(() => useProfile(undefined));

			expect(mockProfileApi.getPrivateProfile).not.toHaveBeenCalled();
			expect(result.current.loading).toBe(false);
		});
	});

	describe("Successful profile fetch", () => {
		it("should fetch profile data successfully", async () => {
			const mockProfileData = {
				id: "user123",
				username: "testuser",
				email: "test@example.com",
				profilePicture: "http://example.com/avatar.jpg",
				createdAt: "2024-01-01T00:00:00Z",
			};
			const mockResponse = { success: true, msg: mockProfileData };
			mockProfileApi.getPrivateProfile.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useProfile("user123"));

			// Wait for the profile to be fetched
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(mockProfileApi.getPrivateProfile).toHaveBeenCalledWith(
				"user123"
			);
			expect(result.current.profile).toEqual(mockProfileData);
			expect(result.current.error).toBe(null);
		});

		it("should handle profile data with minimal fields", async () => {
			const minimalProfile = { id: "user123", username: "testuser" };
			const mockResponse = { success: true, msg: minimalProfile };
			mockProfileApi.getPrivateProfile.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useProfile("user123"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toEqual(minimalProfile);
		});
	});

	describe("Error handling", () => {
		it("should handle API error with Error instance", async () => {
			const errorMessage = "Profile not found";
			const mockError = new Error(errorMessage);
			mockProfileApi.getPrivateProfile.mockRejectedValue(mockError);

			const { result } = renderHook(() => useProfile("user123"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toBe(null);
			expect(result.current.error).toBe(errorMessage);
		});

		it("should handle API error without Error instance", async () => {
			const mockError = { status: 404, message: "Not found" };
			mockProfileApi.getPrivateProfile.mockRejectedValue(mockError);

			const { result } = renderHook(() => useProfile("user123"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toBe(null);
			expect(result.current.error).toBe("Failed to fetch profile");
		});

		it("should handle network errors", async () => {
			const networkError = new Error("Network connection failed");
			mockProfileApi.getPrivateProfile.mockRejectedValue(networkError);

			const { result } = renderHook(() => useProfile("user123"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.error).toBe("Network connection failed");
		});
	});

	describe("UserId changes", () => {
		it("should refetch when userId changes", async () => {
			const profile1 = { id: "user1", username: "user1" };
			const profile2 = { id: "user2", username: "user2" };

			mockProfileApi.getPrivateProfile
				.mockResolvedValueOnce({ success: true, msg: profile1 })
				.mockResolvedValueOnce({ success: true, msg: profile2 });

			const { result, rerender } = renderHook(
				({ userId }) => useProfile(userId),
				{ initialProps: { userId: "user1" } }
			);

			// Wait for first profile to load
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});
			expect(result.current.profile).toEqual(profile1);

			// Change userId
			rerender({ userId: "user2" });

			// Wait for second profile to load
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toEqual(profile2);
			expect(mockProfileApi.getPrivateProfile).toHaveBeenCalledTimes(2);
			expect(mockProfileApi.getPrivateProfile).toHaveBeenNthCalledWith(
				1,
				"user1"
			);
			expect(mockProfileApi.getPrivateProfile).toHaveBeenNthCalledWith(
				2,
				"user2"
			);
		});

		it("should handle userId changing from empty to valid", async () => {
			const profile = { id: "user1", username: "user1" };
			mockProfileApi.getPrivateProfile.mockResolvedValue({
				success: true,
				msg: profile,
			});

			const { result, rerender } = renderHook(
				({ userId }) => useProfile(userId),
				{ initialProps: { userId: "" } }
			);

			expect(mockProfileApi.getPrivateProfile).not.toHaveBeenCalled();

			// Change to valid userId
			rerender({ userId: "user1" });

			// Wait for profile to load
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toEqual(profile);
			expect(mockProfileApi.getPrivateProfile).toHaveBeenCalledWith(
				"user1"
			);
		});

		it("should reset error state when userId changes", async () => {
			const mockError = new Error("Profile not found");
			const validProfile = { id: "user2", username: "user2" };

			mockProfileApi.getPrivateProfile
				.mockRejectedValueOnce(mockError)
				.mockResolvedValueOnce({ success: true, msg: validProfile });

			const { result, rerender } = renderHook(
				({ userId }) => useProfile(userId),
				{ initialProps: { userId: "invalid-user" } }
			);

			// Wait for error to occur
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});
			expect(result.current.error).toBe("Profile not found");

			// Change to valid user
			rerender({ userId: "user2" });

			// Wait for successful fetch
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toEqual(validProfile);
			expect(result.current.error).toBe(null);
		});
	});

	describe("Edge cases", () => {
		it("should handle API response without msg field", async () => {
			const mockResponse = { success: true }; // Missing msg field
			mockProfileApi.getPrivateProfile.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useProfile("user123"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toBe(undefined);
			expect(result.current.error).toBe(null);
		});

		it("should handle API response with null msg", async () => {
			const mockResponse = { success: true, msg: null };
			mockProfileApi.getPrivateProfile.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useProfile("user123"));

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.profile).toBe(null);
			expect(result.current.error).toBe(null);
		});
	});
});

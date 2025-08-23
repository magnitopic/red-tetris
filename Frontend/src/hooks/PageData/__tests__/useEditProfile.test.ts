import { renderHook, act } from "@testing-library/react";
import { useEditProfile } from "../useEditProfile";
import { profileApi } from "../../../services/api/profile";

// Mock the profile API
jest.mock("../../../services/api/profile");
const mockProfileApi = profileApi as jest.Mocked<typeof profileApi>;

describe("useEditProfile", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Initial state", () => {
		it("should initialize with correct default values", () => {
			const { result } = renderHook(() => useEditProfile());

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);
			expect(typeof result.current.uploadProfilePicture).toBe("function");
		});
	});

	describe("uploadProfilePicture", () => {
		it("should handle successful file upload", async () => {
			const mockFile = new File(["test"], "test.jpg", {
				type: "image/jpeg",
			});
			const mockResponse = { success: true, msg: "Upload successful" };
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useEditProfile());

			let uploadResult;
			await act(async () => {
				uploadResult = await result.current.uploadProfilePicture(
					"user123",
					mockFile
				);
			});

			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledWith(
				"user123",
				mockFile
			);
			expect(uploadResult).toEqual(mockResponse);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);
		});

		it("should handle upload error with message", async () => {
			const mockFile = new File(["test"], "test.jpg", {
				type: "image/jpeg",
			});
			const errorMessage = "File too large";
			const mockError = { message: errorMessage };
			mockProfileApi.uploadProfilePicture.mockRejectedValue(mockError);

			const { result } = renderHook(() => useEditProfile());

			await act(async () => {
				await expect(
					result.current.uploadProfilePicture("user123", mockFile)
				).rejects.toThrow(errorMessage);
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(errorMessage);
		});

		it("should handle upload error without message", async () => {
			const mockFile = new File(["test"], "test.jpg", {
				type: "image/jpeg",
			});
			const mockError = { status: 500 };
			mockProfileApi.uploadProfilePicture.mockRejectedValue(mockError);

			const { result } = renderHook(() => useEditProfile());

			await act(async () => {
				await expect(
					result.current.uploadProfilePicture("user123", mockFile)
				).rejects.toThrow("Failed to upload profile picture");
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(
				"Failed to upload profile picture"
			);
		});

		it("should clear error state before new upload", async () => {
			const mockFile = new File(["test"], "test.jpg", {
				type: "image/jpeg",
			});

			// First upload fails
			const mockError = { message: "Upload failed" };
			mockProfileApi.uploadProfilePicture.mockRejectedValueOnce(
				mockError
			);

			const { result } = renderHook(() => useEditProfile());

			// First upload with error
			await act(async () => {
				await expect(
					result.current.uploadProfilePicture("user123", mockFile)
				).rejects.toThrow("Upload failed");
			});

			expect(result.current.error).toBe("Upload failed");

			// Second upload succeeds
			const mockResponse = { success: true };
			mockProfileApi.uploadProfilePicture.mockResolvedValueOnce(
				mockResponse
			);

			await act(async () => {
				await result.current.uploadProfilePicture("user123", mockFile);
			});

			expect(result.current.error).toBe(null);
		});
	});

	describe("File handling", () => {
		it("should handle different file types", async () => {
			const mockResponse = { success: true };
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useEditProfile());

			// Test with PNG file
			const pngFile = new File(["test"], "test.png", {
				type: "image/png",
			});
			await act(async () => {
				await result.current.uploadProfilePicture("user123", pngFile);
			});

			// Test with JPEG file
			const jpegFile = new File(["test"], "test.jpeg", {
				type: "image/jpeg",
			});
			await act(async () => {
				await result.current.uploadProfilePicture("user123", jpegFile);
			});

			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledTimes(
				2
			);
			expect(mockProfileApi.uploadProfilePicture).toHaveBeenNthCalledWith(
				1,
				"user123",
				pngFile
			);
			expect(mockProfileApi.uploadProfilePicture).toHaveBeenNthCalledWith(
				2,
				"user123",
				jpegFile
			);
		});

		it("should handle files with different sizes", async () => {
			const mockResponse = { success: true };
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useEditProfile());

			const largeFile = new File(["x".repeat(1000000)], "large.jpg", {
				type: "image/jpeg",
			});

			await act(async () => {
				await result.current.uploadProfilePicture("user123", largeFile);
			});

			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledWith(
				"user123",
				largeFile
			);
		});
	});

	describe("User ID handling", () => {
		it("should handle different user ID formats", async () => {
			const mockResponse = { success: true };
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);
			const mockFile = new File(["test"], "test.jpg", {
				type: "image/jpeg",
			});

			const { result } = renderHook(() => useEditProfile());

			// Test with numeric ID
			await act(async () => {
				await result.current.uploadProfilePicture("123", mockFile);
			});

			// Test with UUID format
			await act(async () => {
				await result.current.uploadProfilePicture(
					"550e8400-e29b-41d4-a716-446655440000",
					mockFile
				);
			});

			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledTimes(
				2
			);
		});

		it("should handle empty user ID gracefully", async () => {
			const mockResponse = { success: true };
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);
			const mockFile = new File(["test"], "test.jpg", {
				type: "image/jpeg",
			});

			const { result } = renderHook(() => useEditProfile());

			await act(async () => {
				await result.current.uploadProfilePicture("", mockFile);
			});

			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledWith(
				"",
				mockFile
			);
		});
	});

	describe("State management", () => {
		it("should maintain independent state across multiple instances", () => {
			const { result: result1 } = renderHook(() => useEditProfile());
			const { result: result2 } = renderHook(() => useEditProfile());

			expect(result1.current.loading).toBe(false);
			expect(result2.current.loading).toBe(false);
			expect(result1.current.error).toBe(null);
			expect(result2.current.error).toBe(null);
		});

		it("should reset loading state after error", async () => {
			const mockFile = new File(["test"], "test.jpg", {
				type: "image/jpeg",
			});
			const mockError = { message: "Upload failed" };
			mockProfileApi.uploadProfilePicture.mockRejectedValue(mockError);

			const { result } = renderHook(() => useEditProfile());

			await act(async () => {
				await expect(
					result.current.uploadProfilePicture("user123", mockFile)
				).rejects.toThrow("Upload failed");
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe("Upload failed");
		});
	});

	describe("API interaction", () => {
		it("should call API with correct parameters", async () => {
			const mockResponse = { success: true };
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useEditProfile());
			const userId = "test-user-456";
			const mockFile = new File(["test content"], "profile.jpg", {
				type: "image/jpeg",
			});

			await act(async () => {
				await result.current.uploadProfilePicture(userId, mockFile);
			});

			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledWith(
				userId,
				mockFile
			);
			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledTimes(
				1
			);
		});

		it("should return API response data", async () => {
			const mockResponse = {
				success: true,
				msg: "Profile picture updated successfully",
				url: "http://example.com/new-avatar.jpg",
			};
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useEditProfile());
			const mockFile = new File(["test"], "test.jpg", {
				type: "image/jpeg",
			});

			let uploadResult;
			await act(async () => {
				uploadResult = await result.current.uploadProfilePicture(
					"user123",
					mockFile
				);
			});

			expect(uploadResult).toEqual(mockResponse);
		});
	});

	describe("Edge cases", () => {
		it("should handle very small files", async () => {
			const mockResponse = { success: true };
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useEditProfile());
			const tinyFile = new File(["a"], "tiny.jpg", {
				type: "image/jpeg",
			});

			await act(async () => {
				await result.current.uploadProfilePicture("user123", tinyFile);
			});

			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledWith(
				"user123",
				tinyFile
			);
		});

		it("should handle special characters in filenames", async () => {
			const mockResponse = { success: true };
			mockProfileApi.uploadProfilePicture.mockResolvedValue(mockResponse);

			const { result } = renderHook(() => useEditProfile());
			const specialFile = new File(["test"], "файл-тест_Ñoël.jpg", {
				type: "image/jpeg",
			});

			await act(async () => {
				await result.current.uploadProfilePicture(
					"user123",
					specialFile
				);
			});

			expect(mockProfileApi.uploadProfilePicture).toHaveBeenCalledWith(
				"user123",
				specialFile
			);
		});
	});
});

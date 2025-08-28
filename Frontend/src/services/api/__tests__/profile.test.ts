import { profileApi } from "../profile";
import apiRequest, { fileUploadRequest } from "../config";

// Mock the config module
jest.mock("../config", () => ({
	__esModule: true,
	default: jest.fn(),
	fileUploadRequest: jest.fn(),
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockFileUploadRequest = fileUploadRequest as jest.MockedFunction<
	typeof fileUploadRequest
>;

describe("profileApi", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getPrivateProfile", () => {
		it("fetches private profile data and handles responses correctly", async () => {
			// Test successful response
			const mockResponse = {
				success: true,
				data: {
					id: "user123",
					username: "testuser",
					email: "test@example.com",
					profile_picture: "https://example.com/profile.jpg",
				},
			};

			mockApiRequest.mockResolvedValue(mockResponse);
			const result = await profileApi.getPrivateProfile("user123");

			expect(mockApiRequest).toHaveBeenCalledWith("users/me");
			expect(result).toEqual(mockResponse);

			// Test with different userIds (should always call 'users/me')
			await profileApi.getPrivateProfile("user456");
			await profileApi.getPrivateProfile("");
			expect(mockApiRequest).toHaveBeenCalledTimes(3);
			expect(mockApiRequest).toHaveBeenNthCalledWith(2, "users/me");
			expect(mockApiRequest).toHaveBeenNthCalledWith(3, "users/me");

			// Test empty and malformed responses
			mockApiRequest.mockResolvedValue(null);
			expect(await profileApi.getPrivateProfile("user123")).toBeNull();

			mockApiRequest.mockResolvedValue({ success: true });
			expect(await profileApi.getPrivateProfile("user123")).toEqual({ success: true });

			mockApiRequest.mockResolvedValue({ unexpected: "format" });
			expect(await profileApi.getPrivateProfile("user123")).toEqual({ unexpected: "format" });
		});

		it("handles various error types correctly", async () => {
			// Test network error
			const mockError = new Error("Network error");
			mockApiRequest.mockRejectedValue(mockError);
			await expect(profileApi.getPrivateProfile("user123")).rejects.toThrow("Network error");

			// Test string error
			mockApiRequest.mockRejectedValue("String error");
			await expect(profileApi.getPrivateProfile("user123")).rejects.toBe("String error");

			// Test object error
			const objectError = { message: "Object error", code: 500 };
			mockApiRequest.mockRejectedValue(objectError);
			await expect(profileApi.getPrivateProfile("user123")).rejects.toBe(objectError);

			// Test undefined error
			mockApiRequest.mockRejectedValue(undefined);
			await expect(profileApi.getPrivateProfile("user123")).rejects.toBeUndefined();
		});
	});

	describe("uploadProfilePicture", () => {
		const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });

		it("uploads profile picture with correct parameters and FormData", async () => {
			const mockResponse = {
				success: true,
				msg: "Profile picture updated successfully",
				data: { profile_picture: "https://example.com/new-profile.jpg" },
			};

			mockFileUploadRequest.mockResolvedValue(mockResponse);
			const result = await profileApi.uploadProfilePicture("user123", mockFile);

			// Verify correct endpoint, method, and FormData
			expect(mockFileUploadRequest).toHaveBeenCalledWith(
				"users/user123/profile-picture",
				expect.any(FormData),
				"PUT"
			);
			expect(result).toEqual(mockResponse);

			// Check FormData content
			const callArgs = mockFileUploadRequest.mock.calls[0];
			const formData = callArgs[1] as FormData;
			expect(formData).toBeInstanceOf(FormData);
			expect(formData.get("files")).toBe(mockFile);
			expect(formData.get("file")).toBeNull(); // Should use 'files' key

			// Test with different userId
			await profileApi.uploadProfilePicture("user456", mockFile);
			expect(mockFileUploadRequest).toHaveBeenCalledWith(
				"users/user456/profile-picture",
				expect.any(FormData),
				"PUT"
			);
		});

		it("handles different file types and special cases", async () => {
			const mockResponse = { success: true };
			mockFileUploadRequest.mockResolvedValue(mockResponse);

			// Test different file types
			const pngFile = new File(["png content"], "test.png", { type: "image/png" });
			const gifFile = new File(["gif content"], "test.gif", { type: "image/gif" });
			const largeFile = new File(["x".repeat(1000000)], "large.jpg", { type: "image/jpeg" });

			await profileApi.uploadProfilePicture("user123", pngFile);
			await profileApi.uploadProfilePicture("user123", gifFile);
			await profileApi.uploadProfilePicture("user123", largeFile);

			expect(mockFileUploadRequest).toHaveBeenCalledTimes(3);

			// Verify correct files were passed
			const calls = mockFileUploadRequest.mock.calls;
			expect((calls[0][1] as FormData).get("files")).toBe(pngFile);
			expect((calls[1][1] as FormData).get("files")).toBe(gifFile);
			expect((calls[2][1] as FormData).get("files")).toBe(largeFile);

			// Test special userId cases
			jest.clearAllMocks();
			await profileApi.uploadProfilePicture("user@123_test!", mockFile);
			expect(mockFileUploadRequest).toHaveBeenCalledWith(
				"users/user@123_test!/profile-picture",
				expect.any(FormData),
				"PUT"
			);

			await profileApi.uploadProfilePicture("", mockFile);
			expect(mockFileUploadRequest).toHaveBeenCalledWith(
				"users//profile-picture",
				expect.any(FormData),
				"PUT"
			);
		});

		it("handles errors and edge cases correctly", async () => {
			// Test upload errors
			const mockError = new Error("Upload failed");
			mockFileUploadRequest.mockRejectedValue(mockError);
			await expect(profileApi.uploadProfilePicture("user123", mockFile)).rejects.toThrow("Upload failed");

			// Test server error responses
			const serverError = {
				response: { status: 413, data: { message: "File too large" } },
			};
			mockFileUploadRequest.mockRejectedValue(serverError);
			await expect(profileApi.uploadProfilePicture("user123", mockFile)).rejects.toBe(serverError);

			// Test timeout error
			const timeoutError = new Error("Request timeout");
			timeoutError.name = "TimeoutError";
			mockFileUploadRequest.mockRejectedValue(timeoutError);
			await expect(profileApi.uploadProfilePicture("user123", mockFile)).rejects.toThrow("Request timeout");

			// Test response variations
			mockFileUploadRequest.mockResolvedValue({ msg: "Profile updated" });
			expect(await profileApi.uploadProfilePicture("user123", mockFile)).toEqual({ msg: "Profile updated" });

			mockFileUploadRequest.mockResolvedValue(null);
			expect(await profileApi.uploadProfilePicture("user123", mockFile)).toBeNull();

			// Test undefined file (runtime behavior)
			mockFileUploadRequest.mockResolvedValue({ success: true });
			await profileApi.uploadProfilePicture("user123", undefined as any);
			const formData = mockFileUploadRequest.mock.calls[mockFileUploadRequest.mock.calls.length - 1][1] as FormData;
			expect(formData.get("files")).toBe("undefined");
		});

		it("handles concurrent operations and FormData isolation", async () => {
			const mockResponse = { success: true };
			mockFileUploadRequest.mockResolvedValue(mockResponse);

			const file1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
			const file2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });
			const longUserId = "a".repeat(1000);

			// Test concurrent uploads
			const promise1 = profileApi.uploadProfilePicture("user123", file1);
			const promise2 = profileApi.uploadProfilePicture("user456", file2);
			await Promise.all([promise1, promise2]);

			expect(mockFileUploadRequest).toHaveBeenCalledTimes(2);

			// Verify FormData instances are separate
			const calls = mockFileUploadRequest.mock.calls;
			const firstFormData = calls[calls.length - 2][1] as FormData;
			const secondFormData = calls[calls.length - 1][1] as FormData;
			expect(firstFormData).not.toBe(secondFormData);
			expect(firstFormData.get("files")).toBe(file1);
			expect(secondFormData.get("files")).toBe(file2);

			// Test very long userId
			await profileApi.uploadProfilePicture(longUserId, file1);
			expect(mockFileUploadRequest).toHaveBeenCalledWith(
				`users/${longUserId}/profile-picture`,
				expect.any(FormData),
				"PUT"
			);
		});
	});
});

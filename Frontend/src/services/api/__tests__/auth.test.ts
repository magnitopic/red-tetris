import { authApi } from "../auth";
import apiRequest from "../config";

// Mock the config module
jest.mock("../config");
const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("authApi", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("authenticate", () => {
		it("should authenticate user successfully", async () => {
			const userData = {
				username: "testuser",
				password: "Pass123@",
			};

			const mockUser = {
				id: "1",
				username: "testuser",
				oauth: false,
				iat: 123456,
				exp: 789012,
			};

			// Mock successful authenticate call
			mockApiRequest.mockResolvedValueOnce({ success: true });
			// Mock successful checkAuth call
			mockApiRequest.mockResolvedValueOnce({ msg: mockUser });

			const result = await authApi.authenticate(userData);

			expect(result).toEqual({
				success: true,
				message: "Authentication successful",
				user: mockUser,
			});

			expect(mockApiRequest).toHaveBeenCalledWith("auth/authenticate", {
				method: "POST",
				body: JSON.stringify(userData),
			});
			expect(mockApiRequest).toHaveBeenCalledWith("auth/status");
		});

		it("should handle authentication failure", async () => {
			const userData = {
				username: "testuser",
				password: "badpass",
			};

			const mockError = { message: "Invalid credentials" };
			mockApiRequest.mockRejectedValue(mockError);

			const result = await authApi.authenticate(userData);

			expect(result).toEqual({
				success: false,
				message: "Invalid credentials",
			});
		});
	});

	describe("logout", () => {
		it("should logout successfully", async () => {
			mockApiRequest.mockResolvedValue({ success: true });

			const result = await authApi.logout();

			expect(result).toEqual({
				success: true,
				message: "Logout successful",
			});

			expect(mockApiRequest).toHaveBeenCalledWith("auth/logout", {
				method: "POST",
			});
		});

		it("should handle logout failure", async () => {
			const mockError = { message: "Logout failed" };
			mockApiRequest.mockRejectedValue(mockError);

			const result = await authApi.logout();

			expect(result).toEqual({
				success: false,
				message: "Logout failed",
			});
		});
	});

	describe("checkAuth", () => {
		it("should check auth status successfully", async () => {
			const mockUser = {
				id: "1",
				username: "testuser",
				oauth: false,
				iat: 123456,
				exp: 789012,
			};

			mockApiRequest.mockResolvedValue({ msg: mockUser });

			const result = await authApi.checkAuth();

			expect(result).toEqual({
				success: true,
				user: mockUser,
			});

			expect(mockApiRequest).toHaveBeenCalledWith("auth/status");
		});

		it("should handle auth check failure", async () => {
			mockApiRequest.mockRejectedValue(new Error("Unauthorized"));

			const result = await authApi.checkAuth();

			expect(result).toEqual({
				success: false,
				user: null,
			});
		});
	});

	describe("oauth", () => {
		it("should handle OAuth successfully", async () => {
			const mockUser = {
				id: "1",
				username: "testuser",
				oauth: true,
				iat: 123456,
				exp: 789012,
			};

			// Mock successful OAuth call
			mockApiRequest.mockResolvedValueOnce({ success: true });
			// Mock successful checkAuth call
			mockApiRequest.mockResolvedValueOnce({ msg: mockUser });

			const result = await authApi.oauth("auth_code_123", "google");

			expect(result).toEqual({
				success: true,
				message: "OAuth login successful",
				user: mockUser,
			});

			expect(mockApiRequest).toHaveBeenCalledWith("auth/oauth/google", {
				method: "POST",
				body: JSON.stringify({ code: "auth_code_123" }),
			});
		});

		it("should handle OAuth failure", async () => {
			const mockError = { message: "OAuth failed" };
			mockApiRequest.mockRejectedValue(mockError);

			const result = await authApi.oauth("invalid_code", "github");

			expect(result).toEqual({
				success: false,
				message: "OAuth failed",
			});
		});
	});

	describe("confirmEmail", () => {
		it("should confirm email successfully", async () => {
			mockApiRequest.mockResolvedValue({ success: true });

			const result = await authApi.confirmEmail("confirmation_token");

			expect(result).toEqual({
				success: true,
				message: "Email confirmed",
			});

			expect(mockApiRequest).toHaveBeenCalledWith(
				"auth/confirm?token=confirmation_token"
			);
		});

		it("should handle email confirmation failure", async () => {
			const mockError = { message: "Invalid token" };
			mockApiRequest.mockRejectedValue(mockError);

			const result = await authApi.confirmEmail("invalid_token");

			expect(result).toEqual({
				success: false,
				message: "Invalid token",
			});
		});
	});

	describe("resetPassword", () => {
		it("should reset password successfully", async () => {
			mockApiRequest.mockResolvedValue({ success: true });

			const result = await authApi.resetPassword(
				"reset_token",
				"newpassword123"
			);

			expect(result).toEqual({
				success: true,
				message: "Password reset successful",
			});

			expect(mockApiRequest).toHaveBeenCalledWith(
				"auth/password/reset?token=reset_token",
				{
					method: "POST",
					body: JSON.stringify({ new_password: "newpassword123" }),
				}
			);
		});

		it("should handle password reset failure", async () => {
			const mockError = { message: "Invalid reset token" };
			mockApiRequest.mockRejectedValue(mockError);

			const result = await authApi.resetPassword(
				"invalid_token",
				"newpassword"
			);

			expect(result).toEqual({
				success: false,
				message: "Invalid reset token",
			});
		});
	});
});

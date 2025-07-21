import apiRequest from "./config";

interface RegisterData {
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
}

interface LoginData {
	username: string;
	password: string;
}

// Data for the new authenticate endpoint
interface AuthenticateData {
	username: string;
	password: string;
	profile_picture_url?: string;
}

// Basic user info from auth status
interface BasicUser {
	id: string;
	username: string;
	oauth: boolean;
	iat: number;
	exp: number;
}

interface AuthResponse {
	success: boolean;
	message: string;
	user?: BasicUser;
}

export type {
	BasicUser,
	RegisterData,
	LoginData,
	AuthenticateData,
	AuthResponse,
};

// Authentication service methods
export const authApi = {
	authenticate: async (userData: AuthenticateData): Promise<AuthResponse> => {
		try {
			await apiRequest("auth/authenticate", {
				method: "POST",
				body: JSON.stringify(userData),
			});
			// After successful authentication, fetch the user status
			const status = await authApi.checkAuth();
			return {
				success: true,
				message: "Authentication successful",
				user: status.user,
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Authentication failed",
			};
		}
	},

	logout: async (): Promise<AuthResponse> => {
		try {
			await apiRequest("auth/logout", { method: "POST" });
			return {
				success: true,
				message: "Logout successful",
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Logout failed",
			};
		}
	},

	checkAuth: async () => {
		try {
			const response = await apiRequest("auth/status");
			return {
				success: true,
				user: response.msg as BasicUser,
			};
		} catch {
			return {
				success: false,
				user: null,
			};
		}
	},

	oauth: async (code: string, provider: string): Promise<AuthResponse> => {
		try {
			await apiRequest(`auth/oauth/${provider}`, {
				method: "POST",
				body: JSON.stringify({ code }),
			});
			const status = await authApi.checkAuth();
			return {
				success: true,
				message: "OAuth login successful",
				user: status.user,
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "OAuth login failed",
			};
		}
	},

	confirmEmail: async (code: string): Promise<AuthResponse> => {
		try {
			await apiRequest(`auth/confirm?token=${code}`);
			return {
				success: true,
				message: "Email confirmed",
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Email confirmation failed",
			};
		}
	},

	resetPassword: async (
		code: string,
		new_password: string
	): Promise<AuthResponse> => {
		try {
			await apiRequest(`auth/password/reset?token=${code}`, {
				method: "POST",
				body: JSON.stringify({ new_password }),
			});
			return {
				success: true,
				message: "Password reset successful",
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Password reset failed",
			};
		}
	},
};

export default authApi;

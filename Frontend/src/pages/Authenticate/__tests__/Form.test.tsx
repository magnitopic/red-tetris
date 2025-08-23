import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AuthenticateForm from "../Form";
import { AuthProvider } from "../../../context/AuthContext";
import { authApi } from "../../../services/api/auth";

// Mock the auth API
jest.mock("../../../services/api/auth");
const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigate,
}));

// Mock OAuth button components to simplify testing
jest.mock("../../../components/common/oauthButtons/OauthGoogleButton", () => {
	return function MockOauthGoogleButton({ action, disabled }: any) {
		return (
			<button
				data-testid="oauth-google"
				disabled={disabled}
				onClick={() => window.location.href = "mock-google-url"}
			>
				{action} with Google
			</button>
		);
	};
});

jest.mock("../../../components/common/oauthButtons/Oauth42Button", () => {
	return function MockOauth42Button({ action, disabled }: any) {
		return (
			<button
				data-testid="oauth-42"
				disabled={disabled}
				onClick={() => window.location.href = "mock-42-url"}
			>
				{action} with 42
			</button>
		);
	};
});

jest.mock("../../../components/common/oauthButtons/OauthGithubButton", () => {
	return function MockOauthGithubButton({ action, disabled }: any) {
		return (
			<button
				data-testid="oauth-github"
				disabled={disabled}
				onClick={() => window.location.href = "mock-github-url"}
			>
				{action} with Github
			</button>
		);
	};
});

jest.mock("../../../components/common/oauthButtons/OauthTwitchButton", () => {
	return function MockOauthTwitchButton({ action, disabled }: any) {
		return (
			<button
				data-testid="oauth-twitch"
				disabled={disabled}
				onClick={() => window.location.href = "mock-twitch-url"}
			>
				{action} with Twitch
			</button>
		);
	};
});

// Helper function to render the form with providers
const renderAuthenticateForm = () => {
	return render(
		<MemoryRouter>
			<AuthProvider>
				<AuthenticateForm />
			</AuthProvider>
		</MemoryRouter>
	);
};

describe("Authenticate Form", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	describe("Rendering", () => {
		it("should render the authentication form correctly", () => {
			renderAuthenticateForm();

			// Use a more specific selector since form role might not be exposed
			const form = document.querySelector("form");
			expect(form).toBeInTheDocument();
			expect(screen.getByPlaceholderText("Username*")).toBeInTheDocument();
			expect(screen.getByPlaceholderText("Password*")).toBeInTheDocument();
			expect(screen.getByText("Login or Sign Up")).toBeInTheDocument();
		});

		it("should render all OAuth buttons", () => {
			renderAuthenticateForm();

			expect(screen.getByTestId("oauth-google")).toBeInTheDocument();
			expect(screen.getByTestId("oauth-42")).toBeInTheDocument();
			expect(screen.getByTestId("oauth-github")).toBeInTheDocument();
			expect(screen.getByTestId("oauth-twitch")).toBeInTheDocument();
		});

		it("should render instructional text", () => {
			renderAuthenticateForm();

			expect(screen.getByText("Or enter your credentials to login or create an account")).toBeInTheDocument();
		});

		it("should have correct form structure", () => {
			renderAuthenticateForm();

			const form = document.querySelector("form");
			expect(form).toHaveClass("flex", "gap-8", "flex-col", "items-center");
		});
	});

	describe("Form Inputs", () => {
		it("should update username input when user types", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*") as HTMLInputElement;
			await user.type(usernameInput, "testuser");

			expect(usernameInput.value).toBe("testuser");
		});

		it("should update password input when user types", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			renderAuthenticateForm();

			const passwordInput = screen.getByPlaceholderText("Password*") as HTMLInputElement;
			await user.type(passwordInput, "password123");

			expect(passwordInput.value).toBe("password123");
		});

		it("should have correct input types", () => {
			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*") as HTMLInputElement;
			const passwordInput = screen.getByPlaceholderText("Password*") as HTMLInputElement;

			expect(usernameInput.type).toBe("text");
			expect(passwordInput.type).toBe("password");
		});

		it("should clear form inputs after successful submission", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: true,
				message: "Login successful",
				user: { id: "1", username: "testuser", oauth: false, iat: 0, exp: 0 },
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*") as HTMLInputElement;
			const passwordInput = screen.getByPlaceholderText("Password*") as HTMLInputElement;
			const submitButton = screen.getByRole("button", { name: /login or sign up/i });

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			await waitFor(() => {
				expect(usernameInput.value).toBe("");
				expect(passwordInput.value).toBe("");
			});
		});
	});

	describe("Form Submission", () => {
		it("should call authenticate function with correct data on submission", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: true,
				message: "Login successful",
				user: { id: "1", username: "testuser", oauth: false, iat: 0, exp: 0 },
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockAuthApi.authenticate).toHaveBeenCalledWith({
					username: "testuser",
					password: "password123",
				});
			});
		});

		it("should navigate to profile page after successful authentication", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: true,
				message: "Login successful",
				user: { id: "1", username: "testuser", oauth: false, iat: 0, exp: 0 },
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			// Fast-forward the setTimeout
			jest.advanceTimersByTime(1000);

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith("/profile");
			});
		});

		it("should show success message after successful authentication", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: true,
				message: "Welcome back!",
				user: { id: "1", username: "testuser", oauth: false, iat: 0, exp: 0 },
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			expect(await screen.findByText("Welcome back!")).toBeInTheDocument();
		});

		it("should show error message on authentication failure", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: false,
				message: "Invalid credentials",
				user: null,
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "wronguser");
			await user.type(passwordInput, "wrongpassword");
			await user.click(submitButton);

			expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
		});

		it("should prevent form submission when already submitting", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			// Mock a delayed response
			mockAuthApi.authenticate.mockImplementation(
				() => new Promise(resolve => setTimeout(() => resolve({
					success: true,
					message: "Success",
					user: { id: "1", username: "testuser", oauth: false, iat: 0, exp: 0 },
				}), 100))
			);

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			
			// Click submit button twice quickly
			await user.click(submitButton);
			await user.click(submitButton);

			// Should only be called once
			expect(mockAuthApi.authenticate).toHaveBeenCalledTimes(1);
		});
	});

	describe("Loading States", () => {
		it("should disable form inputs while submitting", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			// Mock a delayed response
			let resolveAuth: (value: any) => void;
			mockAuthApi.authenticate.mockReturnValue(
				new Promise(resolve => { resolveAuth = resolve; })
			);

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*") as HTMLInputElement;
			const passwordInput = screen.getByPlaceholderText("Password*") as HTMLInputElement;
			const submitButton = screen.getByText("Login or Sign Up") as HTMLButtonElement;

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			// Inputs and button should be disabled
			expect(usernameInput.disabled).toBe(true);
			expect(passwordInput.disabled).toBe(true);
			expect(submitButton.disabled).toBe(true);

			// Resolve the promise
			resolveAuth!({
				success: true,
				message: "Success",
				user: { id: "1", username: "testuser", oauth: false, iat: 0, exp: 0 },
			});

			await waitFor(() => {
				expect(usernameInput.disabled).toBe(false);
				expect(passwordInput.disabled).toBe(false);
				expect(submitButton.disabled).toBe(false);
			});
		});

		it("should disable OAuth buttons while submitting", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			// Mock a delayed response
			let resolveAuth: (value: any) => void;
			mockAuthApi.authenticate.mockReturnValue(
				new Promise(resolve => { resolveAuth = resolve; })
			);

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByRole("button", { name: /login or sign up/i });

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			// OAuth buttons should be disabled
			expect(screen.getByTestId("oauth-google")).toBeDisabled();
			expect(screen.getByTestId("oauth-42")).toBeDisabled();
			expect(screen.getByTestId("oauth-github")).toBeDisabled();
			expect(screen.getByTestId("oauth-twitch")).toBeDisabled();

			// Resolve the promise
			resolveAuth!({
				success: true,
				message: "Success",
				user: { id: "1", username: "testuser", oauth: false, iat: 0, exp: 0 },
			});

			await waitFor(() => {
				expect(screen.getByTestId("oauth-google")).not.toBeDisabled();
				expect(screen.getByTestId("oauth-42")).not.toBeDisabled();
				expect(screen.getByTestId("oauth-github")).not.toBeDisabled();
				expect(screen.getByTestId("oauth-twitch")).not.toBeDisabled();
			});
		});
	});

	describe("OAuth Functionality", () => {
		it("should render OAuth buttons with correct text", () => {
			renderAuthenticateForm();

			expect(screen.getByText("Login with Google")).toBeInTheDocument();
			expect(screen.getByText("Login with 42")).toBeInTheDocument();
			expect(screen.getByText("Login with Github")).toBeInTheDocument();
			expect(screen.getByText("Login with Twitch")).toBeInTheDocument();
		});

		it("should have OAuth buttons in grid layout", () => {
			renderAuthenticateForm();

			const oauthContainer = screen.getByTestId("oauth-google").closest(".grid");
			expect(oauthContainer).toHaveClass("grid", "grid-cols-2", "gap-4", "w-full");
		});
	});

	describe("Message Handling", () => {
		it("should close message when close button is clicked", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: false,
				message: "Error occurred",
				user: null,
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			// Wait for error message to appear
			expect(await screen.findByText("Error occurred")).toBeInTheDocument();

			// Find and click close button
			const closeButton = screen.getByText("×");
			await user.click(closeButton);

			// Wait for message to disappear
			await waitFor(() => {
				expect(screen.queryByText("Error occurred")).not.toBeInTheDocument();
			});
		});

		it("should show messages with unique keys for re-rendering", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			
			// First submission - error
			mockAuthApi.authenticate.mockResolvedValueOnce({
				success: false,
				message: "First error",
				user: null,
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			expect(await screen.findByText("First error")).toBeInTheDocument();

			// Second submission - different error
			mockAuthApi.authenticate.mockResolvedValueOnce({
				success: false,
				message: "Second error",
				user: null,
			});

			await user.click(submitButton);

			expect(await screen.findByText("Second error")).toBeInTheDocument();
			expect(screen.queryByText("First error")).not.toBeInTheDocument();
		});
	});

	describe("Form Validation", () => {
		it("should handle empty form submission", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: false,
				message: "Username and password are required",
				user: null,
			});

			renderAuthenticateForm();

			const submitButton = screen.getByText("Login or Sign Up");
			await user.click(submitButton);

			expect(mockAuthApi.authenticate).toHaveBeenCalledWith({
				username: "",
				password: "",
			});
		});

		it("should handle only username provided", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: false,
				message: "Password is required",
				user: null,
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.click(submitButton);

			expect(mockAuthApi.authenticate).toHaveBeenCalledWith({
				username: "testuser",
				password: "",
			});
		});

		it("should handle special characters in inputs", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: true,
				message: "Success",
				user: { id: "1", username: "test@user", oauth: false, iat: 0, exp: 0 },
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "test@user#123");
			await user.type(passwordInput, "p@ssw0rd!@#");
			await user.click(submitButton);

			expect(mockAuthApi.authenticate).toHaveBeenCalledWith({
				username: "test@user#123",
				password: "p@ssw0rd!@#",
			});
		});
	});

	describe("Styling and Layout", () => {
		it("should have correct form container styling", () => {
			renderAuthenticateForm();

			const container = document.querySelector("form")?.closest("div");
			expect(container).toHaveClass("shadow-md", "p-10", "rounded", "max-w-3xl", "bg-background-secondary");
		});

		it("should have correct OAuth grid layout", () => {
			renderAuthenticateForm();

			const oauthContainer = screen.getByTestId("oauth-google").closest(".grid");
			expect(oauthContainer).toHaveClass("grid", "grid-cols-2", "gap-4", "w-full");
		});

		it("should have correct form layout", () => {
			renderAuthenticateForm();

			const form = document.querySelector("form");
			expect(form).toHaveClass("flex", "gap-8", "flex-col", "items-center");
		});
	});

	describe("Edge Cases", () => {
		it("should handle component unmounting during submission", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockImplementation(
				() => new Promise(() => {}) // Never resolves
			);

			const { unmount } = renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			// Should not throw error when unmounting during pending submission
			expect(() => unmount()).not.toThrow();
		});

		it("should handle rapid form submissions", async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			mockAuthApi.authenticate.mockResolvedValue({
				success: true,
				message: "Success",
				user: { id: "1", username: "testuser", oauth: false, iat: 0, exp: 0 },
			});

			renderAuthenticateForm();

			const usernameInput = screen.getByPlaceholderText("Username*");
			const passwordInput = screen.getByPlaceholderText("Password*");
			const submitButton = screen.getByText("Login or Sign Up");

			await user.type(usernameInput, "testuser");
			await user.type(passwordInput, "password123");

			// Submit multiple times rapidly
			await user.click(submitButton);
			await user.click(submitButton);
			await user.click(submitButton);

			// Should handle gracefully without duplicate calls
			await waitFor(() => {
				expect(mockAuthApi.authenticate).toHaveBeenCalledTimes(1);
			});
		});
	});
});

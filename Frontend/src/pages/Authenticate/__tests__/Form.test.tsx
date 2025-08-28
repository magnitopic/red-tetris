import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AuthenticateForm from "../Form";
import { AuthProvider } from "../../../context/AuthContext";
import { authApi } from "../../../services/api/auth";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock the auth API
jest.mock("../../../services/api/auth");
const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigate,
}));

// Mock OAuth button components
jest.mock(
	"../../../components/common/oauthButtons/OauthGoogleButton",
	() =>
		({ action, disabled }: any) =>
			(
				<button data-testid="oauth-google" disabled={disabled}>
					{action} with Google
				</button>
			)
);

jest.mock(
	"../../../components/common/oauthButtons/Oauth42Button",
	() =>
		({ action, disabled }: any) =>
			(
				<button data-testid="oauth-42" disabled={disabled}>
					{action} with 42
				</button>
			)
);

jest.mock(
	"../../../components/common/oauthButtons/OauthGithubButton",
	() =>
		({ action, disabled }: any) =>
			(
				<button data-testid="oauth-github" disabled={disabled}>
					{action} with Github
				</button>
			)
);

jest.mock(
	"../../../components/common/oauthButtons/OauthTwitchButton",
	() =>
		({ action, disabled }: any) =>
			(
				<button data-testid="oauth-twitch" disabled={disabled}>
					{action} with Twitch
				</button>
			)
);

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

	it("renders form structure and components correctly", () => {
		renderAuthenticateForm();

		// Form elements
		expect(document.querySelector("form")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Username*")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Password*")).toBeInTheDocument();
		expect(screen.getByText("Login or Sign Up")).toBeInTheDocument();

		// OAuth buttons
		expect(screen.getByTestId("oauth-google")).toBeInTheDocument();
		expect(screen.getByTestId("oauth-42")).toBeInTheDocument();
		expect(screen.getByTestId("oauth-github")).toBeInTheDocument();
		expect(screen.getByTestId("oauth-twitch")).toBeInTheDocument();

		// Instructional text
		expect(
			screen.getByText(
				"Or enter your credentials to login or create an account"
			)
		).toBeInTheDocument();

		// Styling classes
		const form = document.querySelector("form");
		expect(form).toHaveClass("flex", "gap-8", "flex-col", "items-center");

		const container = form?.closest("div");
		expect(container).toHaveClass(
			"shadow-md",
			"p-10",
			"rounded",
			"max-w-3xl",
			"bg-background-secondary"
		);
	});

	it("handles form input and successful submission workflow", async () => {
		const user = userEvent.setup({
			advanceTimers: jest.advanceTimersByTime,
		});
		mockAuthApi.authenticate.mockResolvedValue({
			success: true,
			message: "Welcome back!",
			user: {
				id: "1",
				username: "testuser",
				oauth: false,
				iat: 0,
				exp: 0,
			},
		});

		renderAuthenticateForm();

		const usernameInput = screen.getByPlaceholderText(
			"Username*"
		) as HTMLInputElement;
		const passwordInput = screen.getByPlaceholderText(
			"Password*"
		) as HTMLInputElement;
		const submitButton = screen.getByText("Login or Sign Up");

		// Test input changes
		await user.type(usernameInput, "testuser");
		await user.type(passwordInput, "password123");
		expect(usernameInput.value).toBe("testuser");
		expect(passwordInput.value).toBe("password123");

		// Test form submission
		await user.click(submitButton);

		// Verify API call
		await waitFor(() => {
			expect(mockAuthApi.authenticate).toHaveBeenCalledWith({
				username: "testuser",
				password: "password123",
			});
		});

		// Verify success message and navigation
		expect(await screen.findByText("Welcome back!")).toBeInTheDocument();

		jest.advanceTimersByTime(1000);
		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/profile");
		});

		// Verify form is cleared
		await waitFor(() => {
			expect(usernameInput.value).toBe("");
			expect(passwordInput.value).toBe("");
		});
	});

	it("handles authentication failure and error display", async () => {
		const user = userEvent.setup({
			advanceTimers: jest.advanceTimersByTime,
		});
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

		// Verify error message appears
		expect(
			await screen.findByText("Invalid credentials")
		).toBeInTheDocument();

		// Test message dismissal
		const closeButton = screen.getByText("×");
		await user.click(closeButton);

		await waitFor(() => {
			expect(
				screen.queryByText("Invalid credentials")
			).not.toBeInTheDocument();
		});
	});

	it("handles loading states and prevents duplicate submissions", async () => {
		const user = userEvent.setup({
			advanceTimers: jest.advanceTimersByTime,
		});

		let resolveAuth: (value: any) => void;
		mockAuthApi.authenticate.mockReturnValue(
			new Promise((resolve) => {
				resolveAuth = resolve;
			})
		);

		renderAuthenticateForm();

		const usernameInput = screen.getByPlaceholderText(
			"Username*"
		) as HTMLInputElement;
		const passwordInput = screen.getByPlaceholderText(
			"Password*"
		) as HTMLInputElement;
		const submitButton = screen.getByText(
			"Login or Sign Up"
		) as HTMLButtonElement;

		await user.type(usernameInput, "testuser");
		await user.type(passwordInput, "password123");
		await user.click(submitButton);

		// Verify all form elements are disabled during submission
		expect(usernameInput.disabled).toBe(true);
		expect(passwordInput.disabled).toBe(true);
		expect(submitButton.disabled).toBe(true);
		expect(screen.getByTestId("oauth-google")).toBeDisabled();

		// Test rapid submissions prevention
		await user.click(submitButton);
		await user.click(submitButton);
		expect(mockAuthApi.authenticate).toHaveBeenCalledTimes(1);

		// Resolve and verify re-enabling
		resolveAuth!({
			success: true,
			message: "Success",
			user: {
				id: "1",
				username: "testuser",
				oauth: false,
				iat: 0,
				exp: 0,
			},
		});

		await waitFor(() => {
			expect(usernameInput.disabled).toBe(false);
			expect(passwordInput.disabled).toBe(false);
			expect(submitButton.disabled).toBe(false);
		});
	});

	it("handles edge cases and special input scenarios", async () => {
		const user = userEvent.setup({
			advanceTimers: jest.advanceTimersByTime,
		});

		// Test 1: Empty form submission
		renderAuthenticateForm();
		const submitButton = screen.getByText("Login or Sign Up");

		mockAuthApi.authenticate.mockResolvedValueOnce({
			success: false,
			message: "Username and password are required",
			user: null,
		});

		await user.click(submitButton);
		expect(mockAuthApi.authenticate).toHaveBeenCalledWith({
			username: "",
			password: "",
		});

		cleanup();

		// Test 2: Special characters input
		renderAuthenticateForm();
		const usernameInput = screen.getByPlaceholderText("Username*");
		const passwordInput = screen.getByPlaceholderText("Password*");
		const submitButton2 = screen.getByText("Login or Sign Up");

		mockAuthApi.authenticate.mockResolvedValueOnce({
			success: true,
			message: "Success",
			user: {
				id: "1",
				username: "test@user",
				oauth: false,
				iat: 0,
				exp: 0,
			},
		});

		await user.type(usernameInput, "test@user#123");
		await user.type(passwordInput, "p@ssw0rd!@#");
		await user.click(submitButton2);

		expect(mockAuthApi.authenticate).toHaveBeenCalledWith({
			username: "test@user#123",
			password: "p@ssw0rd!@#",
		});

		cleanup();

		// Test 3: Component unmounting during submission
		const { unmount } = renderAuthenticateForm();
		mockAuthApi.authenticate.mockImplementation(
			() => new Promise(() => {})
		);

		const usernameInput3 = screen.getByPlaceholderText("Username*");
		const passwordInput3 = screen.getByPlaceholderText("Password*");
		const submitButton3 = screen.getByText("Login or Sign Up");

		await user.type(usernameInput3, "testuser");
		await user.type(passwordInput3, "password123");
		await user.click(submitButton3);

		expect(() => unmount()).not.toThrow();
	});
});

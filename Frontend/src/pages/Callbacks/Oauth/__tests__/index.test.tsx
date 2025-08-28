import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import OauthCallback from "../index";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

jest.mock("../../../../context/AuthContext", () => ({
	useAuth: jest.fn(),
}));

jest.mock("../../../../components/common/RegularButton", () => {
	return function MockRegularButton({
		callback,
		value,
	}: {
		callback: () => void;
		value: string;
	}) {
		return <button onClick={callback}>{value}</button>;
	};
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigate,
}));

describe("OAuth Callback Component", () => {
	const mockOauth = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		jest.clearAllTimers();
		jest.useFakeTimers();

		mockUseAuth.mockReturnValue({
			oauth: mockOauth,
			isAuthenticated: false,
			user: null,
			login: jest.fn(),
			logout: jest.fn(),
			checkAuth: jest.fn(),
			refreshUser: jest.fn(),
		});
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	const renderWithRouter = (initialEntries: string[] = ["/"]) => {
		return render(
			<MemoryRouter initialEntries={initialEntries}>
				<OauthCallback />
			</MemoryRouter>
		);
	};

	it("shows initial loading state and authenticates with valid parameters", async () => {
		mockOauth.mockResolvedValue({ success: true });
		renderWithRouter(["/oauth?code=test123&provider=github"]);

		// Check initial loading state
		expect(screen.getByText("Authenticating you... hold on...")).toBeInTheDocument();
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveClass("text-xl", "font-bold", "max-w-xl");

		// Wait for authentication
		await waitFor(() => {
			expect(mockOauth).toHaveBeenCalledWith("test123", "github");
		});
	});

	it("handles missing or invalid authorization parameters", async () => {
		const testCases = [
			{ url: "/oauth?provider=github", expectedMessage: "No authorization code found. Please try to login again." },
			{ url: "/oauth?code=test123&provider=invalid", expectedMessage: "Invalid provider. Please try to login again." },
			{ url: "/oauth", expectedMessage: "No authorization code found. Please try to login again." }
		];

		for (const { url, expectedMessage } of testCases) {
			const { unmount } = renderWithRouter([url]);
			
			await waitFor(() => {
				expect(screen.getByText(expectedMessage)).toBeInTheDocument();
				expect(screen.getByText("Back to login form")).toBeInTheDocument();
				const heading = screen.getByRole("heading", { level: 1 });
				expect(heading).toHaveClass("text-red-400");
			});

			unmount();
		}
	});

	it("handles different OAuth providers correctly", async () => {
		const validProviders = ["github", "google", "twitch", "42"];

		for (const provider of validProviders) {
			jest.clearAllMocks();
			mockOauth.mockResolvedValue({ success: true });

			const { unmount } = renderWithRouter([`/oauth?code=test123&provider=${provider}`]);

			await waitFor(() => {
				expect(mockOauth).toHaveBeenCalledWith("test123", provider);
			});

			unmount();
		}

		// Test default provider
		jest.clearAllMocks();
		mockOauth.mockResolvedValue({ success: true });
		renderWithRouter(["/oauth?code=test123"]);

		await waitFor(() => {
			expect(mockOauth).toHaveBeenCalledWith("test123", "42");
		});
	});

	it("handles successful authentication and redirects", async () => {
		mockOauth.mockResolvedValue({ success: true });
		renderWithRouter(["/oauth?code=test123&provider=github"]);

		await waitFor(() => {
			expect(screen.getByText("Authentication successful! Redirecting...")).toBeInTheDocument();
			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("text-green-600");
		});

		jest.advanceTimersByTime(1000);
		expect(mockNavigate).toHaveBeenCalledWith("/profile");
	});

	it("handles authentication failures and errors", async () => {
		// Test OAuth rejection
		mockOauth.mockResolvedValue({ 
			success: false, 
			message: "Custom error message from server" 
		});
		
		const { unmount } = renderWithRouter(["/oauth?code=test123&provider=github"]);

		await waitFor(() => {
			expect(screen.getByText("Custom error message from server")).toBeInTheDocument();
			expect(screen.getByText("Back to login form")).toBeInTheDocument();
			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("text-red-400");
		});

		unmount();

		// Test OAuth exception
		jest.clearAllMocks();
		mockOauth.mockRejectedValue(new Error("Network error"));
		
		renderWithRouter(["/oauth?code=test123&provider=github"]);

		await waitFor(() => {
			expect(screen.getByText("An error occurred during authentication. Please try again.")).toBeInTheDocument();
		});
	});

	it("navigates back to authenticate page when back button is clicked", async () => {
		renderWithRouter(["/oauth?provider=github"]);

		await waitFor(() => {
			expect(screen.getByText("Back to login form")).toBeInTheDocument();
		});

		const backButton = screen.getByText("Back to login form");
		backButton.click();

		expect(mockNavigate).toHaveBeenCalledWith("/authenticate");
	});
});

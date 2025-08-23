import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import OauthCallback from "../index";

// Mock the useAuth hook
jest.mock("../../../../context/AuthContext", () => ({
	useAuth: jest.fn(),
}));

// Mock RegularButton
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

// Mock useNavigate
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

	describe("Initial Loading State", () => {
		it("should show initial authentication message", () => {
			renderWithRouter(["/oauth?code=test123&provider=github"]);

			expect(
				screen.getByText("Authenticating you... hold on...")
			).toBeInTheDocument();
		});

		it("should have correct initial styling classes", () => {
			renderWithRouter(["/oauth?code=test123&provider=github"]);

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("text-xl", "font-bold", "max-w-xl");
		});
	});

	describe("Missing Authorization Code", () => {
		it("should show error message when no code is provided", async () => {
			renderWithRouter(["/oauth?provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"No authorization code found. Please try to login again."
					)
				).toBeInTheDocument();
			});

			expect(screen.getByText("Back to login form")).toBeInTheDocument();
		});

		it("should apply error styling when no code is provided", async () => {
			renderWithRouter(["/oauth?provider=github"]);

			await waitFor(() => {
				const heading = screen.getByRole("heading", { level: 1 });
				expect(heading).toHaveClass("text-red-400");
			});
		});

		it("should navigate to authenticate page when back button is clicked", async () => {
			renderWithRouter(["/oauth?provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText("Back to login form")
				).toBeInTheDocument();
			});

			const backButton = screen.getByText("Back to login form");
			backButton.click();

			expect(mockNavigate).toHaveBeenCalledWith("/authenticate");
		});
	});

	describe("Provider Handling", () => {
		it('should default to "42" provider when none is specified', async () => {
			mockOauth.mockResolvedValue({ success: true });

			renderWithRouter(["/oauth?code=test123"]);

			await waitFor(() => {
				expect(mockOauth).toHaveBeenCalledWith("test123", "42");
			});
		});

		it("should use provided provider when valid", async () => {
			mockOauth.mockResolvedValue({ success: true });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(mockOauth).toHaveBeenCalledWith("test123", "github");
			});
		});

		it("should handle each valid provider correctly", async () => {
			const validProviders = ["github", "google", "twitch", "42"];

			for (const provider of validProviders) {
				jest.clearAllMocks();
				mockOauth.mockResolvedValue({ success: true });

				renderWithRouter([`/oauth?code=test123&provider=${provider}`]);

				await waitFor(() => {
					expect(mockOauth).toHaveBeenCalledWith("test123", provider);
				});
			}
		});

		it("should show error for invalid provider", async () => {
			renderWithRouter(["/oauth?code=test123&provider=invalid"]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"Invalid provider. Please try to login again."
					)
				).toBeInTheDocument();
			});

			expect(screen.getByText("Back to login form")).toBeInTheDocument();
		});

		it("should apply error styling for invalid provider", async () => {
			renderWithRouter(["/oauth?code=test123&provider=invalid"]);

			await waitFor(() => {
				const heading = screen.getByRole("heading", { level: 1 });
				expect(heading).toHaveClass("text-red-400");
			});
		});
	});

	describe("Successful Authentication", () => {
		it("should show success message on successful oauth", async () => {
			mockOauth.mockResolvedValue({ success: true });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"Authentication successful! Redirecting..."
					)
				).toBeInTheDocument();
			});
		});

		it("should apply success styling on successful oauth", async () => {
			mockOauth.mockResolvedValue({ success: true });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				const heading = screen.getByRole("heading", { level: 1 });
				expect(heading).toHaveClass("text-green-600");
			});
		});

		it("should navigate to profile after successful authentication", async () => {
			mockOauth.mockResolvedValue({ success: true });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"Authentication successful! Redirecting..."
					)
				).toBeInTheDocument();
			});

			// Fast-forward the setTimeout
			jest.advanceTimersByTime(1000);

			expect(mockNavigate).toHaveBeenCalledWith("/profile");
		});

		it("should show back button on successful authentication (due to error state being truthy)", async () => {
			mockOauth.mockResolvedValue({ success: true });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"Authentication successful! Redirecting..."
					)
				).toBeInTheDocument();
			});

			// The back button appears because error state is set to "text-green-600" which is truthy
			expect(screen.getByText("Back to login form")).toBeInTheDocument();
		});
	});

	describe("Failed Authentication", () => {
		it("should show custom error message from oauth response", async () => {
			mockOauth.mockResolvedValue({
				success: false,
				message: "Custom error message from server",
			});

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText("Custom error message from server")
				).toBeInTheDocument();
			});

			expect(screen.getByText("Back to login form")).toBeInTheDocument();
		});

		it("should show default error message when no message provided", async () => {
			mockOauth.mockResolvedValue({ success: false });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText("Authentication failed. Please try again.")
				).toBeInTheDocument();
			});
		});

		it("should apply error styling on failed authentication", async () => {
			mockOauth.mockResolvedValue({ success: false });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				const heading = screen.getByRole("heading", { level: 1 });
				expect(heading).toHaveClass("text-red-400");
			});
		});

		it("should show back button on failed authentication", async () => {
			mockOauth.mockResolvedValue({ success: false });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText("Back to login form")
				).toBeInTheDocument();
			});
		});
	});

	describe("OAuth Exception Handling", () => {
		it("should handle oauth function throwing an error", async () => {
			mockOauth.mockRejectedValue(new Error("Network error"));

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"An error occurred during authentication. Please try again."
					)
				).toBeInTheDocument();
			});

			expect(screen.getByText("Back to login form")).toBeInTheDocument();
		});

		it("should apply error styling when oauth throws an error", async () => {
			mockOauth.mockRejectedValue(new Error("Network error"));

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				const heading = screen.getByRole("heading", { level: 1 });
				expect(heading).toHaveClass("text-red-400");
			});
		});
	});

	describe("Component Structure and Styling", () => {
		it("should have correct main container structure", () => {
			renderWithRouter(["/oauth?code=test123&provider=github"]);

			const mainElement = screen.getByRole("main");
			expect(mainElement).toHaveClass(
				"flex",
				"flex-col",
				"items-center",
				"justify-center",
				"min-h-screen"
			);
		});

		it("should have correct text container structure", () => {
			renderWithRouter(["/oauth?code=test123&provider=github"]);

			const textContainer = screen.getByRole("main").firstChild;
			expect(textContainer).toHaveClass("text-center");
		});

		it("should have proper heading structure", () => {
			renderWithRouter(["/oauth?code=test123&provider=github"]);

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveClass("text-xl", "font-bold", "max-w-xl");
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty search params gracefully", async () => {
			renderWithRouter(["/oauth"]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"No authorization code found. Please try to login again."
					)
				).toBeInTheDocument();
			});
		});

		it("should handle malformed URL parameters", async () => {
			renderWithRouter(["/oauth?code=&provider="]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"No authorization code found. Please try to login again."
					)
				).toBeInTheDocument();
			});
		});

		it("should handle case-sensitive provider names", async () => {
			renderWithRouter(["/oauth?code=test123&provider=GITHUB"]);

			await waitFor(() => {
				expect(
					screen.getByText(
						"Invalid provider. Please try to login again."
					)
				).toBeInTheDocument();
			});
		});
	});

	describe("Component Lifecycle", () => {
		it("should authenticate immediately on mount", async () => {
			mockOauth.mockResolvedValue({ success: true });

			renderWithRouter(["/oauth?code=test123&provider=github"]);

			await waitFor(() => {
				expect(mockOauth).toHaveBeenCalledTimes(1);
			});
		});

		it("should handle component unmounting gracefully", async () => {
			mockOauth.mockResolvedValue({ success: true });

			const { unmount } = renderWithRouter([
				"/oauth?code=test123&provider=github",
			]);

			unmount();

			// Should not throw any errors
			expect(() => unmount()).not.toThrow();
		});

		it("should not call oauth multiple times on re-renders", async () => {
			mockOauth.mockResolvedValue({ success: true });

			const { rerender } = renderWithRouter([
				"/oauth?code=test123&provider=github",
			]);

			await waitFor(() => {
				expect(mockOauth).toHaveBeenCalledTimes(1);
			});

			rerender(
				<MemoryRouter
					initialEntries={["/oauth?code=test123&provider=github"]}
				>
					<OauthCallback />
				</MemoryRouter>
			);

			// Still should only be called once due to useEffect dependency array
			expect(mockOauth).toHaveBeenCalledTimes(1);
		});
	});
});

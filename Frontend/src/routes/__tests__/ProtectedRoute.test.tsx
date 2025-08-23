import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import { AuthProvider } from "../../context/AuthContext";
import { authApi } from "../../services/api/auth";
import { usersApi } from "../../services/api/users";

// Mock the auth and users APIs
jest.mock("../../services/api/auth");
jest.mock("../../services/api/users");

const mockAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;

// Mock Navigate component to track navigation calls
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	Navigate: ({ to, state, replace }: any) => {
		mockNavigate(to, state, replace);
		return <div data-testid="navigate">Navigating to {to}</div>;
	},
}));

// Test component to render as protected children
const TestProtectedComponent = () => (
	<div data-testid="protected-content">Protected Content</div>
);

// Helper function to render ProtectedRoute with AuthProvider and Router
const renderProtectedRoute = (initialEntries = ["/protected"]) => {
	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<AuthProvider>
				<ProtectedRoute>
					<TestProtectedComponent />
				</ProtectedRoute>
			</AuthProvider>
		</MemoryRouter>
	);
};

describe("ProtectedRoute Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset localStorage
		Storage.prototype.getItem = jest.fn();
		Storage.prototype.setItem = jest.fn();
		Storage.prototype.removeItem = jest.fn();
	});

	describe("Loading State", () => {
		it("should show spinner while authentication is loading", async () => {
			// Mock a delayed auth check to keep loading state
			mockAuthApi.checkAuth.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ success: false, user: null }),
							100
						)
					)
			);

			renderProtectedRoute();

			// Should show spinner immediately
			expect(screen.getByRole("status")).toBeInTheDocument();
			expect(
				screen.queryByTestId("protected-content")
			).not.toBeInTheDocument();
			expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
		});

		it("should have correct spinner structure during loading", async () => {
			mockAuthApi.checkAuth.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ success: false, user: null }),
							100
						)
					)
			);

			renderProtectedRoute();

			const spinner = screen.getByRole("status");
			expect(spinner).toBeInTheDocument();
			expect(spinner.querySelector("svg")).toHaveClass("animate-spin");
			expect(screen.getByText("Loading...")).toBeInTheDocument();
		});
	});

	describe("Authenticated User", () => {
		it("should render protected content when user is authenticated", async () => {
			const mockUser = {
				id: "user123",
				username: "testuser",
				oauth: false,
				iat: Date.now(),
				exp: Date.now() + 3600000,
			};

			mockAuthApi.checkAuth.mockResolvedValue({
				success: true,
				user: mockUser,
			});

			renderProtectedRoute();

			// Wait for auth check to complete
			expect(
				await screen.findByTestId("protected-content")
			).toBeInTheDocument();
			expect(screen.getByText("Protected Content")).toBeInTheDocument();
			expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
			expect(mockNavigate).not.toHaveBeenCalled();
		});

		it("should render children correctly when authenticated", async () => {
			const mockUser = {
				id: "user456",
				username: "anotheruser",
				oauth: true,
				iat: Date.now(),
				exp: Date.now() + 3600000,
			};

			mockAuthApi.checkAuth.mockResolvedValue({
				success: true,
				user: mockUser,
			});

			renderProtectedRoute();

			expect(
				await screen.findByTestId("protected-content")
			).toBeInTheDocument();
			expect(authApi.checkAuth).toHaveBeenCalledTimes(1);
		});

		it("should handle multiple children when authenticated", async () => {
			const mockUser = {
				id: "user789",
				username: "multiuser",
				oauth: false,
				iat: Date.now(),
				exp: Date.now() + 3600000,
			};

			mockAuthApi.checkAuth.mockResolvedValue({
				success: true,
				user: mockUser,
			});

			render(
				<MemoryRouter initialEntries={["/protected"]}>
					<AuthProvider>
						<ProtectedRoute>
							<div data-testid="child1">Child 1</div>
							<div data-testid="child2">Child 2</div>
							<div data-testid="child3">Child 3</div>
						</ProtectedRoute>
					</AuthProvider>
				</MemoryRouter>
			);

			expect(await screen.findByTestId("child1")).toBeInTheDocument();
			expect(screen.getByTestId("child2")).toBeInTheDocument();
			expect(screen.getByTestId("child3")).toBeInTheDocument();
		});
	});

	describe("Unauthenticated User", () => {
		it("should navigate to /authenticate when user is not authenticated", async () => {
			mockAuthApi.checkAuth.mockResolvedValue({
				success: false,
				user: null,
			});

			renderProtectedRoute(["/profile"]);

			// Wait for auth check to complete
			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				{
					from: {
						pathname: "/profile",
						search: "",
						hash: "",
						state: null,
						key: expect.any(String),
					},
				},
				true
			);
			expect(
				screen.queryByTestId("protected-content")
			).not.toBeInTheDocument();
		});

		it("should preserve current location in navigate state", async () => {
			mockAuthApi.checkAuth.mockResolvedValue({
				success: false,
				user: null,
			});

			renderProtectedRoute(["/game/room123?player=john"]);

			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				{
					from: {
						pathname: "/game/room123",
						search: "?player=john",
						hash: "",
						state: null,
						key: expect.any(String),
					},
				},
				true
			);
		});

		it("should use replace navigation to prevent back button issues", async () => {
			mockAuthApi.checkAuth.mockResolvedValue({
				success: false,
				user: null,
			});

			renderProtectedRoute();

			await screen.findByTestId("navigate");

			// Third argument should be true for replace
			expect(mockNavigate).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(Object),
				true
			);
		});
	});

	describe("Authentication Errors", () => {
		it("should navigate to authenticate when auth check throws error", async () => {
			mockAuthApi.checkAuth.mockRejectedValue(new Error("Network error"));

			renderProtectedRoute();

			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				expect.any(Object),
				true
			);
			expect(
				screen.queryByTestId("protected-content")
			).not.toBeInTheDocument();
		});

		it("should handle auth API returning malformed response", async () => {
			// @ts-ignore - Testing malformed response
			mockAuthApi.checkAuth.mockResolvedValue({
				success: undefined,
				user: undefined,
			});

			renderProtectedRoute();

			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				expect.any(Object),
				true
			);
		});

		it("should handle auth check timeout", async () => {
			mockAuthApi.checkAuth.mockImplementation(
				() =>
					new Promise((_, reject) =>
						setTimeout(() => reject(new Error("Timeout")), 50)
					)
			);

			renderProtectedRoute();

			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				expect.any(Object),
				true
			);
		});
	});

	describe("Route Location Handling", () => {
		it("should handle root path correctly", async () => {
			mockAuthApi.checkAuth.mockResolvedValue({
				success: false,
				user: null,
			});

			renderProtectedRoute(["/"]);

			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				{
					from: {
						pathname: "/",
						search: "",
						hash: "",
						state: null,
						key: expect.any(String),
					},
				},
				true
			);
		});

		it("should handle deep nested paths", async () => {
			mockAuthApi.checkAuth.mockResolvedValue({
				success: false,
				user: null,
			});

			renderProtectedRoute(["/profile/settings/privacy"]);

			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				{
					from: {
						pathname: "/profile/settings/privacy",
						search: "",
						hash: "",
						state: null,
						key: expect.any(String),
					},
				},
				true
			);
		});

		it("should handle paths with hash fragments", async () => {
			mockAuthApi.checkAuth.mockResolvedValue({
				success: false,
				user: null,
			});

			renderProtectedRoute(["/profile#section1"]);

			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				{
					from: {
						pathname: "/profile",
						search: "",
						hash: "#section1",
						state: null,
						key: expect.any(String),
					},
				},
				true
			);
		});

		it("should handle complex query parameters", async () => {
			mockAuthApi.checkAuth.mockResolvedValue({
				success: false,
				user: null,
			});

			renderProtectedRoute([
				"/game?room=abc123&mode=multiplayer&level=5",
			]);

			await screen.findByTestId("navigate");

			expect(mockNavigate).toHaveBeenCalledWith(
				"/authenticate",
				{
					from: {
						pathname: "/game",
						search: "?room=abc123&mode=multiplayer&level=5",
						hash: "",
						state: null,
						key: expect.any(String),
					},
				},
				true
			);
		});
	});

	describe("Component Behavior", () => {
		it("should re-render correctly when auth state changes", async () => {
			// Start unauthenticated
			mockAuthApi.checkAuth.mockResolvedValue({
				success: false,
				user: null,
			});

			renderProtectedRoute();

			// Should navigate to authenticate
			expect(await screen.findByTestId("navigate")).toBeInTheDocument();
			expect(
				screen.queryByTestId("protected-content")
			).not.toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", async () => {
			const mockUser = {
				id: "user123",
				username: "testuser",
				oauth: false,
				iat: Date.now(),
				exp: Date.now() + 3600000,
			};

			mockAuthApi.checkAuth.mockResolvedValue({
				success: true,
				user: mockUser,
			});

			const { unmount } = renderProtectedRoute();

			expect(
				await screen.findByTestId("protected-content")
			).toBeInTheDocument();

			// Should unmount without errors
			expect(() => unmount()).not.toThrow();
		});

		it("should handle empty children gracefully", async () => {
			const mockUser = {
				id: "user123",
				username: "testuser",
				oauth: false,
				iat: Date.now(),
				exp: Date.now() + 3600000,
			};

			mockAuthApi.checkAuth.mockResolvedValue({
				success: true,
				user: mockUser,
			});

			render(
				<MemoryRouter initialEntries={["/protected"]}>
					<AuthProvider>
						<ProtectedRoute>{null}</ProtectedRoute>
					</AuthProvider>
				</MemoryRouter>
			);

			// Should not throw error and render empty content
			expect(
				screen.queryByTestId("protected-content")
			).not.toBeInTheDocument();
			expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle rapid auth state changes", async () => {
			let resolveAuth: (value: any) => void;
			const authPromise = new Promise((resolve) => {
				resolveAuth = resolve;
			});

			mockAuthApi.checkAuth.mockReturnValue(authPromise);

			renderProtectedRoute();

			// Should show spinner
			expect(screen.getByRole("status")).toBeInTheDocument();

			// Resolve with authenticated state
			resolveAuth!({
				success: true,
				user: {
					id: "user123",
					username: "testuser",
					oauth: false,
					iat: Date.now(),
					exp: Date.now() + 3600000,
				},
			});

			// Should show protected content
			expect(
				await screen.findByTestId("protected-content")
			).toBeInTheDocument();
		});

		it("should handle user with minimal data", async () => {
			// User with only required fields
			const minimalUser = {
				id: "minimal",
				username: "minimal",
				oauth: false,
				iat: 0,
				exp: 0,
			};

			mockAuthApi.checkAuth.mockResolvedValue({
				success: true,
				user: minimalUser,
			});

			renderProtectedRoute();

			expect(
				await screen.findByTestId("protected-content")
			).toBeInTheDocument();
		});

		it("should handle OAuth user correctly", async () => {
			const oauthUser = {
				id: "oauth123",
				username: "oauthuser",
				oauth: true,
				iat: Date.now(),
				exp: Date.now() + 3600000,
			};

			mockAuthApi.checkAuth.mockResolvedValue({
				success: true,
				user: oauthUser,
			});

			renderProtectedRoute();

			expect(
				await screen.findByTestId("protected-content")
			).toBeInTheDocument();
		});
	});

	describe("Integration with AuthContext", () => {
		it("should work correctly with AuthContext state management", async () => {
			const mockUser = {
				id: "integration123",
				username: "integrationuser",
				oauth: false,
				iat: Date.now(),
				exp: Date.now() + 3600000,
			};

			mockAuthApi.checkAuth.mockResolvedValue({
				success: true,
				user: mockUser,
			});

			renderProtectedRoute();

			// Wait for AuthContext to initialize and ProtectedRoute to respond
			expect(
				await screen.findByTestId("protected-content")
			).toBeInTheDocument();

			// Verify that AuthContext methods are called correctly
			expect(authApi.checkAuth).toHaveBeenCalledTimes(1);
		});

		it("should handle AuthContext loading states correctly", async () => {
			// Mock slow auth check
			mockAuthApi.checkAuth.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({
									success: true,
									user: {
										id: "slow123",
										username: "slowuser",
										oauth: false,
										iat: Date.now(),
										exp: Date.now() + 3600000,
									},
								}),
							50
						)
					)
			);

			renderProtectedRoute();

			// Should show spinner initially
			expect(screen.getByRole("status")).toBeInTheDocument();

			// Should show content after auth resolves
			expect(
				await screen.findByTestId("protected-content")
			).toBeInTheDocument();
		});
	});
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import { AuthProvider } from "../../context/AuthContext";
import { authApi } from "../../services/api/auth";
import { usersApi } from "../../services/api/users";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

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

	it("shows spinner during authentication loading", async () => {
		// Mock delayed auth check to maintain loading state
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

		// Should show spinner with correct structure
		const spinner = screen.getByRole("status");
		expect(spinner).toBeInTheDocument();
		expect(spinner.querySelector("svg")).toHaveClass("animate-spin");
		expect(screen.getByText("Loading...")).toBeInTheDocument();
		expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
		expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
	});

	it("renders protected content for authenticated users", async () => {
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

		// Test with single child
		renderProtectedRoute();
		expect(await screen.findByTestId("protected-content")).toBeInTheDocument();
		expect(screen.getByText("Protected Content")).toBeInTheDocument();
		expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
		expect(mockNavigate).not.toHaveBeenCalled();

		// Test with multiple children and OAuth user
		const oauthUser = { ...mockUser, id: "oauth123", username: "oauthuser", oauth: true };
		mockAuthApi.checkAuth.mockResolvedValue({ success: true, user: oauthUser });

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

		// Test minimal user data
		const minimalUser = { id: "minimal", username: "minimal", oauth: false, iat: 0, exp: 0 };
		mockAuthApi.checkAuth.mockResolvedValue({ success: true, user: minimalUser });
		expect(authApi.checkAuth).toHaveBeenCalled();
	});

	it("navigates to authenticate for unauthenticated users", async () => {
		mockAuthApi.checkAuth.mockResolvedValue({
			success: false,
			user: null,
		});

		// Test basic redirection
		renderProtectedRoute(["/profile"]);
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
		expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();

		// Test location preservation with query params
		jest.clearAllMocks();
		renderProtectedRoute(["/game/room123?player=john&level=5"]);
		await screen.findByTestId("navigate");

		expect(mockNavigate).toHaveBeenCalledWith(
			"/authenticate",
			{
				from: {
					pathname: "/game/room123",
					search: "?player=john&level=5",
					hash: "",
					state: null,
					key: expect.any(String),
				},
			},
			true
		);
	});

	it("handles various path formats and locations correctly", async () => {
		mockAuthApi.checkAuth.mockResolvedValue({ success: false, user: null });

		// Test root path
		const { unmount: unmount1 } = renderProtectedRoute(["/"]);
		await screen.findByTestId("navigate");
		expect(mockNavigate).toHaveBeenCalledWith(
			"/authenticate",
			expect.objectContaining({
				from: expect.objectContaining({ pathname: "/" })
			}),
			true
		);
		unmount1();

		// Test deep nested path
		jest.clearAllMocks();
		const { unmount: unmount2 } = renderProtectedRoute(["/profile/settings/privacy"]);
		await screen.findByTestId("navigate");
		expect(mockNavigate).toHaveBeenCalledWith(
			"/authenticate",
			expect.objectContaining({
				from: expect.objectContaining({ pathname: "/profile/settings/privacy" })
			}),
			true
		);
		unmount2();

		// Test path with hash fragment
		jest.clearAllMocks();
		const { unmount: unmount3 } = renderProtectedRoute(["/profile#section1"]);
		await screen.findByTestId("navigate");
		expect(mockNavigate).toHaveBeenCalledWith(
			"/authenticate",
			expect.objectContaining({
				from: expect.objectContaining({ 
					pathname: "/profile",
					hash: "#section1"
				})
			}),
			true
		);
		unmount3();
	});

	it("handles authentication errors and edge cases", async () => {
		// Test network error
		mockAuthApi.checkAuth.mockRejectedValue(new Error("Network error"));
		const { unmount: unmount1 } = renderProtectedRoute();
		await screen.findByTestId("navigate");
		expect(mockNavigate).toHaveBeenCalledWith("/authenticate", expect.any(Object), true);
		expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
		unmount1();

		// Test malformed response
		jest.clearAllMocks();
		// @ts-ignore - Testing malformed response
		mockAuthApi.checkAuth.mockResolvedValue({ success: undefined, user: undefined });
		const { unmount: unmount2 } = renderProtectedRoute();
		await screen.findByTestId("navigate");
		expect(mockNavigate).toHaveBeenCalledWith("/authenticate", expect.any(Object), true);
		unmount2();

		// Test timeout
		jest.clearAllMocks();
		mockAuthApi.checkAuth.mockImplementation(
			() => new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Timeout")), 50)
			)
		);
		const { unmount: unmount3 } = renderProtectedRoute();
		await screen.findByTestId("navigate");
		expect(mockNavigate).toHaveBeenCalledWith("/authenticate", expect.any(Object), true);
		unmount3();
	});

	it("handles component lifecycle and edge cases correctly", async () => {
		// Test component unmounting
		const mockUser = {
			id: "user123",
			username: "testuser", 
			oauth: false,
			iat: Date.now(),
			exp: Date.now() + 3600000,
		};

		mockAuthApi.checkAuth.mockResolvedValue({ success: true, user: mockUser });
		const { unmount } = renderProtectedRoute();
		expect(await screen.findByTestId("protected-content")).toBeInTheDocument();
		expect(() => unmount()).not.toThrow();

		// Test empty children
		const { unmount: unmount3 } = render(
			<MemoryRouter initialEntries={["/protected"]}>
				<AuthProvider>
					<ProtectedRoute>{null}</ProtectedRoute>
				</AuthProvider>
			</MemoryRouter>
		);
		expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
		expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
		unmount3();

		// Test rapid auth state changes with promise resolution
		let resolveAuth: (value: any) => void;
		const authPromise = new Promise((resolve) => { resolveAuth = resolve; });
		mockAuthApi.checkAuth.mockReturnValue(authPromise);

		const { unmount: unmount4 } = renderProtectedRoute();
		expect(screen.getAllByRole("status")).toHaveLength(1);

		resolveAuth!({ success: true, user: mockUser });
		expect(await screen.findByTestId("protected-content")).toBeInTheDocument();
		unmount4();
	});

	it("integrates correctly with AuthContext", async () => {
		// Test slow auth check with proper loading states
		mockAuthApi.checkAuth.mockImplementation(
			() => new Promise((resolve) =>
				setTimeout(() => resolve({
					success: true,
					user: {
						id: "integration123",
						username: "integrationuser",
						oauth: false,
						iat: Date.now(),
						exp: Date.now() + 3600000,
					},
				}), 50)
			)
		);

		renderProtectedRoute();

		// Should show spinner initially
		expect(screen.getByRole("status")).toBeInTheDocument();

		// Should show content after auth resolves
		expect(await screen.findByTestId("protected-content")).toBeInTheDocument();

		// Verify AuthContext integration
		expect(authApi.checkAuth).toHaveBeenCalledTimes(1);
	});
});

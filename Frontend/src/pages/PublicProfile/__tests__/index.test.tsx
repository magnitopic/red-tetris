import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PublicProfile from "../index";
import { usePublicProfile } from "../../../hooks/PageData/usePublicProfile";
import { useProfile } from "../../../hooks/PageData/useProfile";
import { useAuth } from "../../../context/AuthContext";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock the hooks
jest.mock("../../../hooks/PageData/usePublicProfile");
jest.mock("../../../hooks/PageData/useProfile");
jest.mock("../../../context/AuthContext");

// Mock React Router hooks
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigate,
	useParams: () => mockUseParams(),
	Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
		<div data-testid="navigate" data-to={to} data-replace={replace}>
			Navigating to {to}
		</div>
	),
}));

// Mock components
jest.mock("../../../components/common/Spinner", () => {
	return function MockSpinner() {
		return <div data-testid="spinner">Loading...</div>;
	};
});

jest.mock("../../../components/profile/MainInformation", () => {
	return function MockMainInformation({
		user,
		onProfileUpdate,
	}: {
		user: any;
		onProfileUpdate?: (data: any) => void;
	}) {
		return (
			<div data-testid="main-information">
				<div data-testid="username">{user.username}</div>
				<div data-testid="profile-picture">
					<img
						src={user.profile_picture}
						alt={`${user.username}'s profile`}
					/>
				</div>
				{onProfileUpdate && (
					<button
						data-testid="update-profile"
						onClick={() =>
							onProfileUpdate({ username: "updated-user" })
						}
					>
						Update Profile
					</button>
				)}
			</div>
		);
	};
});

const mockUsePublicProfile = usePublicProfile as jest.MockedFunction<
	typeof usePublicProfile
>;
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("PublicProfile Page", () => {
	const mockUserData = {
		username: "testuser",
		first_name: "Test",
		last_name: "User",
		age: 25,
		biography: "Test bio",
		fame: 100,
		last_online: Date.now(),
		profile_picture: "/test-image.jpg",
		gender: "male",
		sexual_preference: "female",
		images: ["/image1.jpg", "/image2.jpg"],
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockNavigate.mockClear();

		// Default route params
		mockUseParams.mockReturnValue({ username: "testuser" });

		// Default mocks
		mockUseAuth.mockReturnValue({
			user: { id: "different-user-id", username: "current-user" },
			isAuthenticated: true,
			loading: false,
			login: jest.fn(),
			logout: jest.fn(),
		});

		mockUseProfile.mockReturnValue({
			profile: null,
			loading: false,
			error: null,
		});
	});

	const renderPublicProfile = () => {
		return render(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);
	};

	it("should handle loading states correctly", () => {
		// Test auth loading
		mockUseAuth.mockReturnValue({
			user: null,
			isAuthenticated: false,
			loading: true,
			login: jest.fn(),
			logout: jest.fn(),
		});

		mockUsePublicProfile.mockReturnValue({
			profile: null,
			loading: false,
			error: null,
			notFound: false,
		});

		const { rerender } = renderPublicProfile();
		expect(screen.getByTestId("spinner")).toBeInTheDocument();

		// Test profile loading
		mockUseAuth.mockReturnValue({
			user: { id: "user-id", username: "current-user" },
			isAuthenticated: true,
			loading: false,
			login: jest.fn(),
			logout: jest.fn(),
		});

		mockUsePublicProfile.mockReturnValue({
			profile: null,
			loading: true,
			error: null,
			notFound: false,
		});

		rerender(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);

		expect(screen.getByTestId("spinner")).toBeInTheDocument();
		expect(
			screen.queryByTestId("main-information")
		).not.toBeInTheDocument();

		// Test current user profile loading (when authenticated)
		mockUsePublicProfile.mockReturnValue({
			profile: mockUserData,
			loading: false,
			error: null,
			notFound: false,
		});

		mockUseProfile.mockReturnValue({
			profile: null,
			loading: true,
			error: null,
		});

		rerender(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);

		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it("should handle error states and display appropriate messages", () => {
		const errorMessage = "Failed to fetch profile";

		mockUsePublicProfile.mockReturnValue({
			profile: null,
			loading: false,
			error: errorMessage,
			notFound: false,
		});

		renderPublicProfile();

		expect(
			screen.getByText(`Error: ${errorMessage}`, { exact: false })
		).toBeInTheDocument();
		expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("main-information")
		).not.toBeInTheDocument();
	});

	it("should display profile information when loaded successfully", () => {
		mockUsePublicProfile.mockReturnValue({
			profile: mockUserData,
			loading: false,
			error: null,
			notFound: false,
		});

		const { container } = renderPublicProfile();

		expect(screen.getByTestId("main-information")).toBeInTheDocument();
		expect(screen.getByTestId("username")).toHaveTextContent("testuser");
		expect(screen.getByAltText("testuser's profile")).toHaveAttribute(
			"src",
			"/test-image.jpg"
		);
		expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
		expect(
			screen.queryByText("Error:", { exact: false })
		).not.toBeInTheDocument();

		// Test page structure
		expect(container.querySelector("main")).toBeInTheDocument();
		expect(container.querySelector("section")).toBeInTheDocument();
	});

	it("should handle navigation redirects appropriately", () => {
		// Test redirect to /profile when user views their own profile
		mockUseAuth.mockReturnValue({
			user: { id: "user-id", username: "testuser" },
			isAuthenticated: true,
			loading: false,
			login: jest.fn(),
			logout: jest.fn(),
		});

		mockUsePublicProfile.mockReturnValue({
			profile: null,
			loading: false,
			error: null,
			notFound: false,
		});

		const { rerender } = renderPublicProfile();

		let navigateElement = screen.getByTestId("navigate");
		expect(navigateElement).toHaveAttribute("data-to", "/profile");
		expect(navigateElement).toHaveAttribute("data-replace", "true");

		// Test redirect to /404 when profile is not found
		mockUseAuth.mockReturnValue({
			user: { id: "different-user-id", username: "different-user" },
			isAuthenticated: true,
			loading: false,
			login: jest.fn(),
			logout: jest.fn(),
		});

		mockUsePublicProfile.mockReturnValue({
			profile: null,
			loading: false,
			error: null,
			notFound: true,
		});

		rerender(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);

		navigateElement = screen.getByTestId("navigate");
		expect(navigateElement).toHaveAttribute("data-to", "/404");
		expect(navigateElement).toHaveAttribute("data-replace", "true");

		// Test no redirect when viewing different user's profile
		mockUsePublicProfile.mockReturnValue({
			profile: mockUserData,
			loading: false,
			error: null,
			notFound: false,
		});

		rerender(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);

		expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
		expect(screen.getByTestId("main-information")).toBeInTheDocument();
	});

	it("should handle edge cases and state management", () => {
		// Test missing username parameter
		mockUseParams.mockReturnValue({ username: undefined });

		mockUsePublicProfile.mockReturnValue({
			profile: null,
			loading: false,
			error: null,
			notFound: false,
		});

		const { container, rerender } = renderPublicProfile();
		expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

		// Test empty username parameter
		mockUseParams.mockReturnValue({ username: "" });

		rerender(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);

		expect(
			screen.queryByTestId("main-information")
		).not.toBeInTheDocument();

		// Test null profile state
		mockUseParams.mockReturnValue({ username: "testuser" });

		rerender(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);

		expect(container.firstChild).toBeNull();

		// Test profile state changes
		const initialProfile = { ...mockUserData, username: "initial" };
		mockUsePublicProfile.mockReturnValue({
			profile: initialProfile,
			loading: false,
			error: null,
			notFound: false,
		});

		rerender(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);

		expect(screen.getByTestId("username")).toHaveTextContent("initial");

		// Update profile data
		const updatedProfile = { ...mockUserData, username: "updated" };
		mockUsePublicProfile.mockReturnValue({
			profile: updatedProfile,
			loading: false,
			error: null,
			notFound: false,
		});

		rerender(
			<MemoryRouter initialEntries={["/profile/testuser"]}>
				<PublicProfile />
			</MemoryRouter>
		);

		expect(screen.getByTestId("username")).toHaveTextContent("updated");
	});

	it("should handle profile update functionality", () => {
		mockUsePublicProfile.mockReturnValue({
			profile: mockUserData,
			loading: false,
			error: null,
			notFound: false,
		});

		// Create a spy to track function calls
		const originalSetState = React.useState;
		const setStateSpy = jest.fn();

		jest.spyOn(React, "useState").mockImplementation((initial) => {
			if (typeof initial === "object" && initial?.username) {
				return [initial, setStateSpy];
			}
			return originalSetState(initial);
		});

		renderPublicProfile();

		// Verify that the update button is rendered (which means onProfileUpdate was passed)
		expect(screen.getByTestId("update-profile")).toBeInTheDocument();

		// Trigger the update
		const updateButton = screen.getByTestId("update-profile");
		updateButton.click();

		// Verify that the state setter was called (which means handleProfileUpdate was executed)
		expect(setStateSpy).toHaveBeenCalled();

		// Restore the original useState
		jest.restoreAllMocks();
	});

	it("should handle component lifecycle properly", () => {
		mockUsePublicProfile.mockReturnValue({
			profile: mockUserData,
			loading: false,
			error: null,
			notFound: false,
		});

		const { unmount } = renderPublicProfile();

		expect(() => unmount()).not.toThrow();
	});
});

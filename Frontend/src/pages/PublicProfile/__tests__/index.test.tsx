import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PublicProfile from "../index";
import { usePublicProfile } from "../../../hooks/PageData/usePublicProfile";
import { useProfile } from "../../../hooks/PageData/useProfile";
import { useAuth } from "../../../context/AuthContext";

// Mock the hooks
jest.mock("../../../hooks/PageData/usePublicProfile");
jest.mock("../../../hooks/PageData/useProfile");
jest.mock("../../../context/AuthContext");

// Mock React Router hooks  
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigate,
	useParams: () => ({ username: "testuser" }),
}));

// Mock components
jest.mock("../../../components/common/Spinner", () => {
	return function MockSpinner() {
		return <div data-testid="spinner">Loading...</div>;
	};
});

jest.mock("../../../components/profile/MainInformation", () => {
	return function MockMainInformation({ user }: { user: any }) {
		return (
			<div data-testid="main-information">
				<div data-testid="username">{user.username}</div>
				<div data-testid="profile-picture">
					<img src={user.profile_picture} alt={`${user.username}'s profile`} />
				</div>
			</div>
		);
	};
});

const mockUsePublicProfile = usePublicProfile as jest.MockedFunction<typeof usePublicProfile>;
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

	describe("Auth Loading State", () => {
		it("should show spinner when auth is loading", () => {
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

			renderPublicProfile();

			expect(screen.getByTestId("spinner")).toBeInTheDocument();
		});
	});

	describe("Profile Loading State", () => {
		it("should show spinner when profile is loading", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: null,
				loading: true,
				error: null,
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.getByTestId("spinner")).toBeInTheDocument();
			expect(screen.getByText("Loading...")).toBeInTheDocument();
		});

		it("should not show main information when loading", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: null,
				loading: true,
				error: null,
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.queryByTestId("main-information")).not.toBeInTheDocument();
		});
	});

	describe("Error State", () => {
		it("should show error message when profile fetch fails", () => {
			const errorMessage = "Failed to fetch profile";

			mockUsePublicProfile.mockReturnValue({
				profile: null,
				loading: false,
				error: errorMessage,
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.getByText(`Error: ${errorMessage}`, { exact: false })).toBeInTheDocument();
		});

		it("should not show spinner when there's an error", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: null,
				loading: false,
				error: "Some error",
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
		});

		it("should not show main information when there's an error", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: null,
				loading: false,
				error: "Some error",
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.queryByTestId("main-information")).not.toBeInTheDocument();
		});
	});

	describe("Success State", () => {
		it("should show main information when profile is loaded", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: mockUserData,
				loading: false,
				error: null,
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.getByTestId("main-information")).toBeInTheDocument();
		});

		it("should not show spinner when profile is loaded", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: mockUserData,
				loading: false,
				error: null,
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
		});

		it("should not show error message when profile is loaded", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: mockUserData,
				loading: false,
				error: null,
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.queryByText("Error:", { exact: false })).not.toBeInTheDocument();
		});

		it("should pass profile data to MainInformation component", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: mockUserData,
				loading: false,
				error: null,
				notFound: false,
			});

			renderPublicProfile();

			expect(screen.getByTestId("username")).toHaveTextContent("testuser");
			expect(screen.getByAltText("testuser's profile")).toHaveAttribute("src", "/test-image.jpg");
		});
	});

	describe("Component Integration", () => {
		it("should render with correct page structure", () => {
			mockUsePublicProfile.mockReturnValue({
				profile: mockUserData,
				loading: false,
				error: null,
				notFound: false,
			});

			const { container } = renderPublicProfile();

			expect(container.querySelector("main")).toBeInTheDocument();
			expect(container.querySelector("section")).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
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
});

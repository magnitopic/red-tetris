import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../index";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock the hooks
const mockUseAuth = jest.fn();
const mockUseProfile = jest.fn();

jest.mock("../../../context/AuthContext", () => ({
	useAuth: () => mockUseAuth(),
}));

jest.mock("../../../hooks/PageData/useProfile", () => ({
	useProfile: () => mockUseProfile(),
}));

// Mock Spinner component
jest.mock("../../../components/common/Spinner", () => {
	return function MockSpinner() {
		return (
			<div className="text-center">
				<div role="status">
					<svg
						aria-hidden="true"
						className="inline w-8 h-8 text-gray-200 animate-spin fill-tertiary"
						viewBox="0 0 100 101"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
						/>
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
					<span className="sr-only">Loading...</span>
				</div>
			</div>
		);
	};
});

// Mock ProfileHeader component
jest.mock("../ProfileHeader", () => {
	return function MockProfileHeader({ user }: { user: any }) {
		return (
			<section
				className="container max-w-4xl text-center my-20 px-3"
				data-testid="profile-header"
			>
				<div className="flex flex-col items-center gap-3">
					<div className="relative w-fit">
						<img
							src={`${user?.profile_picture}?v=123`}
							alt="UserProfile"
							className="w-36 rounded-full border shadow-lg h-36 object-cover"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<p className="text-2xl font-semibold">
							{user?.username}
						</p>
					</div>
				</div>
			</section>
		);
	};
});

describe("Profile Page", () => {
	const mockProfile = {
		id: "1",
		username: "testuser",
		profile_picture: "test-picture.jpg",
	};

	const mockAuthData = {
		user: { id: "1", username: "testuser" },
		loading: false,
		login: jest.fn(),
		logout: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseAuth.mockReturnValue(mockAuthData);
		mockUseProfile.mockReturnValue({
			profile: null,
			loading: false,
			error: null,
		});
	});

	const renderProfile = () => {
		return render(
			<MemoryRouter>
				<Profile />
			</MemoryRouter>
		);
	};

	describe("Loading State", () => {
		it("should show spinner when profile is loading", () => {
			mockUseProfile.mockReturnValue({
				profile: null,
				loading: true,
				error: null,
			});

			renderProfile();

			expect(screen.getByRole("status")).toBeInTheDocument();
			expect(screen.getByText("Loading...")).toBeInTheDocument();
		});

		it("should not show profile header when loading", () => {
			mockUseProfile.mockReturnValue({
				profile: null,
				loading: true,
				error: null,
			});

			renderProfile();

			expect(
				screen.queryByTestId("profile-header")
			).not.toBeInTheDocument();
		});
	});

	describe("Error State", () => {
		it("should show error message when profile fetch fails", () => {
			const errorMessage = "Failed to load profile";
			mockUseProfile.mockReturnValue({
				profile: null,
				loading: false,
				error: errorMessage,
			});

			renderProfile();

			expect(
				screen.getByText(`Error: ${errorMessage}`, { exact: false })
			).toBeInTheDocument();
		});

		it("should not show spinner when there's an error", () => {
			mockUseProfile.mockReturnValue({
				profile: null,
				loading: false,
				error: "Some error",
			});

			renderProfile();

			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		it("should not show profile header when there's an error", () => {
			mockUseProfile.mockReturnValue({
				profile: null,
				loading: false,
				error: "Some error",
			});

			renderProfile();

			expect(
				screen.queryByTestId("profile-header")
			).not.toBeInTheDocument();
		});
	});

	describe("Success State", () => {
		it("should show profile header when profile is loaded", () => {
			mockUseProfile.mockReturnValue({
				profile: mockProfile,
				loading: false,
				error: null,
			});

			renderProfile();

			expect(screen.getByTestId("profile-header")).toBeInTheDocument();
			expect(screen.getByText(mockProfile.username)).toBeInTheDocument();
		});

		it("should not show spinner when profile is loaded", () => {
			mockUseProfile.mockReturnValue({
				profile: mockProfile,
				loading: false,
				error: null,
			});

			renderProfile();

			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		it("should not show error message when profile is loaded", () => {
			mockUseProfile.mockReturnValue({
				profile: mockProfile,
				loading: false,
				error: null,
			});

			renderProfile();

			expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		});

		it("should pass profile data to ProfileHeader component", () => {
			mockUseProfile.mockReturnValue({
				profile: mockProfile,
				loading: false,
				error: null,
			});

			renderProfile();

			expect(screen.getByText(mockProfile.username)).toBeInTheDocument();
		});
	});
});

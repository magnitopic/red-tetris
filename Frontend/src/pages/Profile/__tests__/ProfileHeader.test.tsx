import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfileHeader from "../ProfileHeader";
import { useAuth } from "../../../context/AuthContext";
import { useEditProfile } from "../../../hooks/PageData/useEditProfile";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock the hooks
jest.mock("../../../context/AuthContext");
jest.mock("../../../hooks/PageData/useEditProfile");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseEditProfile = useEditProfile as jest.MockedFunction<
	typeof useEditProfile
>;

describe("ProfileHeader Component", () => {
	const mockUser = {
		id: "user123",
		username: "testuser",
		profile_picture: "https://example.com/profile.jpg",
	};

	const mockUploadProfilePicture = jest.fn();
	const mockDateNow = jest.spyOn(Date, "now");

	beforeEach(() => {
		jest.clearAllMocks();
		// Mock Date.now consistently
		mockDateNow.mockImplementation(() => 1234567890);

		mockUseAuth.mockReturnValue({
			user: mockUser,
			isAuthenticated: true,
			login: jest.fn(),
			logout: jest.fn(),
			oauth: jest.fn(),
			checkAuth: jest.fn(),
			refreshUser: jest.fn(),
		});

		mockUseEditProfile.mockReturnValue({
			uploadProfilePicture: mockUploadProfilePicture,
			loading: false,
			error: null,
		});
	});

	afterEach(() => {
		mockDateNow.mockRestore();
	});

	const renderWithRouter = (user = mockUser) => {
		return render(
			<MemoryRouter>
				<ProfileHeader user={user} />
			</MemoryRouter>
		);
	};

	const getFileInput = () => {
		return document.querySelector('input[type="file"]') as HTMLInputElement;
	};

	describe("Rendering", () => {
		it("should render profile header correctly", () => {
			renderWithRouter();

			expect(screen.getByText("testuser")).toBeInTheDocument();
			expect(screen.getByAltText("UserProfile")).toBeInTheDocument();
			expect(getFileInput()).toBeInTheDocument();
		});

		it("should render profile picture with correct src", () => {
			renderWithRouter();

			const profileImage = screen.getByAltText("UserProfile");
			const src = profileImage.getAttribute("src");

			// Check that the base URL is correct and cache parameter exists
			expect(src).toMatch(
				/^https:\/\/example\.com\/profile\.jpg\?v=\d+$/
			);
			expect(src).toContain("https://example.com/profile.jpg?v=");
		});

		it("should have correct container structure", () => {
			renderWithRouter();

			const container = document.querySelector("section.container");
			expect(container).toHaveClass(
				"container",
				"max-w-4xl",
				"text-center",
				"my-20",
				"px-3"
			);
		});

		it("should render edit button for profile picture", () => {
			renderWithRouter();

			const editIcon = document.querySelector(".fa-pencil");
			expect(editIcon).toBeInTheDocument();
		});

		it("should render file input for profile picture upload", () => {
			renderWithRouter();

			const fileInput = getFileInput();
			expect(fileInput).toHaveAttribute("type", "file");
			expect(fileInput).toHaveAttribute("accept", "image/*");
		});
	});

	describe("Profile Picture Upload", () => {
		it("should handle successful profile picture upload", async () => {
			mockUploadProfilePicture.mockResolvedValue({
				msg: "Profile picture updated successfully",
			});

			renderWithRouter();

			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			const fileInput = getFileInput();

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(mockUploadProfilePicture).toHaveBeenCalledWith(
					"user123",
					file
				);
			});
		});

		it("should handle upload error and show error message", async () => {
			const errorMessage = "Upload failed";
			mockUploadProfilePicture.mockRejectedValue(new Error(errorMessage));

			renderWithRouter();

			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			const fileInput = getFileInput();

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(screen.getByText(errorMessage)).toBeInTheDocument();
			});
		});

		it("should not upload if no files selected", () => {
			renderWithRouter();

			const fileInput = getFileInput();
			// Simulate selecting no files (files array is empty)
			fireEvent.change(fileInput, { target: { files: null } });

			expect(mockUploadProfilePicture).not.toHaveBeenCalled();
		});

		it("should not upload if user is not authenticated", () => {
			mockUseAuth.mockReturnValue({
				user: null,
				isAuthenticated: false,
				login: jest.fn(),
				logout: jest.fn(),
				oauth: jest.fn(),
				checkAuth: jest.fn(),
				refreshUser: jest.fn(),
			});

			renderWithRouter();

			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			const fileInput = getFileInput();
			fireEvent.change(fileInput, { target: { files: [file] } });

			expect(mockUploadProfilePicture).not.toHaveBeenCalled();
		});

		it("should have file input with correct attributes", () => {
			renderWithRouter();

			const fileInput = getFileInput();
			expect(fileInput).toHaveAttribute("accept", "image/*");
			expect(fileInput).toHaveAttribute("type", "file");
			expect(fileInput).toHaveClass("hidden");
			expect(fileInput.multiple).toBe(false);
		});
	});

	describe("Cache Busting", () => {
		it("should generate cache-busting parameter for profile picture", () => {
			renderWithRouter();

			const profileImage = screen.getByAltText("UserProfile");
			expect(profileImage.getAttribute("src")).toMatch(/\?v=\d+$/);
		});

		it("should include cache parameter in image src", async () => {
			mockUploadProfilePicture.mockResolvedValue({ msg: "Success" });

			renderWithRouter();

			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			const fileInput = getFileInput();

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(mockUploadProfilePicture).toHaveBeenCalled();
			});
		});
	});
});

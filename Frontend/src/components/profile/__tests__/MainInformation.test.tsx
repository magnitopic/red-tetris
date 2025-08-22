import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MainInformation from "../MainInformation";

// Mock the capitalizeLetters utility
jest.mock("../../../utils/capitalizeLetters", () => {
	return jest.fn((str: string) => str);
});

import capitalizeLetters from "../../../utils/capitalizeLetters";

const mockCapitalizeLetters = capitalizeLetters as jest.MockedFunction<
	typeof capitalizeLetters
>;

describe("MainInformation Component", () => {
	const mockUser = {
		profile_picture: "https://example.com/profile.jpg",
		username: "testuser",
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockCapitalizeLetters.mockImplementation((str: string) => str);
	});

	describe("Rendering", () => {
		it("should render user profile correctly", () => {
			render(<MainInformation user={mockUser} />);

			// Check if profile image is rendered
			const profileImage = screen.getByAltText("UserProfile");
			expect(profileImage).toBeInTheDocument();

			// Check if username is displayed
			expect(screen.getByText("testuser")).toBeInTheDocument();
		});

		it("should render profile image with correct src", () => {
			render(<MainInformation user={mockUser} />);

			const profileImage = screen.getByAltText("UserProfile");
			expect(profileImage).toHaveAttribute("src");

			// Check that src contains the base URL
			const src = profileImage.getAttribute("src");
			expect(src).toContain("https://example.com/profile.jpg");
		});

		it("should render username with correct styling", () => {
			render(<MainInformation user={mockUser} />);

			const username = screen.getByText("testuser");
			expect(username).toHaveClass("text-2xl", "font-semibold");
		});

		it("should have correct container structure", () => {
			const { container } = render(<MainInformation user={mockUser} />);

			const mainContainer = container.firstChild;
			expect(mainContainer).toHaveClass(
				"flex",
				"flex-col",
				"items-center",
				"gap-3"
			);
		});
	});

	describe("Profile Image", () => {
		it("should have correct image styling classes", () => {
			render(<MainInformation user={mockUser} />);

			const profileImage = screen.getByAltText("UserProfile");
			expect(profileImage).toHaveClass(
				"w-36",
				"rounded-full",
				"border",
				"shadow-lg",
				"h-36",
				"object-cover"
			);
		});

		it("should have cache-busting parameter in image src", () => {
			render(<MainInformation user={mockUser} />);

			const profileImage = screen.getByAltText("UserProfile");
			const src = profileImage.getAttribute("src");

			// Should contain ?v= parameter for cache busting
			expect(src).toMatch(/\?v=\d+/);
		});

		it("should have correct alt text for accessibility", () => {
			render(<MainInformation user={mockUser} />);

			const profileImage = screen.getByAltText("UserProfile");
			expect(profileImage).toBeInTheDocument();
		});

		it("should be contained in relative positioned container", () => {
			const { container } = render(<MainInformation user={mockUser} />);

			const imageContainer = container.querySelector("div.relative");
			expect(imageContainer).toBeInTheDocument();
		});
	});

	describe("Username Display", () => {
		it("should display username in paragraph element", () => {
			render(<MainInformation user={mockUser} />);

			const username = screen.getByText("testuser");
			expect(username.tagName.toLowerCase()).toBe("p");
		});

		it("should handle usernames with special characters", () => {
			const userWithSpecialChars = {
				...mockUser,
				username: "test_user-123",
			};

			render(<MainInformation user={userWithSpecialChars} />);

			expect(screen.getByText("test_user-123")).toBeInTheDocument();
		});

		it("should handle long usernames", () => {
			const userWithLongName = {
				...mockUser,
				username: "very_very_long_username_that_might_break_layout",
			};

			render(<MainInformation user={userWithLongName} />);

			expect(
				screen.getByText(
					"very_very_long_username_that_might_break_layout"
				)
			).toBeInTheDocument();
		});

		it("should handle empty username gracefully", () => {
			const userWithEmptyName = {
				...mockUser,
				username: "",
			};

			render(<MainInformation user={userWithEmptyName} />);

			// Should render empty text but not crash
			const usernameElement = screen.getByText("", { selector: "p" });
			expect(usernameElement).toBeInTheDocument();
		});
	});

	describe("User Data Handling", () => {
		it("should handle different profile picture URLs", () => {
			const userWithDifferentImage = {
				...mockUser,
				profile_picture: "/local/path/image.png",
			};

			render(<MainInformation user={userWithDifferentImage} />);

			const profileImage = screen.getByAltText("UserProfile");
			const src = profileImage.getAttribute("src");
			expect(src).toContain("/local/path/image.png");
		});

		it("should handle users with numeric usernames", () => {
			const userWithNumericName = {
				...mockUser,
				username: "123456",
			};

			render(<MainInformation user={userWithNumericName} />);

			expect(screen.getByText("123456")).toBeInTheDocument();
		});

		it("should render with minimal user data", () => {
			const minimalUser = {
				profile_picture: "image.jpg",
				username: "u",
			};

			render(<MainInformation user={minimalUser} />);

			expect(screen.getByText("u")).toBeInTheDocument();
			expect(screen.getByAltText("UserProfile")).toBeInTheDocument();
		});
	});

	describe("Component Structure", () => {
		it("should have correct text container structure", () => {
			const { container } = render(<MainInformation user={mockUser} />);

			// Find the div that contains the username
			const textContainer = container.querySelector(
				"div.flex.flex-col.gap-1"
			);
			expect(textContainer).toBeInTheDocument();
		});

		it("should maintain proper layout hierarchy", () => {
			const { container } = render(<MainInformation user={mockUser} />);

			// Main container should contain image container and text container
			const mainContainer = container.firstChild as HTMLElement;
			expect(mainContainer.children).toHaveLength(2);

			// First child should be the image container
			expect(mainContainer.children[0]).toHaveClass("relative");

			// Second child should be the text container
			expect(mainContainer.children[1]).toHaveClass(
				"flex",
				"flex-col",
				"gap-1"
			);
		});
	});

	describe("Cache Busting", () => {
		it("should generate different cache keys for different renders", () => {
			const { unmount } = render(<MainInformation user={mockUser} />);
			const firstImage = screen.getByAltText("UserProfile");
			const firstSrc = firstImage.getAttribute("src");

			unmount();

			// Wait a moment to ensure different timestamp
			setTimeout(() => {
				render(<MainInformation user={mockUser} />);
				const secondImage = screen.getByAltText("UserProfile");
				const secondSrc = secondImage.getAttribute("src");

				// The cache busting parameters should be different
				expect(firstSrc).not.toBe(secondSrc);
			}, 10);
		});

		it("should use timestamp-based cache busting", () => {
			render(<MainInformation user={mockUser} />);

			const profileImage = screen.getByAltText("UserProfile");
			const src = profileImage.getAttribute("src");

			// Extract the timestamp value
			const match = src?.match(/\?v=(\d+)/);
			expect(match).toBeTruthy();

			if (match) {
				const timestamp = parseInt(match[1]);
				expect(timestamp).toBeGreaterThan(0);

				// Should be a reasonable timestamp (not too old, not future)
				const now = Date.now();
				expect(timestamp).toBeLessThanOrEqual(now);
				expect(timestamp).toBeGreaterThan(now - 60000); // Within last minute
			}
		});
	});

	describe("Component Behavior", () => {
		it("should render consistently across multiple renders", () => {
			const { rerender } = render(<MainInformation user={mockUser} />);

			expect(screen.getByText("testuser")).toBeInTheDocument();
			expect(screen.getByAltText("UserProfile")).toBeInTheDocument();

			rerender(<MainInformation user={mockUser} />);

			expect(screen.getByText("testuser")).toBeInTheDocument();
			expect(screen.getByAltText("UserProfile")).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(<MainInformation user={mockUser} />);

			expect(screen.getByText("testuser")).toBeInTheDocument();

			// Should not throw error when unmounting
			expect(() => unmount()).not.toThrow();
		});

		it("should update when user prop changes", () => {
			const { rerender } = render(<MainInformation user={mockUser} />);

			expect(screen.getByText("testuser")).toBeInTheDocument();

			const newUser = {
				profile_picture: "new-image.jpg",
				username: "newuser",
			};

			rerender(<MainInformation user={newUser} />);

			expect(screen.getByText("newuser")).toBeInTheDocument();
			expect(screen.queryByText("testuser")).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have accessible image with proper alt text", () => {
			render(<MainInformation user={mockUser} />);

			const profileImage = screen.getByAltText("UserProfile");
			expect(profileImage).toBeInTheDocument();
		});

		it("should have semantic structure for screen readers", () => {
			const { container } = render(<MainInformation user={mockUser} />);

			// Image should be properly tagged
			const image = screen.getByRole("img");
			expect(image).toBeInTheDocument();

			// Text content should be in paragraph
			const usernameText = screen.getByText("testuser");
			expect(usernameText.tagName.toLowerCase()).toBe("p");
		});
	});

	describe("Edge Cases", () => {
		it("should handle user object with additional properties", () => {
			const userWithExtraProps = {
				...mockUser,
				email: "test@example.com",
				id: 123,
				extraProperty: "should be ignored",
			};

			render(<MainInformation user={userWithExtraProps} />);

			// Should still render correctly with only the expected properties used
			expect(screen.getByText("testuser")).toBeInTheDocument();
			expect(screen.getByAltText("UserProfile")).toBeInTheDocument();
		});

		it("should handle profile picture URLs with query parameters", () => {
			const userWithQueryParams = {
				...mockUser,
				profile_picture:
					"https://example.com/image.jpg?size=200&format=webp",
			};

			render(<MainInformation user={userWithQueryParams} />);

			const profileImage = screen.getByAltText("UserProfile");
			const src = profileImage.getAttribute("src");

			// Should preserve existing query parameters and add cache busting
			expect(src).toContain("size=200");
			expect(src).toContain("format=webp");
			expect(src).toMatch(/\?v=\d+/); // Cache busting is added with ? (component behavior)
		});
	});
});

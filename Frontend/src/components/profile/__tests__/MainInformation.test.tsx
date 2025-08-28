import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MainInformation from "../MainInformation";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

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

	it("renders user profile with correct content and styling", () => {
		render(<MainInformation user={mockUser} />);

		// Check profile image
		const profileImage = screen.getByAltText("UserProfile");
		expect(profileImage).toBeInTheDocument();
		expect(profileImage).toHaveClass(
			"w-36",
			"rounded-full",
			"border",
			"shadow-lg",
			"h-36",
			"object-cover"
		);

		// Check image src contains base URL and cache busting
		const src = profileImage.getAttribute("src");
		expect(src).toContain("https://example.com/profile.jpg");
		expect(src).toMatch(/\?v=\d+/);

		// Check username
		const username = screen.getByText("testuser");
		expect(username).toBeInTheDocument();
		expect(username).toHaveClass("text-2xl", "font-semibold");
		expect(username.tagName.toLowerCase()).toBe("p");
	});

	it("handles different user data correctly", () => {
		const { rerender } = render(<MainInformation user={mockUser} />);
		expect(screen.getByText("testuser")).toBeInTheDocument();

		// Test different username
		rerender(<MainInformation user={{ ...mockUser, username: "newuser123" }} />);
		expect(screen.getByText("newuser123")).toBeInTheDocument();
		expect(screen.queryByText("testuser")).not.toBeInTheDocument();

		// Test empty username
		rerender(<MainInformation user={{ ...mockUser, username: "" }} />);
		const emptyUsername = screen.getByText("", { selector: "p" });
		expect(emptyUsername).toBeInTheDocument();

		// Test different image URL
		rerender(<MainInformation user={{ ...mockUser, profile_picture: "/local/image.png" }} />);
		const newImage = screen.getByAltText("UserProfile");
		expect(newImage.getAttribute("src")).toContain("/local/image.png");
	});

	it("has proper component structure and accessibility", () => {
		const { container } = render(<MainInformation user={mockUser} />);

		// Check main container structure
		const mainContainer = container.firstChild as HTMLElement;
		expect(mainContainer).toHaveClass("flex", "flex-col", "items-center", "gap-3");
		expect(mainContainer.children).toHaveLength(2);

		// Check image container
		expect(mainContainer.children[0]).toHaveClass("relative");

		// Check text container
		expect(mainContainer.children[1]).toHaveClass("flex", "flex-col", "gap-1");

		// Check accessibility
		const image = screen.getByRole("img");
		expect(image).toBeInTheDocument();
	});

	it("handles component lifecycle and edge cases properly", () => {
		const { unmount, rerender } = render(<MainInformation user={mockUser} />);

		// Test normal render
		expect(screen.getByText("testuser")).toBeInTheDocument();

		// Test rerender
		rerender(<MainInformation user={mockUser} />);
		expect(screen.getByText("testuser")).toBeInTheDocument();

		// Test unmount
		expect(() => unmount()).not.toThrow();

		// Test with extra properties (should still work)
		const userWithExtraProps = {
			...mockUser,
			email: "test@example.com",
			extraProperty: "ignored",
		};
		render(<MainInformation user={userWithExtraProps} />);
		expect(screen.getByText("testuser")).toBeInTheDocument();
	});
});

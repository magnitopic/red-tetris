import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import UserBubbles from "../UserBubbles";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

// Mock user data for testing
const mockUser = {
	username: "testuser",
	profilePicture: "https://example.com/profile.jpg",
};

// Wrapper component to provide React Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
	<MemoryRouter>{children}</MemoryRouter>
);

describe("UserBubbles Component", () => {
	it("renders profile image and link with correct styling", () => {
		render(
			<RouterWrapper>
				<UserBubbles user={mockUser} />
			</RouterWrapper>
		);

		// Check image rendering and attributes
		const profileImage = screen.getByAltText("user profile picture");
		expect(profileImage).toBeInTheDocument();
		expect(profileImage).toHaveAttribute(
			"src",
			expect.stringContaining(mockUser.profilePicture)
		);
		expect(profileImage.getAttribute("src")).toMatch(/\?v=\d+$/); // Cache busting

		// Check link
		const profileLink = screen.getByRole("link");
		expect(profileLink).toBeInTheDocument();
		expect(profileLink).toHaveAttribute(
			"href",
			`/profile/view/${mockUser.username}`
		);

		// Check styling classes
		expect(profileImage).toHaveClass(
			"w-14",
			"h-14",
			"rounded-full",
			"object-cover",
			"hover:scale-110",
			"transition-transform",
			"shadow-lg",
			"border-2",
			"border-solid",
			"border-primary"
		);

		// Check container structure
		const container = profileLink.closest("div");
		expect(container).toHaveClass("relative", "w-fit", "h-fit");
	});

	it("shows and hides tooltip on hover with correct styling", async () => {
		render(
			<RouterWrapper>
				<UserBubbles user={mockUser} />
			</RouterWrapper>
		);

		const profileLink = screen.getByRole("link");

		// Initially tooltip should not be visible
		expect(screen.queryByText(mockUser.username)).not.toBeInTheDocument();

		// Show tooltip on mouse enter
		fireEvent.mouseEnter(profileLink);
		await waitFor(() => {
			const tooltip = screen.getByText(mockUser.username);
			expect(tooltip).toBeInTheDocument();
			expect(tooltip).toHaveClass(
				"absolute",
				"z-10",
				"left-1/2",
				"bottom-full",
				"mb-2",
				"-translate-x-1/2",
				"px-3",
				"py-2",
				"text-sm",
				"font-medium",
				"text-white",
				"bg-gray-900",
				"rounded-lg"
			);

			// Check for tooltip arrow
			const tooltipContainer = tooltip.parentElement;
			const arrow = tooltipContainer?.querySelector(
				"div.absolute.-bottom-1"
			);
			expect(arrow).toBeInTheDocument();
			expect(arrow).toHaveClass(
				"absolute",
				"-bottom-1",
				"left-1/2",
				"-translate-x-1/2",
				"border-4",
				"border-transparent",
				"border-t-gray-900"
			);
		});

		// Hide tooltip on mouse leave
		fireEvent.mouseLeave(profileLink);
		await waitFor(() => {
			expect(
				screen.queryByText(mockUser.username)
			).not.toBeInTheDocument();
		});
	});

	it("handles different user data variations", async () => {
		const userWithSpecialChars = {
			username: "user-name_123",
			profilePicture: "/static/images/default-profile.png",
		};

		render(
			<RouterWrapper>
				<UserBubbles user={userWithSpecialChars} />
			</RouterWrapper>
		);

		// Check link with special characters
		const profileLink = screen.getByRole("link");
		expect(profileLink).toHaveAttribute(
			"href",
			`/profile/view/${userWithSpecialChars.username}`
		);

		// Check different profile picture URL
		const profileImage = screen.getByAltText("user profile picture");
		expect(profileImage).toHaveAttribute(
			"src",
			expect.stringContaining(userWithSpecialChars.profilePicture)
		);

		// Check tooltip with special characters
		fireEvent.mouseEnter(profileLink);
		await waitFor(() => {
			expect(
				screen.getByText(userWithSpecialChars.username)
			).toBeInTheDocument();
		});
	});

	it("is accessible and keyboard navigable", () => {
		render(
			<RouterWrapper>
				<UserBubbles user={mockUser} />
			</RouterWrapper>
		);

		const profileLink = screen.getByRole("link");
		const profileImage = screen.getByAltText("user profile picture");

		// Check accessibility
		expect(profileImage).toBeInTheDocument();
		expect(profileLink).toBeInTheDocument();

		// Check keyboard navigation
		profileLink.focus();
		expect(profileLink).toHaveFocus();
	});
});

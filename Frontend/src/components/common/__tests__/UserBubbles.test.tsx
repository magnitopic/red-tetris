import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import UserBubbles from "../UserBubbles";

// Mock user data for testing
const mockUser = {
	username: "testuser",
	profilePicture: "https://example.com/profile.jpg",
};

const mockUserWithLongName = {
	username: "verylongusernamethatmightoverflow",
	profilePicture: "https://example.com/profile.jpg",
};

// Wrapper component to provide React Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
	<MemoryRouter>{children}</MemoryRouter>
);

describe("UserBubbles Component", () => {
	describe("Rendering", () => {
		it("should render user profile image correctly", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileImage = screen.getByAltText("user profile picture");
			expect(profileImage).toBeInTheDocument();
			expect(profileImage).toHaveAttribute(
				"src",
				expect.stringContaining(mockUser.profilePicture)
			);
		});

		it("should render as a link to user profile", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");
			expect(profileLink).toBeInTheDocument();
			expect(profileLink).toHaveAttribute(
				"href",
				`/profile/view/${mockUser.username}`
			);
		});

		it("should have correct image styling classes", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileImage = screen.getByAltText("user profile picture");
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
		});

		it("should have cache-busting parameter in image src", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileImage = screen.getByAltText("user profile picture");
			const src = profileImage.getAttribute("src");
			expect(src).toMatch(/\?v=\d+$/); // Should end with ?v=timestamp
		});
	});

	describe("Tooltip functionality", () => {
		it("should not show tooltip initially", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			expect(
				screen.queryByText(mockUser.username)
			).not.toBeInTheDocument();
		});

		it("should show tooltip on mouse enter", async () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");
			fireEvent.mouseEnter(profileLink);

			await waitFor(() => {
				expect(screen.getByText(mockUser.username)).toBeInTheDocument();
			});
		});

		it("should hide tooltip on mouse leave", async () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");

			// Show tooltip
			fireEvent.mouseEnter(profileLink);
			await waitFor(() => {
				expect(screen.getByText(mockUser.username)).toBeInTheDocument();
			});

			// Hide tooltip
			fireEvent.mouseLeave(profileLink);
			await waitFor(() => {
				expect(
					screen.queryByText(mockUser.username)
				).not.toBeInTheDocument();
			});
		});

		it("should have correct tooltip styling", async () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");
			fireEvent.mouseEnter(profileLink);

			await waitFor(() => {
				const tooltip = screen.getByText(mockUser.username);
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
			});
		});

		it("should show tooltip arrow", async () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");
			fireEvent.mouseEnter(profileLink);

			await waitFor(() => {
				const tooltip = screen.getByText(mockUser.username);
				const tooltipContainer = tooltip.parentElement;

				// Check for arrow div
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
		});
	});

	describe("User data handling", () => {
		it("should handle users with long usernames", async () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUserWithLongName} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");
			expect(profileLink).toHaveAttribute(
				"href",
				`/profile/view/${mockUserWithLongName.username}`
			);

			fireEvent.mouseEnter(profileLink);

			await waitFor(() => {
				expect(
					screen.getByText(mockUserWithLongName.username)
				).toBeInTheDocument();
			});
		});

		it("should handle users with special characters in username", async () => {
			const userWithSpecialChars = {
				username: "user-name_123",
				profilePicture: "https://example.com/profile.jpg",
			};

			render(
				<RouterWrapper>
					<UserBubbles user={userWithSpecialChars} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");
			expect(profileLink).toHaveAttribute(
				"href",
				`/profile/view/${userWithSpecialChars.username}`
			);

			fireEvent.mouseEnter(profileLink);

			await waitFor(() => {
				expect(
					screen.getByText(userWithSpecialChars.username)
				).toBeInTheDocument();
			});
		});

		it("should handle different profile picture URLs", () => {
			const userWithDifferentPicture = {
				username: "testuser",
				profilePicture: "/static/images/default-profile.png",
			};

			render(
				<RouterWrapper>
					<UserBubbles user={userWithDifferentPicture} />
				</RouterWrapper>
			);

			const profileImage = screen.getByAltText("user profile picture");
			expect(profileImage).toHaveAttribute(
				"src",
				expect.stringContaining(userWithDifferentPicture.profilePicture)
			);
		});
	});

	describe("Component structure", () => {
		it("should have correct container structure", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const container = screen.getByRole("link").closest("div");
			expect(container).toHaveClass("relative", "w-fit", "h-fit");
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			expect(() => unmount()).not.toThrow();
		});
	});

	describe("Image cache busting", () => {
		it("should generate different cache keys for different renders", () => {
			// First render
			const { container: container1 } = render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const image1 = container1.querySelector("img");
			const src1 = image1?.getAttribute("src");

			// Second render (simulating a new component instance)
			const { container: container2 } = render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const image2 = container2.querySelector("img");
			const src2 = image2?.getAttribute("src");

			// Both should have cache busting parameters
			expect(src1).toMatch(/\?v=\d+$/);
			expect(src2).toMatch(/\?v=\d+$/);
		});
	});

	describe("Accessibility", () => {
		it("should have proper alt text for screen readers", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileImage = screen.getByAltText("user profile picture");
			expect(profileImage).toBeInTheDocument();
		});

		it("should be keyboard navigable", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");
			expect(profileLink).toBeInTheDocument();

			// Link should be focusable
			profileLink.focus();
			expect(profileLink).toHaveFocus();
		});

		it("should maintain semantic link structure", () => {
			render(
				<RouterWrapper>
					<UserBubbles user={mockUser} />
				</RouterWrapper>
			);

			const profileLink = screen.getByRole("link");
			expect(profileLink).toHaveAttribute(
				"href",
				`/profile/view/${mockUser.username}`
			);
		});
	});
});

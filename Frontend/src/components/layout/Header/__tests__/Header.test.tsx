import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header";

// Mock the dependencies
jest.mock("../../../../hooks/useBreakpoints", () => ({
	useBreakpoints: jest.fn(),
}));

jest.mock("../../../../context/AuthContext", () => ({
	useAuth: jest.fn(),
}));

jest.mock("../../../../services/api/users", () => ({
	usersApi: {
		getMe: jest.fn(),
	},
}));

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigate,
}));

import { useBreakpoints } from "../../../../hooks/useBreakpoints";
import { useAuth } from "../../../../context/AuthContext";
import { usersApi } from "../../../../services/api/users";

const mockUseBreakpoints = useBreakpoints as jest.MockedFunction<
	typeof useBreakpoints
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Wrapper component to provide React Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
	<MemoryRouter>{children}</MemoryRouter>
);

describe("Header Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockNavigate.mockClear();

		// Default API mock to prevent console errors
		(usersApi.getMe as jest.Mock).mockResolvedValue({
			msg: { username: "testuser" },
		});
	});

	describe("Desktop Rendering - Unauthenticated", () => {
		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: false,
				isTablet: false,
				isDesktop: true,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: false,
				user: null,
				logout: jest.fn(),
				refreshUserData: jest.fn(),
			});
		});

		it("should render header with title", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			expect(screen.getByText("Red Tetris")).toBeInTheDocument();
			expect(screen.getByText("Red Tetris").closest("h1")).toHaveClass(
				"text-3xl",
				"font-bold"
			);
		});

		it("should render navigation links on desktop", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			expect(
				screen.getByRole("link", { name: "Home" })
			).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: "Play" })
			).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: "Profile" })
			).toBeInTheDocument();
		});

		it("should render Enter button when not authenticated", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const enterButton = screen.getByRole("link", { name: "Enter" });
			expect(enterButton).toBeInTheDocument();
			expect(enterButton).toHaveAttribute("href", "/authenticate");
		});

		it("should not show mobile menu button on desktop", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			expect(
				screen.queryByLabelText("Open menu")
			).not.toBeInTheDocument();
			expect(
				screen.queryByLabelText("Close menu")
			).not.toBeInTheDocument();
		});
	});

	describe("Desktop Rendering - Authenticated", () => {
		const mockUser = { username: "testuser", id: "1" };
		const mockLogout = jest.fn();

		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: false,
				isTablet: false,
				isDesktop: true,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: true,
				user: mockUser,
				logout: mockLogout,
				refreshUserData: jest.fn(),
			});
		});

		it("should display username when authenticated", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			expect(screen.getByText("testuser")).toBeInTheDocument();
		});

		it("should render logout button when authenticated", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			expect(
				screen.getByRole("button", { name: "Logout" })
			).toBeInTheDocument();
		});

		it("should call logout function when logout button is clicked", async () => {
			mockLogout.mockResolvedValue({ success: true });

			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const logoutButton = screen.getByRole("button", { name: "Logout" });
			fireEvent.click(logoutButton);

			await waitFor(() => {
				expect(mockLogout).toHaveBeenCalledTimes(1);
			});
		});

		it("should navigate to home after successful logout", async () => {
			mockLogout.mockResolvedValue({ success: true });

			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const logoutButton = screen.getByRole("button", { name: "Logout" });
			fireEvent.click(logoutButton);

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith("/");
			});
		});
	});

	describe("Mobile Rendering", () => {
		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: true,
				isTablet: false,
				isDesktop: false,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: false,
				user: null,
				logout: jest.fn(),
				refreshUserData: jest.fn(),
			});
		});

		it("should show mobile menu button", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
		});

		it("should not show desktop navigation links on mobile", () => {
			const { container } = render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			// Desktop navigation container should not be present on mobile
			const desktopNav = container.querySelector("nav.flex.flex-1.ml-20");
			expect(desktopNav).not.toBeInTheDocument();
		});

		it("should toggle mobile menu when button is clicked", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const menuButton = screen.getByLabelText("Open menu");
			fireEvent.click(menuButton);

			expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
		});
	});

	describe("Mobile Menu Functionality", () => {
		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: true,
				isTablet: false,
				isDesktop: false,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: false,
				user: null,
				logout: jest.fn(),
				refreshUserData: jest.fn(),
			});
		});

		it("should show mobile menu when opened", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const menuButton = screen.getByLabelText("Open menu");
			fireEvent.click(menuButton);

			// Mobile menu should be visible
			const mobileMenu = screen.getByRole("navigation");
			expect(mobileMenu).toBeInTheDocument();
		});

		it("should close menu when link is clicked", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			// Open menu
			const menuButton = screen.getByLabelText("Open menu");
			fireEvent.click(menuButton);

			// Click a navigation link
			const homeLink = screen.getAllByText("Home")[0];
			fireEvent.click(homeLink);

			// Menu should be closed
			expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
		});
	});

	describe("Authenticated Mobile Menu", () => {
		const mockUser = { username: "testuser", id: "1" };
		const mockLogout = jest.fn();

		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: true,
				isTablet: false,
				isDesktop: false,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: true,
				user: mockUser,
				logout: mockLogout,
				refreshUserData: jest.fn(),
			});
		});

		it("should show user greeting in mobile menu", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const menuButton = screen.getByLabelText("Open menu");
			fireEvent.click(menuButton);

			expect(screen.getByText("Hello")).toBeInTheDocument();
			expect(screen.getByText("testuser")).toBeInTheDocument();
		});

		it("should show logout option in mobile menu", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const menuButton = screen.getByLabelText("Open menu");
			fireEvent.click(menuButton);

			expect(
				screen.getByRole("button", { name: "Logout" })
			).toBeInTheDocument();
		});
	});

	describe("Styling and CSS Classes", () => {
		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: false,
				isTablet: false,
				isDesktop: true,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: false,
				user: null,
				logout: jest.fn(),
				refreshUserData: jest.fn(),
			});
		});

		it("should have correct header styling", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const header = screen.getByRole("banner");
			expect(header).toHaveClass(
				"transition-all",
				"duration-300",
				"z-30",
				"bg-primary"
			);
		});

		it("should have correct navigation button styling", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const homeButton = screen.getByRole("link", { name: "Home" });
			expect(homeButton.querySelector("button")).toHaveClass(
				"text-font-main",
				"font-medium",
				"btn",
				"whitespace-nowrap",
				"text-base",
				"px-6",
				"py-2",
				"rounded-full",
				"hover:bg-secondary-light",
				"transition-colors",
				"duration-300"
			);
		});
	});

	describe("API Integration", () => {
		const mockUser = { username: "testuser", id: "1" };
		const mockRefreshUserData = jest.fn();

		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: false,
				isTablet: false,
				isDesktop: true,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: true,
				user: mockUser,
				logout: jest.fn(),
				refreshUserData: mockRefreshUserData,
			});

			// Mock successful API response
			(usersApi.getMe as jest.Mock).mockResolvedValue({
				msg: { username: "testuser" },
			});
		});

		it("should check username from backend on mount", async () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			await waitFor(() => {
				expect(usersApi.getMe).toHaveBeenCalledTimes(1);
			});
		});

		it("should refresh user data if username differs", async () => {
			const mockApiResponse = { msg: { username: "differentuser" } };
			(usersApi.getMe as jest.Mock).mockResolvedValue(mockApiResponse);

			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			await waitFor(() => {
				expect(mockRefreshUserData).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe("Component Behavior", () => {
		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: false,
				isTablet: false,
				isDesktop: true,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: false,
				user: null,
				logout: jest.fn(),
				refreshUserData: jest.fn(),
			});
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			expect(screen.getByRole("banner")).toBeInTheDocument();

			// Should not throw error when unmounting
			expect(() => unmount()).not.toThrow();

			// Should no longer be in document
			expect(screen.queryByRole("banner")).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		beforeEach(() => {
			mockUseBreakpoints.mockReturnValue({
				isMobile: true,
				isTablet: false,
				isDesktop: false,
			});
			mockUseAuth.mockReturnValue({
				isAuthenticated: false,
				user: null,
				logout: jest.fn(),
				refreshUserData: jest.fn(),
			});
		});

		it("should have proper semantic header element", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const header = screen.getByRole("banner");
			expect(header.tagName.toLowerCase()).toBe("header");
		});

		it("should have accessible mobile menu button", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const menuButton = screen.getByLabelText("Open menu");
			expect(menuButton).toBeInTheDocument();
		});

		it("should update aria-label when menu state changes", () => {
			render(
				<RouterWrapper>
					<Header />
				</RouterWrapper>
			);

			const menuButton = screen.getByLabelText("Open menu");
			fireEvent.click(menuButton);

			expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
		});
	});
});

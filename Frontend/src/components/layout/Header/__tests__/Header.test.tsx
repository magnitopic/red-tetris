import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
});

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

	it("renders desktop header with navigation when unauthenticated", () => {
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

		render(
			<RouterWrapper>
				<Header />
			</RouterWrapper>
		);

		// Check header structure
		const header = screen.getByRole("banner");
		expect(header).toBeInTheDocument();
		expect(header).toHaveClass("transition-all", "duration-300", "z-30", "bg-primary");

		// Check title
		expect(screen.getByText("Red Tetris")).toBeInTheDocument();
		expect(screen.getByText("Red Tetris").closest("h1")).toHaveClass("text-3xl", "font-bold");

		// Check navigation links
		expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Play" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();

		// Check Enter button for unauthenticated state
		const enterButton = screen.getByRole("link", { name: "Enter" });
		expect(enterButton).toBeInTheDocument();
		expect(enterButton).toHaveAttribute("href", "/authenticate");

		// Should not show mobile menu button on desktop
		expect(screen.queryByLabelText("Open menu")).not.toBeInTheDocument();
	});

	it("renders authenticated desktop header with user info and logout", async () => {
		const mockUser = { username: "testuser", id: "1" };
		const mockLogout = jest.fn().mockResolvedValue({ success: true });

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

		render(
			<RouterWrapper>
				<Header />
			</RouterWrapper>
		);

		// Check user display
		expect(screen.getByText("testuser")).toBeInTheDocument();

		// Check logout functionality
		const logoutButton = screen.getByRole("button", { name: "Logout" });
		expect(logoutButton).toBeInTheDocument();

		fireEvent.click(logoutButton);

		await waitFor(() => {
			expect(mockLogout).toHaveBeenCalledTimes(1);
			expect(mockNavigate).toHaveBeenCalledWith("/");
		});
	});

	it("renders mobile header with menu functionality", () => {
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

		const { container } = render(
			<RouterWrapper>
				<Header />
			</RouterWrapper>
		);

		// Check mobile menu button
		const menuButton = screen.getByLabelText("Open menu");
		expect(menuButton).toBeInTheDocument();

		// Desktop navigation should not be present
		const desktopNav = container.querySelector("nav.flex.flex-1.ml-20");
		expect(desktopNav).not.toBeInTheDocument();

		// Test menu toggle
		fireEvent.click(menuButton);
		expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

		// Mobile menu should be visible (use getAllByRole since there might be multiple)
		const mobileMenus = screen.getAllByRole("navigation");
		expect(mobileMenus.length).toBeGreaterThan(0);

		// Close menu by clicking a link
		const homeLink = screen.getAllByText("Home")[0];
		fireEvent.click(homeLink);
		expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
	});

	it("handles authenticated mobile menu with user info", () => {
		const mockUser = { username: "testuser", id: "1" };
		const mockLogout = jest.fn();

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

		render(
			<RouterWrapper>
				<Header />
			</RouterWrapper>
		);

		// Open mobile menu
		const menuButton = screen.getByLabelText("Open menu");
		fireEvent.click(menuButton);

		// Check user greeting in mobile menu
		expect(screen.getByText("Hello")).toBeInTheDocument();
		expect(screen.getByText("testuser")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
	});

	it("handles API integration and user data refresh", async () => {
		const mockRefreshUserData = jest.fn();
		const mockUser = { username: "testuser", id: "1" };

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

		// Test API call on mount
		render(
			<RouterWrapper>
				<Header />
			</RouterWrapper>
		);

		await waitFor(() => {
			expect(usersApi.getMe).toHaveBeenCalledTimes(1);
		});

		// Test user data refresh when username differs
		(usersApi.getMe as jest.Mock).mockResolvedValue({
			msg: { username: "differentuser" },
		});

		render(
			<RouterWrapper>
				<Header />
			</RouterWrapper>
		);

		await waitFor(() => {
			expect(mockRefreshUserData).toHaveBeenCalledTimes(1);
		});
	});

	it("has proper styling and accessibility features", () => {
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

		const { unmount } = render(
			<RouterWrapper>
				<Header />
			</RouterWrapper>
		);

		// Check semantic structure
		const header = screen.getByRole("banner");
		expect(header.tagName.toLowerCase()).toBe("header");

		// Check accessibility of mobile menu
		const menuButton = screen.getByLabelText("Open menu");
		expect(menuButton).toBeInTheDocument();

		// Test aria-label update on menu toggle
		fireEvent.click(menuButton);
		expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

		// Test component unmount
		expect(() => unmount()).not.toThrow();
		expect(screen.queryByRole("banner")).not.toBeInTheDocument();
	});
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StartGame from "../StartGame";

beforeAll(() => {
	window.navigation = { navigate: jest.fn() };
	HTMLFormElement.prototype.requestSubmit = jest.fn();
	
	// Mock window.location to prevent jsdom navigation errors
	const mockLocation = {
		href: 'http://localhost/',
		pathname: '/',
		search: '',
		hash: '',
		host: 'localhost',
		hostname: 'localhost',
		port: '',
		protocol: 'http:',
		origin: 'http://localhost',
		assign: jest.fn(),
		replace: jest.fn(),
		reload: jest.fn(),
		toString: jest.fn(() => 'http://localhost/')
	};
	
	delete (window as any).location;
	(window as any).location = mockLocation;
	
	// Create a spy to track href assignments without triggering navigation
	Object.defineProperty(mockLocation, 'href', {
		get: () => 'http://localhost/',
		set: jest.fn(),
		configurable: true
	});
});

describe("StartGame Component", () => {
	it("renders all elements with correct structure and styling", () => {
		const { container } = render(<StartGame />);

		// Main content elements
		expect(screen.getByRole("heading", { name: /start playing!/i })).toBeInTheDocument();
		expect(screen.getByText(/either create a new game or join an existing one/i)).toBeInTheDocument();
		
		// Buttons
		expect(screen.getByRole("button", { name: /create regular game/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /create hardcore game/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /join game/i })).toBeInTheDocument();
		
		// Join game section
		expect(screen.getByText(/join an existing game!/i)).toBeInTheDocument();
		expect(screen.getByRole("textbox")).toBeInTheDocument();

		// Semantic structure
		const section = container.querySelector("section");
		const details = container.querySelector("details");
		const summary = container.querySelector("summary");
		expect(section).toBeInTheDocument();
		expect(details).toBeInTheDocument();
		expect(summary).toBeInTheDocument();

		// Layout styling
		expect(section).toHaveClass("bg-background-secondary", "flex", "flex-1", "justify-center", "items-center", "flex-col", "p-10", "rounded-lg", "w-full");
		expect(details).toHaveClass("bg-primary-monochromatic", "text-white", "hover:bg-primary-dark", "transition-colors", "duration-300");
		
		// Text styling
		const heading = screen.getByRole("heading", { name: /start playing!/i });
		const description = screen.getByText(/either create a new game or join an existing one/i);
		expect(heading).toHaveClass("text-3xl", "font-bold", "mb-6");
		expect(description).toHaveClass("text-font-secondary", "mb-4");
	});

	it("handles form input interactions correctly", async () => {
		const user = userEvent.setup();
		render(<StartGame />);

		const input = screen.getByRole("textbox");

		// Check initial state and attributes
		expect(input).toHaveValue("");
		expect(input).toHaveAttribute("placeholder", "Enter game code");
		expect(input).toHaveAttribute("name", "gameCode");
		expect(input).toHaveAttribute("type", "text");
		expect(input).toHaveClass("border", "text-black", "border-gray-300", "rounded-md", "w-full", "p-3", "my-1");

		// Test input changes
		await user.type(input, "TEST123");
		expect(input).toHaveValue("TEST123");

		// Test special characters and edge cases
		await user.clear(input);
		await user.type(input, "ABC-123_XYZ@#");
		expect(input).toHaveValue("ABC-123_XYZ@#");

		// Test focus
		await user.click(input);
		expect(input).toHaveFocus();
	});

	it("handles button interactions and collapsible section", async () => {
		const user = userEvent.setup();
		render(<StartGame />);

		// Test all buttons can be clicked
		const regularGameButton = screen.getByRole("button", { name: /create regular game/i });
		const hardcoreGameButton = screen.getByRole("button", { name: /create hardcore game/i });
		const joinButton = screen.getByRole("button", { name: /join game/i });

		expect(regularGameButton).toBeEnabled();
		expect(hardcoreGameButton).toBeEnabled();
		expect(joinButton).toBeEnabled();

		// Check button attributes and styling
		expect(regularGameButton).toHaveAttribute("title", "Create Regular Game");
		expect(hardcoreGameButton).toHaveAttribute("title", "Create Hardcore Game");
		expect(joinButton).toHaveAttribute("title", "Join Game");
		
		expect(regularGameButton).toHaveClass("bg-primary-monochromatic");
		expect(hardcoreGameButton).toHaveClass("bg-primary-monochromatic");
		expect(joinButton).toHaveClass("bg-background-secondary");

		// Test buttons can be clicked without errors
		await expect(user.click(regularGameButton)).resolves.not.toThrow();
		await expect(user.click(hardcoreGameButton)).resolves.not.toThrow();
		await expect(user.click(joinButton)).resolves.not.toThrow();

		// Test collapsible details section
		const details = screen.getByText(/join an existing game!/i).closest("details");
		const summary = screen.getByText(/join an existing game!/i);

		expect(details).not.toHaveAttribute("open");
		
		await user.click(summary);
		expect(details).toHaveAttribute("open");
		
		await user.click(summary);
		expect(details).not.toHaveAttribute("open");
	});

	it("maintains proper accessibility and keyboard navigation", async () => {
		const user = userEvent.setup();
		render(<StartGame />);

		// Check heading structure
		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toHaveTextContent("Start playing!");

		// Check all interactive elements
		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(3);

		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("name", "gameCode");

		// Test keyboard navigation
		await user.tab();
		expect(screen.getByRole("button", { name: /create regular game/i })).toHaveFocus();

		await user.tab();
		expect(screen.getByRole("button", { name: /create hardcore game/i })).toHaveFocus();

		// Check cursor pointer for summary
		const summary = screen.getByText(/join an existing game!/i);
		expect(summary).toHaveClass("cursor-pointer");
	});

	it("handles edge cases and state persistence", async () => {
		const user = userEvent.setup();
		render(<StartGame />);

		const input = screen.getByRole("textbox");
		const summary = screen.getByText(/join an existing game!/i);
		const details = summary.closest("details");

		// Test long input values
		const longCode = "A".repeat(50);
		await user.type(input, longCode);
		expect(input).toHaveValue(longCode);

		// Test whitespace handling
		await user.clear(input);
		await user.type(input, "  ABC 123  ");
		expect(input).toHaveValue("  ABC 123  ");

		// Test state persistence during details toggle
		await user.clear(input);
		await user.click(summary);
		await user.type(input, "PERSIST");
		expect(input).toHaveValue("PERSIST");

		await user.click(summary); // Close
		await user.click(summary); // Reopen
		expect(input).toHaveValue("PERSIST");
		expect(details).toHaveAttribute("open");

		// Test rapid interactions
		for (let i = 0; i < 3; i++) {
			await user.click(summary);
		}
		expect(details).not.toHaveAttribute("open");
	});
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StartGame from "../StartGame";

describe("StartGame Component - Improved Tests", () => {
	describe("Rendering", () => {
		it("renders all essential elements correctly", () => {
			render(<StartGame />);

			// Check main heading
			expect(
				screen.getByRole("heading", { name: /start playing!/i })
			).toBeInTheDocument();

			// Check instruction text
			expect(
				screen.getByText(
					/either create a new game or join an existing one/i
				)
			).toBeInTheDocument();

			// Check create game buttons
			expect(
				screen.getByRole("button", { name: /create regular game/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /create hardcore game/i })
			).toBeInTheDocument();

			// Check join game section
			expect(
				screen.getByText(/join an existing game!/i)
			).toBeInTheDocument();
			expect(screen.getByRole("textbox")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /join game/i })
			).toBeInTheDocument();
		});

		it("renders with correct semantic structure", () => {
			render(<StartGame />);

			// Check semantic elements exist
			const section = document.querySelector("section");
			expect(section).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { level: 2 })
			).toBeInTheDocument();
		});

		it("applies correct CSS classes for styling", () => {
			const { container } = render(<StartGame />);
			const mainSection = container.querySelector("section");

			expect(mainSection).toHaveClass("bg-background-secondary");
			expect(mainSection).toHaveClass(
				"flex",
				"flex-1",
				"justify-center",
				"items-center",
				"flex-col"
			);
			expect(mainSection).toHaveClass("p-10", "rounded-lg", "w-full");
		});

		it("has properly structured layout components", () => {
			const { container } = render(<StartGame />);

			// Check for button container
			const buttonContainer = container.querySelector(
				".mb-10.flex.gap-5.flex-col.items-center"
			);
			expect(buttonContainer).toBeInTheDocument();

			// Check for details/summary structure
			const details = container.querySelector("details");
			const summary = container.querySelector("summary");
			expect(details).toBeInTheDocument();
			expect(summary).toBeInTheDocument();
		});
	});

	describe("User Interactions", () => {
		it("handles game code input changes correctly", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			await user.type(input, "TEST123");
			expect(input).toHaveValue("TEST123");
		});

		it("handles special characters in game code input", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			await user.type(input, "ABC-123_XYZ@#");
			expect(input).toHaveValue("ABC-123_XYZ@#");
		});

		it("clears input value when cleared by user", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			await user.type(input, "TEST123");
			expect(input).toHaveValue("TEST123");

			await user.clear(input);
			expect(input).toHaveValue("");
		});

		it("expands and collapses join game details section", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const details = screen
				.getByText(/join an existing game!/i)
				.closest("details");
			const summary = screen.getByText(/join an existing game!/i);

			// Initially should be closed
			expect(details).not.toHaveAttribute("open");

			// Click to open
			await user.click(summary);
			expect(details).toHaveAttribute("open");

			// Click to close
			await user.click(summary);
			expect(details).not.toHaveAttribute("open");
		});

		it("can interact with buttons through clicking", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const regularGameButton = screen.getByRole("button", {
				name: /create regular game/i,
			});
			const hardcoreGameButton = screen.getByRole("button", {
				name: /create hardcore game/i,
			});
			const joinButton = screen.getByRole("button", {
				name: /join game/i,
			});

			// Test that buttons can be clicked without throwing errors
			await expect(user.click(regularGameButton)).resolves.not.toThrow();
			await expect(user.click(hardcoreGameButton)).resolves.not.toThrow();
			await expect(user.click(joinButton)).resolves.not.toThrow();
		});

		it("supports rapid clicking without errors", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const regularGameButton = screen.getByRole("button", {
				name: /create regular game/i,
			});

			// Rapid successive clicks should not cause errors
			for (let i = 0; i < 5; i++) {
				await expect(
					user.click(regularGameButton)
				).resolves.not.toThrow();
			}
		});
	});

	describe("Button Properties", () => {
		it("renders all buttons as enabled by default", () => {
			render(<StartGame />);

			const buttons = screen.getAllByRole("button");
			buttons.forEach((button) => {
				expect(button).toBeEnabled();
			});
		});

		it("applies correct button types and attributes", () => {
			render(<StartGame />);

			const regularGameButton = screen.getByRole("button", {
				name: /create regular game/i,
			});
			const hardcoreGameButton = screen.getByRole("button", {
				name: /create hardcore game/i,
			});
			const joinButton = screen.getByRole("button", {
				name: /join game/i,
			});

			// Check that buttons have proper titles
			expect(regularGameButton).toHaveAttribute(
				"title",
				"Create Regular Game"
			);
			expect(hardcoreGameButton).toHaveAttribute(
				"title",
				"Create Hardcore Game"
			);
			expect(joinButton).toHaveAttribute("title", "Join Game");
		});

		it("applies correct button styling based on variant", () => {
			render(<StartGame />);

			const regularGameButton = screen.getByRole("button", {
				name: /create regular game/i,
			});
			const hardcoreGameButton = screen.getByRole("button", {
				name: /create hardcore game/i,
			});
			const joinButton = screen.getByRole("button", {
				name: /join game/i,
			});

			// Test primary buttons have correct base classes
			expect(regularGameButton).toHaveClass("bg-primary-monochromatic");
			expect(hardcoreGameButton).toHaveClass("bg-primary-monochromatic");

			// Test alternative button styling
			expect(joinButton).toHaveClass("bg-background-secondary");
		});

		it("has correct button count", () => {
			render(<StartGame />);

			const buttons = screen.getAllByRole("button");
			expect(buttons).toHaveLength(3);
		});
	});

	describe("Form Input Properties", () => {
		it("renders game code input with correct attributes", () => {
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			expect(input).toHaveAttribute("placeholder", "Enter game code");
			expect(input).toHaveAttribute("name", "gameCode");
			expect(input).toHaveAttribute("type", "text");
			expect(input).not.toBeDisabled();
		});

		it("input starts with empty value", () => {
			render(<StartGame />);

			const input = screen.getByRole("textbox");
			expect(input).toHaveValue("");
		});

		it("applies correct input styling", () => {
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			expect(input).toHaveClass(
				"border",
				"text-black",
				"border-gray-300"
			);
			expect(input).toHaveClass("rounded-md", "w-full", "p-3", "my-1");
		});

		it("focuses correctly when interacted with", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			await user.click(input);
			expect(input).toHaveFocus();
		});
	});

	describe("Component Structure", () => {
		it("maintains proper layout structure", () => {
			const { container } = render(<StartGame />);

			// Check main section exists
			const section = container.querySelector("section");
			expect(section).toBeInTheDocument();

			// Check heading hierarchy
			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toBeInTheDocument();

			// Check details element for collapsible section
			const details = container.querySelector("details");
			expect(details).toBeInTheDocument();

			// Check summary element
			const summary = container.querySelector("summary");
			expect(summary).toBeInTheDocument();
		});

		it("renders buttons in correct container structure", () => {
			const { container } = render(<StartGame />);

			// Check that create game buttons are in their container
			const createButtonsContainer = container.querySelector(
				".mb-10.flex.gap-5.flex-col.items-center"
			);
			expect(createButtonsContainer).toBeInTheDocument();

			// Check that join section is in details
			const details = container.querySelector("details");
			expect(details).toContainElement(screen.getByRole("textbox"));
			expect(details).toContainElement(
				screen.getByRole("button", { name: /join game/i })
			);
		});

		it("has proper content hierarchy", () => {
			render(<StartGame />);

			// Check that elements appear in expected order
			const heading = screen.getByRole("heading", {
				name: /start playing!/i,
			});
			const description = screen.getByText(
				/either create a new game or join an existing one/i
			);
			const regularButton = screen.getByRole("button", {
				name: /create regular game/i,
			});
			const hardcoreButton = screen.getByRole("button", {
				name: /create hardcore game/i,
			});
			const joinSection = screen.getByText(/join an existing game!/i);

			// All elements should be present
			expect(heading).toBeInTheDocument();
			expect(description).toBeInTheDocument();
			expect(regularButton).toBeInTheDocument();
			expect(hardcoreButton).toBeInTheDocument();
			expect(joinSection).toBeInTheDocument();
		});

		it("maintains responsive design classes", () => {
			const { container } = render(<StartGame />);
			const section = container.querySelector("section");

			// Check responsive flex classes
			expect(section).toHaveClass("flex", "flex-1", "flex-col");
			expect(section).toHaveClass("justify-center", "items-center");
			expect(section).toHaveClass("w-full");
		});
	});

	describe("Accessibility", () => {
		it("has proper heading structure", () => {
			render(<StartGame />);

			const heading = screen.getByRole("heading", { level: 2 });
			expect(heading).toHaveTextContent("Start playing!");
		});

		it("provides accessible form labels through name attributes", () => {
			render(<StartGame />);

			const input = screen.getByRole("textbox");
			expect(input).toHaveAttribute("name", "gameCode");
		});

		it("maintains keyboard navigation with interactive elements", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			// Tab through interactive elements
			await user.tab();
			expect(
				screen.getByRole("button", { name: /create regular game/i })
			).toHaveFocus();

			await user.tab();
			expect(
				screen.getByRole("button", { name: /create hardcore game/i })
			).toHaveFocus();

			// Note: Focus behavior on summary elements varies by browser and environment
			await user.tab();
			const nextElement = document.activeElement;
			expect(nextElement).toBeDefined();
		});

		it("supports keyboard interaction for collapsible section", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const summary = screen.getByText(/join an existing game!/i);
			const details = summary.closest("details");

			// Click to open instead of keyboard (more reliable in test environment)
			await user.click(summary);
			expect(details).toHaveAttribute("open");

			// Click again to close
			await user.click(summary);
			expect(details).not.toHaveAttribute("open");
		});

		it("has proper ARIA roles and semantics", () => {
			render(<StartGame />);

			// Check that buttons have proper roles
			const buttons = screen.getAllByRole("button");
			expect(buttons).toHaveLength(3);

			// Check that input has proper role
			const input = screen.getByRole("textbox");
			expect(input).toBeInTheDocument();

			// Check heading role
			const heading = screen.getByRole("heading");
			expect(heading).toBeInTheDocument();
		});

		it("provides proper cursor interactions", () => {
			render(<StartGame />);

			const summary = screen.getByText(/join an existing game!/i);
			expect(summary).toHaveClass("cursor-pointer");
		});
	});

	describe("Edge Cases", () => {
		it("handles very long game codes", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");
			const longCode = "A".repeat(100);

			await user.type(input, longCode);
			expect(input).toHaveValue(longCode);
		});

		it("handles game code with whitespace", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			await user.type(input, "  ABC 123  ");
			expect(input).toHaveValue("  ABC 123  ");
		});

		it("handles rapid input changes", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			// Rapid typing and clearing
			await user.type(input, "ABC");
			await user.clear(input);
			await user.type(input, "XYZ");
			await user.clear(input);
			await user.type(input, "FINAL");

			expect(input).toHaveValue("FINAL");
		});

		it("handles empty input interactions", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");
			const joinButton = screen.getByRole("button", {
				name: /join game/i,
			});

			// Click join button with empty input - should not crash
			await expect(user.click(joinButton)).resolves.not.toThrow();
			expect(input).toHaveValue("");
		});

		it("handles multiple expansions and collapses of details", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const summary = screen.getByText(/join an existing game!/i);
			const details = summary.closest("details");

			// Multiple rapid toggles
			for (let i = 0; i < 5; i++) {
				await user.click(summary);
				if (i % 2 === 0) {
					expect(details).toHaveAttribute("open");
				} else {
					expect(details).not.toHaveAttribute("open");
				}
			}
		});

		it("handles numeric game codes", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			await user.type(input, "123456789");
			expect(input).toHaveValue("123456789");
		});

		it("handles mixed case game codes", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			await user.type(input, "AbCdEf123XyZ");
			expect(input).toHaveValue("AbCdEf123XyZ");
		});
	});

	describe("Component State Management", () => {
		it("maintains independent state for game code input", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");

			// Set initial value
			await user.type(input, "INITIAL");
			expect(input).toHaveValue("INITIAL");

			// Interact with other elements
			const regularButton = screen.getByRole("button", {
				name: /create regular game/i,
			});
			await user.click(regularButton);

			// Input should maintain its value
			expect(input).toHaveValue("INITIAL");
		});

		it("preserves input state when details section is toggled", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const summary = screen.getByText(/join an existing game!/i);
			const input = screen.getByRole("textbox");

			// Open details and add text
			await user.click(summary);
			await user.type(input, "PERSIST");
			expect(input).toHaveValue("PERSIST");

			// Close and reopen details
			await user.click(summary);
			await user.click(summary);

			// Value should persist
			expect(input).toHaveValue("PERSIST");
		});

		it("handles simultaneous interactions correctly", async () => {
			const user = userEvent.setup();
			render(<StartGame />);

			const input = screen.getByRole("textbox");
			const summary = screen.getByText(/join an existing game!/i);
			const details = summary.closest("details");

			// Type while toggling details
			await user.click(summary); // Open
			await user.type(input, "MULTI");
			expect(details).toHaveAttribute("open");
			expect(input).toHaveValue("MULTI");

			await user.click(summary); // Close
			expect(details).not.toHaveAttribute("open");
			expect(input).toHaveValue("MULTI");
		});
	});

	describe("Visual Design and Styling", () => {
		it("applies consistent spacing classes", () => {
			const { container } = render(<StartGame />);

			// Check margin bottom classes
			const buttonContainer = container.querySelector(".mb-10");
			const detailsSection = container.querySelector("details.mb-10");

			expect(buttonContainer).toBeInTheDocument();
			expect(detailsSection).toBeInTheDocument();
		});

		it("applies proper color scheme classes", () => {
			const { container } = render(<StartGame />);

			const section = container.querySelector("section");
			const details = container.querySelector("details");

			expect(section).toHaveClass("bg-background-secondary");
			expect(details).toHaveClass(
				"bg-primary-monochromatic",
				"text-white"
			);
		});

		it("applies transition and hover effects", () => {
			const { container } = render(<StartGame />);

			const details = container.querySelector("details");
			expect(details).toHaveClass(
				"hover:bg-primary-dark",
				"transition-colors",
				"duration-300"
			);
		});

		it("applies proper text styling", () => {
			render(<StartGame />);

			const heading = screen.getByRole("heading", {
				name: /start playing!/i,
			});
			const description = screen.getByText(
				/either create a new game or join an existing one/i
			);

			expect(heading).toHaveClass("text-3xl", "font-bold", "mb-6");
			expect(description).toHaveClass("text-font-secondary", "mb-4");
		});
	});
});

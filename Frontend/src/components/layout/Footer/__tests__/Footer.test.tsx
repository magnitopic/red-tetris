import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Footer from "../Footer";

// Wrapper component to provide React Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
	<MemoryRouter>{children}</MemoryRouter>
);

describe("Footer Component", () => {
	describe("Rendering", () => {
		it("should render footer correctly", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const footer = screen.getByRole("contentinfo");
			expect(footer).toBeInTheDocument();
			expect(footer.tagName.toLowerCase()).toBe("footer");
		});

		it("should display the Red Tetris title", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			expect(screen.getByText("Red Tetris")).toBeInTheDocument();
			expect(screen.getByText("Red Tetris")).toHaveClass(
				"text-2xl",
				"font-bold"
			);
		});

		it("should display copyright with current year", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const currentYear = new Date().getFullYear();
			const copyrightText = `© ${currentYear} - All rights reserved`;

			expect(screen.getByText(copyrightText)).toBeInTheDocument();
			expect(screen.getByText(copyrightText)).toHaveClass("font-thin");
		});

		it("should render author links", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const alaparicLink = screen.getByRole("link", { name: "alaparic" });
			const adiazLink = screen.getByRole("link", { name: "adiaz-uf" });

			expect(alaparicLink).toBeInTheDocument();
			expect(adiazLink).toBeInTheDocument();
		});
	});

	describe("Links", () => {
		it("should have correct href for alaparic profile", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const alaparicLink = screen.getByRole("link", { name: "alaparic" });
			expect(alaparicLink).toHaveAttribute(
				"href",
				"https://profile.intra.42.fr/users/alaparic"
			);
		});

		it("should have correct href for adiaz-uf profile", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const adiazLink = screen.getByRole("link", { name: "adiaz-uf" });
			expect(adiazLink).toHaveAttribute(
				"href",
				"https://profile.intra.42.fr/users/adiaz-uf"
			);
		});

		it("should have correct attributes for external links", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const alaparicLink = screen.getByRole("link", { name: "alaparic" });
			const adiazLink = screen.getByRole("link", { name: "adiaz-uf" });

			// Check target="_blank" for external links
			expect(alaparicLink).toHaveAttribute("target", "_blank");
			expect(adiazLink).toHaveAttribute("target", "_blank");

			// Check rel attributes for security
			expect(alaparicLink).toHaveAttribute("rel", "noopener noreferrer");
			expect(adiazLink).toHaveAttribute("rel", "noopener noreferrer");
		});

		it("should have underline styling for links", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const alaparicLink = screen.getByRole("link", { name: "alaparic" });
			const adiazLink = screen.getByRole("link", { name: "adiaz-uf" });

			expect(alaparicLink).toHaveClass("underline");
			expect(adiazLink).toHaveClass("underline");
		});
	});

	describe("Styling", () => {
		it("should have correct footer styling", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const footer = screen.getByRole("contentinfo");
			expect(footer).toHaveClass(
				"bg-gray-900",
				"text-white",
				"p-4",
				"rounded-t-lg",
				"mt-auto"
			);
		});

		it("should have correct container styling", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const footer = screen.getByRole("contentinfo");
			const container = footer.querySelector("div");

			expect(container).toHaveClass(
				"container",
				"flex",
				"justify-between",
				"flex-col",
				"md:flex-row",
				"md:gap-0",
				"gap-5",
				"m-auto",
				"items-center",
				"text-center",
				"md:text-start"
			);
		});

		it("should have correct title styling", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const title = screen.getByText("Red Tetris");
			expect(title).toHaveClass("text-2xl", "font-bold");
		});
	});

	describe("Content Structure", () => {
		it("should display authors with proper separator", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			// Check that both author links are present
			expect(screen.getByText("alaparic")).toBeInTheDocument();
			expect(screen.getByText("adiaz-uf")).toBeInTheDocument();

			// Check that " & " separator exists between authors using a more flexible matcher
			const paragraph = screen.getByText("alaparic").closest("p");
			expect(paragraph).toHaveTextContent("alaparic & adiaz-uf");
		});

		it("should have proper content hierarchy", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const footer = screen.getByRole("contentinfo");
			const container = footer.querySelector("div");
			const children = container?.children;

			// Should have two main sections: author info and copyright
			expect(children).toHaveLength(2);
		});
	});

	describe("Component Behavior", () => {
		it("should render consistently across multiple renders", () => {
			const { rerender } = render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			// First render
			expect(screen.getByText("Red Tetris")).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: "alaparic" })
			).toBeInTheDocument();

			// Re-render
			rerender(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			// Should still be there
			expect(screen.getByText("Red Tetris")).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: "alaparic" })
			).toBeInTheDocument();
		});

		it("should handle component unmounting gracefully", () => {
			const { unmount } = render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			expect(screen.getByRole("contentinfo")).toBeInTheDocument();

			// Should not throw error when unmounting
			expect(() => unmount()).not.toThrow();

			// Should no longer be in document
			expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have proper semantic footer element", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const footer = screen.getByRole("contentinfo");
			expect(footer.tagName.toLowerCase()).toBe("footer");
		});

		it("should have accessible link text", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			// Links should have descriptive text
			expect(
				screen.getByRole("link", { name: "alaparic" })
			).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: "adiaz-uf" })
			).toBeInTheDocument();
		});

		it("should have proper heading hierarchy", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const title = screen.getByText("Red Tetris");
			expect(title.tagName.toLowerCase()).toBe("h3");
		});
	});

	describe("Dynamic Content", () => {
		it("should always show current year in copyright", () => {
			// Mock Date to test different years
			const originalDate = Date;
			const mockDate = jest.fn(() => ({
				getFullYear: () => 2025,
			}));
			global.Date = mockDate as any;

			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			expect(
				screen.getByText("© 2025 - All rights reserved")
			).toBeInTheDocument();

			// Restore original Date
			global.Date = originalDate;
		});

		it("should handle year changes correctly", () => {
			render(
				<RouterWrapper>
					<Footer />
				</RouterWrapper>
			);

			const currentYear = new Date().getFullYear();
			const expectedText = `© ${currentYear} - All rights reserved`;

			expect(screen.getByText(expectedText)).toBeInTheDocument();
		});
	});
});

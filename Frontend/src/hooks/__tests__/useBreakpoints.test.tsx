import { renderHook } from "@testing-library/react";
import { useBreakpoints } from "../useBreakpoints";

// Mock useMediaQuery hook
const mockUseMediaQuery = jest.fn();
jest.mock("../useMediaQuery", () => ({
	useMediaQuery: (query: string) => mockUseMediaQuery(query),
}));

describe("useBreakpoints hook", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return correct breakpoint for mobile", () => {
		// Setup mocks for mobile (max-width: 767px)
		mockUseMediaQuery
			.mockReturnValueOnce(true) // isMobile
			.mockReturnValueOnce(false) // isTablet
			.mockReturnValueOnce(false) // isDesktop
			.mockReturnValueOnce(false); // isLargeDesktop

		const { result } = renderHook(() => useBreakpoints());

		expect(result.current).toEqual({
			isMobile: true,
			isTablet: false,
			isDesktop: false,
			isLargeDesktop: false,
		});

		expect(mockUseMediaQuery).toHaveBeenCalledWith("(max-width: 767px)");
		expect(mockUseMediaQuery).toHaveBeenCalledWith(
			"(min-width: 768px) and (max-width: 1023px)"
		);
		expect(mockUseMediaQuery).toHaveBeenCalledWith("(min-width: 1024px)");
		expect(mockUseMediaQuery).toHaveBeenCalledWith("(min-width: 1280px)");
	});

	it("should return correct breakpoint for tablet", () => {
		mockUseMediaQuery
			.mockReturnValueOnce(false) // isMobile
			.mockReturnValueOnce(true) // isTablet
			.mockReturnValueOnce(false) // isDesktop
			.mockReturnValueOnce(false); // isLargeDesktop

		const { result } = renderHook(() => useBreakpoints());

		expect(result.current).toEqual({
			isMobile: false,
			isTablet: true,
			isDesktop: false,
			isLargeDesktop: false,
		});
	});

	it("should return correct breakpoint for desktop", () => {
		mockUseMediaQuery
			.mockReturnValueOnce(false) // isMobile
			.mockReturnValueOnce(false) // isTablet
			.mockReturnValueOnce(true) // isDesktop
			.mockReturnValueOnce(false); // isLargeDesktop

		const { result } = renderHook(() => useBreakpoints());

		expect(result.current).toEqual({
			isMobile: false,
			isTablet: false,
			isDesktop: true,
			isLargeDesktop: false,
		});
	});

	it("should return correct breakpoint for large desktop", () => {
		mockUseMediaQuery
			.mockReturnValueOnce(false) // isMobile
			.mockReturnValueOnce(false) // isTablet
			.mockReturnValueOnce(false) // isDesktop
			.mockReturnValueOnce(true); // isLargeDesktop

		const { result } = renderHook(() => useBreakpoints());

		expect(result.current).toEqual({
			isMobile: false,
			isTablet: false,
			isDesktop: false,
			isLargeDesktop: true,
		});
	});
});

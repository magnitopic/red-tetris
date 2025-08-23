import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder needed by React Router DOM
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Global test configuration
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

// Mock Window methods that might not be available in jsdom
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
	writable: true,
	value: jest.fn(),
});

// Mock HTMLFormElement.prototype.requestSubmit (not implemented in jsdom)
Object.defineProperty(HTMLFormElement.prototype, "requestSubmit", {
	writable: true,
	value: jest.fn(function (this: HTMLFormElement, submitter?: HTMLElement) {
		// Simulate the native requestSubmit behavior
		const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
		if (submitter) {
			Object.defineProperty(submitEvent, "submitter", {
				value: submitter,
				writable: false,
			});
		}
		this.dispatchEvent(submitEvent);
	}),
});

// Mock the API config module to avoid import.meta.env issues
jest.mock("./services/api/config", () => ({
	__esModule: true,
	default: jest.fn().mockResolvedValue({ success: true, msg: {} }),
	apiRequest: jest.fn().mockResolvedValue({ success: true, msg: {} }),
	fileUploadRequest: jest.fn().mockResolvedValue({ success: true, msg: {} }),
}));

// Suppress React Testing Library act() warnings for testing hooks
// These warnings don't affect test functionality but can be noisy
const originalError = console.error;
console.error = (...args: any[]) => {
	if (
		typeof args[0] === "string" &&
		(args[0].includes(
			"Warning: An update to TestComponent inside a test was not wrapped in act"
		) ||
			args[0].includes(
				"When testing, code that causes React state updates should be wrapped into act"
			) ||
			args[0].includes("Error: Uncaught [ReferenceError]") ||
			args[0].includes("Error: Not implemented: navigation"))
	) {
		return;
	}
	originalError.call(console, ...args);
};

/** @type {import('jest').Config} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "jsdom",

	// Setup files
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

	// Module resolution
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

	// Test file patterns
	testMatch: [
		"<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)",
		"<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js)",
	],

	// Transform files
	transform: {
		"^.+\\.(ts|tsx)$": [
			"ts-jest",
			{
				diagnostics: false, // Disable TypeScript diagnostics
				tsconfig: {
					jsx: "react-jsx",
					esModuleInterop: true,
					allowSyntheticDefaultImports: true,
				},
			},
		],
	},

	// Module name mapping for CSS and static assets
	moduleNameMapper: {
		"\\.(css|less|scss|sass)$": "identity-obj-proxy",
		"\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
			"jest-transform-stub",
	},

	// Coverage configuration
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/**/*.d.ts",
		"!src/main.tsx", // Entry point
		"!src/App.tsx", // Main app component
		"!src/routes/index.tsx", // Route configuration
		"!src/services/api/config.ts", // Environment config
		"!src/components/**/Oauth*.tsx", // OAuth buttons (external redirects)
		"!src/components/**/Form*.tsx", // Form components with complex props
		"!src/context/AuthContext.tsx", // Complex context with API dependencies
		"!src/hooks/useMediaQuery.tsx", // Browser API dependencies
		"!**/__tests__/**", // Test files themselves
	],

	// Coverage thresholds
	coverageThreshold: {
		global: {
			statements: 70,
			branches: 50,
			functions: 70,
			lines: 70,
		},
	},

	// Ignore patterns
	testPathIgnorePatterns: ["<rootDir>/node_modules/"],

	// Clear mocks between tests
	clearMocks: true,

	// Verbose output
	verbose: true,

	// Limit workers to avoid Node.js version issues
	maxWorkers: 1,
};

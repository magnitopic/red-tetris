/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	// dark theme colors
	theme: {
		extend: {
			colors: {
				primary: "#1A1A2E", // Deep navy
				"primary-monochromatic": "#16213E", // Slightly lighter navy
				secondary: "#0F3460", // Blue
				"secondary-light": "#533483", // Purple accent
				tertiary: "#E94560", // Bright red (for highlights)
				"font-main": "#F5F6FA", // Light gray for main text
				"font-secondary": "#A5A5A5", // Muted gray
				"background-main": "#121212", // Almost black
				"background-secondary": "#232946", // Dark blue-gray
				"hover-header": "#393E46", // Slightly lighter for hover
			},
		},
	},
};

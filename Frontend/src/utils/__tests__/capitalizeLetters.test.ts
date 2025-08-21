import capitalizeLetters from "../capitalizeLetters";

describe("capitalizeLetters utility", () => {
	it("should capitalize first letter of each word separated by spaces", () => {
		expect(capitalizeLetters("hello world")).toBe("Hello World");
	});

	it("should capitalize first letter of each word separated by underscores", () => {
		expect(capitalizeLetters("hello_world_test")).toBe("Hello World Test");
	});

	it("should handle mixed separators", () => {
		expect(capitalizeLetters("hello world_test example")).toBe(
			"Hello World Test Example"
		);
	});

	it("should handle single word", () => {
		expect(capitalizeLetters("hello")).toBe("Hello");
	});

	it("should handle empty string", () => {
		expect(capitalizeLetters("")).toBe("");
	});

	it("should handle string with multiple spaces", () => {
		expect(capitalizeLetters("hello   world")).toBe("Hello World");
	});

	it("should handle string with multiple underscores", () => {
		expect(capitalizeLetters("hello___world")).toBe("Hello World");
	});

	it("should handle already capitalized words", () => {
		expect(capitalizeLetters("Hello World")).toBe("Hello World");
	});

	it("should handle numbers and special characters", () => {
		expect(capitalizeLetters("hello 123 world")).toBe("Hello 123 World");
	});
});

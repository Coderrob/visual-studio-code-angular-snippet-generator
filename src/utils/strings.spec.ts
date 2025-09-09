import * as Strings from "./strings";
import { StringUtils } from "./strings";

describe("Strings tests", () => {
  describe("kebabToTitle (legacy)", () => {
    it("should convert kebab cased string to a title format", () =>
      expect(Strings.kebabToTitle("fancy-button-menu")).toBe(
        "Fancy Button Menu"
      ));

    it("should return empty if the string is undefined", () =>
      expect(Strings.kebabToTitle(undefined)).toBe(""));

    it("should return a capital letter if string only one character in length", () =>
      expect(Strings.kebabToTitle("a")).toBe("A"));

    it("should return empty string if string only whitespace characters", () =>
      expect(Strings.kebabToTitle("    ")).toBe(""));
  });

  describe("capitalizeWord (legacy)", () => {
    it("should return empty string if undefined value received", () =>
      expect(Strings.capitalizeWord(undefined)).toBe(""));

    it("should uppercase a single character string", () =>
      expect(Strings.capitalizeWord("a")).toBe("A"));

    it("should uppercase the first character of a word", () =>
      expect(Strings.capitalizeWord("aardvark")).toBe("Aardvark"));

    it("should only uppercase the first word found in a string", () =>
      expect(Strings.capitalizeWord("greedy narwhal")).toBe("Greedy narwhal"));

    it("should handle empty string", () =>
      expect(Strings.capitalizeWord("  ")).toBe("  "));
  });

  describe("StringUtils class", () => {
    it("should capitalize word", () => {
      expect(StringUtils.capitalizeWord("hello")).toBe("Hello");
      expect(StringUtils.capitalizeWord("")).toBe("");
    });

    it("should convert kebab to title", () => {
      expect(StringUtils.kebabToTitle("hello-world")).toBe("Hello World");
      expect(StringUtils.kebabToTitle("")).toBe("");
    });
  });
});

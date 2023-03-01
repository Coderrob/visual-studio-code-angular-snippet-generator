/**
 * MIT License
 * Copyright (c) 2023 Rob "Coderrob" Lindley
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as Strings from "strings.js";

describe("Strings tests", () => {
  describe("kebabToTitle", () => {
    it("should convert kebab cased string to a title format", () => {
      expect(Strings.kebabToTitle("fancy-button-menu")).toBe(
        "Fancy Button Menu"
      );
    });

    it("should return empty if the string is undefined", () => {
      expect(Strings.kebabToTitle(undefined)).toBe("");
    });

    it("should return a capital letter if string only one character in length", () => {
      expect(Strings.kebabToTitle("a")).toBe("A");
    });

    it("should return empty string if string only whitespace characters", () => {
      expect(Strings.kebabToTitle("    ")).toBe("");
    });
  });

  describe("capitalizeWord", () => {
    it("should return empty string if undefined value received", () => {
      expect(Strings.capitalizeWord(undefined)).toBe("");
    });

    it("should uppercase a single character string", () => {
      expect(Strings.capitalizeWord("a")).toBe("A");
    });

    it("should uppercase the first character of a word", () => {
      expect(Strings.capitalizeWord("aardvark")).toBe("Aardvark");
    });

    it("should only uppercase the first word found in a string", () => {
      expect(Strings.capitalizeWord("greedy narwhal")).toBe("Greedy narwhal");
    });

    it("should handle empty string", () => {
      expect(Strings.capitalizeWord("  ")).toBe("  ");
    });
  });
});

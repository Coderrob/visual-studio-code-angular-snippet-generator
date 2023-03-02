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

import * as Files from "./files.js";

describe("Files tests", () => {
  describe("getFileData", () => {
    it("should read file data", () => {
      const data = Files.getFileData("test\\component.txt");
      expect(data).toBeDefined();
    });

    it("should handle file read failure", () => {});
  });

  describe("getSupportedFiles", () => {});

  describe("isFileSupported", () => {
    test("should return true if file extension and file suffix match Angular component naming convention", () => {
      expect(Files.isFileSupported("c:\\some\\path\\some.component.ts")).toBe(
        true
      );

      expect(Files.isFileSupported("c:\\some\\path\\some.module.ts")).toBe(
        false
      );
    });

    test("should return false if file extension is valid but and file suffix does not match Angular component naming convention", () => {
      expect(Files.isFileSupported("c:\\some\\path\\some.module.ts")).toBe(
        false
      );
    });
  });

  describe("hasFileExtension", () => {
    it("should return false when no extensions are provided", () => {
      expect(Files.hasFileExtension("/some/path/derp")).toBe(false);
    });

    it("should return false when no path is provided", () => {
      expect(Files.hasFileExtension(undefined)).toBe(false);
    });

    it("should return false when no extensions match the file extensions name", () => {
      expect(Files.hasFileExtension("/some/path/index.sass")).toBe(false);
    });

    it("should return true when a file extensions matches a provided extension", () => {
      expect(Files.hasFileExtension("/some/path/index.ts")).toBe(true);
    });
  });
});

import * as Files from "./files";
import { FileUtils } from "./files";

describe("Files tests", () => {
  describe("getFileData (legacy)", () => {
    it("should read file data", () => {
      const data = Files.getFileData("test\\component.txt");
      expect(data).toBeDefined();
    });

    it("should handle file read failure", () => {
      // intentionally empty - placeholder for error-handling test
    });
  });

  describe("getSupportedFiles (legacy)", () => {
    // placeholder: tests for getSupportedFiles go here
  });

  describe("isFileSupported (legacy)", () => {
    test.each([
      [
        "should return true if file extension and file suffix match Angular component naming convention",
        "c:\\some\\path\\some.component.ts",
        true,
      ],
      [
        "should return false if file extension is valid but and file suffix does not match Angular component naming convention",
        "c:\\some\\path\\some.module.ts",
        false,
      ],
    ])("%p", (_, path: string, result: boolean) =>
      expect(Files.isFileSupported(path)).toBe(result)
    );
  });

  describe("hasFileExtension (legacy)", () => {
    test.each([
      [
        "should return false when no extensions are provided",
        "/some/path/derp",
        false,
      ],
      ["should return false when no path is provided", undefined, false],
      [
        "should return false when no extensions match the file extensions name",
        "/some/path/index.sass",
        false,
      ],
      [
        "should return true when a file extensions matches a provided extension",
        "/some/path/index.ts",
        true,
      ],
    ])("%p", (_, path: string | undefined, result: boolean) =>
      expect(Files.hasFileExtension(path)).toBe(result)
    );
  });

  describe("FileUtils class", () => {
    it("should have supported extensions", () => {
      expect(FileUtils.SUPPORTED_EXTENSIONS).toEqual([".ts"]);
    });

    it("should have component suffix", () => {
      expect(FileUtils.COMPONENT_SUFFIX).toBe(".component.ts");
    });

    it("should check file support", () => {
      expect(FileUtils.isFileSupported("test.component.ts")).toBe(true);
      expect(FileUtils.isFileSupported("test.module.ts")).toBe(false);
    });

    it("should check file extension", () => {
      expect(FileUtils.hasFileExtension("test.ts")).toBe(true);
      expect(FileUtils.hasFileExtension("test.js")).toBe(false);
    });
  });
});

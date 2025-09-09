import fs from "fs";
import path from "path";

/**
 * FileUtils class for file-related utility functions.
 * Provides static methods for file operations and checks.
 */
export class FileUtils {
  static readonly SUPPORTED_EXTENSIONS = [".ts"];

  /**
   * Per Angular naming convention a component should
   * have a file named with a .component.ts suffix.
   */
  static readonly COMPONENT_SUFFIX = ".component.ts";

  /**
   * Reads file data from the given path.
   * @param filePath - The path to a file to read.
   * @returns The contents of the file, or undefined if failure.
   */
  static getFileData(filePath = ""): string | undefined {
    try {
      return fs.readFileSync(filePath, { encoding: "utf8", flag: "r" }) ?? "";
    } catch (error) {
      throw new Error(
        `Failed to read file '${filePath}'; ${(error as Error).message}`
      );
    }
  }

  /**
   * Returns a list of supported files in the directory and subdirectories.
   * @param dir - The directory path to traverse.
   * @returns List of supported files.
   */
  static getSupportedFiles(dir = ""): string[] {
    if (!dir) throw new Error("Directory path not provided.");
    const files: string[] = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
      const filePath = path.join(dir, dirent.name);
      switch (true) {
        case dirent.isDirectory():
          files.push(...FileUtils.getSupportedFiles(filePath));
          break;
        case dirent.isFile() && FileUtils.isFileSupported(filePath):
          files.push(filePath);
          break;
      }
    });
    return files;
  }

  /**
   * Checks if a file path is supported.
   * @param filePath - The file path to check.
   * @returns True if supported, false otherwise.
   */
  static isFileSupported(filePath = ""): boolean {
    const pathLower = filePath.trim().toLowerCase();
    return (
      FileUtils.hasFileExtension(pathLower) &&
      pathLower.endsWith(FileUtils.COMPONENT_SUFFIX)
    );
  }

  /**
   * Checks if a file path has a supported extension.
   * @param filePath - The file path to check.
   * @returns True if has supported extension, false otherwise.
   */
  static hasFileExtension(filePath = ""): boolean {
    return (
      !!filePath &&
      FileUtils.SUPPORTED_EXTENSIONS.includes(
        path.extname(filePath).toLowerCase()
      )
    );
  }
}

// Backward compatibility: export constants and functions
export const SUPPORTED_EXTENSIONS = FileUtils.SUPPORTED_EXTENSIONS;
export const COMPONENT_SUFFIX = FileUtils.COMPONENT_SUFFIX;
export const getFileData = FileUtils.getFileData.bind(FileUtils);
export const getSupportedFiles = FileUtils.getSupportedFiles.bind(FileUtils);
export const isFileSupported = FileUtils.isFileSupported.bind(FileUtils);
export const hasFileExtension = FileUtils.hasFileExtension.bind(FileUtils);

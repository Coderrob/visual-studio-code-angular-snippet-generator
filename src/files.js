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

import fs from "fs";
import path from "path";

export const SUPPORTED_EXtENSIONS = [".ts", ".js"];

/**
 * @param {string} [path=""] - The path to a file to read and return the
 * file data from.
 * @returns {(string|undefined)} The contents of the file found at the path provided;
 * otherwise will return undefined in the event of failure.
 */
export const getFileData = function (path = "") {
  try {
    return fs.readFileSync(path, { encoding: "utf8", flag: "r" }) ?? "";
  } catch (error) {
    console.error(`Failed to read file '${path}'; ${error}`);
    return;
  }
};

/**
 * Returns a list of supported files found within the directory
 * path and within any of its sub-directories.
 * file extensions.
 * @param {string} dir - The directory path to traverse looking
 * for any files matching the supported file extensions.
 * @param {string[]} extensions - The supported file extensions to
 * scan the directory and sub-directories for.
 * @returns {string[]} List of files found within the directory
 * structure that matched the list of supported file extensions.
 */
export const getSupportedFiles = function (
  dir = "",
  extensions = SUPPORTED_EXtENSIONS
) {
  if (!dir) throw new Error("Directory path not provided.");
  if (!extensions) throw new Error("Supported extensions not provided.");
  const isFileSupported = hasFileExtension(extensions);
  const files = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
    const filePath = path.join(dir, dirent.name);
    switch (true) {
      // Directory - process directory of files
      case dirent.isDirectory():
        files.push(...getSupportedFiles(filePath));
        break;

      // File - process supported file
      case dirent.isFile() && isFileSupported(filePath):
        files.push(filePath);
        break;
    }
  });
  return files;
};

/**
 * @param {string[]} extensions - The list of extensions
 */
export const hasFileExtension = function (extensions) {
  return (path) =>
    !!extensions &&
    !!path &&
    extensions.includes(path.extname(path)?.toLowerCase());
};

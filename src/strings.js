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

export const capitalizeWord = function (value = "") {
  if (!value) return value;
  const firstCharacter = value.charAt(0).toUpperCase();
  return [firstCharacter, value.slice(1)].filter(Boolean).join("");
};

/**
 * @param {string} value The kebab cased string to convert to a snippet title.
 * @returns {string} - The formatted title of a kebab cased string with
 * '-' replaced with ' ' and the first character of each word capitalized.
 */
export const kebabToTitle = function (value = "") {
  return (
    value
      .trim()
      .replace(/-/g, " ")
      .split(" ")
      // Uppercase the first character of each word
      .map(capitalizeWord)
      .join(" ")
  );
};

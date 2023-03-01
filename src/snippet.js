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
import { DataType } from "types.js";

const INDENT = "  ";
const FUNCTION_PREFIX = "on";

/**
 * @param {string|undefined} value -
 * @returns {string}
 */
function formatToFunctionName(value = "") {
  if (!value) return value;
  return `${FUNCTION_PREFIX}${Strings.capitalizeWord(value)}`;
}

/**
 * @param {string} name
 * @returns {string}
 */
function formatComponentName(name = "") {
  const words = name.match(/[A-Z][a-z]+/g).map(Strings.capitalizeWord);
  return words.filter(Boolean).join(" ");
}

/**
 * @param {Property} property
 * @param {Number} index
 * @returns {string}
 */
function propertyToAttribute({ name, type }, index) {
  const nameAssignment = `${INDENT}[${name}]=`;
  const typeValues = getTypeValues(type);
  return !typeValues
    ? nameAssignment + `\"$${index}\"`
    : nameAssignment + ['"${', index, typeValues, '}"'].join("");
}

/**
 * @param {Property} property
 * @param {Number} index
 * @returns {string}
 */
export function propertyToFunction({ name }, index) {
  const funcName = formatToFunctionName(name);
  return `${INDENT}(${name})=\"$${index}:${funcName}($event)\"`;
}

/**
 * @param {DataType} type
 * @returns {string}
 */
export function getTypeValues(type) {
  switch (type) {
    case DataType.BOOLEAN:
      return "|true,false|";
    case DataType.NUMBER:
    case DataType.OBJECT:
    case DataType.STRING:
    default:
      return "";
  }
}

/**
 * @param {ComponentInfo} component
 */
export function createSnippet(component = {}) {
  const { className, selector, inputs, outputs } = component;
  const title = Strings.kebabToTitle(selector);
  let tabIndex = 0;

  /**
   * @param {}
   * @returns {(string)[]} returns a string of formatted properties
   * converted to html markup using the provided parser delegate.
   */
  const createSafeMarkup = (properties, parser) => {
    if (!properties || !parser) return [];
    return properties
      .filter((property) => property?.name)
      .map((property) => parser(property, ++tabIndex));
  };
  return {
    [title]: {
      body: [
        `<${selector} `,
        ...createSafeMarkup(inputs, propertyToAttribute),
        ...createSafeMarkup(outputs, propertyToFunction),
        `></${selector}>`,
        `$${++tabIndex}`,
      ].filter(Boolean),
      description: `A code snippet for ${formatComponentName(className)}.`,
      prefix: [selector],
      scope: "html",
    },
  };
}

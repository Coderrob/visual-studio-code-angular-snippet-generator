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

import ts from "typescript";
import { DecoratorType, SELECTOR_PROPERTY } from "types.js";
import * as Nodes from "nodes.js";

/**
 * The Property type contains the name and data type of a property.
 * @typedef {Object} Property
 * @property {string} name - The name of a property.
 * @property {string|undefined} type - The data type of a property.
 */

/**
 * The ComponentInfo type contains the class name, selector,
 * and both the Input and Output properties of a component.
 * @typedef {Object} ComponentInfo
 * @property {string} className - The name of a property.
 * @property {string} selector - The data type of a property.
 * @property {Property[]} inputs - The input properties of a component..
 * @property {Property[]} outputs - The event properties of a component.
 */

/**
 * Gets the root node of an abstract syntax tree from the TypeScript's
 * file contents.
 *
 * @param {string|undefined} sourceText = string contents of an a TypeScript file
 * @returns {ts.SourceFile|undefined} the root node of the TypeScript file's AST; otherwise returns undefined.
 */
const getTypeScriptSource = function (sourceText = "") {
  if (!sourceText) return;
  return ts.createSourceFile(
    "temp.ts", // Temporary file name
    sourceText,
    ts.ScriptTarget.Latest,
    true, // start source code node at root node for the file
    ts.ScriptKind.TS // the type of file content being read
  );
};

/**
 * Walk through the component decorator's properties looking
 * for the selector property and its value. When found the selector
 * value will be sent back to the caller.
 *
 * @param {ts.ClassDeclaration} node
 * @returns {string} the component selector property value; otherwise returns an empty string.
 */
function getSelectorName(node) {
  if (!ts.isClassDeclaration(node) || !ts.canHaveDecorators(node)) {
    return "";
  }
  const decorator = ts.getDecorators(node)?.find(Nodes.isComponent);
  if (!decorator) return "";
  /**
   * Iterate through the component decorator's properties looking
   * for the selector property, and then return its value when
   * found; otherwise returns an empty string.
   */
  for (const argument of decorator.expression?.arguments ?? []) {
    const property = Nodes.findAssignedProperty(argument, SELECTOR_PROPERTY);
    if (!property) continue;
    const selectorName = property.initializer?.text ?? "";
    if (!selectorName) continue;
    return selectorName;
  }
  return "";
}

/**
 * @param {ts.ClassDeclaration} node
 * @param {DecoratorType} type
 * @param {ts.Node} sourceCode
 */
function getDecoratorNames(node, type, sourceCode) {
  const names = [];
  node.members?.filter(Nodes.isPropertyOrGetAccessor).forEach((member) =>
    ts
      .getDecorators(member)
      ?.filter((decorator) => Nodes.isDecorator(decorator, type))
      .forEach((decorator) => {
        /**
         * Use the alias over property identifier to cover case
         * when an alias is set in @Input('alias') or @Output('alias').
         */
        names.push({
          name: Nodes.getAliasName(decorator.expression) || member.name?.text,
          type: Nodes.getTypeName(member, sourceCode),
        });
      })
  );
  return names;
}

/**
 * Gets the first component's metadata information
 * found within a source code file.
 *
 * The assumption here is that a component's TypeScript
 * file should contain only one component
 *
 * @param {ts.Node} sourceCode
 * @returns {ComponentInfo[]} an array of component info objects for components found in the source code; otherwise an empty array.
 */
function getComponentMetadata(sourceCode) {
  const components = [];
  /**
   * @param {ts.Node|undefined} node
   */
  function visit(node) {
    if (!node) return;
    /**
     * Walk the abstract syntax tree until the first class
     * identifier is found.
     *
     * This makes assumptions that the component class should
     * be only class contained within the TypeScript file. There
     * may be constants, enums, types, or interfaces at the same
     * level but only one class.
     */
    if (!ts.isClassDeclaration(node)) {
      ts.forEachChild(node, visit);
      return;
    }
    components.push({
      className: Nodes.getClassName(node),
      selector: getSelectorName(node),
      inputs: getDecoratorNames(node, DecoratorType.INPUT, sourceCode),
      outputs: getDecoratorNames(node, DecoratorType.OUTPUT, sourceCode),
    });
  }
  visit(sourceCode);
  return components;
}

/**
 * @param {string} fileData The string data to parse for input and output properties.
 * @returns {ComponentInfo[]} - The component information that includes its class
 * name, selector attribute, and both input and output properties collections;
 * otherwise returns undefined if no component information was found.
 */
export const parseComponent = function (fileData = "") {
  const sourceCode = getTypeScriptSource(fileData);
  if (!sourceCode) return;
  return getComponentMetadata(sourceCode);
};

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

const DECORATOR_TYPE = {
  COMPONENT: "Component",
  INPUT: "Input",
  OUTPUT: "Output",
  SELECTOR: "selector",
};
const DATA_TYPE = {
  ANY: "any",
  BOOLEAN: "boolean",
  NULL: "null",
  NUMBER: "number",
  OBJECT: "object",
  STRING: "string",
};
const DEFAULT_DATA_TYPE = DATA_TYPE.ANY;
const EVENT_EMITTER_TYPE = "EventEmitter";
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

const getTypeScriptSource = function (data = "") {
  if (!data) return;
  return ts.createSourceFile(
    "x.ts", // File name
    data, // Source
    ts.ScriptTarget.Latest, // TS version
    true, // Start at root node,
    ts.ScriptKind.TS
  );
};

function isDecorator(node, decoratorType) {
  return (
    ts.isDecorator(node) &&
    ts.isIdentifier(node.expression?.expression) &&
    ts.idText(node.expression.expression) === decoratorType
  );
}

function isComponent(node) {
  return (
    ts.isCallExpression(node.expression) &&
    ts.isIdentifier(node.expression?.expression) &&
    ts.idText(node.expression.expression) === DECORATOR_TYPE.COMPONENT
  );
}

function getClassName(node, sourceCode) {
  if (!ts.isClassDeclaration(node)) return "";
  return node.name?.getText(sourceCode) ?? "";
}

function getSelectorName(node, sourceCode) {
  if (!ts.isClassDeclaration(node)) return "";
  if (!ts.canHaveDecorators(node)) return "";
  const decorator = ts.getDecorators(node)?.find(isComponent);
  for (const argument of decorator?.expression?.arguments ?? []) {
    for (const selector of argument?.properties ?? []) {
      if (!ts.isPropertyAssignment(selector)) continue;
      if (selector?.name?.getText(sourceCode) !== DECORATOR_TYPE.SELECTOR)
        continue;
      return selector?.initializer?.text ?? "";
    }
  }
  return "";
}

function getDecoratorNames(node, type, sourceCode) {
  const names = [];
  node.members
    .filter(
      (member) => ts.isPropertyDeclaration(member) || ts.isGetAccessor(member)
    )
    .forEach((member) =>
      ts
        .getDecorators(member)
        ?.filter((decorator) => isDecorator(decorator, type))
        .forEach((decorator) =>
          names.push({
            name:
              getNodeAliasName(decorator.expression) ||
              member.name.getText(sourceCode),
            type: getTypeName(member, sourceCode),
          })
        )
    );
  return names;
}

function getTypeName(node, sourceCode) {
  const type = node.type
    ? getReferenceTypeName(node, sourceCode)
    : getLiteralTypeName(node, sourceCode);
  return isMarkedUndefined(node) ? `${type}|undefined` : type;
}

function isMarkedUndefined(node) {
  return !!node?.questionToken;
}

function getNodeAliasName(expression) {
  const [aliasNode] = expression?.arguments ?? [];
  return aliasNode && ts.isStringLiteral(aliasNode) && aliasNode.text;
}

function getComponentMetadata(sourceCode) {
  const components = [];
  function scanNode(node) {
    /**
     * Scan syntax tree until one class identifier is found.
     */
    if (!ts.isClassDeclaration(node)) {
      ts.forEachChild(node, scanNode);
      return;
    }
    components.push({
      className: getClassName(node, sourceCode),
      selector: getSelectorName(node),
      inputNames: getDecoratorNames(node, DECORATOR_TYPE.INPUT, sourceCode),
      outputNames: getDecoratorNames(node, DECORATOR_TYPE.OUTPUT, sourceCode),
    });
  }
  scanNode(sourceCode);
  return components;
}

function getReferenceTypeName(node, sourceCode) {
  const { type: typeNode } = node ?? {};
  switch (true) {
    case !node:
      return DEFAULT_DATA_TYPE;

    case !typeNode:
      return DEFAULT_DATA_TYPE;

    case !ts.isTypeReferenceNode(typeNode):
      return typeNode.getText(sourceCode) || DEFAULT_DATA_TYPE;

    case !ts.isIdentifier(typeNode.typeName):
      return DEFAULT_DATA_TYPE;

    case typeNode.typeName.getText(sourceCode) === EVENT_EMITTER_TYPE: {
      const [type] = typeNode.typeArguments ?? [];
      return type.getText(sourceCode) || DEFAULT_DATA_TYPE;
    }

    default:
      return typeNode.typeName.getText(sourceCode) || DEFAULT_DATA_TYPE;
  }
}

function getLiteralTypeName(node, sourceCode) {
  const { initializer } = node ?? {};

  switch (true) {
    case !node:
      return DEFAULT_DATA_TYPE;

    case !initializer:
      return DEFAULT_DATA_TYPE;

    case ts.isStringLiteral(initializer):
      return DATA_TYPE.STRING;

    case ts.isNumericLiteral(initializer):
      return DATA_TYPE.NUMBER;

    case ts.isBooleanLiteral(initializer):
      return DATA_TYPE.BOOLEAN;

    case ts.isArrayLiteralExpression(initializer): {
      const [typeNode] = initializer?.elements ?? [];
      const elementType = typeNode
        ? getLiteralType(typeNode, sourceCode)
        : DEFAULT_DATA_TYPE;
      return `${elementType}[]`;
    }

    default:
      return DEFAULT_DATA_TYPE;
  }
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

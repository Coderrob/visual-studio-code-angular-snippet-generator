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
import {
  DecoratorType,
  DataType,
  DEFAULT_DATA_TYPE,
  EVENT_EMITTER_TYPE,
} from "types.js";

/**
 * @param {ts.ClassElement|undefined} node
 */
export function isPropertyOrGetAccessor(node) {
  return !!node && (ts.isPropertyDeclaration(node) || ts.isGetAccessor(node));
}

/**
 * @param {ts.ObjectLiteralElementLike} expression
 */
export function findAssignedProperty(expression, propertyName) {
  return expression?.properties?.find(
    (property) =>
      !!property &&
      ts.isPropertyAssignment(property) &&
      property.name?.text === propertyName
  );
}

/**
 * @param {ts.Identifier} identifier - The identifier to check for a match by name.
 * @param {string} name - The name of the identifier
 */
function isIdentifier(identifier, name) {
  return (
    !!identifier &&
    ts.isIdentifier(identifier) &&
    ts.idText(identifier) === name
  );
}

/**
 * @param {ts.Decorator} decorator
 * @param {DecoratorType} type
 */
export function isDecorator(decorator, type) {
  return (
    ts.isDecorator(decorator) &&
    isIdentifier(decorator.expression?.expression, type)
  );
}

/**
 * @param {ts.Node} node
 */
export function isComponent(node) {
  return (
    ts.isCallExpression(node.expression) &&
    isIdentifier(node.expression?.expression, DecoratorType.COMPONENT)
  );
}

export function getTypeName(node, sourceCode) {
  const type = node.type
    ? getReferenceTypeName(node, sourceCode)
    : getLiteralTypeName(node, sourceCode);
  return isMarkedUndefined(node) ? `${type}|undefined` : type;
}

/**
 * @param {ts.PropertyDeclaration} property
 */
export function isMarkedUndefined(property) {
  return !!property?.questionToken;
}

/**
 *
 */
export function getAliasName(expression) {
  const [aliasNode] = expression?.arguments ?? [];
  return aliasNode && ts.isStringLiteral(aliasNode) && aliasNode.text;
}

/**
 * @param {ts.ClassDeclaration|undefined} node
 */
export function getClassName(node) {
  if (!node || !ts.isClassDeclaration(node)) return "";
  return node.name?.text ?? "";
}

export function getReferenceTypeName(node, sourceCode) {
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

export function getLiteralTypeName(node, sourceCode) {
  const { initializer } = node ?? {};

  switch (true) {
    case !node:
      return DEFAULT_DATA_TYPE;

    case !initializer:
      return DEFAULT_DATA_TYPE;

    case ts.isStringLiteral(initializer):
      return DataType.STRING;

    case ts.isNumericLiteral(initializer):
      return DataType.NUMBER;

    case ts.isBooleanLiteral(initializer):
      return DataType.BOOLEAN;

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

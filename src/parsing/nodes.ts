import * as ts from "typescript";
import { DEFAULT_DATA_TYPE, EVENT_EMITTER_TYPE, DataType } from "../types";

/**
 * Checks if a given node is a property declaration or a get accessor.
 * @param node - The TypeScript AST node to check.
 * @returns True if the node is a property or get accessor, false otherwise.
 */
export function isPropertyOrGetAccessor(node: ts.Node | undefined): boolean {
  return !!node && (ts.isPropertyDeclaration(node) || ts.isGetAccessor(node));
}

/**
 * Finds an assigned property in an object literal expression by name.
 * @param expression - The object literal expression to search in.
 * @param propertyName - The name of the property to find.
 * @returns The property assignment node if found, undefined otherwise.
 */
export function findAssignedProperty(
  expression: ts.ObjectLiteralExpression,
  propertyName: string
): ts.ObjectLiteralElementLike | undefined {
  return expression.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === propertyName
  );
}

/**
 * Checks if a decorator matches a specific type.
 * @param decorator - The decorator node to check.
 * @param type - The decorator type to match (e.g., "Input", "Output").
 * @returns True if the decorator matches the type, false otherwise.
 */
export function isDecorator(decorator: ts.Decorator, type: string): boolean {
  return (
    ts.isDecorator(decorator) &&
    ts.isCallExpression(decorator.expression) &&
    ts.isIdentifier(decorator.expression.expression) &&
    decorator.expression.expression.text === type
  );
}

/**
 * Checks if a node is a Component decorator.
 * @param node - The TypeScript AST node to check.
 * @returns True if the node is a Component decorator, false otherwise.
 */
export function isComponent(node: ts.Node): boolean {
  return ts.isDecorator(node) && isDecorator(node, "Component");
}

/**
 * Gets the type name of a property declaration.
 * @param node - The property declaration node.
 * @returns The type name as a string, including "|undefined" if optional.
 */
export function getTypeName(node: ts.PropertyDeclaration): string {
  const type = node.type
    ? getReferenceTypeName(node)
    : getLiteralTypeName(node);
  return isMarkedUndefined(node) ? `${type}|undefined` : type;
}

/**
 * Gets the type name for a reference type (e.g., EventEmitter<T>).
 * @param node - The property declaration node.
 * @returns The resolved type name as a string.
 */
export function getReferenceTypeName(node: ts.PropertyDeclaration): string {
  const typeNode = node.type;
  if (!typeNode) {
    return DEFAULT_DATA_TYPE;
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    if (ts.isIdentifier(typeNode.typeName)) {
      const typeName =
        (typeNode.typeName.escapedText as string) || DEFAULT_DATA_TYPE;
      if (typeName === EVENT_EMITTER_TYPE) {
        const [type] = typeNode.typeArguments ?? [];
        if (
          type &&
          ts.isTypeReferenceNode(type) &&
          ts.isIdentifier(type.typeName)
        ) {
          return (type.typeName.escapedText as string) || DEFAULT_DATA_TYPE;
        }
        return DEFAULT_DATA_TYPE;
      }
      if (typeNode.typeArguments?.length) {
        const genericTypes = typeNode.typeArguments
          .map((arg) => {
            if (ts.isTypeReferenceNode(arg) && ts.isIdentifier(arg.typeName)) {
              return (arg.typeName.escapedText as string) || DEFAULT_DATA_TYPE;
            }
            return DEFAULT_DATA_TYPE;
          })
          .join(", ");
        return `${typeName}<${genericTypes}>`;
      }
      return typeName;
    }
    return DEFAULT_DATA_TYPE;
  }

  return DEFAULT_DATA_TYPE;
}

/**
 * Gets the type name based on the initializer literal.
 * @param node - The property declaration node.
 * @returns The inferred type name as a string.
 */
export function getLiteralTypeName(node: ts.PropertyDeclaration): string {
  const initializer = node.initializer;

  if (!initializer) {
    return DEFAULT_DATA_TYPE;
  }

  if (ts.isStringLiteral(initializer)) {
    return DataType.STRING;
  }

  if (ts.isNumericLiteral(initializer)) {
    return DataType.NUMBER;
  }

  if (
    initializer.kind === ts.SyntaxKind.TrueKeyword ||
    initializer.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return DataType.BOOLEAN;
  }

  if (ts.isArrayLiteralExpression(initializer)) {
    const [typeNode] = initializer.elements;
    const elementType = typeNode ? getLiteralType(typeNode) : DEFAULT_DATA_TYPE;
    return `${elementType}[]`;
  }

  return DEFAULT_DATA_TYPE;
}

function getLiteralType(node: ts.Node): string {
  if (ts.isStringLiteral(node)) {
    return DataType.STRING;
  }

  if (ts.isNumericLiteral(node)) {
    return DataType.NUMBER;
  }

  if (
    node.kind === ts.SyntaxKind.TrueKeyword ||
    node.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return DataType.BOOLEAN;
  }

  return DEFAULT_DATA_TYPE;
}

/**
 * Checks if a property is marked as optional (has a question token).
 * @param property - The property declaration node.
 * @returns True if the property is optional, false otherwise.
 */
export function isMarkedUndefined(property: ts.PropertyDeclaration): boolean {
  return !!property.questionToken;
}

/**
 * Gets the alias name from a decorator (e.g., @Input('alias')).
 * @param decorator - The decorator node.
 * @returns The alias name if present, undefined otherwise.
 */
export function getAliasName(decorator: ts.Decorator): string | undefined {
  if (
    ts.isCallExpression(decorator.expression) &&
    decorator.expression.arguments.length > 0 &&
    ts.isStringLiteral(decorator.expression.arguments[0])
  ) {
    return decorator.expression.arguments[0].text;
  }
  return undefined;
}

/**
 * Gets the name of a class declaration.
 * @param node - The class declaration node.
 * @returns The class name as a string.
 */
export function getClassName(node: ts.ClassDeclaration): string {
  return node.name?.text || "";
}

// Add other exports here...

import * as ts from "typescript";
import {
  DecoratorType,
  SELECTOR_PROPERTY,
  DEFAULT_DATA_TYPE,
  EVENT_EMITTER_TYPE,
} from "../types/angular";
import * as Nodes from "./nodes";
import { ComponentShape as ComponentInfo } from "../types/shapes";

/**
 * Parser class for extracting Angular component information from TypeScript source files.
 * This class encapsulates parsing logic and provides methods for parsing components.
 */
export class Parser {
  /**
   * Parses a source file using a provided TypeChecker to extract component information.
   * @param sourceFile - The TypeScript source file to parse.
   * @param checker - The TypeChecker for type resolution.
   * @returns An array of ComponentInfo objects.
   */
  parseComponentFromSourceFile(
    sourceFile: ts.SourceFile | undefined,
    checker: ts.TypeChecker
  ): ComponentInfo[] {
    if (!sourceFile) return [];

    const components: ComponentInfo[] = [];
    this.visit(sourceFile, components, checker);
    return components;
  }

  /**
   * Parses a TypeScript file string to extract component information.
   * @param fileData - The string content of the TypeScript file.
   * @returns An array of ComponentInfo objects, or undefined if parsing fails.
   */
  parseComponent(fileData = ""): ComponentInfo[] | undefined {
    if (!fileData) return undefined;

    const fileName = "temp-file.ts";
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    };

    const host = ts.createCompilerHost(compilerOptions);
    // Override host methods for in-memory file
    const originalGetSourceFile = host.getSourceFile;
    host.getSourceFile = (filePath, languageVersion, onError) => {
      if (filePath === fileName) {
        return ts.createSourceFile(
          filePath,
          fileData,
          languageVersion,
          true,
          ts.ScriptKind.TS
        );
      }
      return originalGetSourceFile(filePath, languageVersion, onError);
    };
    const originalReadFile = host.readFile;
    host.readFile = (filePath) =>
      filePath === fileName ? fileData : originalReadFile(filePath);
    const originalFileExists = host.fileExists;
    host.fileExists = (filePath) =>
      filePath === fileName ? true : originalFileExists(filePath);

    const program = ts.createProgram([fileName], compilerOptions, host);
    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) return undefined;

    return this.parseComponentFromSourceFile(sourceFile, checker);
  }

  /**
   * Private method to visit AST nodes and extract component info.
   * @param node - The current AST node.
   * @param components - Array to collect component info.
   * @param checker - TypeChecker for type resolution.
   */
  private visit(
    node: ts.Node | undefined,
    components: ComponentInfo[],
    checker: ts.TypeChecker
  ): void {
    if (!node) return;
    if (!ts.isClassDeclaration(node)) {
      ts.forEachChild(node, (child) => this.visit(child, components, checker));
      return;
    }

    const classNode = node as ts.ClassDeclaration;
    const selector = this.getSelectorName(classNode);
    const inputs: any[] = [];
    const outputs: any[] = [];

    classNode.members.forEach((member) => {
      if (!Nodes.isPropertyOrGetAccessor(member)) return;
      const decorators =
        (member as any).decorators ??
        (ts.canHaveDecorators?.(member)
          ? ts.getDecorators?.(member)
          : undefined) ??
        [];
      (decorators as ts.Decorator[]).forEach((decorator) => {
        if (Nodes.isDecorator(decorator, DecoratorType.INPUT)) {
          const name =
            Nodes.getAliasName(decorator) || this.getMemberName(member);
          const type = this.resolveTypeForNode(member as ts.Node, checker);
          inputs.push({ name, type });
        }
        if (Nodes.isDecorator(decorator, DecoratorType.OUTPUT)) {
          const name =
            Nodes.getAliasName(decorator) || this.getMemberName(member);
          const type = this.resolveTypeForNode(member as ts.Node, checker);
          outputs.push({ name, type });
        }
      });
    });

    components.push({
      className: Nodes.getClassName(classNode),
      selector,
      inputs,
      outputs,
    });
  }

  /**
   * Private method to get member name.
   * @param member - The class member.
   * @returns The member name.
   */
  private getMemberName(member: ts.ClassElement): string {
    const name = (member as any).name;
    if (!name) return "";
    if (ts.isIdentifier(name)) return name.text;
    if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
    return "";
  }

  /**
   * Private method to resolve type for a node.
   * @param node - The AST node.
   * @param checker - TypeChecker.
   * @returns The resolved type string.
   */
  private resolveTypeForNode(node: ts.Node, checker: ts.TypeChecker): string {
    try {
      const isOptional =
        (ts.isPropertyDeclaration(node) &&
          !!(node as ts.PropertyDeclaration).questionToken) ||
        (ts.isParameter(node) &&
          !!(node as ts.ParameterDeclaration).questionToken) ||
        false;
      const typeNode = (node as any).type as ts.TypeNode | undefined;
      if (typeNode) {
        if (
          ts.isTypeReferenceNode(typeNode) &&
          ts.isIdentifier(typeNode.typeName)
        ) {
          const name = typeNode.typeName.text;
          if (
            name === EVENT_EMITTER_TYPE &&
            typeNode.typeArguments &&
            typeNode.typeArguments.length
          ) {
            try {
              const argType = checker.getTypeFromTypeNode(
                typeNode.typeArguments[0]
              );
              const argStr = checker.typeToString(argType);
              let resolved = argStr || DEFAULT_DATA_TYPE;
              if (argType.flags & ts.TypeFlags.StringLiteral)
                resolved = "string";
              if (argType.flags & ts.TypeFlags.BooleanLiteral)
                resolved = "boolean";
              if (isOptional && !resolved.includes("undefined"))
                resolved = `${resolved}|undefined`;
              return resolved;
            } catch (e) {
              return DEFAULT_DATA_TYPE;
            }
          }
          return name;
        }
        const annotated = checker.getTypeFromTypeNode(typeNode);
        if (annotated) {
          let s = checker.typeToString(annotated);
          if (annotated.flags & ts.TypeFlags.StringLiteral) s = "string";
          if (annotated.flags & ts.TypeFlags.BooleanLiteral) s = "boolean";
          if (isOptional && !s.includes("undefined")) s = `${s}|undefined`;
          return s || DEFAULT_DATA_TYPE;
        }
      }

      let type: ts.Type | undefined;
      if ((node as any).initializer) {
        type = checker.getTypeAtLocation((node as any).initializer);
      } else {
        type = checker.getTypeAtLocation(node);
      }
      if (!type) return DEFAULT_DATA_TYPE;

      if (type.isUnion()) {
        const kinds = type.types.map((t) => t.flags);
        const allBooleanLiteral = kinds.every(
          (f) => !!(f & ts.TypeFlags.BooleanLiteral)
        );
        if (allBooleanLiteral) return "boolean";
        const allStringLiteral = kinds.every(
          (f) => !!(f & ts.TypeFlags.StringLiteral)
        );
        if (allStringLiteral) return "string";
        const joined = type.types.map((t) => checker.typeToString(t)).join("|");
        return isOptional && !joined.includes("undefined")
          ? `${joined}|undefined`
          : joined;
      }

      const typeStr = checker.typeToString(type);
      const emMatch = /EventEmitter<(.+)>/.exec(typeStr || "");
      if (emMatch) {
        const inner = emMatch[1];
        return isOptional && !inner.includes("undefined")
          ? `${inner}|undefined`
          : inner;
      }

      if (type.flags & ts.TypeFlags.StringLiteral) return "string";
      if (type.flags & ts.TypeFlags.BooleanLiteral) return "boolean";

      const out = typeStr || DEFAULT_DATA_TYPE;
      return isOptional && !out.includes("undefined")
        ? `${out}|undefined`
        : out;
    } catch (e) {
      return DEFAULT_DATA_TYPE;
    }
  }

  /**
   * Private method to get selector name from class decorator.
   * @param node - The class declaration.
   * @returns The selector name.
   */
  private getSelectorName(node: ts.ClassDeclaration): string {
    if (!ts.isClassDeclaration(node) || !ts.canHaveDecorators(node)) {
      return "";
    }
    const decorator = ts.getDecorators(node)?.find(Nodes.isComponent);
    if (!decorator) return "";
    for (const argument of (decorator.expression as ts.CallExpression)
      ?.arguments ?? []) {
      const property = Nodes.findAssignedProperty(
        argument as ts.ObjectLiteralExpression,
        SELECTOR_PROPERTY
      );
      if (!property) continue;
      const selectorName =
        ((property as ts.PropertyAssignment).initializer as ts.StringLiteral)
          ?.text ?? "";
      if (!selectorName) continue;
      return selectorName;
    }
    return "";
  }
}

// Backward compatibility: export the functions as before
export function parseComponentFromSourceFile(
  sourceFile: ts.SourceFile | undefined,
  checker: ts.TypeChecker
): ComponentInfo[] {
  const parser = new Parser();
  return parser.parseComponentFromSourceFile(sourceFile, checker);
}

export const parseComponent = function (
  fileData = ""
): ComponentInfo[] | undefined {
  const parser = new Parser();
  return parser.parseComponent(fileData);
};

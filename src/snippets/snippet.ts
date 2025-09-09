import * as Strings from "../utils/strings";
import { DataType } from "../types/angular";
import {
  PropertyShape as Property,
  ComponentShape as ComponentInfo,
} from "../types/shapes";

/**
 * SnippetGenerator class for creating VS Code snippets from Angular component information.
 * This class encapsulates snippet generation logic.
 */
export class SnippetGenerator {
  private static readonly INDENT = "  ";
  private static readonly FUNCTION_PREFIX = "on";

  /**
   * Creates a VS Code snippet for an Angular component.
   * @param component - The component information.
   * @returns An object containing the snippet definition.
   */
  createSnippet(component: Partial<ComponentInfo> = {}): Record<string, any> {
    const {
      className = "",
      selector = "",
      inputs = [],
      outputs = [],
    } = component;
    const title = Strings.kebabToTitle(selector);
    let tabIndex = 0;

    const createSafeMarkup = (
      properties: Property[],
      parser: (prop: Property, idx: number) => string
    ): string[] => {
      if (!properties || !parser) return [];
      return properties
        .filter((property) => property?.name)
        .map((property) => parser(property, ++tabIndex));
    };

    return {
      [title]: {
        body: [
          `<${selector} `,
          ...createSafeMarkup(inputs, (prop, idx) =>
            this.propertyToAttribute(prop, idx)
          ),
          ...createSafeMarkup(outputs, (prop, idx) =>
            this.propertyToFunction(prop, idx)
          ),
          `></${selector}>`,
          `$${++tabIndex}`,
        ].filter(Boolean),
        description: `A code snippet for ${this.formatComponentName(
          className
        )}.`,
        prefix: [selector],
        scope: "html",
      },
    };
  }

  /**
   * Converts a property to an HTML attribute string for the snippet.
   * @param property - The property object with name and type.
   * @param index - The tab stop index for the snippet.
   * @returns The formatted attribute string.
   */
  private propertyToAttribute({ name, type }: Property, index: number): string {
    const nameAssignment = `${SnippetGenerator.INDENT}[${name}]=`;
    const typeValues = this.getTypeValues(type);
    return !typeValues
      ? nameAssignment + `"$${index}"`
      : nameAssignment + ['"${', index, typeValues, '}"'].join("");
  }

  /**
   * Converts a property to an HTML event binding string for the snippet.
   * @param property - The property object with name.
   * @param index - The tab stop index for the snippet.
   * @returns The formatted event binding string.
   */
  private propertyToFunction({ name }: Property, index: number): string {
    const funcName = this.formatToFunctionName(name);
    return `${SnippetGenerator.INDENT}(${name})="$${index}:${funcName}($event)"`;
  }

  /**
   * Gets the placeholder values for a given data type in snippets.
   * @param type - The data type.
   * @returns The placeholder string for the type.
   */
  private getTypeValues(type?: string): string {
    switch (type) {
      case DataType.BOOLEAN:
        return "|true,false|";
      case DataType.NUMBER:
        return "0";
      case DataType.OBJECT:
        return "";
      case DataType.STRING:
        return "''";
      default:
        return "";
    }
  }

  /**
   * Formats a property name to a function name by prefixing with 'on' and capitalizing.
   * @param value - The property name to format.
   * @returns The formatted function name.
   */
  private formatToFunctionName(value = ""): string {
    if (!value) return value;
    return `${SnippetGenerator.FUNCTION_PREFIX}${Strings.capitalizeWord(
      value
    )}`;
  }

  /**
   * Formats a component class name to a readable title by splitting on uppercase letters.
   * @param name - The component class name.
   * @returns The formatted component name.
   */
  private formatComponentName(name = ""): string {
    const words = name.match(/[A-Z][a-z]+/g)?.map(Strings.capitalizeWord) || [];
    return words.filter(Boolean).join(" ");
  }
}

// Backward compatibility: export the functions as before
export function propertyToFunction(property: Property, index: number): string {
  const generator = new SnippetGenerator();
  return generator["propertyToFunction"](property, index);
}

export function getTypeValues(type?: string): string {
  const generator = new SnippetGenerator();
  return generator["getTypeValues"](type);
}

export function createSnippet(
  component: Partial<ComponentInfo> = {}
): Record<string, any> {
  const generator = new SnippetGenerator();
  return generator.createSnippet(component);
}

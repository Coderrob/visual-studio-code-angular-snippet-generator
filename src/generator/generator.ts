import * as path from "path";
import fg from "fast-glob";
import * as ts from "typescript";
import { createSnippet } from "../snippets/snippet";
import { parseComponentFromSourceFile } from "../parsing/parser";
import Logger from "../logging/logging";
import fs from "fs";
import { GeneratorOptions, Logger as LoggerType } from "../types/infra";

/**
 * Generator class for generating VS Code snippets from Angular components in a directory.
 * This class handles file discovery, parsing, and snippet generation.
 */
export class Generator {
  private logger: LoggerType;

  /**
   * Constructor for Generator.
   * @param logger - The logger instance to use for logging.
   */
  constructor(logger: LoggerType = Logger) {
    this.logger = logger;
  }

  /**
   * Generate snippets from a directory path.
   * @param dir - The directory path to scan for component files.
   * @param options - Options for generation.
   * @returns A promise resolving to the generated snippets.
   */
  async generateFromFolder(
    dir: string,
    options: GeneratorOptions = {}
  ): Promise<Record<string, any>> {
    const pattern = "**/*.component.ts";
    const ignore = options.ignore ?? ["**/node_modules/**", "**/dist/**"];
    const entries = await fg(pattern, { cwd: dir, ignore, absolute: true });

    const snippets: Record<string, any> = {};
    if (!entries || !entries.length) return snippets;

    const program = this.buildProgram(entries, options);

    const checker = program.getTypeChecker();

    for (const filePath of entries) {
      try {
        const sourceFile = program.getSourceFile(filePath);
        if (!sourceFile) continue;
        const fileLogger = this.logger.child({ file: filePath });
        const components = parseComponentFromSourceFile(sourceFile, checker);
        if (!components || !components.length) continue;
        for (const comp of components) {
          const compLogger = fileLogger.child({ component: comp.className });
          compLogger.debug(`Processing component ${comp.className}`);
          Object.assign(snippets, createSnippet(comp));
          compLogger.info(`Created snippets for ${comp.className}`);
        }
      } catch (err) {
        const fileLogger = this.logger.child({ file: filePath });
        const errorObj = err instanceof Error ? err : new Error(String(err));
        fileLogger.warn(`Failed processing ${filePath}: ${errorObj.message}`);
        fileLogger.debug(errorObj.stack ?? "no-stack");
      }
    }

    if (options.outFile) {
      fs.mkdirSync(path.dirname(options.outFile), { recursive: true });
      fs.writeFileSync(
        options.outFile,
        JSON.stringify(snippets, null, 2),
        "utf8"
      );
      this.logger.info(
        `Wrote ${Object.keys(snippets).length} snippets to ${options.outFile}`
      );
    }

    return snippets;
  }

  /**
   * Builds the TypeScript program based on options.
   * @param entries - List of file entries.
   * @param options - Generation options.
   * @returns The TypeScript program.
   */
  private buildProgram(
    entries: string[],
    options: GeneratorOptions
  ): ts.Program {
    if (options.tsconfigPath) {
      try {
        const tsconfigFile = ts.readConfigFile(
          options.tsconfigPath,
          ts.sys.readFile
        );
        const parsed = ts.parseJsonConfigFileContent(
          tsconfigFile.config,
          ts.sys,
          path.dirname(options.tsconfigPath)
        );
        return ts.createProgram(
          parsed.fileNames.length ? parsed.fileNames : entries,
          parsed.options
        );
      } catch (e) {
        this.logger.fatal(
          new Error(
            `Failed reading/parsing tsconfig at ${options.tsconfigPath}: ${
              (e as Error).message
            }`
          )
        );
        return this.createFallbackProgram(entries);
      }
    } else {
      return this.createFallbackProgram(entries);
    }
  }

  /**
   * Creates a fallback program with default options.
   * @param entries - List of file entries.
   * @returns The fallback TypeScript program.
   */
  private createFallbackProgram(entries: string[]): ts.Program {
    return ts.createProgram(entries, {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      allowJs: true,
      jsx: ts.JsxEmit.Preserve,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      skipLibCheck: true,
    });
  }
}

// Backward compatibility: export the function as before
export async function generateFromFolder(
  dir: string,
  options: GeneratorOptions = {},
  logger: LoggerType = Logger
): Promise<Record<string, any>> {
  const generator = new Generator(logger);
  return generator.generateFromFolder(dir, options);
}

#!/usr/bin/env node
import { Command } from "commander";
import * as path from "path";
import { Generator } from "./generator/generator";
import logger from "./logging/logging";
import { randomUUID } from "crypto";

const program = new Command();

program
  .name("snippet-gen")
  .description("Generate VS Code snippets from Angular components");

program
  .command("generate:folder <dir>")
  .description("Generate snippets from a folder")
  .option("-o, --out <file>", "Output file path")
  .option(
    "-t, --tsconfig <path>",
    "Path to tsconfig.json to use for type resolution"
  )
  .action(async (dir: string, opts: any) => {
    try {
      const out =
        opts.out ||
        path.join(process.cwd(), "snippets.generated.code-snippets");
      const runId = process.env.RUN_ID || randomUUID();
      const runLogger = logger.child({ runId });
      const generator = new Generator(runLogger);
      const result = await generator.generateFromFolder(dir, {
        outFile: out,
        tsconfigPath: opts.tsconfig ? path.resolve(opts.tsconfig) : undefined,
      });
      logger.info(`Generated ${Object.keys(result).length} snippets to ${out}`);
    } catch (err) {
      logger.error(err as Error);
      process.exit(1);
    }
  });

program.parse(process.argv);

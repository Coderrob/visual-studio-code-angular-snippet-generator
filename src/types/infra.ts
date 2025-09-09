export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface Logger {
  child(bindings?: Record<string, unknown>): Logger;
  trace(msg: string, ...args: unknown[]): void;
  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string | Error, ...args: unknown[]): void;
  fatal(msg: string | Error, ...args: unknown[]): void;
}

export interface GeneratorOptions {
  ignore?: string[];
  outFile?: string;
  tsconfigPath?: string;
}

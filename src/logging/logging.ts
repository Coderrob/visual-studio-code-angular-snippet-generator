/* eslint-disable @typescript-eslint/no-var-requires */
let pinoLib: any;
try {
  // attempt to dynamically require pino; if not installed, we'll fall back
  // to a console-based adapter so tests and usage still work.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pinoLib = require("pino");
} catch (e) {
  pinoLib = undefined;
}

import { Logger } from "../types/infra";

function makeConsoleAdapter(prefix?: Record<string, unknown>): Logger {
  const fmt = (level: string, args: any[]) => {
    const meta = prefix ? JSON.stringify(prefix) + " " : "";
    const first = args.length ? args[0] : "";
    const rest = args.slice(1);
    return `${level.toUpperCase()} ${meta}${first} ${rest
      .map((r) => (typeof r === "string" ? r : JSON.stringify(r)))
      .join(" ")}`;
  };
  return {
    child(bindings?: Record<string, unknown>) {
      return makeConsoleAdapter(
        Object.assign({}, prefix ?? {}, bindings ?? {})
      );
    },
    trace: (...args: any[]) => console.debug(fmt("trace", args)),
    debug: (...args: any[]) => console.debug(fmt("debug", args)),
    info: (...args: any[]) => console.info(fmt("info", args)),
    warn: (...args: any[]) => console.warn(fmt("warn", args)),
    error: (...args: any[]) => console.error(fmt("error", args)),
    fatal: (...args: any[]) => console.error(fmt("fatal", args)),
  };
}

let adapter: Logger;
if (pinoLib) {
  const pino = pinoLib;
  // Try to configure pino-pretty if available for development readability
  let transportOption: any = undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require.resolve("pino-pretty");
    if (process.env.NODE_ENV === "development") {
      transportOption = { target: "pino-pretty" };
    }
  } catch (e) {
    transportOption = undefined;
  }
  const pinoLogger = pino({
    level: (process.env.LOG_LEVEL as string) || "info",
    transport: transportOption,
  });
  const createAdapter = (instance: any): Logger => ({
    child(bindings?: Record<string, unknown>) {
      return createAdapter(instance.child(bindings ?? {}));
    },
    trace: (...args: any[]) => instance.trace(...args),
    debug: (...args: any[]) => instance.debug(...args),
    info: (...args: any[]) => instance.info(...args),
    warn: (...args: any[]) => instance.warn(...args),
    error: (...args: any[]) => instance.error(...args),
    fatal: (...args: any[]) => instance.fatal(...args),
  });
  adapter = {
    child(bindings?: Record<string, unknown>) {
      const childLogger = pinoLogger.child(bindings ?? {});
      return createAdapter(childLogger);
    },
    trace: (...args: any[]) => pinoLogger.trace(...args),
    debug: (...args: any[]) => pinoLogger.debug(...args),
    info: (...args: any[]) => pinoLogger.info(...args),
    warn: (...args: any[]) => pinoLogger.warn(...args),
    error: (...args: any[]) => pinoLogger.error(...args),
    fatal: (...args: any[]) => pinoLogger.fatal(...args),
  };
} else {
  adapter = makeConsoleAdapter();
}

export default adapter;

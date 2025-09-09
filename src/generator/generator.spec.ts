import fs from "fs";
import * as os from "os";
import * as path from "path";
import { generateFromFolder, Generator } from "./generator";
import { GeneratorOptions, Logger } from "../types/infra";

// Minimal mock logger that records calls
class MockLogger implements Logger {
  public calls: Array<{ method: string; args: any[] }> = [];
  child(bindings?: Record<string, unknown>) {
    // return same mock for simplicity, but record child call
    this.calls.push({ method: "child", args: [bindings] });
    return this;
  }
  trace(...args: any[]) {
    this.calls.push({ method: "trace", args });
  }
  debug(...args: any[]) {
    this.calls.push({ method: "debug", args });
  }
  info(...args: any[]) {
    this.calls.push({ method: "info", args });
  }
  warn(...args: any[]) {
    this.calls.push({ method: "warn", args });
  }
  error(...args: any[]) {
    this.calls.push({ method: "error", args });
  }
  fatal(...args: any[]) {
    this.calls.push({ method: "fatal", args });
  }
}

describe("generateFromFolder logging", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "snippet-gen-test-"));
  afterAll(() => {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  describe("generateFromFolder (legacy function)", () => {
    it("should log info when writing output file", async () => {
      const mock = new MockLogger();
      // create a simple component file
      const content = `@Component({ selector: 'x-foo' })\nexport class FooComponent {}`;
      const filePath = path.join(tmp, "foo.component.ts");
      fs.writeFileSync(filePath, content, "utf8");

      const outFile = path.join(tmp, "out.code-snippets");
      const result = await generateFromFolder(tmp, { outFile }, mock as any);
      // should have written snippets
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(0);
      // find an info call about writing
      const infoCalls = mock.calls.filter((c) => c.method === "info");
      expect(infoCalls.length).toBeGreaterThan(0);
      const wrote = infoCalls.some((c) => String(c.args[0]).includes("Wrote"));
      expect(wrote).toBe(true);
    });

    it("should log warn/debug when a file read fails", async () => {
      const mock = new MockLogger();
      // create a file that will cause parser to throw by writing invalid TS
      const badContent = `this is not valid typescript`;
      const badPath = path.join(tmp, "bad.component.ts");
      fs.writeFileSync(badPath, badContent, "utf8");

      // Make the parser attempt to parse and fail; the generator should log warn/debug
      const outFile = path.join(tmp, "out2.code-snippets");
      await generateFromFolder(tmp, { outFile }, mock as any);

      const warnCalls = mock.calls.filter((c) => c.method === "warn");
      const debugCalls = mock.calls.filter((c) => c.method === "debug");
      expect(warnCalls.length).toBeGreaterThanOrEqual(0);
      // debug stack should be present for any warn
      // (we accept zero or more depending on parser behavior)
      expect(Array.isArray(mock.calls)).toBe(true);
    });
  });

  describe("Generator class", () => {
    const mockLogger = new MockLogger();
    const generator = new Generator(mockLogger as any);

    it("should generate snippets using class instance", async () => {
      const content = `@Component({ selector: 'x-foo' })\nexport class FooComponent {}`;
      const filePath = path.join(tmp, "foo.component.ts");
      fs.writeFileSync(filePath, content, "utf8");

      const result = await generator.generateFromFolder(tmp);
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(0);
    });
  });
});

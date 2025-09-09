import fs from "fs";
import * as os from "os";
import * as path from "path";
import { generateFromFolder } from "../generator/generator";
import { Logger } from "../types/infra";

class MockLogger implements Logger {
  public calls: Array<{ method: string; args: any[] }> = [];
  child(bindings?: Record<string, unknown>) {
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

describe("Structured logging child bindings", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "snippet-logs-"));
  afterAll(() => {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  it("should create child loggers with runId, file and component fields", async () => {
    const mock = new MockLogger();

    // Create a component file
    const content = `@Component({ selector: 'x-foo' })\nexport class FooComponent {}`;
    const filePath = path.join(tmp, "foo.component.ts");
    fs.writeFileSync(filePath, content, "utf8");

    const runId = "test-run-123";
    // simulate CLI runLogger creation
    const runLogger = mock.child({ runId });

    await generateFromFolder(
      tmp,
      { outFile: path.join(tmp, "out.json") },
      runLogger as any
    );

    const childCalls = mock.calls.filter((c) => c.method === "child");
    // check runId child
    const hasRunId = childCalls.some(
      (c) => c.args[0] && (c.args[0] as any).runId === runId
    );
    expect(hasRunId).toBe(true);

    // check file child
    const hasFile = childCalls.some(
      (c) =>
        c.args[0] &&
        (c.args[0] as any).file &&
        String((c.args[0] as any).file).endsWith("foo.component.ts")
    );
    expect(hasFile).toBe(true);

    // check component child
    const hasComponent = childCalls.some(
      (c) => c.args[0] && (c.args[0] as any).component === "FooComponent"
    );
    expect(hasComponent).toBe(true);
  });
});

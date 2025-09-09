import { createSnippet, getTypeValues, SnippetGenerator } from "./snippet";

describe("Snippet tests", () => {
  describe("createSnippet (legacy function)", () => {
    it("should create a snippet", () => {
      const component = {
        className: "TestComponent",
        selector: "test-component",
        inputs: [{ name: "input1", type: "string" }],
        outputs: [{ name: "output1", type: "void" }],
      };
      const result = createSnippet(component);
      expect(result).toBeDefined();
    });
  });

  describe("getTypeValues (legacy function)", () => {
    it("should return type values for boolean", () => {
      expect(getTypeValues("boolean")).toBe("|true,false|");
    });
  });

  describe("SnippetGenerator class", () => {
    const generator = new SnippetGenerator();

    it("should create a snippet using class instance", () => {
      const component = {
        className: "TestComponent",
        selector: "test-component",
        inputs: [{ name: "input1", type: "string" }],
        outputs: [{ name: "output1", type: "void" }],
      };
      const result = generator.createSnippet(component);
      expect(result).toBeDefined();
    });
  });
});

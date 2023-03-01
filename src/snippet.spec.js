import * as Snippets from "./snippet.js";
import { DataType } from "types.js";

describe("Snippet tests", () => {
  const mockComponentInfo = {
    className: "SaveCancelButtonComponent",
    inputs: [
      { name: "label", type: "string" },
      { name: "disabled", type: "boolean" },
      { name: "icon", type: "string" },
      { name: "color", type: "Color" },
      { name: "tooltip", type: "string|undefined" },
    ],
    outputs: [
      { name: "cancel", type: "boolean" },
      { name: "save", type: "any" },
      { name: "draft", type: "any" },
    ],
    selector: "save-cancel-button",
  };

  describe("createSnippet", () => {
    it("should create snippet for component info object", () => {
      expect(Snippets.createSnippet(mockComponentInfo)).toEqual({
        "Save Cancel Button": {
          body: [
            "<save-cancel-button ",
            '  [label]="$1"',
            '  [disabled]="${2|true,false|}"',
            '  [icon]="$3"',
            '  [color]="$4"',
            '  [tooltip]="$5"',
            '  (cancel)="$6:onCancel($event)"',
            '  (save)="$7:onSave($event)"',
            '  (draft)="$8:onDraft($event)"',
            "></save-cancel-button>",
            "$9",
          ],
          description: "A code snippet for Save Cancel Button Component.",
          prefix: ["save-cancel-button"],
          scope: "html",
        },
      });
    });
  });

  describe("getTypeValues", () => {
    it.each([
      {
        type: DataType.BOOLEAN,
        expects: "|true,false|",
      },
      {
        type: DataType.NUMBER,
        expects: "",
      },
      {
        type: DataType.OBJECT,
        expects: "",
      },
      {
        type: DataType.STRING,
        expects: "",
      },
      {
        type: undefined,
        expects: "",
      },
    ])("should return expected values for %p", ({ type, expects }) =>
      expect(Snippets["getTypeValues"](type)).toBe(expects)
    );
  });

  describe("propertyToFunction", () => {
    it.each([
      {
        property: { name: "change" },
        index: 0,
        expects: '  (change)="$0:onChange($event)"',
      },
    ])(
      "should take an event name and return properly indented function markup %p",
      ({ property, index, expects }) =>
        expect(Snippets.propertyToFunction(property, index)).toBe(expects)
    );
  });
});

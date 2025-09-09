import { parseComponent, Parser } from "./parser";

describe("Parser tests", () => {
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

  const mockComponentData = `
  enum Color {
    RED = "red",
    WHITE = "white",
    BLUE = "blue",
  }
  
  @Component({
    templateUrl: "save-cancel-button.component.html",
    selector: "save-cancel-button",
  })
  export class SaveCancelButtonComponent {
    @Input()
    public label: string;
  
    @Input("disabled")
    public get notEnabled(): boolean {
      return this._enabled;
    }
    private _enabled = false;
  
    @Input("icon")
    public iconName = "info";
    @Input() public color: Color;
    @Input() tooltip?: string;
  
    @Output("cancel")
    public deleteItAll: EventEmitter<boolean>;
  
    @Output() save = new EventEmitter<undefined>();
    @Output()
    public draft = new EventEmitter<any>();
  }
  `;

  describe("parseComponent (legacy function)", () => {
    it("should parse and return a component information object matching the mocked component data", () =>
      expect(parseComponent(mockComponentData)).toEqual([mockComponentInfo]));
  });

  describe("Parser class", () => {
    const parser = new Parser();

    it("should parse component data using class instance", () => {
      expect(parser.parseComponent(mockComponentData)).toEqual([
        mockComponentInfo,
      ]);
    });
  });
});

/**
 * Angular-related type constants and enums.
 */
export const DataType = {
  ANY: "any",
  BOOLEAN: "boolean",
  NULL: "null",
  NUMBER: "number",
  OBJECT: "object",
  STRING: "string",
} as const;

export const DEFAULT_DATA_TYPE = DataType.ANY;

export const EVENT_EMITTER_TYPE = "EventEmitter";

export const DecoratorType = {
  COMPONENT: "Component",
  INPUT: "Input",
  OUTPUT: "Output",
} as const;

export const PropertyKind = {
  UNKNOWN: 0,
  PROPERTY: 1,
  EVENT: 2,
} as const;

export const SELECTOR_PROPERTY = "selector";

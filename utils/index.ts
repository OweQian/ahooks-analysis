export const isFunction = (value: unknown): value is (...args: any[]) => any =>
  typeof value === "function";
export const isUndef = (value: unknown): value is undefined =>
  typeof value === "undefined";
export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";
export const isNumber = (value: unknown): value is number =>
  typeof value === "number";
export const isString = (value: unknown): value is string =>
  typeof value === "string";
export const isObject = (value: unknown): value is object =>
  typeof value === "object";

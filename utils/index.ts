export const isFunction = (value: unknown): value is (...args: any[]) => any => typeof value === 'function';
export const isUndefined = (value: unknown): value is undefined => typeof value === 'undefined';

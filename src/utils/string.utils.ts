export const isString = (data: unknown): data is string => typeof data === "string";
export const stringIsFilled = (data: unknown): data is string => isString(data) && data.length > 0;

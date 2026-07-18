export type ValidationCode =
  | "type"
  | "required"
  | "format"
  | "range"
  | "unsupported";

export interface ValidationError {
  readonly path: string;
  readonly code: ValidationCode;
  readonly message: string;
}

export type Validation<T> =
  | { readonly kind: "valid"; readonly value: T }
  | { readonly kind: "invalid"; readonly errors: readonly ValidationError[] };

export type Validator<T> = (input: unknown, path: string) => Validation<T>;

export const valid = <T>(value: T): Validation<T> => ({ kind: "valid", value });

export const invalid = (
  path: string,
  code: ValidationCode,
  message: string,
): Validation<never> => ({
  kind: "invalid",
  errors: [{ path, code, message }],
});

export const mapValidator = <A, B>(
  validator: Validator<A>,
  transform: (value: A) => B,
): Validator<B> =>
  (input, path) => {
    const result = validator(input, path);
    return result.kind === "valid"
      ? valid(transform(result.value))
      : result;
  };

export const refineValidator = <T>(
  validator: Validator<T>,
  predicate: (value: T) => boolean,
  error: (path: string, value: T) => ValidationError,
): Validator<T> =>
  (input, path) => {
    const result = validator(input, path);
    if (result.kind === "invalid" || predicate(result.value)) {
      return result;
    }

    return {
      kind: "invalid",
      errors: [error(path, result.value)],
    };
  };

export const combineValidations = <const T extends readonly unknown[]>(
  ...results: { readonly [K in keyof T]: Validation<T[K]> }
): Validation<T> => {
  const errors: ValidationError[] = [];
  const values: unknown[] = [];

  for (const result of results) {
    if (result.kind === "invalid") {
      errors.push(...result.errors);
    } else {
      values.push(result.value);
    }
  }

  return errors.length > 0
    ? { kind: "invalid", errors }
    : valid(values as unknown as T);
};

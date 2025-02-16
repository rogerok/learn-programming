// class ZodTypeError extends Error {
//
//
//   constructor(message: string = "type error") {
//
//   }
//
//   return this.message
// }

interface ZodNumber {
  type: "number";
  parse(value: unknown): number;
}
interface ZodUnknown {
  type: "unknown";
  parse(value: unknown): unknown;
}
interface ZodString {
  type: "string";
  parse(value: unknown): string;
}

interface ZodArray<T extends ZodType> {
  type: "array";
  element: T;
  parse(value: unknown): Array<TypeOf<T>>;
}

interface ZodObject<T extends Record<string, ZodType>> {
  type: "object";
  fields: T;
  parse(value: unknown): InferZodObject<ZodObject<T>>;
}

type InferZodObject<T extends ZodObject<any>> = {
  [K in keyof T["fields"]]: TypeOf<T["fields"][K]>;
};

type ZodType =
  | ZodUnknown
  | ZodString
  | ZodNumber
  | ZodArray<ZodType>
  | ZodObject<Record<string, ZodType>>;

export type TypeOf<T extends ZodType> = T extends ZodUnknown
  ? unknown
  : T extends ZodString
    ? string
    : T extends ZodNumber
      ? number
      : T extends ZodArray<infer E>
        ? Array<TypeOf<E>>
        : T extends ZodObject<Record<string, ZodType>>
          ? InferZodObject<T>
          : never;

type shouldBeArrayOfString = TypeOf<ZodArray<ZodArray<ZodString>>>;

export const string = (): ZodString => ({
  type: "string",
  parse(value: unknown) {
    if (typeof value !== "string") {
      throw new TypeError("invalid string ");
    }
    return value;
  },
});

export const number = (): ZodNumber => ({
  type: "number",
  parse(value: unknown) {
    if (typeof value !== "number") {
      throw new TypeError("invalid number ");
    }
    return value;
  },
});

export const unknown = (): ZodUnknown => ({
  type: "unknown",
  parse(value) {
    return value;
  },
});

export const array = <T extends ZodType>(element: T): ZodArray<T> => ({
  type: "array",
  element,
  parse(value: unknown): Array<TypeOf<T>> {
    if (!Array.isArray(value)) {
      throw new TypeError("invalid array ");
    }
    return value.map((item) => element.parse(item) as TypeOf<T>);
  },
});

export const object = <T extends Record<string, ZodType>>(
  fields: T,
): ZodObject<T> => ({
  type: "object",
  fields,
  parse(value: unknown) {
    if (typeof value !== "object" || value === null) {
      throw new TypeError("invalid object");
    }

    const recordValue = value as Record<string, unknown>;

    Object.entries(recordValue).forEach(([key, value]) => {
      fields[key].parse(value);
    });

    return value as InferZodObject<ZodObject<T>>;
  },
});

export type { TypeOf as infer };

---
tags: [typescript, zod, validation, workshop, type-system, generics]
aliases: [Zod валидатор, Zod-like validator]
---

# Воркшоп: создание аналога Zod

Zod — библиотека для валидации данных в TypeScript с выводом типов. Здесь реализован её упрощённый аналог с нуля.

## Архитектура

```
index.ts    — точка входа (re-export)
schema.ts   — классы валидаторов (ZodString, ZodNumber, ZodObject…)
util.ts     — вспомогательные типы (AddQuestionMarks, Flatten)
```

## util.ts — вспомогательные типы

```typescript
export type Identity<T> = T;
export type Flatten<T> = Identity<{ [k in keyof T]: T[k] }>;

type RequiredKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];

export type AddQuestionMarks<
  T extends object,
  R extends keyof T = RequiredKeys<T>,
> = Pick<Required<T>, R> & Partial<T>;
```

- `Flatten` — "разворачивает" пересечение типов в один объект (удобно для hover в IDE)
- `AddQuestionMarks` — делает поля, которые могут быть `undefined`, опциональными (`?`)
- `RequiredKeys` — выбирает только обязательные ключи (те, где `undefined` не входит в тип)

## schema.ts — ядро валидатора

```typescript
import { AddQuestionMarks, Flatten } from "./util";

class ZodTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZodTypeError";
  }
}

abstract class ZodType<Output = unknown> {
  readonly _type: Output;

  constructor(definition?: Output) {}

  optional() {
    return ZodOptional.create(this);
  }

  abstract parse(value: unknown): Output;
}

class ZodOptional<T extends ZodType = ZodType> extends ZodType<
  TypeOf<T> | undefined
> {
  static create<T extends ZodType>(type: T) {
    return new ZodOptional(type);
  }

  constructor(readonly type: ZodType) {
    super();
  }

  parse(value: unknown) {
    if (value === undefined) {
      return undefined;
    }

    return this.type.parse(value);
  }
}

class ZodString extends ZodType<string> {
  static create() {
    return new ZodString();
  }

  parse(value: unknown) {
    if (typeof value !== "string") {
      throw new ZodTypeError("Invalid string");
    }

    return value;
  }
}

class ZodNumber extends ZodType<number> {
  static create() {
    return new ZodNumber();
  }

  parse(value: unknown) {
    if (typeof value !== "number") {
      throw new ZodTypeError("Invalid number");
    }

    return value;
  }
}

class ZodUnknown extends ZodType<unknown> {
  static create() {
    return new ZodUnknown();
  }

  parse(value: unknown) {
    return value;
  }
}

class ZodArray<T extends ZodType> extends ZodType<Array<TypeOf<T>>> {
  static create<T extends ZodType>(element: T) {
    return new ZodArray(element);
  }

  constructor(readonly element: T) {
    super();
  }

  parse(value: unknown) {
    if (!Array.isArray(value)) {
      throw new ZodTypeError("Invalid array");
    }

    return value;
  }
}

class ZodObject<T extends Record<string, ZodType>> extends ZodType<
  InferZodObject<T>
> {
  static create<T extends Record<string, ZodType>>(fields: T) {
    return new ZodObject(fields);
  }

  constructor(readonly fields: T) {
    super();
  }

  parse(value: unknown) {
    if (typeof value !== "object" || value == null) {
      throw new ZodTypeError("Not an object");
    }

    const recordValue = value as Record<string, unknown>;

    for (const [k, v] of Object.entries(this.fields)) {
      v.parse(recordValue[k]);
    }

    return value as InferZodObject<T>;
  }
}

type InferZodObject<T extends Record<string, ZodType>> = Flatten<
  AddQuestionMarks<{
    [Key in keyof T]: TypeOf<T[Key]>;
  }>
>;

export type TypeOf<T extends ZodType> = T["_type"];

export const number = ZodNumber.create;
export const string = ZodString.create;
export const unknown = ZodUnknown.create;
export const array = ZodArray.create;
export const object = ZodObject.create;
export const optional = ZodOptional.create;

export type { TypeOf as infer };
```

## index.ts — точка входа

```typescript
export * as z from './schema';
```

## Тесты (z.spec.ts)

```typescript
import { describe, it, expect } from 'vitest';
import { z } from '..';

describe('z', () => {
  it('should validate object', () => {
    const User = z.object({ username: z.string() });
    type TUser = z.infer<typeof User>;

    const user: TUser = { username: 'Ludwig' };
    expect(User.parse(user)).toEqual(user);
  });

  it('should throw error when invalid', () => {
    const User = z.object({ username: z.string() });
    // @ts-expect-error username is not a string
    expect(() => User.parse({ username: 123 })).toThrow();
  });

  it('should mark optional type as undefined', () => {
    const User = z.object({ username: z.string().optional() });
    type TUser = z.infer<typeof User>;

    const user: TUser = {};
    expect(User.parse(user)).toEqual(user);
  });
});
```

## Ключевые паттерны

- **`_type` как phantom field** — поле `readonly _type: Output` никогда не хранит реальное значение, но TypeScript использует его для вывода типов через `TypeOf<T> = T["_type"]`
- **Статический `create()`** — альтернатива `new`, позволяет цепочки: `z.string().optional()`
- **`AddQuestionMarks`** — автоматически делает `optional()` поля опциональными в итоговом типе объекта

## Связанные темы

- [[../../typescript/MOC|TypeScript MOC]]
- [[../../typescript/type-level-programming/type-level-programming|Type-level programming]]
- [[../../typescript/infer|infer в TypeScript]]

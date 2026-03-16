---
tags: [typescript, assert, type-narrowing]
aliases: [assert TypeScript]
---

# Assert-функции

Assert-функция — специальная функция, которая:
1. Проверяет условие **в рантайме**
2. Бросает ошибку (`throw`), если условие ложно
3. Сообщает компилятору, что после успешного вызова переменная имеет определённый тип

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string');
  }
}

let val: unknown = getData();
assertIsString(val);
val.toUpperCase(); // OK — тип сужен до string
```

## Assert vs Type Guard

| | Type Guard | Assert |
|---|---|---|
| Сигнатура | `(x): x is T` → `boolean` | `(x): asserts x is T` → `void` |
| При неудаче | Возвращает `false` | Бросает ошибку |
| Паттерн | `if (isString(val)) { ... }` | Ранний выход: `assert(val); ...` |
| Narrowing | Expression-level (внутри `if`) | Statement-level (после вызова) |

## asserts condition (без `is`)

Можно утверждать произвольное условие:

```ts
function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new Error(msg ?? 'Assertion failed');
}

function process(x: string | null) {
  assert(x !== null, 'x is null');
  x.toUpperCase(); // OK — null исключён
}
```

## Важные нюансы

- **TypeScript доверяет вашей логике** — если проверка написана неверно, компилятор это не поймает. Ответственность за корректность на вас.
- **Не путать с `as`**: `as` — чисто compile-time подсказка без рантайм-проверки. `asserts` — реальная проверка + сужение типа.
- Assert-функции удобны для валидации данных на границах системы (API responses, user input).

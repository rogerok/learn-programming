---
tags: [typescript, literal-types, type-system]
aliases: [Литеральные типы]
---

# Literal Types

Литеральные типы — типы, представляющие **одно конкретное значение**. Доступны для `string`, `number`, `boolean`, `bigint`.

```ts
type Hexlet = 'hexlet';   // множество из одного элемента {"hexlet"}
type One = 1;
type False = false;
type BigN = 100n;
```

## Вывод литеральных типов

```ts
const x = 'hello';  // тип: "hello" — const не может измениться
let y = 'hello';    // тип: string  — let может измениться
```

`const` для примитивов автоматически выводит литеральный тип, `let` — расширяет до базового.

## `as const`

Приводит значение к литеральному типу + делает всё `readonly`:

```ts
const config = {
  type: 'mysql',
  host: 'localhost',
  port: 5432,
} as const;
// type: { readonly type: "mysql"; readonly host: "localhost"; readonly port: 5432 }
```

- Для массивов — превращает в readonly tuple.
- Для объектов — все поля `readonly` + литеральные типы значений.
- Для примитивов — сужает тип: `let x = 'test' as const` → тип `"test"`.

## Enum vs Union of Literals

```ts
// Enum — остаётся в скомпилированном JS как объект
enum Status { Created = 'Created', Paid = 'Paid' }

// Union of literals — стирается при компиляции (zero runtime cost)
type Status = 'Created' | 'Paid';
```

Многие предпочитают union of literals: нет рантайм-артефакта, проще tree-shaking, работает с `as const` для объектов.

## Template Literal Types

TypeScript позволяет строить литеральные типы из шаблонов:

```ts
type EventName = 'click' | 'scroll';
type Handler = `on${Capitalize<EventName>}`; // "onClick" | "onScroll"
```

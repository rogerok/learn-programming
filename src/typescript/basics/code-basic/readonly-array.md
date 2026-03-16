---
tags: [typescript, readonly, arrays]
aliases: [ReadOnly массивы]
---

# Readonly Arrays

Модификатор `readonly` запрещает мутирующие операции массива:

```ts
function process(numbers: readonly number[]) {
  numbers.push(1);    // Error — push не существует
  numbers[0] = 5;     // Error — index signature readonly
  numbers.sort();     // Error — sort мутирует
}
```

## Альтернативный синтаксис

```ts
readonly number[]    // краткий
ReadonlyArray<number> // generic-форма
```

## readonly не рекурсивен

`readonly` защищает сам массив, но **не** вложенные объекты:

```ts
const users: readonly { name: string }[] = [{ name: 'Alice' }];
users.push({ name: 'Bob' }); // Error
users[0].name = 'Eve';       // OK — объект внутри мутабелен
```

Для глубокой иммутабельности нужен рекурсивный тип или библиотека (e.g. `DeepReadonly`).

## Совместимость

`number[]` присваивается `readonly number[]` (мутабельный → иммутабельный — безопасно). Обратное — нет:

```ts
const mutable: number[] = [1, 2];
const immutable: readonly number[] = mutable;     // OK
const back: number[] = immutable;                  // Error
```

Это следствие ковариантности: `number[]` — подтип `readonly number[]` (имеет все методы readonly + дополнительные мутирующие).

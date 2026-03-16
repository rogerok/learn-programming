---
tags: [typescript, functions, higher-order]
aliases: [Функции как параметры]
---

# Типизация функций-параметров

## Проблема типа `Function`

```ts
function process(callback: Function) {
  const value = callback(); // возвращает any
}
```

Тип `Function` **отключает проверку**: количество и типы аргументов не проверяются, результат — `any`.

## Правильный подход

Явно описать сигнатуру:

```ts
function process(callback: (input: string) => number) {
  const value = callback('hello'); // value: number
}
```

Или через type alias:

```ts
type Transformer<T, R> = (input: T) => R;

function process(callback: Transformer<string, number>) {
  return callback('hello');
}
```

## Callable types в интерфейсах

```ts
interface Formatter {
  (value: string): string;       // call signature
  locale: string;                // + свойство
}
```

## Overload signatures для колбеков

```ts
type Handler = {
  (event: MouseEvent): void;
  (event: KeyboardEvent): void;
};
```

## `(...args: any[]) => any` vs `Function`

Если нужен «любой вызываемый тип» без потери типобезопасности:

```ts
type AnyFunction = (...args: any[]) => any;
```

Это типобезопаснее, чем `Function`, потому что `Function` включает `bind`, `call`, `apply` и другие свойства прототипа.

# Типы object, Object, {}

Три похожих типа с разным значением:

## `{}` — пустой объектный тип

Принимает **любое значение, кроме `null` и `undefined`**. Не описывает «пустой объект» — описывает «что угодно, что не nullish»:

```ts
const a: {} = 42;        // OK
const b: {} = 'hello';   // OK
const c: {} = null;      // Error
```

## `Object` — тип с прототипом Object

Работает как `{}`, но **предопределяет типы встроенных методов** (`toString`, `valueOf` и т.д.):

```ts
const foo: {} = { toString() { return 1; } };      // OK — {} не проверяет toString
const bar: Object = { toString() { return 1; } };  // Error — Object требует toString(): string
```

## `object` (с маленькой буквы) — только непримитивы

Исключает `string`, `number`, `boolean`, `symbol`, `bigint`:

```ts
function fn(obj: object) {}
fn({});      // OK
fn([]);      // OK
fn('hello'); // Error — примитив
fn(123);     // Error — примитив
```

## Когда что использовать

| Тип | Когда |
|---|---|
| `object` | Нужен любой непримитив (Record, Array, Function...) |
| `Record<string, unknown>` | Нужен объект с произвольными ключами |
| Конкретный тип `{ key: Type }` | Знаете структуру |
| `{}` / `Object` | Избегайте — слишком широко и неинтуитивно |

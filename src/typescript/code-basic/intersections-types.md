# Intersection Types (`&`)

Пересечение создаёт тип, значения которого удовлетворяют **всем** исходным типам одновременно.

## Для объектных типов — объединение полей

```ts
type Order = { status: 'Created' };
type WithCost = { cost: number };
type FullOrder = Order & WithCost;
// { status: 'Created'; cost: number }
```

## Для примитивов — never

```ts
type Impossible = string & number; // never
```

Нет значения, которое одновременно строка и число → пустое множество.

## Intersection vs Union в теории множеств

Для **объектных типов** интуиция инвертирована:

| Операция | Множество значений | Множество полей |
|---|---|---|
| `A \| B` | Расширяется (больше значений подходит) | Сужается (доступны только общие поля) |
| `A & B` | Сужается (должно подходить под оба) | Расширяется (доступны все поля обоих типов) |

## Конфликт одноимённых свойств

```ts
type A = { x: number };
type B = { x: string };
type C = A & B;
// C.x: number & string → never
```

Если одноимённые свойства несовместимы — результат для этого поля `never`, что делает тип непригодным.

## Intersection с `never`

```ts
type T = { a: string } & never; // never
```

Пересечение чего-либо с `never` всегда `never` (пересечение с пустым множеством).

## Практическое применение — миксины

```ts
function withTimestamp<T>(obj: T): T & { createdAt: Date } {
  return { ...obj, createdAt: new Date() };
}
```

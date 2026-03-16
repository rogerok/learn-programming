---
tags: [typescript, type-system, sets, theory]
aliases: [Типы как множества]
---

# Типы как множества

**Тип** — множество всех допустимых значений + набор операций над ними.

| Тип | Множество |
|---|---|
| `never` | ∅ (пустое) |
| `'hello'` | { "hello" } — одноэлементное |
| `boolean` | { true, false } |
| `number` | все числа (включая NaN, ±Infinity) |
| `string` | бесконечное множество всех строк |
| `unknown` | универсальное множество (все значения) |

## Операции над множествами в TypeScript

### Union (`|`) — объединение

Новое множество включает **все** элементы из обоих типов.

```ts
type StringOrNumber = string | number; // string ∪ number
```

### Intersection (`&`) — пересечение

Новое множество содержит только элементы, принадлежащие **обоим** типам одновременно.

```ts
type A = { name: string };
type B = { age: number };
type AB = A & B; // { name: string; age: number }
```

Для примитивов: `string & number` → `never` (пустое пересечение).

### Подмножество (Subtyping)

Тип `A` является подтипом `B`, если `A ⊂ B`:

```
never ⊂ 'hello' ⊂ string ⊂ unknown
```

## Фильтрация через `never`

Поскольку `never` — пустое множество, `T | never` = `T`. Это используется для фильтрации в distributive conditional types:

```ts
type NonNumbers<T> = T extends number ? never : T;
type Result = NonNumbers<string | number | boolean>;
// string | boolean — number отфильтрован
```

## Ключевое правило

Чем **меньше** множество значений — тем **уже** (конкретнее) тип. Чем **больше** — тем **шире** (абстрактнее).

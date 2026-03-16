---
tags: [typescript, interfaces]
aliases: [Интерфейсы TypeScript]
---

# Интерфейсы

## Контракт для классов

Интерфейс описывает **контракт** — набор свойств и методов, которые класс обязуется реализовать:

```ts
interface Countable {
  count(): number;
}

class SchoolClass implements Countable {
  count(): number { /* ... */ }
}

// Принимаем любой объект с count(), а не конкретный класс
function doSomething(obj: Countable) {
  obj.count();
}
```

## Ключевая особенность: `implements` не наследует типы

TypeScript **только проверяет** класс на соответствие интерфейсу, но **не переносит типы** параметров:

```ts
interface ICalculate {
  sum: (num1: number, num2: number) => number;
}

class Summator implements ICalculate {
  sum(num1, num2) { return num1 + num2; }
  // ⚠️ num1, num2 имеют тип any — типы НЕ унаследованы
}
```

Параметры нужно типизировать вручную. Ошибка реализации возникает только если метод отсутствует или его сигнатура несовместима.

## Declaration Merging (слияние деклараций)

Уникальная возможность интерфейсов — повторное объявление **расширяет** интерфейс:

```ts
interface IUser { rating: number; }
interface IUser { nickname: string; }
// IUser = { rating: number; nickname: string }
```

Это используется для расширения типов из библиотек (augmentation). Type aliases (`type`) **не поддерживают** слияние — повторное объявление даст ошибку.

## interface vs type

| Возможность | `interface` | `type` |
|---|---|---|
| Declaration merging | Да | Нет |
| `extends` (наследование) | Да | Через `&` |
| `implements` классом | Да | Да (если не union) |
| Union / Intersection | Нет | Да |
| Mapped types, conditional types | Нет | Да |
| Вычисляемые свойства | Нет | Да |

**Правило**: `interface` — для объектных контрактов и public API. `type` — для unions, intersections, mapped/conditional types.

## Опциональные свойства и implements

```ts
interface ICalculate {
  sum: (a: number, b: number) => number;
  multiply?: (a: number, b: number) => number;
}

class Summator implements ICalculate {
  sum(a: number, b: number) { return a + b; }
}

new Summator().multiply?.(2, 3);
// Error — multiply не существует на Summator
// Опциональные свойства интерфейса НЕ попадают в класс автоматически
```

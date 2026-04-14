---
tags: [typescript, functional-programming, option, fp-ts, exercises]
---

# Упражнения: Типы как множества, ADT и Option

> [!info] Context
> Упражнения к главе [[types-adt-option]]. Порядок — от базового к композиционному.

## Упражнение 1: Мощность типов

Определите мощность каждого типа (количество возможных значений):

```typescript
type A = boolean;                              // ?
type B = 'small' | 'medium' | 'large';        // ?
type C = [boolean, boolean, boolean];          // ?
type D = { size: 'S' | 'M' | 'L'; inStock: boolean }; // ?
type E = never;                                // ?
type F = 'red' | never | 'blue';              // ?
```

---

## Упражнение 2: Exhaustive switch

Добавьте тип `Triangle` к `Shape` и исправьте функцию `describe` так, чтобы она обрабатывала все варианты. Используйте exhaustive checking с `never`.

```typescript
type Shape =
  | { _tag: 'Circle'; radius: number }
  | { _tag: 'Rectangle'; width: number; height: number };
  // добавьте Triangle с полями base и height

function describe(shape: Shape): string {
  switch (shape._tag) {
    case 'Circle':
      return `Круг с радиусом ${shape.radius}`;
    case 'Rectangle':
      return `Прямоугольник ${shape.width}×${shape.height}`;
    // обработайте Triangle
    // добавьте default с проверкой never
  }
}
```

---

## Упражнение 3: Самописный Option

Реализуйте функцию `filter` для самописного `Option`:

```typescript
interface Some<A> {
  readonly _tag: 'Some';
  readonly value: A;
}

interface None {
  readonly _tag: 'None';
}

type Option<A> = Some<A> | None;

const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value });
const none: Option<never> = { _tag: 'None' };

// Реализуйте: если Some и предикат истинен — вернуть Some, иначе None
const filter = <A>(predicate: (a: A) => boolean) =>
  (option: Option<A>): Option<A> => {
    // ваш код
  };

// Тесты:
// filter((n: number) => n > 0)(some(5))  → some(5)
// filter((n: number) => n > 0)(some(-3)) → none
// filter((n: number) => n > 0)(none)     → none
```

---

## Упражнение 4: Nullable → Option цепочка

Перепишите эту функцию с использованием fp-ts `Option` и `pipe`. Результат должен быть `Option<number>`, а не `number | null`.

```typescript
interface Product {
  price?: number;
  discount?: { percentage: number; expired: boolean };
}

// Исходная версия:
function getFinalPrice(product: Product): number | null {
  if (product.price == null) return null;
  if (product.discount == null) return product.price;
  if (product.discount.expired) return product.price;
  
  const discounted = product.price * (1 - product.discount.percentage / 100);
  return Math.round(discounted * 100) / 100;
}

// Перепишите с fp-ts:
// import * as O from 'fp-ts/Option';
// import { pipe } from 'fp-ts/function';
//
// const getFinalPrice = (product: Product): O.Option<number> => ...
```

> [!tip] Подсказка
> Используйте `O.fromNullable` для `price`, `O.fromPredicate` для проверки `!expired`, и `O.map` для вычисления итоговой цены.

---

## Упражнение 5: ADT для состояния загрузки

Спроектируйте ADT `RemoteData<E, A>` для представления состояний загрузки данных:

- `NotAsked` — запрос ещё не отправлен
- `Loading` — данные загружаются
- `Failure` — ошибка, с информацией об ошибке типа `E`
- `Success` — данные получены, типа `A`

Реализуйте:
1. Тип `RemoteData<E, A>` как discriminated union
2. Конструкторы для каждого варианта
3. Функцию `fold`, которая обрабатывает все четыре случая

```typescript
// Пример использования:
const renderUser = fold<string, User>(
  () => 'Нажмите "Загрузить"',
  () => 'Загрузка...',
  (error) => `Ошибка: ${error}`,
  (user) => `Пользователь: ${user.name}`
);

renderUser(notAsked);                          // "Нажмите \"Загрузить\""
renderUser(loading);                           // "Загрузка..."
renderUser(failure('Network error'));          // "Ошибка: Network error"
renderUser(success({ name: 'Alice' }));       // "Пользователь: Alice"
```

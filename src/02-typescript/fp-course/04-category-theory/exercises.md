---
tags: [typescript, functional-programming, category-theory, semigroup, monoid, natural-transformation, exercises]
---

# Упражнения: Теория категорий через код

> [!info] Context
> Упражнения к главе [[category-theory]]. Порядок — от проверки категориальных свойств до практики с Semigroup/Monoid в fp-ts.

## Упражнение 1: Докажите, что Option — функтор

Используя определение функтора как отображения между категориями, покажите, что Option сохраняет структуру. Проверьте оба закона **кодом**.

```typescript
import * as O from 'fp-ts/Option';
import { pipe, identity } from 'fp-ts/function';

const double = (n: number): number => n * 2;
const toString = (n: number): string => `${n}`;

// 1. Закон identity: map(identity) === identity
// Проверьте для O.some(42) и O.none

// 2. Закон composition: map(f ∘ g) === map(f) ∘ map(g)
// Проверьте для O.some(5) с функциями double и toString
```

<details>
<summary>Решение</summary>

```typescript
// Закон identity
const idSome = pipe(O.some(42), O.map(identity));
// O.some(42) — значение не изменилось ✓

const idNone = pipe(O.none, O.map(identity));
// O.none — значение не изменилось ✓

// Закон composition
const twoMaps = pipe(O.some(5), O.map(double), O.map(toString));
// O.some('10')

const composed = pipe(O.some(5), O.map(x => toString(double(x))));
// O.some('10')

// Результаты идентичны ✓

// Для None:
const twoMapsNone = pipe(O.none as O.Option<number>, O.map(double), O.map(toString));
// O.none

const composedNone = pipe(O.none as O.Option<number>, O.map(x => toString(double(x))));
// O.none

// Оба дают O.none ✓
```

Option — функтор, потому что `O.map` сохраняет и identity, и композицию.

</details>

---

## Упражнение 2: Напишите natural transformation

Напишите natural transformation из `Either<E, A>` в `Option<A>`, а затем проверьте закон коммутативности.

```typescript
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

// 1. Реализуйте eitherToOption
const eitherToOption = <E, A>(either: E.Either<E, A>): O.Option<A> => {
  // ваш код: Right(a) → Some(a), Left(e) → None
};

// 2. Проверьте закон коммутативности:
//    eitherToOption ∘ E.map(f)  ===  O.map(f) ∘ eitherToOption
// Используйте f = (n: number) => n * 3
// Проверьте для E.right(10) и E.left('ошибка')
```

<details>
<summary>Решение</summary>

```typescript
const eitherToOption = <E, A>(either: E.Either<E, A>): O.Option<A> =>
  E.isRight(either) ? O.some(either.right) : O.none;

const triple = (n: number): number => n * 3;

// Путь 1: сначала map в Either, потом конвертировать в Option
const path1Right = pipe(E.right(10) as E.Either<string, number>, E.map(triple), eitherToOption);
// O.some(30)

// Путь 2: сначала конвертировать в Option, потом map
const path2Right = pipe(E.right(10) as E.Either<string, number>, eitherToOption, O.map(triple));
// O.some(30)
// Совпадают ✓

// Для Left:
const path1Left = pipe(E.left('ошибка') as E.Either<string, number>, E.map(triple), eitherToOption);
// O.none

const path2Left = pipe(E.left('ошибка') as E.Either<string, number>, eitherToOption, O.map(triple));
// O.none
// Совпадают ✓
```

> [!tip] Заметьте
> fp-ts уже предоставляет эту функцию: `E.toOption` делает то же самое. Но написать её самостоятельно полезно для понимания паттерна.

</details>

---

## Упражнение 3: Определите структуру

Для каждой пары "тип + операция" определите, является ли она Magma, Semigroup или Monoid. Обоснуйте ответ.

```typescript
// A: числа с Math.max
const maxMagma: Magma<number> = { concat: (x, y) => Math.max(x, y) };

// B: непустые массивы с конкатенацией
type NonEmptyArray<A> = readonly [A, ...A[]];
const neaConcat: Magma<NonEmptyArray<number>> = {
  concat: (x, y) => [...x, ...y] as unknown as NonEmptyArray<number>,
};

// C: числа с возведением в степень
const power: Magma<number> = { concat: (x, y) => Math.pow(x, y) };

// D: объекты с Object.assign
const merge: Magma<Record<string, number>> = {
  concat: (x, y) => ({ ...x, ...y }),
};

// E: boolean с XOR
const xor: Magma<boolean> = {
  concat: (x, y) => (x && !y) || (!x && y),
};
```

<details>
<summary>Ответы</summary>

**A: `Math.max` на числах** — **Semigroup** (но не Monoid для всех number).
- Замкнутость: `max(number, number) → number` ✓
- Ассоциативность: `max(x, max(y, z)) === max(max(x, y), z)` ✓ (max всегда выбирает наибольшее)
- Identity: для конечных чисел нет конечного `empty` такого что `max(x, empty) = x` для всех x. (Если ограничить натуральными числами, `empty = 0` работает, но для всех number — `empty = -Infinity`, что формально является числом в JS, поэтому можно считать Monoid с `empty = -Infinity`)

**B: Непустые массивы с конкатенацией** — **Semigroup** (не Monoid).
- Замкнутость: конкатенация двух непустых массивов — непустой массив ✓
- Ассоциативность: `[...x, ...[...y, ...z]]` === `[...[...x, ...y], ...z]` ✓
- Identity: нет пустого непустого массива — нет нейтрального элемента ✗

**C: Возведение в степень** — только **Magma**.
- Замкнутость: `number ** number → number` ✓
- Ассоциативность: `2 ** (3 ** 2) = 2 ** 9 = 512`, но `(2 ** 3) ** 2 = 8 ** 2 = 64`. Не равны ✗

**D: Слияние объектов через spread** — **Monoid**.
- Замкнутость: `{...Record, ...Record} → Record` ✓
- Ассоциативность: `{...a, ...{...b, ...c}}` === `{...{...a, ...b}, ...c}` ✓ (при одинаковых ключах побеждает последний — порядок одинаковый)
- Identity: `empty = {}`. `{...x, ...{}} = x` и `{...{}, ...x} = x` ✓

**E: XOR на boolean** — **Monoid**.
- Замкнутость: `boolean XOR boolean → boolean` ✓
- Ассоциативность: XOR ассоциативен (проверяется таблицей истинности) ✓
- Identity: `empty = false`. `x XOR false = x` и `false XOR x = x` ✓

</details>

---

## Упражнение 4: Реализуйте concatAll и используйте его

Реализуйте функцию `concatAll`, которая сворачивает массив значений с помощью Monoid. Затем используйте её для трёх разных задач.

```typescript
interface Monoid<A> {
  readonly concat: (x: A, y: A) => A;
  readonly empty: A;
}

// 1. Реализуйте concatAll
const concatAll = <A>(monoid: Monoid<A>) =>
  (items: readonly A[]): A => {
    // ваш код
  };

// 2. Создайте Monoid для объединения множеств (Set)
// const setUnionMonoid: Monoid<Set<number>> = ???

// 3. Создайте Monoid для "последнее побеждает" (для Option-подобных значений)
// type Last<A> = A | null;
// const lastMonoid: Monoid<Last<number>> = ???

// 4. Используйте concatAll с каждым из ваших Monoid:
// concatAll(setUnionMonoid)([new Set([1,2]), new Set([2,3]), new Set([3,4])])
//   → Set {1, 2, 3, 4}
//
// concatAll(lastMonoid)([null, 5, null, 10, null])
//   → 10
```

<details>
<summary>Решение</summary>

```typescript
// 1. concatAll
const concatAll = <A>(monoid: Monoid<A>) =>
  (items: readonly A[]): A =>
    items.reduce(monoid.concat, monoid.empty);

// 2. Monoid для Set (union)
const setUnionMonoid: Monoid<Set<number>> = {
  concat: (x, y) => new Set([...x, ...y]),
  empty: new Set(),
};

concatAll(setUnionMonoid)([new Set([1, 2]), new Set([2, 3]), new Set([3, 4])]);
// Set {1, 2, 3, 4}

concatAll(setUnionMonoid)([]);
// Set {} — пустое множество, безопасно благодаря empty

// 3. Monoid для "последнее ненулевое значение"
type Last<A> = A | null;

const lastMonoid: Monoid<Last<number>> = {
  concat: (x, y) => y !== null ? y : x,
  empty: null,
};

concatAll(lastMonoid)([null, 5, null, 10, null]);
// 10

concatAll(lastMonoid)([null, null, null]);
// null

concatAll(lastMonoid)([]);
// null — безопасно
```

</details>

---

## Упражнение 5: Monoid для Stats через fp-ts

Используя fp-ts, создайте Monoid для агрегации статистики HTTP-запросов. Затем агрегируйте массив записей.

```typescript
import * as M from 'fp-ts/Monoid';
import * as N from 'fp-ts/number';
import { pipe } from 'fp-ts/function';

interface RequestStats {
  readonly totalRequests: number;
  readonly totalErrors: number;
  readonly totalBytes: number;
  readonly maxLatencyMs: number;
}

// 1. Создайте Monoid<RequestStats> используя M.struct
//    Подсказка: для maxLatencyMs нужен Monoid с Math.max и empty = 0
// const requestStatsMonoid: M.Monoid<RequestStats> = ???

// 2. Агрегируйте данные:
const batches: RequestStats[] = [
  { totalRequests: 100, totalErrors: 2, totalBytes: 50000, maxLatencyMs: 150 },
  { totalRequests: 200, totalErrors: 5, totalBytes: 120000, maxLatencyMs: 300 },
  { totalRequests: 50, totalErrors: 0, totalBytes: 10000, maxLatencyMs: 80 },
];

// M.concatAll(requestStatsMonoid)(batches)
// → { totalRequests: 350, totalErrors: 7, totalBytes: 180000, maxLatencyMs: 300 }
```

<details>
<summary>Подсказка</summary>

Для `maxLatencyMs` создайте свой Monoid: `{ concat: Math.max, empty: 0 }`. Для остальных полей используйте `N.MonoidSum`. Соберите всё через `M.struct`.

</details>

<details>
<summary>Решение</summary>

```typescript
import * as M from 'fp-ts/Monoid';
import * as N from 'fp-ts/number';

const maxMonoid: M.Monoid<number> = {
  concat: Math.max,
  empty: 0,
};

const requestStatsMonoid: M.Monoid<RequestStats> = M.struct({
  totalRequests: N.MonoidSum,
  totalErrors: N.MonoidSum,
  totalBytes: N.MonoidSum,
  maxLatencyMs: maxMonoid,
});

const result = M.concatAll(requestStatsMonoid)(batches);
// { totalRequests: 350, totalErrors: 7, totalBytes: 180000, maxLatencyMs: 300 }

// Пустой массив тоже безопасен:
M.concatAll(requestStatsMonoid)([]);
// { totalRequests: 0, totalErrors: 0, totalBytes: 0, maxLatencyMs: 0 }
```

Ключевой вывод: `M.struct` автоматически строит Monoid для объекта, комбинируя Monoid-ы для каждого поля. Это паттерн, который в fp-ts используется повсеместно — вместо ручного написания reduce/accumulator логики.

</details>

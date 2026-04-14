---
tags: [typescript, functional-programming, functor, map, either, exercises]
---

# Упражнения: Функтор — обобщение map

> [!info] Context
> Упражнения к главе [[functor]]. Порядок — от реализации map для своего контейнера до работы с fp-ts.

## Упражнение 1: map для Tree

Реализуйте `map` для бинарного дерева:

```typescript
type Tree<A> =
  | { readonly _tag: 'Leaf'; readonly value: A }
  | { readonly _tag: 'Node'; readonly left: Tree<A>; readonly value: A; readonly right: Tree<A> };

const leaf = <A>(value: A): Tree<A> => ({ _tag: 'Leaf', value });
const node = <A>(left: Tree<A>, value: A, right: Tree<A>): Tree<A> =>
  ({ _tag: 'Node', left, value, right });

// Реализуйте: применить функцию ко всем значениям в дереве,
// сохранив структуру (форму) дерева
const mapTree = <A, B>(f: (a: A) => B) =>
  (tree: Tree<A>): Tree<B> => {
    // ваш код
  };

// Тесты:
// mapTree((n: number) => n * 2)(leaf(5))
//   → leaf(10)
//
// mapTree((n: number) => `${n}`)(node(leaf(1), 2, leaf(3)))
//   → node(leaf('1'), '2', leaf('3'))
```

<details>
<summary>Подсказка</summary>

Используйте рекурсию: для `Leaf` — применить `f` к значению, для `Node` — рекурсивно обработать левое и правое поддерево и применить `f` к значению узла.

</details>

<details>
<summary>Решение</summary>

```typescript
const mapTree = <A, B>(f: (a: A) => B) =>
  (tree: Tree<A>): Tree<B> => {
    switch (tree._tag) {
      case 'Leaf':
        return leaf(f(tree.value));
      case 'Node':
        return node(
          mapTree(f)(tree.left),
          f(tree.value),
          mapTree(f)(tree.right)
        );
    }
  };
```

</details>

---

## Упражнение 2: Проверь законы функтора

Проверьте оба закона функтора для `mapTree` из упражнения 1. Напишите конкретные примеры, демонстрирующие выполнение каждого закона.

```typescript
const identity = <A>(x: A): A => x;
const double = (n: number): number => n * 2;
const toString = (n: number): string => `${n}`;

const myTree = node(leaf(1), 2, node(leaf(3), 4, leaf(5)));

// 1. Закон identity: mapTree(identity)(tree) должен быть равен tree
// Проверьте для myTree

// 2. Закон composition:
//    mapTree(x => g(f(x)))(tree) должен давать тот же результат, что
//    mapTree(g)(mapTree(f)(tree))
// Проверьте для myTree с функциями double и toString
```

<details>
<summary>Подсказка</summary>

Для сравнения деревьев используйте `JSON.stringify`. Покажите результаты обоих выражений и убедитесь, что они совпадают.

</details>

<details>
<summary>Решение</summary>

```typescript
// Закон identity
const result1 = mapTree(identity)(myTree);
console.log(JSON.stringify(result1) === JSON.stringify(myTree)); // true

// Закон composition
const twoMaps = mapTree(toString)(mapTree(double)(myTree));
const composed = mapTree((x: number) => toString(double(x)))(myTree);
console.log(JSON.stringify(twoMaps) === JSON.stringify(composed)); // true
// Оба дают: node(leaf('2'), '4', node(leaf('6'), '8', leaf('10')))
```

</details>

---

## Упражнение 3: Сломанный map

Функция `badMap` ниже имеет правильную сигнатуру `map`, но нарушает один из законов функтора. Определите, какой закон нарушен, и объясните почему.

```typescript
const badMap = <A, B>(f: (a: A) => B) =>
  (option: Option<A>): Option<B> => {
    switch (option._tag) {
      case 'None': return none;
      case 'Some': return f(option.value) !== null ? some(f(option.value)) : none;
    }
  };
```

<details>
<summary>Подсказка</summary>

Проверьте закон identity: `badMap(x => x)(some(null))`. Должно ли это вернуть `some(null)` или `none`?

</details>

<details>
<summary>Ответ</summary>

Нарушен **закон identity**.

```typescript
badMap(identity)(some(null));
// Ожидание (по закону identity): some(null)
// Реальность: none (потому что null !== null... нет, null === null, но f(option.value) !== null → false → none)
```

`badMap(identity)(some(null))` возвращает `none`, а не `some(null)`. Функция привносит дополнительную логику (проверку на null), которой не было в исходной функции `f`. Корректный `map` не должен менять структуру контейнера на основе значения — он только трансформирует содержимое.

Также нарушен **закон composition**: `badMap` вызывает `f` дважды, что неэффективно и может дать неожиданные результаты, если `f` имеет побочные эффекты (хотя мы работаем с чистыми функциями, двойной вызов — это запах).

</details>

---

## Упражнение 4: Either + pipe в fp-ts

Перепишите функцию `processAge` с использованием `Either` и `pipe` из fp-ts. Каждый шаг валидации должен возвращать `Either<string, число>`, а ошибка — пропускать оставшиеся шаги.

```typescript
// Исходная версия с исключениями:
function processAge(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') throw new Error('Пустая строка');

  const parsed = Number(trimmed);
  if (isNaN(parsed)) throw new Error(`"${trimmed}" — не число`);
  if (!Number.isInteger(parsed)) throw new Error('Возраст должен быть целым числом');
  if (parsed < 0 || parsed > 150) throw new Error(`Возраст ${parsed} вне диапазона 0–150`);

  return `Возраст: ${parsed} лет`;
}

// Перепишите с fp-ts:
// import * as E from 'fp-ts/Either';
// import { pipe } from 'fp-ts/function';
//
// const processAge = (input: string): E.Either<string, string> => ...
```

> [!tip] Подсказка
> Используйте `E.fromPredicate` для каждой проверки и `E.map` для финального форматирования. Цепочку проверок постройте через `E.flatMap` (или `E.chain`).

<details>
<summary>Решение</summary>

```typescript
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

const nonEmpty = (s: string): E.Either<string, string> =>
  pipe(
    s.trim(),
    E.fromPredicate(
      (t) => t.length > 0,
      () => 'Пустая строка'
    )
  );

const parseNumber = (s: string): E.Either<string, number> =>
  pipe(
    Number(s),
    E.fromPredicate(
      (n) => !isNaN(n),
      () => `"${s}" — не число`
    )
  );

const isInteger = (n: number): E.Either<string, number> =>
  pipe(
    n,
    E.fromPredicate(
      Number.isInteger,
      () => 'Возраст должен быть целым числом'
    )
  );

const inRange = (n: number): E.Either<string, number> =>
  pipe(
    n,
    E.fromPredicate(
      (v) => v >= 0 && v <= 150,
      (v) => `Возраст ${v} вне диапазона 0–150`
    )
  );

const processAge = (input: string): E.Either<string, string> =>
  pipe(
    input,
    nonEmpty,
    E.flatMap(parseNumber),
    E.flatMap(isInteger),
    E.flatMap(inRange),
    E.map((age) => `Возраст: ${age} лет`)
  );

// processAge('  25 ')      → E.right('Возраст: 25 лет')
// processAge('')            → E.left('Пустая строка')
// processAge('abc')         → E.left('"abc" — не число')
// processAge('25.5')        → E.left('Возраст должен быть целым числом')
// processAge('200')         → E.left('Возраст 200 вне диапазона 0–150')
```

> [!warning] Заметьте
> В решении используется `E.flatMap` — это уже выходит за рамки `map`. Мы забегаем вперёд к главе 5 (монады). Здесь `map` применяется только на последнем шаге — для финального форматирования. Остальные шаги требуют `flatMap`, потому что каждая проверка сама возвращает `Either`.

</details>

---

## Упражнение 5: Lifting — поднятие функций

У вас есть три чистые функции, которые работают с обычными значениями. "Поднимите" их в мир `Option` и `Either` с помощью `map`, а затем используйте в `pipe`-цепочке.

```typescript
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

// Обычные функции (ничего не знают о контейнерах)
const trim = (s: string): string => s.trim();
const parseIntSafe = (s: string): number => parseInt(s, 10);
const double = (n: number): number => n * 2;

// Задание 1: Создайте lifted-версии для Option
// const liftedTrim: (fa: O.Option<string>) => O.Option<string> = ...
// const liftedParseInt: (fa: O.Option<string>) => O.Option<number> = ...
// const liftedDouble: (fa: O.Option<number>) => O.Option<number> = ...

// Задание 2: Используйте их в pipe-цепочке
// pipe(O.some('  42  '), liftedTrim, liftedParseInt, liftedDouble)
// → O.some(84)

// Задание 3: То же для Either<string, _>
// pipe(E.right('  42  ') as E.Either<string, string>, ???, ???, ???)
// → E.right(84)
```

<details>
<summary>Решение</summary>

```typescript
// Задание 1: lifted-версии для Option
const liftedTrim = O.map(trim);
const liftedParseInt = O.map(parseIntSafe);
const liftedDouble = O.map(double);

// Задание 2: pipe-цепочка с Option
const result1 = pipe(
  O.some('  42  '),
  liftedTrim,
  liftedParseInt,
  liftedDouble
);
// O.some(84)

const result2 = pipe(
  O.none as O.Option<string>,
  liftedTrim,
  liftedParseInt,
  liftedDouble
);
// O.none — все три функции пропущены

// Задание 3: то же для Either
const liftedTrimE = E.map(trim);
const liftedParseIntE = E.map(parseIntSafe);
const liftedDoubleE = E.map(double);

const result3 = pipe(
  E.right('  42  ') as E.Either<string, string>,
  liftedTrimE,
  liftedParseIntE,
  liftedDoubleE
);
// E.right(84)

const result4 = pipe(
  E.left('no input') as E.Either<string, string>,
  liftedTrimE,
  liftedParseIntE,
  liftedDoubleE
);
// E.left('no input') — ошибка прошла насквозь
```

Ключевой вывод: `O.map(f)` и `E.map(f)` — это lifting. Мы взяли обычную функцию `string => string` и "подняли" её до `Option<string> => Option<string>`. Функция `trim` не знает о существовании Option, но работает с ним через map.

</details>

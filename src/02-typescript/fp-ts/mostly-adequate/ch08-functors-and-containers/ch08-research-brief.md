---
tags: [typescript, functional-programming, fp-ts, functors, option, either, io, research-brief]
---

# Research Brief: Mostly Adequate Guide, Chapter 08 in fp-ts framing

> [!info] Назначение
> Этот документ нужен как вход для `author`. Он фиксирует scope главы, порядок подачи материала, источники и связи с уже существующими заметками. Это не сама глава.

## 1. Scope и границы

Глава должна сохранить ход мысли оригинального `ch08-ru.md`, но объяснять его через `fp-ts`:

- показать `Container` как педагогический мост к `Identity` и к идее `Functor`
- объяснить `map` как общую форму работы с контекстом, а не как метод одной конкретной коллекции
- показать `Option<A>` как типовую замену `null` / `undefined`
- показать `Either<E, A>` как чистую обработку ошибок вместо `throw/catch`
- показать `IO<A>` как отложенный effect
- связать всё через namespace-style API: `O.map`, `E.map`, `IO.map`, `RA.map`

Глава не должна:

- превращаться в дубль существующей JS-главы [Функторы и контейнеры](/home/vyacheslav/my-projects/learn-programming/src/01-javascript/patterns/fp/mostly-adequate-guide-to-fp/ch08-functors-and-containers/functors-and-containers.md)
- превращаться в полный пересказ `[[fp-ts-phase-1-2]]`
- уходить в глубокую теорию категорий или детальный разбор всех методов `Option` / `Either` / `IO`
- смешивать сюда `Task`, `TaskEither` и `Reader` глубже, чем это нужно для мотивации

> [!important] Педагогический акцент
> Эта глава должна показать одну сквозную мысль: `map` работает одинаково в разных контекстах, а `fp-ts` даёт этой мысли точную и производственную форму.

## 2. Пререквизиты

Перед чтением у learner'а должны быть:

- понимание чистых функций из `[[ch03-pure-functions]]`
- базовая композиция функций из `[[function-composition/function-composition]]`
- каррирование и data-last стиль из `[[ch04-currying/ch04-currying]]`
- базовые знания TypeScript: generics, function types, union types
- знакомство с `pipe` и namespace-imports `import * as O from ...`

Желательно, но не обязательно:

- `[[unsound]]` для мотивации type-safe error handling
- уже прочитанная глава `[[fp-ts-phase-1-2|fp-ts -- Теория и Core Types]]`

## 3. Рекомендуемый порядок подтем

1. Контекст: зачем нам контейнеры и почему `map` важнее конкретной реализации
2. `ReadonlyArray` или `Array` как знакомый warm-up для `Functor`
3. `Container` как педагогический мост, затем `Identity` как реальный fp-ts-аналог
4. `Option<A>` как замена `null` / `undefined`
5. `Either<E, A>` как чистая обработка ошибок
6. `IO<A>` как отложенный effect
7. Общая форма `map` и namespace-style API (`O.map`, `E.map`, `IO.map`)
8. Извлечение результата через `match` / `getOrElse`, а не через “вытаскивание из коробки”
9. Упражнения и Anki-карточки

> [!tip] Как не перегрузить главу
> Законы Functor можно упомянуть коротко как напоминание, но не делать из них центральную цель главы. `fp-ts-phase-1-2` уже даёт теоретический фундамент.

## 4. Ключевые объяснения и углы подачи

### `Container` и `Identity`

`Container` стоит использовать только как учебный мост: показать идею “значение внутри контекста, к которому применяется `map`”. После этого сразу перевести читателя к `Identity` как к формальному `fp-ts`-аналогy.

### `Option`

Объяснять как тип, который явно моделирует отсутствие значения. В примерах лучше опираться на `O.fromNullable`, `O.map`, `O.match`, `O.getOrElse`, а не на самодельные `null`-проверки.

### `Either`

Объяснять как тип для ошибок с контекстом. Важные операции для главы: `E.right`, `E.left`, `E.map`, `E.mapLeft`, `E.match`, `E.tryCatch`, `E.fromNullable`. Центральная мысль: ошибка становится частью типа, а не скрытым исключением.

### `IO`

Объяснять как синхронный side effect, завернутый в функцию `() => A`. Важно подчеркнуть, что эффект не исчезает, а откладывается и становится явным.

### `map` как общий паттерн

Показывать, что `map` ведёт себя одинаково на `ReadonlyArray`, `Option`, `Either`, `IO` и `Identity`. Это и есть центральный bridge главы.

### Namespace-style `fp-ts`

Во всех примерах использовать `import * as O from 'fp-ts/Option'`, `import * as E from 'fp-ts/Either'`, `import * as IO from 'fp-ts/IO'`, `import * as RA from 'fp-ts/ReadonlyArray'`, чтобы читатель видел одинаковую форму API и не терялся в коллизиях имён.

## 5. Связи с vault

Эта глава должна ссылаться на:

- `[[ch03-pure-functions]]` как на базу по чистым функциям и эффектам
- `[[ch04-currying/ch04-currying]]` как на базу по data-last и композиционной форме функций
- `[[function-composition/function-composition]]`
- `[[partial-application/readme|Частичное применение и каррирование в JavaScript]]`
- `[[fp-ts-phase-1-2]]` как на следующую тему, где `Option`, `Either`, `IO` и `Task` разбираются системно
- `[[fp-ts-roadmap]]` как на карту всей линии обучения

## 6. Источники

### Исходный текст

- [Mostly Adequate Guide, chapter 08](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch08) - базовая структура и мотивация. Beginner.
- [Russian translation, chapter 08](https://github.com/MostlyAdequate/mostly-adequate-guide-ru/blob/master/ch08-ru.md) - источник оригинальной русской версии. Beginner.

### `fp-ts` official

- [Functor.ts module](https://gcanti.github.io/fp-ts/modules/Functor.ts.html) - определение `Functor` и общая форма `map`. Intermediate.
- [Identity.ts module](https://gcanti.github.io/fp-ts/modules/Identity.ts.html) - `Identity` как минимальный контекст и наглядный bridge от `Container`. Intermediate.
- [Option.ts module](https://gcanti.github.io/fp-ts/modules/Option.ts.html) - `Option` как optional value и возможная failing computation. Intermediate.
- [Either.ts module](https://gcanti.github.io/fp-ts/modules/Either.ts.html) - `Either` как чистая обработка ошибок. Intermediate.
- [IO.ts module](https://gcanti.github.io/fp-ts/modules/IO.ts.html) - `IO<A>` как `() => A`, delayed effect и `map` в computational context. Intermediate.
- [ReadonlyArray.ts module](https://gcanti.github.io/fp-ts/modules/ReadonlyArray.ts.html) - data-last `map`, `filter`, `reduce` как привычный warm-up для главы. Beginner to Intermediate.
- [function.ts module](https://gcanti.github.io/fp-ts/modules/function.ts.html) - `pipe` и `flow` для связки с composition style. Intermediate.

### Практические объяснения

- [fp-ts Learning Resources](https://gcanti.github.io/fp-ts/learning-resources/) - сборник статей и примеров по экосистеме. Intermediate.

## 7. Технические детали для автора главы

**Версия:** `fp-ts` `2.x`. Все примеры — `pipe`-style и namespace imports.

**Рекомендуемые импорты:**

```typescript
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as IO from 'fp-ts/IO'
import * as Id from 'fp-ts/Identity'
```

**Принцип подачи:** сначала знакомый warm-up через `ReadonlyArray`, потом `Identity` как мост, затем `Option`, `Either`, `IO`.

**Формат упражнений:** `vitest`, без `node:assert`, с runnable snippets и `Solution`-блоками.

## 8. Целевой путь главы

`src/02-typescript/fp-ts/mostly-adequate/ch08-functors-and-containers/ch08-functors-and-containers.md`

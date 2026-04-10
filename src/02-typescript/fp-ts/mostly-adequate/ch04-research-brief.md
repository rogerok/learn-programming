---
tags: [typescript, functional-programming, fp-ts, currying, partial-application, research-brief]
---

# Research Brief: Mostly Adequate Guide, Chapter 04 in fp-ts framing

> [!info] Назначение
> Этот документ нужен как вход для `author`. Он фиксирует scope главы, порядок подачи материала, связи с уже существующими заметками и источники. Это не сама глава.

## 1. Scope и границы

Глава должна сохранить ключевую идею оригинального `ch04-ru.md`, но объяснять её через `fp-ts`-мышление:

- что такое currying и чем он отличается от обычной функции с несколькими аргументами
- почему частичное применение удобно в `fp-ts`
- зачем `fp-ts` так настойчиво использует `data-last` стиль
- как currying подготавливает код к `pipe`, `flow` и pointfree-style
- как каррированные функции естественно сочетаются с `map`, `filter`, `reduce`, `Reader`, `TaskEither`
- чем currying отличается от default params, ad-hoc арности и случайного partial application

Глава не должна:

- превращаться в полный пересказ уже существующих заметок про [[partial-application/readme|partial application]] и [[function-composition/function-composition|composition]]
- уходить в глубокую реализацию `curry` как utility-функции
- объяснять `pipe` и `flow` с нуля так, будто этих тем ещё не было в vault
- дублировать материал `fp-ts-phase-1-2` про Functor / Monad глубже, чем это нужно для мотивации

> [!important] Педагогический акцент
> Эта глава должна показать, что currying в `fp-ts` важен не сам по себе, а как стиль, который делает API библиотек предсказуемыми, data-last и удобными для композиции.

## 2. Пререквизиты

Перед чтением у learner'а должны быть:

- понимание чистых функций из `[[pure-functions]]`
- базовая композиция функций из `[[function-composition/function-composition]]`
- базовые знания TypeScript: generics, function types, union types
- знакомство с `pipe` и namespace-imports `import * as O from ...`

Желательно, но не обязательно:

- `[[unsound]]` для мотивации type-safe подхода
- уже прочитанный `[[fp-ts-phase-1-2|fp-ts: Theory and Core Types]]`

## 3. Рекомендуемый порядок подтем

1. Контекст: зачем currying нужен именно в `fp-ts`
2. Простое определение currying на знакомых примерах
3. Частичное применение как следствие currying
4. `data-last` как соглашение, которое делает API `fp-ts` удобным
5. Связь с `pipe`, `flow` и pointfree-style
6. Почему `map`, `filter`, `reduce` и похожие функции выигрывают от currying
7. Как currying подготавливает почву для `Reader` и `TaskEither`
8. Отличие currying от default params, ad-hoc арности и “удобных” перегрузок
9. Упражнения и Anki-карточки

> [!tip] Как не перегрузить главу
> Не стоит заново доказывать, что такое composition. Достаточно показать, что currying делает композицию удобнее и чище в `fp-ts`-коде.

## 4. Ключевые объяснения и углы подачи

### Currying

Определять как преобразование функции нескольких аргументов в цепочку функций по одному аргументу. Важный смысл для читателя: это не просто синтаксис, а способ создать функции, которые удобно частично применять.

### Partial application

Показать как следствие currying, а не отдельную магию. В `fp-ts` это особенно важно, потому что многие функции уже спроектированы под частичное применение через data-last стиль.

### Data-last

Это центральный pedagogical hook главы. Объяснять как соглашение: сначала передаём конфигурацию/предикат/функцию, а данные, над которыми работаем, оставляем последними. Это делает выражения удобными для `pipe`, `flow` и pointfree-подхода.

### Pipe / flow / pointfree

Показывать не как отдельную теорию, а как естественное продолжение currying: если функции унарные или легко частично применяются, их проще соединять в pipeline.

### `map`, `filter`, `reduce`

Связь должна быть практической:

- `Array.map` в `fp-ts` и модулях `Array` уже data-last
- `filter` естественно принимает predicate первым
- `reduce` в `fp-ts` тоже формируется как curried API

### Reader и TaskEither

Показать, что currying помогает строить API для контекстов и эффектов:

- `Reader<R, A>` хорошо сочетается с data-last функциями, потому что окружение можно передавать явно
- `TaskEither<E, A>` выигрывает, когда вспомогательные функции тоже каррированы и легко компонуются через `pipe`

### Default params и ad-hoc арность

Нужно отдельно показать, что это не замена currying:

- default params не создают цепочку частичных применений
- ad-hoc арность ухудшает предсказуемость и композицию
- currying даёт стабильную форму, которую удобно передавать дальше

## 5. Связи с vault

Эта глава должна ссылаться на:

- `[[pure-functions]]` как на базу для чистого кода
- `[[function-composition/function-composition|Каррирование и композиция функций]]` как на уже существующую JS-ориентированную теорию
- `[[partial-application/readme|Частичное применение и каррирование в JavaScript]]` как на практическую JS-базу
- `[[fp-ts-phase-1-2]]` как на следующую главу, где currying уже используется в реальном `fp-ts`
- `[[fp-ts-roadmap]]` как на карту всей линии обучения

## 6. Источники

### Исходный текст

- [Mostly Adequate Guide, chapter 04](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch04) - базовая структура и аргументация. Beginner.
- [Russian translation, chapter 04](https://github.com/MostlyAdequate/mostly-adequate-guide-ru/blob/master/ch04-ru.md) - источник оригинальной русской версии. Beginner.

### `fp-ts` official

- [function.ts module](https://gcanti.github.io/fp-ts/modules/function.ts.html) - `pipe`, `flow`, `identity`, и related helpers. Intermediate.
- [Array.ts module](https://gcanti.github.io/fp-ts/modules/Array.ts.html) - `map`, `filter`, `reduce`, `chain` в data-last стиле. Intermediate.
- [Reader.ts module](https://gcanti.github.io/fp-ts/modules/Reader.ts.html) - как каррирование и environment-passing сочетаются в `Reader`. Intermediate.
- [TaskEither.ts module](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html) - data-last helpers для async + error pipelines. Intermediate.

### Практические объяснения

- [Practical Guide to fp-ts, part 1](https://rlee.dev/practical-guide-to-fp-ts-part-1) - `pipe`, `flow`, стиль композиции. Beginner.
- [Practical Guide to fp-ts, part 3](https://rlee.dev/practical-guide-to-fp-ts-part-3) - как каррирование и data-last помогают в рабочих пайплайнах. Intermediate.

### Связанные уже существующие заметки

- `src/01-javascript/patterns/partial-application/readme.md`
- `src/01-javascript/patterns/fp/function-composition/function-composition.md`
- `src/02-typescript/fp-ts/fp-ts-phase-1-2.md`
- `src/02-typescript/fp-ts/fp-ts-roadmap.md`
- `src/02-typescript/fp-ts/mostly-adequate/ch03-pure-functions.md`

## 7. Целевой путь главы

`src/02-typescript/fp-ts/mostly-adequate/ch04-currying.md`

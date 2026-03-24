---
tags: [typescript, functional-programming, fp-ts, roadmap]
---

# Study Plan: fp-ts

> [!info] Context
> `fp-ts` — библиотека для функционального программирования на TypeScript. Реализует типы и паттерны из теории категорий: `Option`, `Either`, `Task`, `IO`, `Reader` и другие. Позволяет писать надёжный, компонуемый, side-effect-free код.

## Prerequisites

Перед стартом убедись, что знаешь:

- [[pure-functions]] — чистые функции, отсутствие побочных эффектов
- [[partial-application]] — каррирование, частичное применение
- [[function-composition]] — `pipe` и `compose`
- TypeScript generics, conditional types, discriminated unions

> [!important] Ключевой мостик
> В [[unsound]] уже используется паттерн `Either` для обработки ошибок. fp-ts — это его формальная, production-ready реализация.

---

## Roadmap

### Phase 1: Теория — математика в коде

*~4–6 часов*

1. **Functor** — контейнер, к содержимому которого можно применить функцию через `map()`
   - Законы: identity, composition
   - Знакомые примеры: `Array.map`, `Promise.then`
   - Источник: [Mostly Adequate Guide — ch08](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch08)

2. **Applicative** — functor с возможностью применять функции внутри контейнера через `ap()`
   - `liftA2`: применить бинарную функцию к двум завёрнутым значениям
   - Источник: [Mostly Adequate Guide — ch10](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch10)

3. **Monad** — applicative с `chain()` (flatMap) для последовательных вычислений
   - Законы: left identity, right identity, associativity
   - Чем отличается от Functor: нет вложенности `F<F<A>>`
   - Источник: [Mostly Adequate Guide — ch09](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch09)

> [!tip] Milestone 1
> После Phase 1 ты должен уметь: объяснить разницу Functor / Applicative / Monad своими словами, и показать соответствие в обычном JS-коде (`Array`, `Promise`).

---

### Phase 2: Core типы fp-ts

*~6–8 часов*

1. **`Option<A>`** — замена `null` / `undefined`
   - `some(a)` / `none`
   - `map`, `chain`, `fold`, `getOrElse`
   - Когда использовать: поиск в коллекции, nullable поля

2. **`Either<E, A>`** — type-safe обработка ошибок
   - `right(a)` / `left(e)`
   - `map`, `mapLeft`, `chain`, `fold`, `bimap`
   - Замена `try/catch`: ошибка становится частью типа
   - Источник: [fp-ts Either docs](https://gcanti.github.io/fp-ts/modules/Either.ts.html)

3. **`Task<A>`** — ленивая асинхронность (`() => Promise<A>`)
   - Не запускается сразу, в отличие от `Promise`
   - `map`, `chain`

4. **`TaskEither<E, A>`** — async + явная обработка ошибок
   - Главный рабочий тип в production fp-ts коде
   - `tryCatch`, `map`, `chain`, `fold`, `orElse`

5. **`IO<A>`** — синхронный side-effect в контейнере (`() => A`)
   - Изолирует нечистые операции (чтение Date, Math.random, localStorage)

6. **`IOEither<E, A>`** — синхронный side-effect + ошибка

7. **`Reader<R, A>`** — dependency injection через замыкание
   - Функция `(deps: R) => A` с `map` и `chain`

> [!tip] Milestone 2
> После Phase 2 ты должен уметь: переписать типичный обработчик с `try/catch` на `Either` или `TaskEither`, не используя `throw`.

---

### Phase 3: Паттерны и практика

*~4–6 часов*

1. **`pipe()` и `flow()`** — основной инструмент fp-ts
   - `pipe(value, f, g, h)` — value-first composition
   - `flow(f, g, h)` — point-free style
   - Практика: переписать цепочку `.then()` через `pipe`

2. **Do-notation** — читаемые монадические цепочки
   - `Do`, `bind`, `bindTo`, `apS`, `let`
   - Альтернатива вложенным `chain` вызовам

3. **`Validation` vs `Either`**
   - `Either` — fail-fast: останавливается на первой ошибке
   - `These` / `Validation` — accumulate all errors
   - Применение: валидация форм

4. **Реальные кейсы**
   - HTTP-запрос с обработкой ошибок через `TaskEither`
   - Валидация входных данных через `Option` / `Either`
   - Построение pipeline без единого `if`

> [!tip] Milestone 3
> После Phase 3 ты должен уметь: написать реальный pipeline с `pipe()` для HTTP-запроса + валидации + трансформации данных — без `if`, без `throw`, без `undefined`.

---

### Phase 4: Углубление

*~4 часа*

1. **Type Classes: `Eq`, `Ord`, `Semigroup`, `Monoid`**
   - Абстракции для сравнения и объединения значений
   - Нужны для `sort`, `groupBy`, `concat` в fp-ts стиле

2. **`Traverse` и `Sequence`**
   - `traverse`: `Array<Task<A>>` → `Task<Array<A>>`
   - `sequence`: то же, но без функции-маппера
   - Применение: параллельные запросы с обработкой ошибок

3. **Экосистема fp-ts**
   - `io-ts` — runtime validation + static types
   - `monocle-ts` — оптики (Lens, Prism) для иммутабельного обновления

> [!tip] Milestone 4
> После Phase 4 ты должен уметь: реализовать параллельный fetch нескольких эндпоинтов через `traverse`, собрать ошибки через `Validation`.

---

## Recommended Sources

| Источник | Уровень | Тема |
|---|---|---|
| [Mostly Adequate Guide](https://mostly-adequate.gitbook.io/mostly-adequate-guide/) | Beginner | FP теория на JS |
| [fp-ts docs](https://gcanti.github.io/fp-ts/) | Intermediate | API reference |
| [gcanti blog posts](https://dev.to/gcanti) | Intermediate | Паттерны fp-ts |
| [fp-ts recipes](https://gcanti.github.io/fp-ts/recipes/) | Intermediate | Практические кейсы |
| [Functional Design series (gcanti)](https://dev.to/gcanti/functional-design-combinators-14pn) | Advanced | Комбинаторы, дизайн |

---

## Related Topics

- [[unsound]] — Either уже используется здесь
- [[pure-functions]]
- [[partial-application]]
- [[function-composition]]

## Sources

- https://gcanti.github.io/fp-ts/
- https://mostly-adequate.gitbook.io/mostly-adequate-guide/
- https://dev.to/gcanti

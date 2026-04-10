---
tags: [typescript, functional-programming, fp-ts, applicative, research, mostly-adequate]
aliases: [Mostly Adequate ch10 research brief, Applicative Functors in fp-ts]
---

# Research Brief: Аппликативные функторы через призму fp-ts

> [!info] Context
> Эта глава переосмысляет `Mostly Adequate Guide`, chapter 10, в `fp-ts`-first форме. Оригинальная линия сохраняется: `map` перестаёт хватать -> `ap` / applicative application -> intuition of lifting -> practical power of independent effects -> laws. Но вместо самодельных `Container`/`Maybe` история строится вокруг реальных API `fp-ts`: `Option`, `Either`, `Task`, `TaskEither`, `Apply`, `sequenceT`, `sequenceS`, `apS`, `apFirst`, `apSecond`.

## Goal of Chapter

Показать, почему applicative нужен не как “ещё один combinator”, а как точный ответ на задачу независимых вычислений. После главы читатель должен уметь:

- распознавать, когда `map` уже не решает задачу, но `chain` тоже избыточен;
- применять `ap` и производные helpers (`apFirst`, `apSecond`) в `fp-ts`;
- собирать независимые значения через `sequenceT`, `sequenceS` и `apS`;
- различать applicative- и monadic-style на уровне зависимости аргументов;
- понимать, когда `Task` / `TaskEither` можно читать как parallel-ish composition, а когда нужна последовательность;
- переносить интуицию книги про `liftA2` / `liftA3` в современный `fp-ts` idiom.

## What to Preserve From Original

- Основной narrative: `map` больше не хватает, потому что функция оказывается внутри контейнера.
- Интуиция “поднять функцию в мир контейнеров”.
- Главная практическая мысль: applicative полезен, когда аргументы независимы.
- Контраст с монадами: `Monad` для зависимых шагов, `Applicative` для независимых.
- Законы applicative как гарантия предсказуемой композиции.
- Идея, что более слабая абстракция часто лучше, чем “всегда использовать монаду”.

## What to Reinterpret Through fp-ts

- `Container` и `Maybe` не использовать как основные герои; максимум как историческую отсылку к книге.
- Подачу строить вокруг актуальных `fp-ts` модулей и namespace imports: `import * as O from 'fp-ts/Option'`, `import * as E from 'fp-ts/Either'`, `import * as T from 'fp-ts/Task'`, `import * as TE from 'fp-ts/TaskEither'`.
- `ap` показывать как первичную операцию `Apply`, а `apFirst` / `apSecond` как удобные derived helpers для сохранения одного из результатов.
- `sequenceT` и `sequenceS` подать как ergonomic applicative tools для tuple/struct assembly.
- `apS` использовать как удобный do-like helper для сборки record-значений без лишней вложенности.
- `ApplicativePar` / `ApplicativeSeq` использовать там, где нужно показать разницу между независимым комбинированием и последовательным выполнением, особенно на `Task` и `TaskEither`.
- `liftA2` / `liftA3` подавать как историческую интуицию из книги, но не как основной современный API. Для `fp-ts`-версии лучше опираться на `ap`, `sequenceT`, `sequenceS` и `apS`.

> [!important] API direction
> В `fp-ts` v2 основной стиль должен быть `pipe(...)` + namespace imports. Для applicative-комбинации использовать `ap`, `apFirst`, `apSecond`, `sequenceT`, `sequenceS`, `apS`. Для `Task` и `TaskEither` отдельно показать, что есть выбор между параллельным и последовательным applicative instance, если это помогает объяснить смысл. `liftA2` можно упомянуть как книгу-ориентированную интуицию, но не делать его центральным именем главы.

## What Not to Cover

- Не переписывать chapter в виде истории про самодельные `Container`-классы.
- Не уходить в Monad глубже, чем нужно для сравнения зависимых и независимых шагов.
- Не превращать главу в каталог всех `fp-ts` combinators.
- Не уходить в сложные validation-структуры и `These`/`Validation`-подобные темы, если они не нужны для основной мысли.
- Не дублировать `ch09` и `fp-ts-phase-1-2`; applicative должен быть продолжением, а не повтором.

## Recommended Chapter Structure

1. Почему `map` уже не хватает.
2. Что такое `ap` и почему функция тоже может жить в контексте.
3. `Option` и `Either` как простые applicative-сценарии.
4. `sequenceT`, `sequenceS` и `apS` как удобные способы собирать tuple и struct.
5. `Task` / `TaskEither`: независимые эффекты и выбор между parallel/sequential semantics.
6. `liftA2` / `liftA3` как историческая интуиция, а не обязательный современный стиль.
7. Законы applicative.
8. Итог: почему applicative слабее монады, но часто лучше подходит для независимых данных.

**Краткое резюме:** структура должна повторять narrative оригинала, но всё время переводить его в практический `fp-ts`-язык.

## Exercise Strategy

Упражнения должны быть только в формате `vitest`-snippets и проверять именно выбор applicative-style, а не синтаксис ради синтаксиса.

Рекомендуемые упражнения:

1. `ap` для `Option`.
   - Задача: собрать результат из двух независимых `Option`-значений через `ap` или `sequenceT`.
   - Тесты: оба значения present -> `Some`, один отсутствует -> `None`.

2. `sequenceS` для формы/конфига.
   - Задача: собрать record из нескольких независимых полей, каждое в `Option` или `Either`.
   - Тесты: все поля есть -> успешный record; один missing/error -> short-circuit.

3. `Task` parallel vs sequential.
   - Задача: показать разницу между независимыми `Task`-эффектами и последовательной цепочкой.
   - Тесты: независимые задачи могут быть объединены applicatively; последовательные depend on prior result.

4. `TaskEither` independent assembly.
   - Задача: собрать результат из нескольких независимых `TaskEither`-шагов через `sequenceS`/`apS`.
   - Тесты: ошибки сохраняются, успешные значения собираются в struct.

5. `apFirst` / `apSecond`.
   - Задача: сохранить только один результат, при этом всё равно выполнить обе независимые операции.
   - Тесты: правильный preserved value, side effects описаны один раз.

> [!tip] Test format
> Все тестовые сниппеты оформлять через `vitest` (`describe`, `it`, `expect`). Для `Task` и `TaskEither` использовать `await task()` внутри `async`-тестов.

**Краткое резюме:** упражнения должны заставлять читателя выбирать applicative, когда шаги независимы, и видеть, что `sequenceS`/`sequenceT` часто удобнее ручного `ap`.

## Sources

- [Mostly Adequate Guide, chapter 10: Applicative Functors](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch10)
- [Mostly Adequate Guide, Russian translation, ch10](https://github.com/MostlyAdequate/mostly-adequate-guide-ru/blob/master/ch10-ru.md)
- [fp-ts Apply module](https://gcanti.github.io/fp-ts/modules/Apply.ts.html)
- [fp-ts Applicative module](https://gcanti.github.io/fp-ts/modules/Applicative.ts.html)
- [fp-ts Option module](https://gcanti.github.io/fp-ts/modules/Option.ts.html)
- [fp-ts Either module](https://gcanti.github.io/fp-ts/modules/Either.ts.html)
- [fp-ts Task module](https://gcanti.github.io/fp-ts/modules/Task.ts.html)
- [fp-ts TaskEither module](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html)
- [fp-ts Identity module](https://gcanti.github.io/fp-ts/modules/Identity.ts.html)

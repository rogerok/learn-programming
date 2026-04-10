---
tags: [typescript, functional-programming, fp-ts, monads, research, mostly-adequate]
aliases: [Mostly Adequate ch09 research brief, Monads in fp-ts]
---

# Research Brief: Монадические луковицы через призму fp-ts

> [!info] Context
> Эта глава переосмысляет `Mostly Adequate Guide`, chapter 09, в `fp-ts`-first форме. Оригинальная линия сохраняется: `of` и минимальный контекст -> вложенные контексты -> `join` / `flatten` -> `chain` / `flatMap` -> практическая сила -> законы. Но вместо самодельных классов и псевдо-`Maybe` история строится вокруг реальных типов `fp-ts`: `Identity`, `Option`, `Either`, `IO`, `TaskEither`.

## Goal of Chapter

Показать, почему монады нужны не как абстрактная теория, а как практический ответ на вложенные контексты и последовательные эффекты. После главы читатель должен уметь:

- распознавать, когда `map` создаёт вложенность;
- понимать разницу между `flatMap` и `flatten`;
- использовать `pipe` и namespace imports в стиле `fp-ts v2`;
- отличать монаду от аппликатива на уровне задач и выбора API;
- переносить старую интуицию из оригинального `ch09` в production-форму `fp-ts`.

## What to Preserve From Original

- Основной narrative: сначала `of` и минимальный контекст, затем проблема вложенных контейнеров, затем `join`, `chain`, законы и итог.
- Метафора лука как повторяющееся “снятие слоёв” вложенности.
- Практическая мотивация: `chain` нужен там, где функция внутри контекста возвращает тот же тип контекста.
- Идея, что законы монады нужны не ради формальности, а ради предсказуемой композиции.
- Финальный мост к следующей теме: монады удобны для последовательности, но не всегда лучше аппликативов для независимых вычислений.

## What to Reinterpret Through fp-ts

- `of` объяснять через `Pointed`-интуицию и реальные конструкторы `fp-ts`, а не через самодельные `new`.
- `Identity` использовать как минимальный учебный мост, а не как отдельную “героическую” тему.
- `Option` показать через nested access и безопасный путь вместо `null`-проверок.
- `Either` показать как чистую обработку ошибок, где `Left` сохраняет ошибку, а `Right` продолжает pipeline.
- `IO` подать как отложенный effect, который можно собирать через `pipe` и запускать только на краю.
- `TaskEither` использовать как production-тип для async + error handling и как главный пример последовательных зависимостей.
- `join` переосмыслить как `flatten` в терминах `fp-ts`, а `flatMap` сделать основной рабочей операцией.
- `chain` упоминать как legacy alias / историческое имя, но не как основной стиль главы.

> [!important] API direction
> В `fp-ts v2` основной стиль должен быть `pipe(...)` + namespace imports (`import * as O from 'fp-ts/Option'`, `import * as E from 'fp-ts/Either'`, `import * as IO from 'fp-ts/IO'`, `import * as TE from 'fp-ts/TaskEither'`). Для имен функций в тексте главы и примерах использовать `flatMap` как primary name. `chain` можно упомянуть как старое имя и как alias, если это помогает читателю сопоставить с книгой и устаревшими туториалами. `flatten` показывать отдельно, когда нужно снять один слой у `F<F<A>>`.

## What Not to Cover

- Не переписывать chapter в виде истории про самодельный `Container`, `Maybe.prototype.join` или кастомные реализации `chain`.
- Не уходить в монады-трансформеры и не объяснять `ReaderTaskEither` как отдельную цель главы.
- Не дублировать материал из `ch03`, `ch04`, `ch08` и `fp-ts-phase-1-2`; там уже есть база по pure functions, currying, functor mindset и базовым типам `fp-ts`.
- Не перегружать главу категорией Клейсли и полными доказательствами законов; достаточно практического уровня, который связывает законы с композиционным поведением API.
- Не превращать главу в справочник по всем `fp-ts`-модулям.

## Recommended Chapter Structure

1. `of` и минимальный контекст в `fp-ts`: `Identity` как самый простой мост, затем `Option.of`, `Either.of`, `IO.of`, `TaskEither.of`.
2. Проблема вложенных контекстов: `Option<Option<A>>`, `IO<IO<A>>`, `TaskEither<E, TaskEither<E, A>>`.
3. `join` -> `flatten`: когда нам нужен один слой вместо двух, и как это читается в `fp-ts`.
4. `flatMap` как основная операция: последовательные вычисления без ручного снятия слоёв.
5. Практические сценарии:
   - nested access через `Option`;
   - delayed effects и `IO` composition;
   - последовательные async dependencies через `TaskEither`;
   - явный выбор между Monad и Applicative.
6. Законы монады: left identity, right identity, associativity, но только как последствия корректного API.
7. Итог и переход к аппликативам: почему независимые вычисления часто лучше выражать не через Monad.

**Краткое резюме:** структура должна остаться близкой к оригиналу, но каждый шаг должен сразу показывать реальный `fp-ts`-инструмент.

## Exercise Strategy

Упражнения должны быть только в формате `vitest`-snippets и проверять именно понимание контекста, а не синтаксис ради синтаксиса.

Рекомендуемые упражнения:

1. `Option` nested access.
   - Задача: безопасно извлечь вложенное поле из объекта с `undefined`-полями через `pipe` + `O.fromNullable` + `O.flatMap` / `O.map`.
   - Тесты: корректное значение, `None` на пропущенном участке, отсутствие ручных `if`.

2. `IO` composition.
   - Задача: собрать `IO` pipeline из чтения значения и логирования / форматирования.
   - Тесты: эффект не выполняется до вызова функции, результат стабилен, composition не распаковывает значение вручную.

3. `TaskEither` sequential async dependencies.
   - Задача: сначала получить данные по `TaskEither`, затем использовать результат для второго `TaskEither`.
   - Тесты: `Right` идёт дальше, `Left` останавливает pipeline, ошибки не теряются.

4. Monad vs Applicative.
   - Задача: выбрать между `flatMap` и applicative-подходом для двух сценариев.
   - Тесты: независимые вычисления лучше выражаются через applicative, зависимые - через `flatMap`.

5. `flatten` recognition.
   - Задача: определить, где `F<F<A>>` можно свернуть через `flatten`, а где нужен `flatMap`.
   - Тесты: один слой снят, вложенность не растёт.

> [!tip] Test format
> Все тестовые сниппеты оформлять через `vitest` (`describe`, `it`, `expect`). Для `TaskEither` использовать `await task()` внутри `async`-тестов.

**Краткое резюме:** упражнения должны проверять выбор между `map`, `flatten` и `flatMap`, а не только умение писать код по шаблону.

## Sources

- [Mostly Adequate Guide, chapter 09: Monads](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch09)
- [fp-ts Option module](https://gcanti.github.io/fp-ts/modules/Option.ts.html)
- [fp-ts Either module](https://gcanti.github.io/fp-ts/modules/Either.ts.html)
- [fp-ts IO module](https://gcanti.github.io/fp-ts/modules/IO.ts.html)
- [fp-ts TaskEither module](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html)
- [fp-ts Function module](https://gcanti.github.io/fp-ts/modules/Function.ts.html)
- [fp-ts Identity module](https://gcanti.github.io/fp-ts/modules/Identity.ts.html)


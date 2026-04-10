---
tags: [typescript, functional-programming, fp-ts, pure-functions, side-effects, research-brief]
---

# Research Brief: Mostly Adequate Guide, Chapter 03 in fp-ts framing

> [!info] Назначение
> Этот документ нужен как вход для `author`. Он фиксирует scope главы, порядок подачи материала, источники и связи с уже существующими заметками. Это не сама глава.

## 1. Scope и границы

Глава должна сохранить ключевые идеи оригинального `ch03-ru.md`, но объяснять их через `fp-ts`-мышление:

- что такое pure function и почему это важнее, чем "просто хорошая практика"
- что считается side effect и почему их нужно изолировать
- referential transparency и equational reasoning как инструмент рефакторинга
- memoization и delayed evaluation как способ сохранить чистоту
- explicit dependencies: зависимость как часть сигнатуры, а не скрытое окружение
- мост к `fp-ts`-типам: `IO`, `Task`, `Reader`, `TaskEither`

Глава не должна:

- уходить в глубокую теорию category theory
- объяснять `Option` / `Either` как отдельные темы в полном объёме
- дублировать уже существующую главу про `pipe`, `flow`, Functor / Monad
- превращаться в перевод оригинала один-в-один

> [!important] Педагогический акцент
> Эта глава должна показать, что чистота функций в `fp-ts` не абстракция, а практический способ контролировать эффекты и зависимости на границах программы.

## 2. Пререквизиты

Перед чтением у learner'а должны быть:

- понимание чистых функций из `[[pure-functions]]`
- базовая композиция функций из `[[function-composition]]`
- базовые знания TypeScript: generics, function types, union types
- знакомство с `pipe` и namespace-импортами `import * as O from ...`

Желательно, но не обязательно:

- `[[unsound]]` для мотивации про небезопасность неявных ошибок
- уже прочитанный `[[fp-ts-phase-1-2|fp-ts: Theory and Core Types]]`

## 3. Рекомендуемый порядок подтем

1. Контекст: почему чистые функции важны именно в `fp-ts`
2. Определение pure function и examples of impurity через `fp-ts`-призму
3. Side effects: что считается эффектом и как их изолировать
4. Referential transparency и equational reasoning
5. Memoization и delayed evaluation как приём, который не ломает чистоту
6. Explicit dependencies: почему `Reader` естественно продолжает эту тему
7. `IO<A>` как контейнер для синхронного эффекта
8. `Task<A>` как lazy async effect
9. `TaskEither<E, A>` как практический тип для async + error handling
10. Связь с реальным кодом: HTTP, `localStorage`, `Date.now`, конфиг, логгер
11. Мини-упражнения и Anki-карточки

> [!tip] Как не перегрузить главу
> `Reader` и `TaskEither` лучше подать как естественные продолжения идеи чистоты, а не как "ещё два типа fp-ts". Тогда связка выглядит мотивированной, а не механической.

## 4. Ключевые объяснения и углы подачи

### Pure function

Определять через два признака:

- одинаковые входы дают одинаковый результат
- нет observable side effects

Хороший мост к `fp-ts`: чистая функция возвращает значение, а эффект отложен в контейнер `IO` / `Task`.

### Side effects

Показать, что эффект сам по себе не "плохой", плоха его неконтролируемость. Для `fp-ts` важно объяснить, что side effect можно:

- отложить
- изолировать
- описать в типе

### Referential transparency

Сделать это не как формальную теорию, а как практику рефакторинга: если выражение можно заменить результатом без изменения поведения, код легче понимать и тестировать.

### Explicit dependencies

Здесь должен появиться `Reader<R, A>` как удобный способ сделать зависимости явными:

- конфиг
- logger
- fetcher / HTTP client

### Memoization

Показать memoization как честную оптимизацию только для чистых функций. Если функция зависит от времени, сети или случайности, memoization может исказить поведение.

### `IO`, `Task`, `TaskEither`

Нужно объяснить, что это не "сложные монады ради монады", а разные формы отложенного эффекта:

- `IO<A>` - синхронный эффект без ошибки
- `Task<A>` - асинхронный эффект без ошибки
- `TaskEither<E, A>` - async эффект с явной ошибкой

## 5. Связи с vault

Эта глава должна ссылаться на:

- `[[pure-functions]]` как на базовое определение чистоты
- `[[function-composition]]` как на мост к композиции чистых функций
- `[[unsound]]` как на мотивацию для явной модели ошибок
- `[[fp-ts-phase-1-2|fp-ts: Theory and Core Types]]` как на следующую главу серии
- `[[fp-ts-roadmap]]` как на карту всей линии обучения

## 6. Источники

### Исходный текст

- [Mostly Adequate Guide, chapter 03](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch03) - базовая структура и аргументация. Beginner.
- [Russian translation, chapter 03](https://github.com/MostlyAdequate/mostly-adequate-guide-ru/blob/master/ch03-ru.md) - источник оригинальной русской версии. Beginner.

### `fp-ts` official

- [fp-ts documentation](https://gcanti.github.io/fp-ts/) - точка входа в API. Intermediate.
- [IO module](https://gcanti.github.io/fp-ts/modules/IO.ts.html) - `IO<A>` как `() => A`. Intermediate.
- [Task module](https://gcanti.github.io/fp-ts/modules/Task.ts.html) - `Task<A>` как lazy async effect. Intermediate.
- [TaskEither module](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html) - async error handling. Intermediate.
- [Reader module](https://gcanti.github.io/fp-ts/modules/Reader.ts.html) - dependency injection через тип. Intermediate.

### Практические объяснения

- [Getting started with fp-ts: IO](https://dev.to/gcanti/getting-started-with-fp-ts-io-36p6) - хороший способ объяснить `IO`. Beginner.
- [Getting started with fp-ts: Reader](https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5) - мотивация и базовые примеры `Reader`. Intermediate.
- [Practical Guide to fp-ts, part 3](https://rlee.dev/practical-guide-to-fp-ts-part-3) - `Task`, `Either`, `TaskEither` в реальных сценариях. Intermediate.

### Связанные уже существующие заметки

- `src/01-javascript/core/functions/pure-functions.md`
- `src/01-javascript/patterns/fp/function-composition/function-composition.md`
- `src/02-typescript/unsound/unsound.md`
- `src/02-typescript/fp-ts/fp-ts-roadmap.md`
- `src/02-typescript/fp-ts/fp-ts-phase-1-2.md`

## 7. Целевой путь главы

`src/02-typescript/fp-ts/mostly-adequate/ch03-pure-functions.md`

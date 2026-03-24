---
tags: [fp-ts, functional-programming, typescript, research-brief]
---

# Research Brief: fp-ts — Фазы 1 и 2 (Теория + Core Types)

> [!info] Назначение
> Этот документ — материал для агента `author`. Он не является учебной главой. Содержит: scope темы, приоритеты, найденные объяснения, типичные ошибки, структуру главы и список источников.

## 1. Краткое резюме темы

`fp-ts` — библиотека для функционального программирования на TypeScript. Реализует абстракции из теории категорий (Functor, Applicative, Monad) и предоставляет набор практических типов данных (`Option`, `Either`, `Task`, `TaskEither`, `IO`, `IOEither`, `Reader`). Позволяет описывать программы без `throw`, без `null`-разыменований и без неявных побочных эффектов — всё становится явным в типах.

**Почему важно для learner'а:**
- Уже использует паттерн Either в `[[unsound]]` — fp-ts даёт его production-ready реализацию.
- В реальных проектах (Fastify, React) встречаются сценарии, которые fp-ts закрывает типобезопасно: HTTP-запросы, nullable-поля из БД, обработка ошибок на границах системы.
- Знание fp-ts является ступенью к Effect-TS, который сейчас позиционируется как преемник экосистемы.

**Важное замечание о статусе библиотеки:** Автор fp-ts (Giulio Canti) присоединился к команде Effect-TS в 2023 году. Активная разработка fp-ts остановилась. Новые проекты рекомендуется начинать на Effect. Однако fp-ts остаётся в production в большом количестве кодовых баз, а изученные концепции напрямую переносятся на Effect. Это нужно упомянуть в главе в разделе "Контекст".

---

## 2. Ключевые концепции (с приоритетами)

### Приоритет 1 — обязательно (Phase 1: Теория + инструменты)

| Концепция | Зачем | Аналогия из JS |
|---|---|---|
| `pipe` и `flow` | Основной синтаксис всего fp-ts | Цепочка `.then()` |
| Functor | Контейнер с `map` | `Array.map`, `Promise.then` |
| Законы Functor (identity, composition) | Понять предсказуемость | — |
| Applicative / `ap` | Функция-внутри к значению-внутри | `Promise.all` для независимых |
| Monad / `chain` | Убрать вложенность `F<F<A>>` | `Promise.then` с вложенным Promise |

### Приоритет 1 — обязательно (Phase 2: Core Types)

| Тип | Назначение |
|---|---|
| `Option<A>` | Замена `null`/`undefined` |
| `Either<E, A>` | Type-safe обработка ошибок вместо `try/catch` |
| `Task<A>` | Ленивая асинхронность (`() => Promise<A>`) |
| `TaskEither<E, A>` | Главный production-тип: async + явная ошибка |
| `IO<A>` | Изоляция синхронных side-эффектов |
| `IOEither<E, A>` | Синхронный side-эффект + возможная ошибка |

### Приоритет 2 — желательно

| Тип | Назначение |
|---|---|
| `Reader<R, A>` | Dependency injection через тип |

---

## 3. Лучшие найденные объяснения и примеры кода

### pipe и flow

`pipe` — принимает начальное значение, применяет функции по порядку, вычисляется немедленно.
`flow` — принимает только функции, возвращает новую функцию. Point-free стиль.

```typescript
// pipe: value-first
pipe(1, add1, multiply2) // 4

// flow: point-free
const transform = flow(add1, multiply2)
transform(1) // 4
```

`pipe` лучше выводит типы в TypeScript — рекомендовать его для большинства случаев. `flow` полезен для создания переиспользуемых трансформаций.

**v1 vs v2:** В fp-ts v1 можно было писать `O.some(1).map(f).chain(g)` — цепочка методов. В v2 это заменено на `pipe(O.some(1), O.map(f), O.chain(g))`. Старый синтаксис полностью удалён.

### Functor (источник: Mostly Adequate Guide ch08)

Functor — контейнер, который реализует `map`, соблюдающий два закона:
1. **Identity:** `map(id) === id`
2. **Composition:** `compose(map(f), map(g)) === map(compose(f, g))`

Знакомые примеры: `Array.map`, `Promise.then`. В fp-ts: `Option`, `Either`, `IO`, `Task` — все Functor'ы. Педагогический ключ: Functor — это не класс в ООП-смысле, а поведение + закон.

### Applicative (источник: Mostly Adequate Guide ch10)

Решает задачу, которую Functor не закрывает: применить функцию `f: (a: A, b: B) => C` к двум **независимым** завёрнутым значениям `F<A>` и `F<B>`.

```typescript
Container.of(add).ap(Container.of(2)).ap(Container.of(3)) // Container(5)
```

Ключевое отличие от Monad: Applicative для **параллельных** (независимых) вычислений, Monad — для **последовательных** (где следующий шаг зависит от предыдущего).

### Monad (источник: Mostly Adequate Guide ch09)

Проблема: если `map` применяет функцию `A => F<B>`, результат — `F<F<B>>` (вложенность).
`chain` = `map` + `join` (flatMap) — убирает уровень вложенности.

```typescript
// Без Monad: вложенность
pipe(O.some(1), O.map(n => O.some(n + 1))) // Option<Option<number>>

// С chain: плоско
pipe(O.some(1), O.chain(n => O.some(n + 1))) // Option<number>
```

Законы монады (для информации, не для зубрёжки):
1. Left identity: `chain(f)(of(a)) === f(a)`
2. Right identity: `chain(of)(m) === m`
3. Associativity: `chain(g)(chain(f)(m)) === chain(x => chain(g)(f(x)))(m)`

### IO и IOEither (источник: gcanti на dev.to)

`IO<A>` — это просто `() => A`. Откладывает исполнение side-эффекта. Ничего магического.

```typescript
const now: IO<number> = () => new Date().getTime()
const log = (s: unknown): IO<void> => () => console.log(s)
const getItem = (key: string): IO<Option<string>> =>
  () => fromNullable(localStorage.getItem(key))
```

`IOEither<E, A>` = `() => Either<E, A>`. Для синхронных операций, которые могут упасть:

```typescript
const readFileSync = (path: string): IOEither<Error, string> =>
  tryCatch(() => fs.readFileSync(path, 'utf8'), toError)
// Вызов: readFileSync('foo')() — возвращает Either<Error, string>
```

### Reader (источник: gcanti на dev.to)

`Reader<R, A>` — это `(r: R) => A`. Решает "пробрасывание зависимостей через все уровни":

```typescript
// Без Reader: deps проходит через все промежуточные функции
const h = (s: string, deps: Dependencies): string => g(s.length + 1, deps)

// С Reader: deps становится частью типа возврата
const h = (s: string): Reader<Dependencies, string> => g(s.length + 1)
h('foo')(deps) // зависимости подаются только в точке вызова
```

### Option — ключевые функции

- Конструкторы: `O.some(a)`, `O.none`, `O.fromNullable(nullable)`, `O.fromPredicate(pred)`
- Трансформация: `O.map(f)`, `O.chain(f)`, `O.filter(pred)`
- Извлечение: `O.getOrElse(() => default)`, `O.match(onNone, onSome)`, `O.toNullable`, `O.toUndefined`
- Комбинирование: `O.orElse(() => alternative)`

### Either — ключевые функции

- Конструкторы: `E.right(a)`, `E.left(e)`, `E.tryCatch(f, onError)`, `E.fromNullable(e)(a)`
- Трансформация: `E.map(f)` (правая), `E.mapLeft(f)` (левая), `E.bimap(onLeft, onRight)`, `E.chain(f)`
- Извлечение: `E.match(onLeft, onRight)`, `E.getOrElse(onLeft)`
- Восстановление: `E.orElse(onLeft)`

---

## 4. Типичные ошибки новичков

1. **`map` вместо `chain`** при возврате `Option`/`Either` → получают `Option<Option<A>>`. Решение: `chain`.

2. **Either для накопления ошибок** — Either fail-fast (останавливается на первой ошибке). Для сбора нескольких ошибок нужен `These`/`Validation` (Phase 3). Нужно упомянуть, не объяснять.

3. **Promise вместо Task** — `Promise` запускается немедленно при создании. `Task` ленив — нужен явный вызов `task()`. Не смешивать их напрямую.

4. **Забыть вызвать Task/IO** — `TaskEither<E, A>` является функцией `() => Promise<Either<E,A>>`. Без `()` в конце pipeline ничего не выполнится.

5. **Старый v1-синтаксис из туториалов** — цепочка методов `.map().chain()` не работает в v2. Проверять дату туториала.

6. **Несколько версий fp-ts в node_modules** — приводит к зависанию `tsc`. Проверять: `npm ls fp-ts`.

7. **`fold` vs `match`** — `fold` переименован в `match` в v2. Встречаются оба в документации разных версий. Использовать `match` как актуальное.

---

## 5. Рекомендуемая структура главы

```
1. Контекст и мотивация
   - Проблемы: null, throw, Promise без типа ошибки
   - Связь с [[unsound]] — Either уже там
   - fp-ts → Effect-TS: куда движется экосистема

2. Инструменты композиции: pipe и flow
   - Объяснить ПЕРВЫМИ — они нужны во всех примерах Phase 2
   - pipe vs flow с примерами
   - v1 (chain методов) vs v2 (pipe-style): почему поменялось

3. Теория: Functor, Applicative, Monad
   - Functor через Array.map и Promise.then
   - Законы кратко — для понимания, не зубрёжки
   - Applicative: независимые вычисления
   - Monad: последовательные + решение вложенности

4. Option<A>
   - Проблема null/undefined
   - Конструкторы и основные функции
   - Практика: поиск в Map / nullable поле из JSON

5. Either<E, A>
   - Проблема throw (связь с [[unsound]])
   - tryCatch, map, mapLeft, chain, match, bimap, orElse
   - Практика: переписать try/catch → Either

6. IO<A> и IOEither<E, A>
   - Зачем оборачивать side-эффекты
   - Примеры: Date.now, Math.random, localStorage, fs

7. Task<A> и TaskEither<E, A>
   - Ленивость Task vs eagerness Promise
   - TaskEither как production-тип
   - HTTP-запрос через TaskEither + tryCatch

8. Reader<R, A>
   - Dependency injection через тип
   - Пример: конфиг/логгер

9. Упражнения
10. Anki-карточки
```

**Соотношение объёма:** pipe + теория ~35%, типы ~65%.

---

## 6. Список источников с аннотациями

### Первичные (API-документация)

- [fp-ts official docs](https://gcanti.github.io/fp-ts/) — точка входа. Intermediate.
- [Option.ts module](https://gcanti.github.io/fp-ts/modules/Option.ts.html) — полный API Option.
- [Either.ts module](https://gcanti.github.io/fp-ts/modules/Either.ts.html) — полный API Either, включая tryCatch.
- [Task.ts module](https://gcanti.github.io/fp-ts/modules/Task.ts.html) — Task API.
- [TaskEither.ts module](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html) — TaskEither API.
- [Upgrade to v2 guide](https://gcanti.github.io/fp-ts/guides/upgrade-to-v2.html) — v1→v2 breaking changes.
- [Learning Resources](https://gcanti.github.io/fp-ts/learning-resources/) — кураторский список статей.

### FP-теория

- [Mostly Adequate Guide ch08: Functors](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch08) — лучшее введение в Functor на JS. Beginner.
- [Mostly Adequate Guide ch09: Monads](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch09) — Monad, chain, join, законы, вложенность. Intermediate.
- [Mostly Adequate Guide ch10: Applicative](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch10) — ap, liftA2. Intermediate.

### Статьи автора fp-ts (Giulio Canti)

- [Getting started: IO](https://dev.to/gcanti/getting-started-with-fp-ts-io-36p6) — IO как `() => A`, примеры. Beginner.
- [Getting started: Reader](https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5) — Reader для DI. Intermediate.
- [Getting started: Eq](https://dev.to/gcanti/getting-started-with-fp-ts-setoid-39f3) — type classes в fp-ts. Beginner (Phase 4, для контекста).

### Практические руководства

- [Practical Guide: Pipe and Flow (rlee.dev)](https://rlee.dev/practical-guide-to-fp-ts-part-1) — pipe vs flow с примерами. Beginner.
- [Practical Guide: Task, Either, TaskEither (rlee.dev)](https://rlee.dev/practical-guide-to-fp-ts-part-3) — HTTP-запросы, tryCatch, pipeline. Intermediate.
- [fp-ts Cheatsheet (inato)](https://github.com/inato/fp-ts-cheatsheet) — справочник операций. Reference.
- [Effect vs fp-ts](https://effect.website/docs/additional-resources/effect-vs-fp-ts/) — для раздела "куда движется экосистема". Advanced.

---

## Технические детали для автора главы

**Версия:** fp-ts `2.x`. Все примеры — `pipe`-стиль.

**Рекомендуемые импорты:**
```typescript
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as IO from 'fp-ts/IO'
import * as IOE from 'fp-ts/IOEither'
import * as R from 'fp-ts/Reader'
import { pipe, flow } from 'fp-ts/function'
```

**Стандартные алиасы сообщества:** `O` / `E` / `TE` / `T` / `IO` / `IOE` / `R`.

**fold vs match:** использовать `match` как актуальное (v2). `fold` — устаревший алиас.

**Размещение файла главы:** `src/02-typescript/fp-ts-phase-1-2.md`

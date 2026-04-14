---
tags: [typescript, functional-programming, fp-ts, hkt, higher-kinded-types, type-class]
---

# Бонус: Higher-Kinded Types — как fp-ts обманывает TypeScript

> [!info] Context
> Бонусная глава курса. Объясняет механику, которая стоит за `O.map`, `E.map`, `A.map` — как fp-ts реализует единый интерфейс `Functor` (и другие type classes) для разных контейнеров, несмотря на то что TypeScript не поддерживает Higher-Kinded Types нативно.
>
> **Пререквизиты:** весь основной курс, особенно [[functor]], [[category-theory]]

## Overview

В главе 3 мы написали `map` для Array, Option и Either — три отдельные реализации с одинаковой структурой. Мы сказали: "все они — функторы". Но можно ли написать **один** интерфейс `Functor`, который работает для любого контейнера?

В Haskell — да:

```haskell
class Functor f where
  fmap :: (a -> b) -> f a -> f b
```

Здесь `f` — это **тип-конструктор** (Option, Either, Array). Haskell умеет параметризовать по тип-конструктору. TypeScript — нет.

К концу этой главы вы будете знать:

- Что такое Kind и почему TypeScript не поддерживает HKT
- Как fp-ts обходит это ограничение через URI + declare module
- Как определить свой собственный тип, совместимый с fp-ts type classes

## Deep Dive

### 1. Проблема: TypeScript не умеет параметризовать по тип-конструктору

В TypeScript generic работает с **типами** (`A`, `B`), но не с **тип-конструкторами** (`Option`, `Either`):

```typescript
// ✅ Это работает — A это тип
function identity<A>(a: A): A { return a; }

// ❌ Это НЕ работает — F это тип-конструктор
interface Functor<F> {
  map: <A, B>(f: (a: A) => B) => (fa: F<A>) => F<B>;
  //                                    ^^^^ ошибка: F не является generic-типом
}
```

Проблема в `F<A>`: TypeScript не знает, что `F` принимает параметр. Для него `F` — просто тип, а не "шаблон типа".

#### Kinds — классификация типов

Чтобы понять проблему, введём понятие **Kind** (сорт типа):

| Kind | Описание | Примеры |
|---|---|---|
| `*` | Конкретный тип (готов к использованию) | `string`, `number`, `boolean` |
| `* → *` | Тип-конструктор (принимает 1 параметр) | `Option<_>`, `Array<_>`, `Promise<_>` |
| `* → * → *` | Тип-конструктор (принимает 2 параметра) | `Either<_, _>`, `Map<_, _>` |

`Option` без параметра — это не тип, а **конструктор типа**. `Option<number>` — это тип. Kind описывает "форму" типа.

TypeScript поддерживает generic-и на уровне `*` (конкретные типы), но **не поддерживает** generic-и на уровне `* → *` (тип-конструкторы). Это и есть отсутствие Higher-Kinded Types.

---

### 2. Решение fp-ts: URI + глобальный реестр

fp-ts обходит ограничение через элегантный трюк — **Lightweight Higher-Kinded Polymorphism**. Идея:

1. Каждый тип-конструктор регистрирует себя под уникальным строковым **URI**
2. Глобальный интерфейс `URItoKind` маппит URI на конкретный тип
3. Вспомогательный тип `Kind<URI, A>` делает lookup в этом маппинге

#### Шаг 1: Тип Kind и интерфейс URItoKind

```typescript
// Упрощённая версия из fp-ts/HKT.ts

// Глобальный реестр: URI → конкретный тип
// Изначально пустой — типы добавляются через declare module
interface URItoKind<A> {}

// Kind делает lookup: по URI находит конкретный тип
type Kind<URI extends keyof URItoKind<any>, A> = URItoKind<A>[URI];
```

#### Шаг 2: Тип регистрирует себя

```typescript
// Option регистрируется:
const OptionURI = 'Option';
type OptionURI = typeof OptionURI;

// "Дорегистрируем" в глобальный реестр через declare module
declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Option: Option<A>;
  }
}
```

Теперь `Kind<'Option', number>` разрешается в `Option<number>`:

```typescript
type Test = Kind<'Option', number>;
// = URItoKind<number>['Option']
// = Option<number>  ✓
```

#### Шаг 3: Определяем Functor обобщённо

```typescript
// Теперь можно написать обобщённый Functor!
interface Functor<F extends string> {
  readonly URI: F;
  readonly map: <A, B>(fa: Kind<F, A>, f: (a: A) => B) => Kind<F, B>;
}
```

`F` — это строковый URI, а не тип-конструктор напрямую. `Kind<F, A>` — lookup в реестре, который возвращает конкретный тип.

#### Шаг 4: Реализуем Functor для Option

```typescript
const optionFunctor: Functor<'Option'> = {
  URI: 'Option',
  map: (fa, f) => {
    // fa имеет тип Kind<'Option', A> = Option<A>
    if (fa._tag === 'None') return fa;
    return some(f(fa.value));
  },
};
```

---

### 3. Полный пример: от определения до использования

```typescript
// === 1. Определяем свой тип ===

interface Box<A> {
  readonly _tag: 'Box';
  readonly value: A;
}

const box = <A>(value: A): Box<A> => ({ _tag: 'Box', value });

// === 2. Регистрируем URI ===

const BoxURI = 'Box';
type BoxURI = typeof BoxURI;

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Box: Box<A>;
  }
}

// === 3. Реализуем Functor ===

import { Functor1 } from 'fp-ts/Functor';

const boxFunctor: Functor1<'Box'> = {
  URI: 'Box',
  map: (fa, f) => box(f(fa.value)),
};

// === 4. Используем ===

import { pipe } from 'fp-ts/function';

// map теперь работает с Box так же, как с Option или Either
pipe(
  box(42),
  (b) => boxFunctor.map(b, n => n * 2)
);
// box(84)
```

> [!tip] Functor1 vs Functor2
> fp-ts различает тип-конструкторы по количеству параметров:
> - `Functor1<F>` — для `* → *` (Option, Array, Task)
> - `Functor2<F>` — для `* → * → *` (Either, Reader, TaskEither)
>
> Суффикс — количество type-параметров. `URItoKind` — для одного, `URItoKind2` — для двух.

---

### 4. Как это работает в реальном fp-ts

В реальном fp-ts каждый модуль (Option, Either, Array) экспортирует **инстанс** type class:

```typescript
// Из fp-ts/Option.ts (упрощённо):
export const URI = 'Option';
export type URI = typeof URI;

declare module './HKT' {
  interface URItoKind<A> {
    readonly Option: Option<A>;
  }
}

export const Functor: Functor1<URI> = {
  URI,
  map: (fa, f) => isNone(fa) ? fa : some(f(fa.value)),
};

export const Monad: Monad1<URI> = {
  ...Functor,
  of: some,
  chain: (fa, f) => isNone(fa) ? fa : f(fa.value),
};

// Экспортируемый map — curried версия из инстанса:
export const map = <A, B>(f: (a: A) => B) =>
  (fa: Option<A>): Option<B> => Functor.map(fa, f);
```

Когда вы пишете `O.map(f)` — вы используете curried-обёртку над `Functor.map`. Type class инстанс (`Functor`, `Monad`, `Applicative`) — это объект с методами, который передаётся в обобщённые функции:

```typescript
// sequenceS принимает Applicative-инстанс:
sequenceS(O.Applicative)({ a: O.some(1), b: O.some(2) });
//        ^^^^^^^^^^^^^^
//        передаём инстанс type class

sequenceS(E.Applicative)({ a: E.right(1), b: E.right(2) });
//        ^^^^^^^^^^^^^^
//        другой инстанс — та же функция
```

---

### 5. Зачем это знать

**Для чтения fp-ts кода**: когда вы видите `Functor1<'Option'>` или `Monad2<'Either'>` — вы знаете, что это обобщённый type class, параметризованный через URI.

**Для создания своих типов**: если вы пишете свой контейнер и хотите интеграцию с fp-ts (чтобы работали `pipe`, `sequenceS`, `traverse`) — нужно зарегистрировать URI и реализовать инстансы.

**Для понимания архитектуры**: fp-ts — это не просто набор утилит. Это **система type classes**, где каждый тип реализует нужные интерфейсы (Functor, Monad, Applicative, Traversable). URI-трюк делает эту систему возможной в TypeScript.

---

### 6. Ограничения подхода

Трюк с URI — не идеальная замена настоящих HKT:

- **Глобальный реестр**: `declare module` загрязняет глобальный scope. Два типа с одинаковым URI сломают систему.
- **Нет вывода типов для инстансов**: TypeScript не может автоматически найти `Functor` для данного типа — инстанс передаётся явно.
- **Boilerplate**: для каждого нового типа нужно писать URI + declare module + инстансы.

Альтернативы:
- **Effect** (преемник fp-ts) использует другой подход — единый тип `Effect<R, E, A>` вместо множества отдельных монад.
- **Будущие версии TypeScript** могут добавить нативную поддержку HKT (есть proposals).

## Related Topics

- [[functor]]
- [[category-theory]]
- [[fp-ts-practice]]
- [[25.kind,higher-kinded_type]]

## Sources

- [fp-ts HKT.ts](https://gcanti.github.io/fp-ts/modules/HKT.ts.html)
- [Lightweight Higher-Kinded Polymorphism (paper)](https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf) — Yallop & White
- [Intro to fp-ts, part 1: Higher-Kinded Types](https://ybogomolov.me/01-higher-kinded-types) — Yuriy Bogomolov
- [Intro to fp-ts, part 4: Tasks as an alternative to Promises](https://ybogomolov.me/04-tasks) — Yuriy Bogomolov
- Introduction to Functional Programming using TypeScript — Giulio Canti

---

*Глава написана моделью claude-opus-4-6 (Opus 4.6)*

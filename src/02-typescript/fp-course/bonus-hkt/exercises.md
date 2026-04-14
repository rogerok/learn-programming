---
tags: [typescript, functional-programming, fp-ts, hkt, higher-kinded-types, exercises]
---

# Упражнения: Higher-Kinded Types

> [!info] Context
> Упражнения к бонусной главе [[higher-kinded-types]]. Фокус на понимании механики URI-трюка fp-ts и практике создания собственных типов, совместимых с type classes.

## Упражнение 1: Kind как lookup

Без запуска кода, определите, во что разрешится каждый тип. Затем проверьте в IDE.

```typescript
import { Kind } from 'fp-ts/HKT';

// Допустим, URItoKind уже содержит:
// 'Option' → Option<A>
// 'Either' → Either<E, A>  (через URItoKind2)
// 'Array'  → Array<A>

type A = Kind<'Option', string>;
type B = Kind<'Option', number[]>;
type C = Kind<'Array', boolean>;
```

<details>
<summary>Ответ</summary>

```typescript
type A = Option<string>;
type B = Option<number[]>;
type C = Array<boolean>;  // точнее readonly boolean[] в fp-ts
```

`Kind<URI, A>` — это просто `URItoKind<A>[URI]`. Подставляем A в реестр, берём поле по URI — получаем конкретный тип.

</details>

---

## Упражнение 2: Регистрация своего типа

Создайте тип `Pair<A>` (пара одинаковых значений) и зарегистрируйте его в fp-ts.

```typescript
// 1. Определите тип Pair<A> — объект с полями first: A и second: A
// 2. Создайте конструктор pair(first, second)
// 3. Зарегистрируйте URI 'Pair' в URItoKind
// 4. Реализуйте Functor1<'Pair'> — map применяет функцию к обоим значениям

// Тест:
// pairFunctor.map(pair(1, 2), n => n * 10)
// → pair(10, 20)
```

<details>
<summary>Решение</summary>

```typescript
import { Functor1 } from 'fp-ts/Functor';

// 1. Тип
interface Pair<A> {
  readonly _tag: 'Pair';
  readonly first: A;
  readonly second: A;
}

// 2. Конструктор
const pair = <A>(first: A, second: A): Pair<A> => ({
  _tag: 'Pair',
  first,
  second,
});

// 3. Регистрация URI
const PairURI = 'Pair';
type PairURI = typeof PairURI;

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Pair: Pair<A>;
  }
}

// 4. Functor
const pairFunctor: Functor1<'Pair'> = {
  URI: 'Pair',
  map: (fa, f) => pair(f(fa.first), f(fa.second)),
};

// Тест:
pairFunctor.map(pair(1, 2), n => n * 10);
// { _tag: 'Pair', first: 10, second: 20 }

pairFunctor.map(pair('hello', 'world'), s => s.length);
// { _tag: 'Pair', first: 5, second: 5 }
```

</details>

---

## Упражнение 3: Почему это ломается?

Найдите ошибку в коде. Объясните, какое ограничение URI-подхода она демонстрирует.

```typescript
// Модуль A:
const CacheURI = 'Cache';
type CacheURI = typeof CacheURI;

interface Cache<A> {
  readonly value: A;
  readonly ttl: number;
}

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Cache: Cache<A>;
  }
}

// Модуль B (другой разработчик):
const CacheURI = 'Cache';
type CacheURI = typeof CacheURI;

interface Cache<A> {
  readonly data: A;
  readonly expiry: Date;
}

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Cache: Cache<A>;
  }
}
```

<details>
<summary>Ответ</summary>

**Конфликт URI.** Два разных типа зарегистрированы под одним ключом `'Cache'`. Поскольку `URItoKind` — глобальный интерфейс, TypeScript попытается объединить (merge) два объявления `Cache`. Результат:

- Если интерфейсы `Cache` несовместимы (разные поля) — ошибка компиляции
- Если совместимы случайно — тихо неправильный тип

Это главное ограничение URI-подхода: **глобальный реестр не защищён от коллизий**. В реальном коде используйте уникальные URI (например, `'@mylib/Cache'`).

</details>

---

## Упражнение 4: Напишите обобщённую функцию

Напишите функцию `doubleMap`, которая применяет функцию к значению внутри любого функтора дважды. Функция должна работать с Option, Either, Array — любым типом с Functor.

```typescript
import { Functor1 } from 'fp-ts/Functor';
import { Kind, URIS } from 'fp-ts/HKT';

// Реализуйте:
// const doubleMap = <F extends URIS>(F: Functor1<F>) =>
//   <A, B>(f: (a: A) => B) =>
//     (fa: Kind<F, A>): Kind<F, ???> => ...

// Тесты:
// doubleMap(O.Functor)(n => n + 1)(O.some(5))     → O.some(7)
// doubleMap(A.Functor)(s => s + '!')([ 'hi' ])     → [ 'hi!!' ]
```

<details>
<summary>Решение</summary>

```typescript
import { Functor1 } from 'fp-ts/Functor';
import { Kind, URIS } from 'fp-ts/HKT';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';

const doubleMap = <F extends URIS>(F: Functor1<F>) =>
  <A, B>(f: (a: A) => B) =>
    (fa: Kind<F, A>): Kind<F, B> => {
      // Проблема: f: A → B, но для второго map нужна B → B
      // Поэтому doubleMap работает только когда A = B
      // Исправим сигнатуру:
      return fa; // не скомпилируется как задумано
    };

// Правильная версия — f должна быть эндоморфизм (A → A):
const doubleMap2 = <F extends URIS>(F: Functor1<F>) =>
  <A>(f: (a: A) => A) =>
    (fa: Kind<F, A>): Kind<F, A> =>
      F.map(F.map(fa, f), f);

// Тесты:
doubleMap2(O.Functor)((n: number) => n + 1)(O.some(5));
// O.some(7)

doubleMap2(A.Functor)((s: string) => s + '!')(['hi']);
// ['hi!!']
```

Ключевой момент: чтобы применить `f` дважды, она должна быть `A → A` (эндоморфизм), а не `A → B`. Иначе типы не сойдутся для второго применения. Это показывает, как система типов помогает обнаруживать ошибки в рассуждениях.

</details>

---

## Упражнение 5: Разберите реальный fp-ts код

Прочитайте упрощённый код из fp-ts и ответьте на вопросы.

```typescript
// Из fp-ts/Option.ts:
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

export const map = <A, B>(f: (a: A) => B) =>
  (fa: Option<A>): Option<B> => Functor.map(fa, f);
```

**Вопросы:**

1. Почему `URI` объявлен и как `const`, и как `type`?
2. Почему `Monad` использует `...Functor`?
3. Зачем нужна отдельная экспортируемая функция `map`, если есть `Functor.map`?

<details>
<summary>Ответы</summary>

**1.** `const URI = 'Option'` — значение строки в рантайме (используется в объекте инстанса). `type URI = typeof URI` — строковый литеральный тип `'Option'` на уровне типов (используется в `Functor1<URI>`). Это стандартный паттерн fp-ts для связи рантайма и типов.

**2.** Потому что каждая монада — автоматически функтор. `Monad1` расширяет `Functor1`, поэтому объект `Monad` должен содержать и `URI`, и `map`. Spread `...Functor` переиспользует уже написанную реализацию, избегая дублирования.

**3.** `Functor.map(fa, f)` — uncurried (оба аргумента сразу). Экспортируемая `map(f)(fa)` — curried, что позволяет использовать её в `pipe`:

```typescript
pipe(
  O.some(5),
  O.map(n => n * 2)  // curried — передаём только f, fa придёт из pipe
);
```

Без curried-обёртки пришлось бы писать `(fa) => Functor.map(fa, f)` вручную в каждом pipe.

</details>

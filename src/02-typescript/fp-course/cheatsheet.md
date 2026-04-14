---
tags: [typescript, functional-programming, fp-ts, cheatsheet, reference]
---

# fp-ts Шпаргалка

> [!info] Context
> Одностраничная справка по всему курсу. Открывайте, когда пишете fp-ts код и нужно быстро вспомнить синтаксис, конверсию или паттерн.

## 1. Импорты

```typescript
import { pipe, flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/ReadonlyArray';
import * as RTE from 'fp-ts/ReaderTaskEither';
```

---

## 2. pipe vs flow

```typescript
// pipe — значение первым аргументом, вычисляется сразу
const result = pipe(5, double, addOne); // 11

// flow — композиция функций, возвращает новую функцию
const transform = flow(double, addOne);
transform(5); // 11
```

| | pipe | flow |
|---|---|---|
| Первый аргумент | значение | функция |
| Возвращает | результат | функцию |
| Когда | одноразовый пайплайн | переиспользуемая цепочка |

---

## 3. Option — значение может отсутствовать

### Создание

```typescript
O.some(42)                        // Some(42)
O.none                            // None
O.fromNullable(value)             // null|undefined → None, иначе Some
O.fromPredicate(x => x > 0)(n)   // предикат ложен → None
```

### Трансформация

```typescript
pipe(option,
  O.map(x => x * 2),              // Some(v) → Some(f(v)), None → None
  O.chain(x => x > 0              // Some(v) → f(v) возвращает Option
    ? O.some(x) : O.none),
  O.filter(x => x > 10),          // Some → предикат? Some : None
  O.getOrElse(() => 0),           // извлечь: Some → значение, None → дефолт
)
```

### Извлечение

```typescript
O.getOrElse(() => defaultValue)    // Some → значение, None → дефолт
O.match(() => 'empty', v => v)     // паттерн-матчинг по обоим веткам
O.toNullable(option)               // Some → A, None → null
O.toUndefined(option)              // Some → A, None → undefined
```

---

## 4. Either — операция может вернуть ошибку

### Создание

```typescript
E.right(42)                        // Right(42) — успех
E.left('ошибка')                   // Left('ошибка') — ошибка
E.tryCatch(                        // try/catch → Either
  () => JSON.parse(str),
  (e) => `Parse error: ${e}`
)
E.fromPredicate(                   // предикат ложен → Left
  x => x > 0,
  () => 'Должно быть положительным'
)(n)
E.fromOption(() => 'not found')    // Option → Either
```

### Трансформация

```typescript
pipe(either,
  E.map(x => x * 2),              // Right → трансформировать значение
  E.mapLeft(e => `Err: ${e}`),     // Left → трансформировать ошибку
  E.chain(x => validate(x)),       // Right → f возвращает Either
  E.bimap(                         // обе стороны одновременно
    e => `Err: ${e}`,
    v => v * 2
  ),
  E.orElse(e =>                    // Left → попробовать альтернативу
    E.right(fallback)
  ),
)
```

### Извлечение

```typescript
E.getOrElse(() => defaultValue)
E.match(
  e => `Ошибка: ${e}`,
  v => `Успех: ${v}`
)
```

### Валидация с накоплением ошибок

```typescript
import { getSemigroup } from 'fp-ts/NonEmptyArray';

const V = E.getApplicativeValidation(getSemigroup<string>());

pipe(
  E.Do,
  E.apS('name', validateName(input)),     // собирает ВСЕ ошибки,
  E.apS('email', validateEmail(input)),    // не останавливается на первой
  E.apS('age', validateAge(input)),
)
// Left(['имя пустое', 'email невалиден']) — обе ошибки
```

---

## 5. TaskEither — async + ошибки

### Создание

```typescript
TE.right(42)                       // успех (sync)
TE.left('error')                   // ошибка (sync)
TE.tryCatch(                       // Promise → TaskEither
  () => fetch('/api/data').then(r => r.json()),
  (e) => `Fetch failed: ${e}`
)
TE.fromEither(either)              // Either → TaskEither
TE.fromOption(() => 'not found')   // Option → TaskEither
```

### Трансформация

```typescript
pipe(
  TE.tryCatch(() => fetchUser(id), handleError),
  TE.map(user => user.name),       // трансформировать значение
  TE.chain(name =>                 // f возвращает TaskEither
    TE.tryCatch(() => fetchProfile(name), handleError)
  ),
  TE.chainFirst(profile =>         // side effect, возвращает предыдущее
    TE.fromIO(() => console.log(profile))
  ),
  TE.mapLeft(e => `API: ${e}`),    // трансформировать ошибку
  TE.orElse(e =>                   // fallback при ошибке
    TE.right(defaultProfile)
  ),
)
```

### Запуск

```typescript
const result: E.Either<string, Data> = await myTaskEither();
```

---

## 6. Конверсии между типами

```
  Option ──────→ Either ──────→ TaskEither
    │               │                │
    ▼               ▼                ▼
fromNullable    tryCatch        tryCatch
fromPredicate   fromOption      fromEither
                fromPredicate   fromOption
```

```typescript
// Option → Either
pipe(option, E.fromOption(() => 'not found'))

// Option → TaskEither
pipe(option, TE.fromOption(() => 'not found'))

// Either → TaskEither
pipe(either, TE.fromEither)

// Either → Option (теряем ошибку!)
pipe(either, O.fromEither)

// TaskEither → Promise (запуск)
const result = await taskEither();
```

---

## 7. Массивы контейнеров (Traversable)

### sequence — перевернуть вложенность

```typescript
// Array<Option<A>> → Option<Array<A>>
pipe([O.some(1), O.some(2)], A.sequence(O.Applicative))
// O.some([1, 2])

// Один None → весь результат None
pipe([O.some(1), O.none], A.sequence(O.Applicative))
// O.none
```

### traverse — map + sequence в одном шаге

```typescript
// Вместо: pipe(ids, A.map(fetchUser), A.sequence(TE.ApplicativePar))
pipe(ids, A.traverse(TE.ApplicativePar)(fetchUser))
```

### Параллельно vs последовательно

```typescript
// Параллельно (как Promise.all):
pipe(ids, A.traverse(TE.ApplicativePar)(fetchUser))

// Последовательно (rate limiting):
pipe(ids, A.traverse(TE.ApplicativeSeq)(fetchUser))
```

---

## 8. Независимые значения (Applicative)

### sequenceS — объект независимых контейнеров

```typescript
import { sequenceS } from 'fp-ts/Apply';

// Все Option должны быть Some:
sequenceS(O.Apply)({
  name: O.some('Иван'),
  age: O.some(30),
})
// O.some({ name: 'Иван', age: 30 })

// Параллельные async запросы:
sequenceS(TE.ApplyPar)({
  user: fetchUser(id),
  orders: fetchOrders(id),
  balance: fetchBalance(id),
})
// TaskEither<E, { user: User, orders: Order[], balance: number }>
```

### Do-нотация — пошаговое построение

```typescript
pipe(
  E.Do,
  E.apS('name', validateName(input)),
  E.apS('age', validateAge(input)),
  E.apS('email', validateEmail(input)),
  E.map(({ name, age, email }) => createUser(name, age, email))
)
```

---

## 9. ReaderTaskEither — async + ошибки + зависимости

```typescript
// RTE<R, E, A> = (env: R) => () => Promise<Either<E, A>>

interface AppEnv {
  db: DbClient;
  logger: Logger;
}

const findUser = (id: number): RTE.ReaderTaskEither<AppEnv, string, User> =>
  (env) => TE.tryCatch(
    () => env.db.query(`SELECT * FROM users WHERE id = ${id}`),
    () => 'DB error'
  );

// Пайплайн
const handler = (id: number) => pipe(
  findUser(id),
  RTE.chain(ensureAdmin),
  RTE.map(user => user.name),
);

// Запуск — передаём зависимости один раз
const result = await handler(1)(prodEnv)();
```

### Полезные операции

```typescript
RTE.ask<AppEnv>()                  // получить всё окружение
RTE.asks(env => env.config)        // получить часть окружения
RTE.local(env => ({ db: env.db })) // сузить окружение
RTE.fromTaskEither(te)             // TaskEither → RTE
RTE.fromEither(either)             // Either → RTE
```

---

## 10. Выбор абстракции

```
Нужен контейнер для...           → Используй
──────────────────────────────────────────────
Может быть null/undefined        → Option
Ошибка с описанием               → Either
Async + ошибки                   → TaskEither
Async + ошибки + зависимости     → ReaderTaskEither
```

```
Нужна операция...                → Используй
──────────────────────────────────────────────
Трансформировать значение        → map      (Functor)
f возвращает контейнер           → chain    (Monad)
Объединить независимые           → ap / sequenceS (Applicative)
Массив контейнеров → контейнер   → traverse / sequence (Traversable)
```

```
Зависимость данных               → Используй
──────────────────────────────────────────────
B зависит от A                   → chain (последовательно)
A и B независимы                 → sequenceS / Do (можно параллельно)
```

> [!important] Минимально достаточная абстракция
> Простой `?.` лучше Option для тривиальных случаев. `try/catch` лучше Either для одиночных операций. fp-ts раскрывается на **цепочках трансформаций** с несколькими точками отказа.

---

## 11. Частые ошибки

| Ошибка | Правильно |
|---|---|
| `chain` для независимых значений | `sequenceS` / `Do` — не создавайте ложные зависимости |
| `map` когда f возвращает контейнер | `chain` — иначе получите `Option<Option<A>>` |
| `getOrElse` в середине pipe | Извлекайте в самом конце, трансформируйте внутри |
| Заворачивать всё в Option/Either | fp-ts для цепочек; для одиночных проверок — обычный TS |
| `ApplicativeSeq` по умолчанию | `ApplicativePar` по умолчанию, Seq только при rate limiting |

---

*Шпаргалка к курсу fp-ts. Подробности — в соответствующих главах.*

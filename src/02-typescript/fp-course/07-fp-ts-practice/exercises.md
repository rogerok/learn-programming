---
tags: [typescript, functional-programming, fp-ts, pipe, option, either, taskEither, exercises]
---

# Упражнения: fp-ts на практике

> [!info] Context
> Упражнения к главе [[fp-ts-practice]]. Фокус на реальных сценариях: парсинг конфигов, обработка API-ответов, комбинирование типов.

## Упражнение 1: Option-цепочка для конфига

Напишите функцию, которая извлекает URL базы данных из вложенного конфига. Используйте `pipe`, `O.fromNullable`, `O.chain`, `O.map`.

```typescript
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

interface Config {
  database?: {
    primary?: {
      host?: string;
      port?: number;
      name?: string;
    };
  };
}

// Реализуйте: извлечь строку подключения "host:port/name"
// Если любое из полей отсутствует — вернуть none
const getConnectionString = (config: Config): O.Option<string> => {
  // ваш код
};

// Тесты:
// getConnectionString({ database: { primary: { host: 'localhost', port: 5432, name: 'mydb' } } })
//   → some('localhost:5432/mydb')
//
// getConnectionString({ database: { primary: { host: 'localhost' } } })
//   → none (нет port и name)
//
// getConnectionString({})
//   → none
```

<details>
<summary>Решение</summary>

```typescript
const getConnectionString = (config: Config): O.Option<string> =>
  pipe(
    O.fromNullable(config.database),
    O.chain(db => O.fromNullable(db.primary)),
    O.chain(primary =>
      pipe(
        O.fromNullable(primary.host),
        O.chain(host =>
          pipe(
            O.fromNullable(primary.port),
            O.chain(port =>
              pipe(
                O.fromNullable(primary.name),
                O.map(name => `${host}:${port}/${name}`)
              )
            )
          )
        )
      )
    )
  );
```

Альтернативный вариант через `sequenceS`:

```typescript
import { sequenceS } from 'fp-ts/Apply';

const getConnectionString = (config: Config): O.Option<string> =>
  pipe(
    O.fromNullable(config.database?.primary),
    O.chain(primary =>
      pipe(
        sequenceS(O.Applicative)({
          host: O.fromNullable(primary.host),
          port: O.fromNullable(primary.port),
          name: O.fromNullable(primary.name),
        }),
        O.map(({ host, port, name }) => `${host}:${port}/${name}`)
      )
    )
  );
```

Второй вариант лучше: поля host, port, name независимы, поэтому `sequenceS` (аппликативный стиль) уместнее, чем вложенный `chain`.

</details>

---

## Упражнение 2: Either-пайплайн для парсинга

Напишите функцию, которая парсит строку JSON, извлекает массив чисел и вычисляет среднее. Каждый шаг может вернуть ошибку.

```typescript
import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';

// Реализуйте:
// 1. parseJSON: string → Either<string, unknown>
// 2. extractNumbers: unknown → Either<string, readonly number[]>
//    (проверить, что это массив чисел)
// 3. nonEmpty: readonly number[] → Either<string, readonly number[]>
//    (проверить, что массив непустой)
// 4. average: readonly number[] → number
//    (вычислить среднее)

// const computeAverage = (input: string): E.Either<string, number> => ...

// Тесты:
// computeAverage('[1, 2, 3, 4]')    → E.right(2.5)
// computeAverage('not json')         → E.left('Невалидный JSON')
// computeAverage('{"a": 1}')         → E.left('Данные не являются массивом чисел')
// computeAverage('[1, "two", 3]')    → E.left('Данные не являются массивом чисел')
// computeAverage('[]')               → E.left('Массив пуст')
```

<details>
<summary>Решение</summary>

```typescript
const parseJSON = (s: string): E.Either<string, unknown> =>
  E.tryCatch(
    () => JSON.parse(s),
    () => 'Невалидный JSON'
  );

const extractNumbers = (data: unknown): E.Either<string, readonly number[]> =>
  Array.isArray(data) && data.every((x): x is number => typeof x === 'number')
    ? E.right(data)
    : E.left('Данные не являются массивом чисел');

const nonEmpty = (arr: readonly number[]): E.Either<string, readonly number[]> =>
  arr.length > 0 ? E.right(arr) : E.left('Массив пуст');

const average = (arr: readonly number[]): number =>
  arr.reduce((sum, n) => sum + n, 0) / arr.length;

const computeAverage = (input: string): E.Either<string, number> =>
  pipe(
    parseJSON(input),
    E.chain(extractNumbers),
    E.chain(nonEmpty),
    E.map(average)
  );
```

Обратите внимание: `parseJSON`, `extractNumbers`, `nonEmpty` используют `chain` (каждая возвращает Either). `average` — обычная функция, поэтому используется `map`.

</details>

---

## Упражнение 3: Конвертация между типами

Напишите функцию, которая:
1. Ищет пользователя в кеше (`Option`)
2. Если не нашла — загружает по API (`TaskEither`)
3. Валидирует результат (`Either`)
4. Возвращает `TaskEither` с финальным результатом

```typescript
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

interface User {
  id: number;
  name: string;
  email: string;
}

const cache: Record<number, User> = {
  1: { id: 1, name: 'Кеш-Иван', email: 'ivan@cache.ru' },
};

const findInCache = (id: number): O.Option<User> =>
  O.fromNullable(cache[id]);

const fetchFromApi = (id: number): TE.TaskEither<string, unknown> =>
  TE.tryCatch(
    () => Promise.resolve({ id, name: `API-User-${id}`, email: `user${id}@api.ru` }),
    () => `Не удалось загрузить пользователя ${id}`
  );

const validateUser = (data: unknown): E.Either<string, User> =>
  data !== null &&
  typeof data === 'object' &&
  'name' in data &&
  'email' in data
    ? E.right(data as User)
    : E.left('Невалидные данные пользователя');

// Реализуйте:
// const getUser = (id: number): TE.TaskEither<string, User> => ...
// Логика: сначала кеш (Option → TaskEither), если none → API → validate
```

<details>
<summary>Решение</summary>

```typescript
const getUser = (id: number): TE.TaskEither<string, User> =>
  pipe(
    findInCache(id),
    O.match(
      // Не в кеше → идём в API
      () => pipe(
        fetchFromApi(id),
        TE.chain(data => TE.fromEither(validateUser(data)))
      ),
      // В кеше → сразу возвращаем
      (user) => TE.right(user)
    )
  );

// getUser(1)()  → Promise<E.right({ id: 1, name: 'Кеш-Иван', ... }))
// getUser(2)()  → Promise<E.right({ id: 2, name: 'API-User-2', ... }))
```

Ключевой паттерн: `O.match` конвертирует из Option в TaskEither, разветвляя логику для None и Some.

</details>

---

## Упражнение 4: Параллельные запросы через sequenceS

Загрузите три независимых ресурса параллельно и соберите dashboard.

```typescript
import * as TE from 'fp-ts/TaskEither';
import { sequenceS } from 'fp-ts/Apply';
import { pipe } from 'fp-ts/function';

interface Dashboard {
  userName: string;
  orderCount: number;
  balance: number;
}

// Моки:
const fetchUserName = (id: number): TE.TaskEither<string, string> =>
  TE.tryCatch(
    () => new Promise<string>(resolve =>
      setTimeout(() => resolve(`User-${id}`), 100)
    ),
    () => 'Ошибка загрузки имени'
  );

const fetchOrderCount = (id: number): TE.TaskEither<string, number> =>
  TE.tryCatch(
    () => new Promise<number>(resolve =>
      setTimeout(() => resolve(id * 3), 100)
    ),
    () => 'Ошибка загрузки заказов'
  );

const fetchBalance = (id: number): TE.TaskEither<string, number> =>
  TE.tryCatch(
    () => new Promise<number>(resolve =>
      setTimeout(() => resolve(id * 1000), 100)
    ),
    () => 'Ошибка загрузки баланса'
  );

// Реализуйте: загрузить параллельно и собрать Dashboard
// const fetchDashboard = (userId: number): TE.TaskEither<string, Dashboard> => ...
```

<details>
<summary>Решение</summary>

```typescript
const fetchDashboard = (userId: number): TE.TaskEither<string, Dashboard> =>
  pipe(
    sequenceS(TE.ApplyPar)({
      userName: fetchUserName(userId),
      orderCount: fetchOrderCount(userId),
      balance: fetchBalance(userId),
    })
  );

// fetchDashboard(1)()
// → Promise<E.right({ userName: 'User-1', orderCount: 3, balance: 1000 })>
// Все три запроса выполняются параллельно (~100ms, а не ~300ms)
```

Ключевой момент: `TE.ApplyPar` запускает все TaskEither параллельно. Если бы мы использовали `chain`, запросы шли бы последовательно (300ms вместо 100ms).

</details>

---

## Упражнение 5: Реальный сценарий — обработка формы

Соберите полный пайплайн: получить данные формы → валидировать (с накоплением ошибок) → создать пользователя через API → вернуть результат.

```typescript
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { sequenceS } from 'fp-ts/Apply';
import { getSemigroup } from 'fp-ts/NonEmptyArray';
import { pipe } from 'fp-ts/function';

interface FormData {
  name: string;
  email: string;
  age: string;
}

interface ValidatedUser {
  name: string;
  email: string;
  age: number;
}

// 1. Валидация (accumulating errors):
// validateForm: FormData → Either<string[], ValidatedUser>

// 2. Отправка на сервер (mock):
// submitUser: ValidatedUser → TaskEither<string, { id: number }>

// 3. Полный пайплайн:
// processForm: FormData → TaskEither<string[], { id: number; name: string }>
```

<details>
<summary>Решение</summary>

```typescript
type Errors = readonly string[];
type Validated<A> = E.Either<Errors, A>;

const validateName = (name: string): Validated<string> =>
  name.trim().length >= 2
    ? E.right(name.trim())
    : E.left(['Имя слишком короткое']);

const validateEmail = (email: string): Validated<string> =>
  /^[^@]+@[^@]+\.[^@]+$/.test(email)
    ? E.right(email)
    : E.left(['Невалидный email']);

const validateAge = (ageStr: string): Validated<number> => {
  const age = Number(ageStr);
  if (isNaN(age)) return E.left(['Возраст должен быть числом']);
  if (age < 18 || age > 120) return E.left(['Возраст от 18 до 120']);
  return E.right(age);
};

const validateForm = (form: FormData): Validated<ValidatedUser> =>
  sequenceS(E.getApplicativeValidation(getSemigroup<string>()))({
    name: validateName(form.name),
    email: validateEmail(form.email),
    age: validateAge(form.age),
  });

const submitUser = (user: ValidatedUser): TE.TaskEither<Errors, { id: number }> =>
  TE.tryCatch(
    () => Promise.resolve({ id: Math.floor(Math.random() * 1000) }),
    () => ['Ошибка сервера']
  );

const processForm = (form: FormData): TE.TaskEither<Errors, { id: number; name: string }> =>
  pipe(
    validateForm(form),
    TE.fromEither,
    TE.chain(user =>
      pipe(
        submitUser(user),
        TE.map(result => ({ ...result, name: user.name }))
      )
    )
  );

// await processForm({ name: 'Иван', email: 'ivan@mail.ru', age: '25' })()
//   → E.right({ id: 123, name: 'Иван' })

// await processForm({ name: '', email: 'bad', age: 'abc' })()
//   → E.left(['Имя слишком короткое', 'Невалидный email', 'Возраст должен быть числом'])
```

</details>

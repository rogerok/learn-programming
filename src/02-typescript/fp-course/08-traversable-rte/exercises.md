---
tags: [typescript, functional-programming, traversable, readerTaskEither, fp-ts, exercises]
---

# Упражнения: Traversable и ReaderTaskEither

> [!info] Context
> Упражнения к финальной главе [[traversable-rte]]. Фокус на практических сценариях: batch-операции, параллельные запросы, dependency injection.

## Упражнение 1: sequence для Option и Either

Используйте `A.sequence` для "переворачивания" массива контейнеров.

```typescript
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';

// Задание 1: Массив Option → Option массива
const optionals: readonly O.Option<number>[] = [O.some(1), O.some(2), O.some(3)];
const withNone: readonly O.Option<number>[] = [O.some(1), O.none, O.some(3)];

// Примените A.sequence(O.Applicative) к обоим массивам.
// Какой результат и почему?

// Задание 2: Массив Either → Either массива
const eithers: readonly E.Either<string, number>[] = [
  E.right(1), E.right(2), E.right(3)
];
const withError: readonly E.Either<string, number>[] = [
  E.right(1), E.left('ошибка A'), E.right(3), E.left('ошибка B')
];

// Примените A.sequence(E.Applicative) к withError.
// Сколько ошибок будет в результате? Почему?
```

<details>
<summary>Ответы</summary>

```typescript
// Задание 1
pipe(optionals, A.sequence(O.Applicative));
// O.some([1, 2, 3]) — все Some → собраны в один Some

pipe(withNone, A.sequence(O.Applicative));
// O.none — хотя бы один None → весь результат None

// Задание 2
pipe(eithers, A.sequence(E.Applicative));
// E.right([1, 2, 3])

pipe(withError, A.sequence(E.Applicative));
// E.left('ошибка A') — ОДНА ошибка (первая), потому что E.Applicative
// останавливается на первой ошибке

// Для накопления всех ошибок:
import { getSemigroup } from 'fp-ts/NonEmptyArray';
pipe(withError, A.sequence(E.getApplicativeValidation(getSemigroup<string>())));
// E.left(['ошибка A', 'ошибка B']) — обе ошибки собраны
```

</details>

---

## Упражнение 2: traverse для batch-обработки

Напишите функцию, которая принимает массив строк, парсит каждую как JSON, извлекает поле `value` (число) и возвращает массив чисел. Если хотя бы одна строка невалидна — возвращает ошибку.

```typescript
import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';

// const processItems = (items: readonly string[]): E.Either<string, readonly number[]> => ...

// Тесты:
// processItems(['{"value": 1}', '{"value": 2}', '{"value": 3}'])
//   → E.right([1, 2, 3])
//
// processItems(['{"value": 1}', 'bad json', '{"value": 3}'])
//   → E.left('Невалидный JSON: "bad json"')
//
// processItems(['{"value": 1}', '{"name": "test"}', '{"value": 3}'])
//   → E.left('Поле value не найдено или не число')
```

<details>
<summary>Решение</summary>

```typescript
const parseAndExtract = (raw: string): E.Either<string, number> =>
  pipe(
    E.tryCatch(
      () => JSON.parse(raw),
      () => `Невалидный JSON: "${raw}"`
    ),
    E.chain(obj =>
      typeof obj === 'object' && obj !== null && typeof obj.value === 'number'
        ? E.right(obj.value as number)
        : E.left('Поле value не найдено или не число')
    )
  );

const processItems = (items: readonly string[]): E.Either<string, readonly number[]> =>
  pipe(items, A.traverse(E.Applicative)(parseAndExtract));
```

`A.traverse(E.Applicative)(parseAndExtract)` — это `map(parseAndExtract)` + `sequence(E.Applicative)` в одном шаге. Каждый элемент обрабатывается, результаты собираются в Either.

</details>

---

## Упражнение 3: Параллельные и последовательные запросы

Напишите две версии функции: одна загружает пользователей параллельно, другая — последовательно. Измерьте разницу во времени.

```typescript
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';

// Мок с задержкой:
const fetchUser = (id: number): TE.TaskEither<string, string> =>
  TE.tryCatch(
    () => new Promise<string>(resolve =>
      setTimeout(() => resolve(`User-${id}`), 200) // 200ms задержка
    ),
    () => `Ошибка загрузки ${id}`
  );

const ids = [1, 2, 3, 4, 5];

// Реализуйте:
// const fetchParallel = (ids: number[]): TE.TaskEither<string, readonly string[]> => ...
// const fetchSequential = (ids: number[]): TE.TaskEither<string, readonly string[]> => ...

// Тест:
// fetchParallel — должен занять ~200ms (все параллельно)
// fetchSequential — должен занять ~1000ms (5 × 200ms)
```

<details>
<summary>Решение</summary>

```typescript
const fetchParallel = (ids: readonly number[]): TE.TaskEither<string, readonly string[]> =>
  pipe(ids, A.traverse(TE.ApplicativePar)(fetchUser));

const fetchSequential = (ids: readonly number[]): TE.TaskEither<string, readonly string[]> =>
  pipe(ids, A.traverse(TE.ApplicativeSeq)(fetchUser));

// Замер:
const measure = async (label: string, task: TE.TaskEither<string, readonly string[]>) => {
  const start = Date.now();
  const result = await task();
  const elapsed = Date.now() - start;
  console.log(`${label}: ${elapsed}ms`, result);
};

await measure('Parallel', fetchParallel(ids));
// Parallel: ~200ms  E.right(['User-1', ..., 'User-5'])

await measure('Sequential', fetchSequential(ids));
// Sequential: ~1000ms  E.right(['User-1', ..., 'User-5'])
```

</details>

---

## Упражнение 4: Reader для зависимостей

Перепишите функции так, чтобы они получали зависимости через Reader, а не через аргументы.

```typescript
import * as R from 'fp-ts/Reader';
import { pipe } from 'fp-ts/function';

// Текущий код — зависимости передаются явно:
const formatPrice = (price: number, currency: string, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);

const formatDiscount = (price: number, discount: number, currency: string, locale: string): string =>
  `${formatPrice(price, currency, locale)} → ${formatPrice(price * (1 - discount), currency, locale)}`;

// Перепишите с Reader:
interface FormatEnv {
  currency: string;
  locale: string;
}

// const formatPriceR = (price: number): R.Reader<FormatEnv, string> => ...
// const formatDiscountR = (price: number, discount: number): R.Reader<FormatEnv, string> => ...
```

<details>
<summary>Решение</summary>

```typescript
const formatPriceR = (price: number): R.Reader<FormatEnv, string> =>
  (env) => new Intl.NumberFormat(env.locale, {
    style: 'currency',
    currency: env.currency,
  }).format(price);

const formatDiscountR = (price: number, discount: number): R.Reader<FormatEnv, string> =>
  pipe(
    R.Do,
    R.bind('original', () => formatPriceR(price)),
    R.bind('discounted', () => formatPriceR(price * (1 - discount))),
    R.map(({ original, discounted }) => `${original} → ${discounted}`)
  );

// Использование:
const env: FormatEnv = { currency: 'RUB', locale: 'ru-RU' };

formatPriceR(1500)(env);
// '1 500,00 ₽'

formatDiscountR(1500, 0.2)(env);
// '1 500,00 ₽ → 1 200,00 ₽'

// Для тестов — другое окружение:
const testEnv: FormatEnv = { currency: 'USD', locale: 'en-US' };
formatPriceR(1500)(testEnv);
// '$1,500.00'
```

Преимущество: `currency` и `locale` не прокидываются через каждый аргумент. Функции декларируют зависимость в типе (`Reader<FormatEnv, ...>`), а конкретное окружение передаётся при запуске.

</details>

---

## Упражнение 5: Сервис пользователей с RTE

Напишите мини-сервис с ReaderTaskEither: поиск пользователя → проверка прав → форматирование. Зависимости: БД и логгер.

```typescript
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

interface AppEnv {
  db: {
    findUser: (id: number) => Promise<User | null>;
  };
  logger: {
    info: (msg: string) => void;
  };
}

// Реализуйте:
// 1. findUser(id) — ищет пользователя, если null → left('Пользователь не найден')
// 2. ensureAdmin(user) — проверяет role === 'admin', иначе left('Нет прав')
// 3. formatAdmin(user) — возвращает строку 'Администратор: {name}'
// 4. getAdminName(id) — собирает пайплайн: найти → проверить → отформатировать

// const getAdminName = (id: number): RTE.ReaderTaskEither<AppEnv, string, string> => ...
```

<details>
<summary>Решение</summary>

```typescript
const findUser = (id: number): RTE.ReaderTaskEither<AppEnv, string, User> =>
  (env) =>
    pipe(
      TE.tryCatch(
        () => env.db.findUser(id),
        () => 'Ошибка БД'
      ),
      TE.chain(user =>
        user !== null
          ? TE.right(user)
          : TE.left('Пользователь не найден')
      )
    );

const ensureAdmin = (user: User): RTE.ReaderTaskEither<AppEnv, string, User> =>
  user.role === 'admin'
    ? RTE.right(user)
    : RTE.left('Нет прав');

const logAction = (msg: string): RTE.ReaderTaskEither<AppEnv, string, void> =>
  RTE.fromReader((env: AppEnv) => { env.logger.info(msg); });

const getAdminName = (id: number): RTE.ReaderTaskEither<AppEnv, string, string> =>
  pipe(
    findUser(id),
    RTE.chainFirst(user => logAction(`Найден пользователь: ${user.name}`)),
    RTE.chain(ensureAdmin),
    RTE.map(user => `Администратор: ${user.name}`)
  );

// Продакшен:
const prodEnv: AppEnv = {
  db: { findUser: async (id) => ({ id, name: 'Иван', role: 'admin' }) },
  logger: { info: console.log },
};
await getAdminName(1)(prodEnv)();
// E.right('Администратор: Иван')

// Тесты:
const testEnv: AppEnv = {
  db: { findUser: async () => ({ id: 1, name: 'Тест', role: 'user' }) },
  logger: { info: () => {} },
};
await getAdminName(1)(testEnv)();
// E.left('Нет прав')
```

</details>

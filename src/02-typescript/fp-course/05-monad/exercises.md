---
tags: [typescript, functional-programming, monad, chain, flatMap, either, option, exercises]
---

# Упражнения: Монада — flatMap и цепочки эффектов

> [!info] Context
> Упражнения к главе [[monad]]. Порядок — от вложенных if/null-checks к цепочкам chain, от Option до TaskEither.

## Упражнение 1: Перепиши вложенные if через chain

Перепишите императивную функцию, используя самописный `Option` и `chain`. Результат должен быть `Option<number>`, а не `number | null`.

```typescript
// Императивная версия:
function getDiscountedPrice(
  store: { products?: Record<string, { price?: number; discount?: number }> },
  productId: string
): number | null {
  if (!store.products) return null;
  const product = store.products[productId];
  if (!product) return null;
  if (product.price == null) return null;
  if (product.discount == null) return null;
  if (product.discount <= 0 || product.discount > 100) return null;
  return product.price * (1 - product.discount / 100);
}

// Перепишите с fp-ts:
// import * as O from 'fp-ts/Option';
// import { pipe } from 'fp-ts/function';
//
// const getDiscountedPrice = (
//   store: { products?: Record<string, { price?: number; discount?: number }> },
//   productId: string
// ): O.Option<number> => ...
```

> [!tip] Подсказка
> Начните с `O.fromNullable(store.products)`, затем используйте `O.chain` для каждого шага, который может вернуть `none`. Для проверки диапазона используйте `O.fromPredicate`.

<details>
<summary>Решение</summary>

```typescript
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

const getDiscountedPrice = (
  store: { products?: Record<string, { price?: number; discount?: number }> },
  productId: string
): O.Option<number> =>
  pipe(
    O.fromNullable(store.products),
    O.chain((products) => O.fromNullable(products[productId])),
    O.chain((product) =>
      pipe(
        O.fromNullable(product.price),
        O.chain((price) =>
          pipe(
            O.fromNullable(product.discount),
            O.chain(O.fromPredicate((d) => d > 0 && d <= 100)),
            O.map((discount) => price * (1 - discount / 100))
          )
        )
      )
    )
  );

// Тесты:
const store = {
  products: {
    widget: { price: 100, discount: 20 },
    gadget: { price: 50 },
    broken: { price: 30, discount: -5 },
  },
};

getDiscountedPrice(store, 'widget');   // O.some(80)
getDiscountedPrice(store, 'gadget');   // O.none (нет скидки)
getDiscountedPrice(store, 'broken');   // O.none (скидка вне диапазона)
getDiscountedPrice(store, 'missing');  // O.none (нет продукта)
getDiscountedPrice({}, 'widget');      // O.none (нет products)
```

</details>

---

## Упражнение 2: Валидация через Either chain

Напишите валидационный пайплайн для создания пароля. Каждая проверка возвращает `Either<string, string>` (ошибка или валидный пароль). Используйте `E.chain` для построения цепочки.

Правила:
1. Длина >= 8 символов
2. Содержит хотя бы одну цифру
3. Содержит хотя бы одну заглавную букву
4. Не содержит пробелов

```typescript
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

// Реализуйте каждую проверку и соберите в цепочку:
// const validatePassword = (password: string): E.Either<string, string> => ...

// Тесты:
// validatePassword('Str0ngPass')  → E.right('Str0ngPass')
// validatePassword('short')       → E.left('Пароль должен быть не менее 8 символов')
// validatePassword('nouppercase1') → E.left('Пароль должен содержать заглавную букву')
// validatePassword('NoDigits!')    → E.left('Пароль должен содержать цифру')
// validatePassword('Has Spaces1')  → E.left('Пароль не должен содержать пробелы')
```

<details>
<summary>Решение</summary>

```typescript
const minLength = (min: number) => (s: string): E.Either<string, string> =>
  s.length >= min
    ? E.right(s)
    : E.left(`Пароль должен быть не менее ${min} символов`);

const hasDigit = (s: string): E.Either<string, string> =>
  /\d/.test(s)
    ? E.right(s)
    : E.left('Пароль должен содержать цифру');

const hasUpperCase = (s: string): E.Either<string, string> =>
  /[A-Z]/.test(s)
    ? E.right(s)
    : E.left('Пароль должен содержать заглавную букву');

const noSpaces = (s: string): E.Either<string, string> =>
  !s.includes(' ')
    ? E.right(s)
    : E.left('Пароль не должен содержать пробелы');

const validatePassword = (password: string): E.Either<string, string> =>
  pipe(
    E.right(password) as E.Either<string, string>,
    E.chain(minLength(8)),
    E.chain(hasDigit),
    E.chain(hasUpperCase),
    E.chain(noSpaces)
  );
```

> [!warning] Заметьте
> `chain` останавливается на первой ошибке. `validatePassword('ab')` вернёт только ошибку длины, хотя пароль также не содержит цифр и заглавных букв. Для сбора **всех** ошибок нужен Applicative (глава 6).

</details>

---

## Упражнение 3: chain для своего контейнера

Реализуйте `chain` для контейнера `Validated<A>`, который хранит значение и массив предупреждений:

```typescript
interface Validated<A> {
  readonly value: A;
  readonly warnings: readonly string[];
}

const validated = <A>(value: A, warnings: readonly string[] = []): Validated<A> =>
  ({ value, warnings });

// map уже есть:
const mapValidated = <A, B>(f: (a: A) => B) =>
  (va: Validated<A>): Validated<B> =>
    validated(f(va.value), va.warnings);

// Реализуйте chain:
// chain должен объединять предупреждения из обоих уровней
const chainValidated = <A, B>(f: (a: A) => Validated<B>) =>
  (va: Validated<A>): Validated<B> => {
    // ваш код
  };

// Тесты:
const parseAge = (s: string): Validated<number> => {
  const n = Number(s);
  return n > 100
    ? validated(n, ['Возраст > 100, проверьте данные'])
    : validated(n);
};

const checkRetirement = (age: number): Validated<string> =>
  age >= 65
    ? validated('пенсионер', ['Применяется льготная ставка'])
    : validated('работающий');

// pipe(validated('70'), chainValidated(parseAge), chainValidated(checkRetirement))
// → { value: 'пенсионер', warnings: ['Применяется льготная ставка'] }

// pipe(validated('105'), chainValidated(parseAge), chainValidated(checkRetirement))
// → { value: 'пенсионер', warnings: ['Возраст > 100, проверьте данные', 'Применяется льготная ставка'] }
```

<details>
<summary>Решение</summary>

```typescript
const chainValidated = <A, B>(f: (a: A) => Validated<B>) =>
  (va: Validated<A>): Validated<B> => {
    const result = f(va.value);
    return validated(result.value, [...va.warnings, ...result.warnings]);
  };
```

Ключевое отличие от Option/Either: здесь `chain` не просто разворачивает вложенность, но и **объединяет предупреждения** из двух уровней. Это легальная реализация — она подчиняется трём законам монады (проверьте!).

</details>

---

## Упражнение 4: Проверьте законы монады

Проверьте все три закона монады для `O.chain` из fp-ts. Используйте конкретные примеры.

```typescript
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

const f = (n: number): O.Option<number> => n > 0 ? O.some(n * 2) : O.none;
const g = (n: number): O.Option<string> => O.some(`value: ${n}`);

// 1. Left identity: pipe(O.some(x), O.chain(f)) === f(x)
// Проверьте для x = 5 и x = -3

// 2. Right identity: pipe(m, O.chain(O.some)) === m
// Проверьте для m = O.some(42) и m = O.none

// 3. Associativity:
//    pipe(m, O.chain(f), O.chain(g)) === pipe(m, O.chain(x => pipe(f(x), O.chain(g))))
// Проверьте для m = O.some(5)
```

<details>
<summary>Решение</summary>

```typescript
// 1. Left identity
const li1 = pipe(O.some(5), O.chain(f));  // O.some(10)
const li2 = f(5);                          // O.some(10)
// Равны ✓

const li3 = pipe(O.some(-3), O.chain(f)); // O.none
const li4 = f(-3);                         // O.none
// Равны ✓

// 2. Right identity
const ri1 = pipe(O.some(42), O.chain(O.some));  // O.some(42)
// Равно O.some(42) ✓

const ri2 = pipe(O.none as O.Option<number>, O.chain(O.some));  // O.none
// Равно O.none ✓

// 3. Associativity
const assoc1 = pipe(O.some(5), O.chain(f), O.chain(g));
// O.some(10) → O.some('value: 10')

const assoc2 = pipe(
  O.some(5),
  O.chain((x) => pipe(f(x), O.chain(g)))
);
// f(5) = O.some(10) → O.chain(g) → O.some('value: 10')

// Равны ✓
```

</details>

---

## Упражнение 5: Async цепочка через TaskEither

Напишите функцию, которая:
1. Парсит строку JSON в объект
2. Извлекает поле `url` (string)
3. "Загружает" данные по URL (используйте мок)
4. Возвращает `TaskEither<string, Data>`

Каждый шаг может упасть с ошибкой. Используйте `TE.chain` для построения цепочки.

```typescript
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

interface ApiResponse {
  status: number;
  data: string;
}

// Мок для "загрузки"
const mockFetch = (url: string): Promise<ApiResponse> => {
  if (url === 'https://api.example.com/ok') {
    return Promise.resolve({ status: 200, data: 'success' });
  }
  return Promise.reject(new Error(`Failed to fetch ${url}`));
};

// Реализуйте каждый шаг и соберите цепочку:
// const parseConfig = (raw: string): TE.TaskEither<string, unknown> => ...
// const extractUrl = (config: unknown): TE.TaskEither<string, string> => ...
// const fetchData = (url: string): TE.TaskEither<string, ApiResponse> => ...
// const validateStatus = (res: ApiResponse): TE.TaskEither<string, string> => ...

// const processConfig = (raw: string): TE.TaskEither<string, string> =>
//   pipe(
//     parseConfig(raw),
//     TE.chain(extractUrl),
//     TE.chain(fetchData),
//     TE.chain(validateStatus)
//   );

// Тесты (запустите через await):
// await processConfig('{"url": "https://api.example.com/ok"}')()
//   → E.right('success')
//
// await processConfig('not json')()
//   → E.left('Невалидный JSON')
//
// await processConfig('{"name": "test"}')()
//   → E.left('Поле url не найдено')
//
// await processConfig('{"url": "https://api.example.com/fail"}')()
//   → E.left('Ошибка загрузки: Failed to fetch https://api.example.com/fail')
```

<details>
<summary>Решение</summary>

```typescript
const parseConfig = (raw: string): TE.TaskEither<string, unknown> =>
  TE.fromEither(
    E.tryCatch(
      () => JSON.parse(raw),
      () => 'Невалидный JSON'
    )
  );

const extractUrl = (config: unknown): TE.TaskEither<string, string> => {
  const url = (config as Record<string, unknown>).url;
  return typeof url === 'string'
    ? TE.right(url)
    : TE.left('Поле url не найдено');
};

const fetchData = (url: string): TE.TaskEither<string, ApiResponse> =>
  TE.tryCatch(
    () => mockFetch(url),
    (err) => `Ошибка загрузки: ${(err as Error).message}`
  );

const validateStatus = (res: ApiResponse): TE.TaskEither<string, string> =>
  res.status === 200
    ? TE.right(res.data)
    : TE.left(`HTTP ошибка: ${res.status}`);

const processConfig = (raw: string): TE.TaskEither<string, string> =>
  pipe(
    parseConfig(raw),
    TE.chain(extractUrl),
    TE.chain(fetchData),
    TE.chain(validateStatus)
  );
```

Ключевой вывод: `TE.chain` объединяет три проблемы в одну плоскую цепочку:
- Синхронные ошибки (парсинг JSON, извлечение поля)
- Асинхронные ошибки (сетевой запрос)
- Валидация результата

Без монады это были бы вложенные `try/catch` + `if/else` + `async/await`.

</details>

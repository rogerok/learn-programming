---
tags: [typescript, functional-programming, applicative, ap, validation, fp-ts, exercises]
---

# Упражнения: Аппликативный функтор — независимые эффекты

> [!info] Context
> Упражнения к главе [[applicative]]. Порядок — от написания ap вручную до валидации с накоплением ошибок в fp-ts.

## Упражнение 1: Напишите ap для Option

Реализуйте `ap` для самописного Option и используйте его для комбинирования двух значений.

```typescript
type Option<A> = { _tag: 'Some'; value: A } | { _tag: 'None' };

const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value });
const none: Option<never> = { _tag: 'None' };

const mapOption = <A, B>(f: (a: A) => B) =>
  (fa: Option<A>): Option<B> =>
    fa._tag === 'None' ? none : some(f(fa.value));

// Реализуйте ap:
const apOption = <A, B>(fab: Option<(a: A) => B>) =>
  (fa: Option<A>): Option<B> => {
    // ваш код
  };

// Тесты:
const add = (a: number) => (b: number): number => a + b;
const greet = (name: string) => (age: number): string => `${name}, ${age} лет`;

// pipe(some(add), apOption(some(3)), apOption(some(4)))       → some(7)
// pipe(some(add), apOption(none), apOption(some(4)))           → none
// pipe(some(greet), apOption(some('Иван')), apOption(some(25))) → some('Иван, 25 лет')
```

<details>
<summary>Решение</summary>

```typescript
const apOption = <A, B>(fab: Option<(a: A) => B>) =>
  (fa: Option<A>): Option<B> => {
    if (fab._tag === 'None' || fa._tag === 'None') return none;
    return some(fab.value(fa.value));
  };
```

Логика: если хотя бы один из контейнеров пуст — результат `none`. Иначе — извлекаем функцию и значение, применяем, оборачиваем в `some`.

</details>

---

## Упражнение 2: ap vs chain — выберите правильный инструмент

Для каждого сценария определите, нужен `ap` (applicative) или `chain` (monad). Реализуйте решение с fp-ts.

```typescript
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

// Сценарий A: Есть два Option<number>, нужно сложить их.
// firstName и lastName — независимы.
const a = O.some(10);
const b = O.some(20);
// Результат: O.some(30)

// Сценарий B: Нужно найти пользователя, а потом загрузить его профиль.
// getProfile ЗАВИСИТ от результата findUser.
const findUser = (id: number): O.Option<{ id: number; profileId: number }> =>
  id === 1 ? O.some({ id: 1, profileId: 42 }) : O.none;
const getProfile = (profileId: number): O.Option<string> =>
  profileId === 42 ? O.some('Профиль Ивана') : O.none;
// Результат для id=1: O.some('Профиль Ивана')

// Сценарий C: Валидация email и пароля — поля независимы.
const validateEmail = (e: string): E.Either<string, string> =>
  e.includes('@') ? E.right(e) : E.left('Невалидный email');
const validatePass = (p: string): E.Either<string, string> =>
  p.length >= 8 ? E.right(p) : E.left('Пароль < 8 символов');
// Результат: E.right({ email, password }) или E.left(...)
```

<details>
<summary>Ответы</summary>

```typescript
// Сценарий A: APPLICATIVE — аргументы независимы
const add = (a: number) => (b: number): number => a + b;
const resultA = pipe(O.of(add), O.ap(a), O.ap(b));
// O.some(30)

// Сценарий B: MONAD — getProfile зависит от findUser
const resultB = pipe(
  findUser(1),
  O.chain(user => getProfile(user.profileId))
);
// O.some('Профиль Ивана')

// Сценарий C: APPLICATIVE — поля независимы
import { sequenceS } from 'fp-ts/Apply';

const resultC = (email: string, pass: string) =>
  sequenceS(E.Applicative)({
    email: validateEmail(email),
    password: validatePass(pass),
  });

resultC('ivan@mail.ru', 'strongpass');  // E.right({ email: 'ivan@mail.ru', password: 'strongpass' })
resultC('bad', 'short');                 // E.left('Невалидный email') — первая ошибка (обычный Either)
```

Правило: если второй шаг **использует результат** первого → `chain`. Если шаги **не зависят** друг от друга → `ap`.

</details>

---

## Упражнение 3: Валидация формы с накоплением ошибок

Напишите валидацию формы регистрации, которая собирает **все** ошибки. Используйте `E.getApplicativeValidation` и `sequenceS` из fp-ts.

Правила:
- Имя: не пустое, >= 2 символов
- Email: содержит `@` и `.`
- Пароль: >= 8 символов, содержит цифру
- Возраст: число от 18 до 120

```typescript
import * as E from 'fp-ts/Either';
import { sequenceS } from 'fp-ts/Apply';
import { getSemigroup } from 'fp-ts/NonEmptyArray';
import { pipe } from 'fp-ts/function';

type FormErrors = readonly string[];
type Validated<A> = E.Either<FormErrors, A>;

// Реализуйте валидаторы:
// const validateName = (name: string): Validated<string> => ...
// const validateEmail = (email: string): Validated<string> => ...
// const validatePassword = (pass: string): Validated<string> => ...
// const validateAge = (age: number): Validated<number> => ...

// Соберите через sequenceS с accumulation:
// const validateForm = (input: {
//   name: string; email: string; password: string; age: number;
// }) => ...

// Тесты:
// validateForm({ name: 'Иван', email: 'ivan@mail.ru', password: 'Str0ng123', age: 25 })
//   → E.right({ name: 'Иван', email: 'ivan@mail.ru', password: 'Str0ng123', age: 25 })
//
// validateForm({ name: '', email: 'bad', password: 'short', age: 10 })
//   → E.left([
//       'Имя должно содержать минимум 2 символа',
//       'Email должен содержать @ и .',
//       'Пароль должен быть не менее 8 символов',
//       'Возраст должен быть от 18 до 120'
//     ])
```

<details>
<summary>Решение</summary>

```typescript
const validateName = (name: string): Validated<string> =>
  name.trim().length >= 2
    ? E.right(name.trim())
    : E.left(['Имя должно содержать минимум 2 символа']);

const validateEmail = (email: string): Validated<string> =>
  email.includes('@') && email.includes('.')
    ? E.right(email)
    : E.left(['Email должен содержать @ и .']);

const validatePassword = (pass: string): Validated<string> => {
  const errors: string[] = [];
  if (pass.length < 8) errors.push('Пароль должен быть не менее 8 символов');
  if (!/\d/.test(pass)) errors.push('Пароль должен содержать цифру');
  return errors.length > 0 ? E.left(errors) : E.right(pass);
};

const validateAge = (age: number): Validated<number> =>
  age >= 18 && age <= 120
    ? E.right(age)
    : E.left(['Возраст должен быть от 18 до 120']);

const validateForm = (input: {
  name: string;
  email: string;
  password: string;
  age: number;
}) =>
  sequenceS(E.getApplicativeValidation(getSemigroup<string>()))({
    name: validateName(input.name),
    email: validateEmail(input.email),
    password: validatePassword(input.password),
    age: validateAge(input.age),
  });
```

Ключевой момент: `getSemigroup<string>()` — Semigroup для массивов (конкатенация). Когда два поля невалидны, их ошибки (массивы) объединяются через `[...errorsA, ...errorsB]`.

</details>

---

## Упражнение 4: liftA2 на голом TypeScript

Реализуйте `liftA2` для `Either` вручную (без fp-ts). Затем используйте для комбинирования двух валидаций.

```typescript
type Either<E, A> = { _tag: 'Left'; left: E } | { _tag: 'Right'; right: A };

const left = <E>(e: E): Either<E, never> => ({ _tag: 'Left', left: e });
const right = <A>(a: A): Either<never, A> => ({ _tag: 'Right', right: a });

// Реализуйте liftA2:
const liftA2 = <E, A, B, C>(
  f: (a: A) => (b: B) => C,
  fa: Either<E, A>,
  fb: Either<E, B>
): Either<E, C> => {
  // ваш код
};

// Тесты:
const createPair = (a: string) => (b: number) => ({ name: a, age: b });

// liftA2(createPair, right('Иван'), right(25))
//   → right({ name: 'Иван', age: 25 })

// liftA2(createPair, left('ошибка имени'), right(25))
//   → left('ошибка имени')

// liftA2(createPair, right('Иван'), left('ошибка возраста'))
//   → left('ошибка возраста')
```

<details>
<summary>Решение</summary>

```typescript
const liftA2 = <E, A, B, C>(
  f: (a: A) => (b: B) => C,
  fa: Either<E, A>,
  fb: Either<E, B>
): Either<E, C> => {
  if (fa._tag === 'Left') return fa;
  if (fb._tag === 'Left') return fb;
  return right(f(fa.right)(fb.right));
};
```

Это эквивалентно `pipe(fa, map(f), ap(fb))` — каноническое определение liftA2. Обратите внимание: эта версия останавливается на первой ошибке. Для накопления нужен Semigroup (как в упражнении 3).

</details>

---

## Упражнение 5: Конвертация монадического кода в аппликативный

Код ниже использует `chain`, но шаги на самом деле **независимы**. Перепишите его в аппликативном стиле, чтобы:
1. Использовать `sequenceS` вместо chain
2. Собирать **все** ошибки (через `getApplicativeValidation`)

```typescript
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

interface Config {
  host: string;
  port: number;
  dbName: string;
}

// Текущий код (монадический — останавливается на первой ошибке):
const parseConfig = (raw: Record<string, string>): E.Either<string, Config> =>
  pipe(
    E.fromPredicate(
      (r: Record<string, string>) => typeof r.host === 'string' && r.host.length > 0,
      () => 'host обязателен'
    )(raw),
    E.chain(r =>
      pipe(
        E.fromPredicate(
          () => !isNaN(Number(r.port)),
          () => 'port должен быть числом'
        )(r),
        E.map(r => Number(r.port))
      )
    ),
    E.chain(port =>
      pipe(
        E.fromPredicate(
          () => typeof raw.dbName === 'string' && raw.dbName.length > 0,
          () => 'dbName обязателен'
        )(raw),
        E.map(r => ({ host: raw.host, port, dbName: r.dbName }))
      )
    )
  );

// Перепишите: каждое поле валидируется ОТДЕЛЬНО, ошибки НАКАПЛИВАЮТСЯ
// const parseConfigV = (raw: Record<string, string>): E.Either<readonly string[], Config> => ...
```

<details>
<summary>Решение</summary>

```typescript
import { sequenceS } from 'fp-ts/Apply';
import { getSemigroup } from 'fp-ts/NonEmptyArray';

type Validated<A> = E.Either<readonly string[], A>;

const parseHost = (raw: Record<string, string>): Validated<string> =>
  typeof raw.host === 'string' && raw.host.length > 0
    ? E.right(raw.host)
    : E.left(['host обязателен']);

const parsePort = (raw: Record<string, string>): Validated<number> => {
  const n = Number(raw.port);
  return !isNaN(n) ? E.right(n) : E.left(['port должен быть числом']);
};

const parseDbName = (raw: Record<string, string>): Validated<string> =>
  typeof raw.dbName === 'string' && raw.dbName.length > 0
    ? E.right(raw.dbName)
    : E.left(['dbName обязателен']);

const parseConfigV = (raw: Record<string, string>): Validated<Config> =>
  sequenceS(E.getApplicativeValidation(getSemigroup<string>()))({
    host: parseHost(raw),
    port: parsePort(raw),
    dbName: parseDbName(raw),
  });

// parseConfigV({})
//   → E.left(['host обязателен', 'port должен быть числом', 'dbName обязателен'])
//   ВСЕ три ошибки!

// parseConfigV({ host: 'localhost', port: '5432', dbName: 'mydb' })
//   → E.right({ host: 'localhost', port: 5432, dbName: 'mydb' })
```

Ключевые изменения:
1. Каждый валидатор стал **независимой** функцией (не зависит от результатов других)
2. Ошибки — массивы строк (для Semigroup-конкатенации)
3. `sequenceS` с `getApplicativeValidation` собирает все ошибки

</details>

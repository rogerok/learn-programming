---
tags: [typescript, functional-programming, fp-ts, pipe, option, either, taskEither, patterns]
---

# Глава: fp-ts на практике

> [!info] Context
> Седьмая глава курса по функциональному программированию в TypeScript. Практическая глава: студент знает теорию (функтор, монада, аппликатив), теперь учится писать реальный fp-ts код. Паттерны, типичные сценарии, мини-проект и антипаттерны.
>
> **Пререквизиты:** [[pure-functions-and-pipe]], [[types-adt-option]], [[functor]], [[monad]], [[applicative]]

## Overview

Предыдущие шесть глав дали теоретическую базу. Эта глава — мост к реальному коду. Мы разберём конкретные паттерны работы с fp-ts: как думать pipe-цепочками, какие функции из Option/Either/TaskEither использовать в каких ситуациях, и как собрать всё в рабочий мини-проект.

К концу главы вы будете знать:

- Как проектировать pipe-цепочки как конвейеры трансформаций
- Основные операции Option, Either, TaskEither и когда их применять
- Как конвертировать между типами (Option → Either → TaskEither)
- Как построить HTTP-клиент с обработкой ошибок в fp-ts стиле
- Когда fp-ts — overkill и лучше написать обычный код

## Deep Dive

### 1. Архитектура pipe-цепочки

Главный паттерн fp-ts — **pipe**: данные текут слева направо через цепочку трансформаций.

```typescript
import { pipe, flow } from 'fp-ts/function';

// Без pipe — вложенные вызовы, читаем изнутри наружу:
format(validate(parse(trim(input))));

// С pipe — линейный поток, читаем сверху вниз:
pipe(
  input,
  trim,
  parse,
  validate,
  format
);
```

#### Как думать pipe-цепочкой

1. **Начните с входных данных** — что у вас есть?
2. **Определите результат** — что должно получиться?
3. **Запишите промежуточные типы** — как данные трансформируются на каждом шаге?

```typescript
pipe(
  rawInput,               // string
  parseJSON,              // string → Either<Error, unknown>
  E.chain(validateUser),  // Either<Error, unknown> → Either<Error, User>
  E.map(formatGreeting),  // Either<Error, User> → Either<Error, string>
  E.getOrElse(() => 'Ошибка')  // Either<Error, string> → string
);
```

> [!tip] Подсказка
> Пишите типы в комментариях, пока не привыкнете. TypeScript подсветит ошибку, если тип на выходе одного шага не совпадает со входом следующего.

#### pipe vs flow

```typescript
// pipe — когда значение уже есть
const result = pipe(42, double, toString);  // '84'

// flow — когда нужна переиспользуемая функция (point-free)
const transform = flow(double, toString);
transform(42);  // '84'

// flow удобен для передачи в map/chain:
pipe(
  [1, 2, 3],
  A.map(flow(double, toString))
);
// ['2', '4', '6']
```

---

### 2. Option — паттерны работы

#### Создание

```typescript
import * as O from 'fp-ts/Option';

O.some(42);                    // Option<number> — есть значение
O.none;                        // Option<never> — нет значения

O.fromNullable(value);         // null/undefined → none, иначе some
O.fromNullable(null);          // none
O.fromNullable('hello');       // some('hello')

O.fromPredicate((n: number) => n > 0)(5);   // some(5)
O.fromPredicate((n: number) => n > 0)(-3);  // none
```

#### Трансформация

```typescript
pipe(
  O.some(42),
  O.map(n => n * 2),           // some(84) — трансформирует значение
  O.filter(n => n > 50),       // some(84) — оставляет, если предикат true
  O.chain(n =>                 // some('84') — когда f возвращает Option
    n > 0 ? O.some(`${n}`) : O.none
  )
);
```

#### Извлечение

```typescript
pipe(O.some(42), O.getOrElse(() => 0));           // 42
pipe(O.none, O.getOrElse(() => 0));                // 0

pipe(O.some(42), O.match(
  () => 'пусто',                    // onNone
  (n) => `значение: ${n}`          // onSome
));
// 'значение: 42'

pipe(O.none, O.toUndefined);       // undefined
pipe(O.some(42), O.toNullable);    // 42
pipe(O.none, O.toNullable);        // null
```

#### Типичный сценарий: безопасный доступ к вложенным данным

```typescript
interface AppConfig {
  db?: {
    host?: string;
    port?: number;
  };
}

const getDbHost = (config: AppConfig): O.Option<string> =>
  pipe(
    O.fromNullable(config.db),
    O.chain(db => O.fromNullable(db.host)),
    O.filter(host => host.length > 0)
  );

getDbHost({ db: { host: 'localhost' } });  // some('localhost')
getDbHost({ db: {} });                      // none
getDbHost({});                              // none
```

---

### 3. Either — паттерны работы

#### Создание

```typescript
import * as E from 'fp-ts/Either';

E.right(42);                   // Either<never, number> — успех
E.left('ошибка');              // Either<string, never> — ошибка

E.fromNullable('not found')(value);         // null → left, иначе right
E.fromPredicate(
  (n: number) => n > 0,
  (n) => `${n} не положительное`
)(5);                                       // right(5)

E.tryCatch(
  () => JSON.parse(str),
  (err) => `Parse error: ${err}`
);                                          // right(parsed) или left(message)
```

#### Трансформация

```typescript
pipe(
  E.right(42),
  E.map(n => n * 2),            // right(84) — трансформирует Right
  E.mapLeft(err => `[ERR] ${err}`),  // не вызвалась — Right
  E.chain(n =>                  // right('84') — когда f возвращает Either
    n > 0 ? E.right(`${n}`) : E.left('отрицательное')
  )
);
```

#### Работа с обоими каналами

```typescript
// bimap — трансформирует и Left, и Right одновременно
pipe(
  E.left('ошибка'),
  E.bimap(
    err => err.toUpperCase(),   // Left → 'ОШИБКА'
    val => val * 2              // Right — не вызвалась
  )
);

// orElse — восстановиться из ошибки
pipe(
  E.left('timeout'),
  E.orElse((err) =>
    err === 'timeout' ? E.right('default') : E.left(err)
  )
);
// right('default')
```

#### Извлечение

```typescript
pipe(E.right(42), E.getOrElse(() => 0));   // 42
pipe(E.left('err'), E.getOrElse(() => 0)); // 0

pipe(E.right(42), E.match(
  (err) => `ошибка: ${err}`,     // onLeft
  (val) => `успех: ${val}`       // onRight
));
// 'успех: 42'

pipe(E.right(42), E.toOption);    // O.some(42) — теряем информацию об ошибке
pipe(E.left('err'), E.toOption);   // O.none
```

#### Типичный сценарий: парсинг и валидация

```typescript
interface CreateUserDTO {
  name: string;
  email: string;
  age: string;  // приходит как строка из формы
}

interface User {
  name: string;
  email: string;
  age: number;
}

const parseAge = (s: string): E.Either<string, number> =>
  pipe(
    E.tryCatch(
      () => parseInt(s, 10),
      () => 'Невозможно распарсить возраст'
    ),
    E.chain(E.fromPredicate(
      n => !isNaN(n) && n >= 0 && n <= 150,
      () => 'Возраст вне диапазона 0–150'
    ))
  );

const createUser = (dto: CreateUserDTO): E.Either<string, User> =>
  pipe(
    parseAge(dto.age),
    E.map(age => ({
      name: dto.name,
      email: dto.email,
      age,
    }))
  );
```

---

### 4. TaskEither — async + ошибки

`TaskEither<E, A>` — это `() => Promise<Either<E, A>>`. Ленивая асинхронная операция с обработкой ошибок.

#### Создание

```typescript
import * as TE from 'fp-ts/TaskEither';

TE.right(42);                  // TaskEither<never, number> — уже успех
TE.left('ошибка');             // TaskEither<string, never> — уже ошибка

TE.tryCatch(
  () => fetch('/api/data').then(r => r.json()),
  (err) => `Fetch failed: ${err}`
);

// Из Either
TE.fromEither(E.right(42));    // TaskEither<never, number>

// Из Option
TE.fromOption(() => 'not found')(O.some(42));  // TaskEither<string, number>
```

#### Трансформация (те же операции, что у Either)

```typescript
const fetchUser = (id: number): TE.TaskEither<string, User> =>
  TE.tryCatch(
    () => fetch(`/api/users/${id}`).then(r => r.json()),
    () => `Не удалось загрузить пользователя ${id}`
  );

const validateAge = (user: User): TE.TaskEither<string, User> =>
  user.age >= 18 ? TE.right(user) : TE.left(`${user.name} младше 18`);

const formatGreeting = (user: User): string =>
  `Привет, ${user.name}!`;

// Цепочка: async-запрос → валидация → форматирование
const greetUser = (id: number): TE.TaskEither<string, string> =>
  pipe(
    fetchUser(id),            // TaskEither<string, User>
    TE.chain(validateAge),    // TaskEither<string, User>
    TE.map(formatGreeting)    // TaskEither<string, string>
  );

// Запуск:
const result = await greetUser(1)();
// Either<string, string>
```

#### Параллельное выполнение

```typescript
import { sequenceS } from 'fp-ts/Apply';

const fetchDashboard = pipe(
  sequenceS(TE.ApplyPar)({
    user: fetchUser(1),
    orders: fetchOrders(1),
    notifications: fetchNotifications(1),
  }),
  TE.map(({ user, orders, notifications }) => ({
    greeting: `Привет, ${user.name}!`,
    orderCount: orders.length,
    unread: notifications.filter(n => !n.read).length,
  }))
);
```

> [!tip] ApplyPar vs ApplySeq
> `TE.ApplyPar` — запускает TaskEither параллельно (как Promise.all). `TE.ApplySeq` — последовательно. Для независимых запросов всегда используйте `ApplyPar`.

---

### 5. Конвертация между типами

fp-ts позволяет легко конвертировать между Option, Either и TaskEither:

```typescript
// Option → Either (добавляем информацию об ошибке)
pipe(
  O.fromNullable(config.apiKey),
  E.fromOption(() => 'API key не настроен')
);
// Option<string> → Either<string, string>

// Either → Option (теряем информацию об ошибке)
pipe(
  E.tryCatch(() => JSON.parse(str), String),
  E.toOption
);
// Either<string, unknown> → Option<unknown>

// Either → TaskEither (делаем "ленивым")
pipe(
  validateInput(data),          // Either<string, Data>
  TE.fromEither                 // TaskEither<string, Data>
);

// Option → TaskEither
pipe(
  findInCache(key),             // Option<Data>
  TE.fromOption(() => 'Cache miss')  // TaskEither<string, Data>
);

// TaskEither → Promise (для интеграции с обычным кодом)
const result = await pipe(
  fetchUser(1),
  TE.match(
    (err) => ({ error: err }),
    (user) => ({ data: user })
  )
)();
```

#### Типичный паттерн: постепенное "повышение" типа

```typescript
const getUser = (id: number): TE.TaskEither<string, User> =>
  pipe(
    // Шаг 1: валидация (синхронная) — Either
    E.fromPredicate(
      (n: number) => n > 0,
      () => 'ID должен быть положительным'
    )(id),

    // Шаг 2: "повышаем" до TaskEither
    TE.fromEither,

    // Шаг 3: асинхронная операция — остаёмся в TaskEither
    TE.chain(validId =>
      TE.tryCatch(
        () => fetch(`/api/users/${validId}`).then(r => r.json()),
        () => 'Ошибка сети'
      )
    ),

    // Шаг 4: валидация ответа — всё ещё TaskEither
    TE.chain(data =>
      data && typeof data.name === 'string'
        ? TE.right(data as User)
        : TE.left('Невалидный ответ API')
    )
  );
```

---

### 6. Мини-проект: API-клиент

Соберём всё вместе: HTTP-клиент с типобезопасной обработкой ошибок.

```typescript
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as t from 'io-ts';  // для runtime-валидации типов
import { pipe } from 'fp-ts/function';

// === Типы ===

interface ApiError {
  readonly type: 'network' | 'parse' | 'validation' | 'business';
  readonly message: string;
}

const apiError = (type: ApiError['type'], message: string): ApiError =>
  ({ type, message });

interface Todo {
  readonly id: number;
  readonly title: string;
  readonly completed: boolean;
}

// === Слои ===

// 1. HTTP-слой: запрос → ответ или ошибка сети
const httpGet = (url: string): TE.TaskEither<ApiError, Response> =>
  TE.tryCatch(
    () => fetch(url),
    () => apiError('network', `Не удалось подключиться к ${url}`)
  );

// 2. Parse-слой: Response → JSON или ошибка парсинга
const parseResponse = (res: Response): TE.TaskEither<ApiError, unknown> =>
  TE.tryCatch(
    () => res.json(),
    () => apiError('parse', 'Невалидный JSON в ответе')
  );

// 3. Validation-слой: unknown → типизированные данные
const validateTodo = (data: unknown): E.Either<ApiError, Todo> => {
  if (
    data !== null &&
    typeof data === 'object' &&
    'id' in data &&
    'title' in data &&
    'completed' in data
  ) {
    const d = data as Record<string, unknown>;
    if (
      typeof d.id === 'number' &&
      typeof d.title === 'string' &&
      typeof d.completed === 'boolean'
    ) {
      return E.right({ id: d.id, title: d.title, completed: d.completed });
    }
  }
  return E.left(apiError('validation', 'Ответ не соответствует типу Todo'));
};

// 4. Business-слой: проверка бизнес-правил
const ensureNotCompleted = (todo: Todo): E.Either<ApiError, Todo> =>
  todo.completed
    ? E.left(apiError('business', `Todo "${todo.title}" уже завершён`))
    : E.right(todo);

// === Сборка ===

const fetchActiveTodo = (id: number): TE.TaskEither<ApiError, Todo> =>
  pipe(
    httpGet(`https://jsonplaceholder.typicode.com/todos/${id}`),
    TE.chain(parseResponse),
    TE.chain(data => TE.fromEither(validateTodo(data))),
    TE.chain(todo => TE.fromEither(ensureNotCompleted(todo)))
  );

// === Использование ===

const main = async () => {
  const result = await pipe(
    fetchActiveTodo(1),
    TE.match(
      (err) => `[${err.type}] ${err.message}`,
      (todo) => `Активная задача: ${todo.title}`
    )
  )();

  console.log(result);
};
```

Обратите внимание на архитектуру:

1. Каждый слой — отдельная функция с чёткой ответственностью
2. Ошибки типизированы (`ApiError.type`) — можно обрабатывать разные виды по-разному
3. Синхронные проверки (`validateTodo`, `ensureNotCompleted`) возвращают `Either` и "поднимаются" до `TaskEither` через `TE.fromEither`
4. Вся цепочка — один `pipe`, легко читается сверху вниз

---

### 7. Антипаттерны: когда fp-ts вредит

fp-ts — мощный инструмент, но не серебряная пуля. Вот когда стоит писать обычный код:

#### 1. Тривиальные операции

```typescript
// Overkill:
const getName = (user: User): string =>
  pipe(user, u => u.name);

// Просто:
const getName = (user: User): string => user.name;
```

#### 2. Единственная проверка на null

```typescript
// Overkill:
const result = pipe(
  O.fromNullable(user.address),
  O.map(a => a.city),
  O.getOrElse(() => 'Неизвестно')
);

// Просто:
const result = user.address?.city ?? 'Неизвестно';
```

Optional chaining (`?.`) и nullish coalescing (`??`) достаточно для простых случаев. Option полезен, когда цепочка длинная или нужна композиция с другими fp-ts типами.

#### 3. Код, который не возвращает ошибки

```typescript
// Overkill:
const double = (n: number): E.Either<never, number> => E.right(n * 2);

// Просто:
const double = (n: number): number => n * 2;
```

Если функция не может упасть — не заворачивайте результат в Either. Используйте `map`, чтобы применить её внутри цепочки.

#### 4. Слишком длинные pipe-цепочки

```typescript
// Трудно читать (10+ шагов в одном pipe):
pipe(input, step1, step2, step3, step4, step5, step6, step7, step8, step9, step10);

// Лучше: разбить на именованные промежуточные функции
const validated = pipe(input, step1, step2, step3);
const transformed = pipe(validated, step4, step5, step6);
const result = pipe(transformed, step7, step8, step9, step10);
```

#### 5. Весь проект на fp-ts

fp-ts хорошо работает как **ядро бизнес-логики** с тонкой оболочкой обычного кода. Не нужно заворачивать Express-роуты, React-компоненты или конфиг-файлы в Either/TaskEither.

> [!important] Правило
> Используйте fp-ts там, где есть **цепочки трансформаций с ошибками** (валидация, API-вызовы, парсинг). Для всего остального — обычный TypeScript.

---

### 8. Шпаргалка: что использовать когда

| Ситуация | Тип | Операция |
|---|---|---|
| Значение может отсутствовать | `Option` | `fromNullable`, `map`, `chain` |
| Операция может вернуть ошибку | `Either` | `tryCatch`, `fromPredicate`, `chain` |
| Async + ошибки | `TaskEither` | `tryCatch`, `chain`, `map` |
| Трансформировать значение | любой | `map` |
| f возвращает контейнер | любой | `chain` |
| Независимые контейнеры | любой | `sequenceS`, `sequenceT` |
| Все ошибки валидации | `Either` + validation | `getApplicativeValidation` |
| Параллельные async | `TaskEither` | `sequenceS(TE.ApplyPar)` |
| Перевести null → Option | `Option` | `fromNullable` |
| Перевести Option → Either | `Either` | `E.fromOption` |
| Перевести Either → TaskEither | `TaskEither` | `TE.fromEither` |
| Извлечь значение | любой | `getOrElse`, `match` |

---

### 9. Что дальше

Мы научились писать реальный fp-ts код: pipe-цепочки, Option/Either/TaskEither, конвертация между типами, практические паттерны. В финальной главе — **Traversable и ReaderTaskEither**: как работать с массивами контейнеров и как передавать зависимости без глобального состояния.

## Related Topics

- [[pure-functions-and-pipe]]
- [[types-adt-option]]
- [[functor]]
- [[monad]]
- [[applicative]]

## Sources

- [Getting started with fp-ts](https://gcanti.github.io/fp-ts/learning-resources/)
- [fp-ts Option module](https://gcanti.github.io/fp-ts/modules/Option.ts.html)
- [fp-ts Either module](https://gcanti.github.io/fp-ts/modules/Either.ts.html)
- [fp-ts TaskEither module](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html)
- [Practical Guide to fp-ts](https://rlee.dev/practical-guide-to-fp-ts-part-1)
- Introduction to Functional Programming using TypeScript — Giulio Canti

---

*Глава написана моделью claude-opus-4-6 (Opus 4.6)*

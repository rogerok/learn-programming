# FP Course — Roadmap & Chapter Instructions

Единый курс по функциональному программированию с нуля.
Аудитория: разработчик без математического бэкграунда, не писавший fp-ts код.

## Принципы каждой главы

Структура: **боль → интуиция → голый TS → fp-ts → название → формальное определение → упражнение**

- Всегда начинать с проблемы, которую решает концепция
- Сначала написать решение на голом TypeScript, затем показать fp-ts эквивалент
- Давать аналогии из реального мира перед кодом
- Определение — после примеров, не до
- Каждая глава заканчивается упражнением (отдельный файл)

## Ссылки на существующие материалы (reference)

- `src/01-javascript/patterns/fp/mostly-adequate-guide-to-fp/` — глубокие главы ch08-ch12
- `src/02-typescript/functiona-programming-in-ts/` — теория (17-36) и fp-ts примеры
- `src/02-typescript/fp-ts/fp-ts-turorial/` — практика Option/Either

---

## Chapter 1: Чистые функции, композиция, pipe

**Файл:** `src/02-typescript/fp-course/01-pure-functions-and-pipe/`

**Команда запуска:**
```
/chapter Чистые функции, композиция и pipe в TypeScript с fp-ts
```

**Подробные инструкции для author-агента:**

Написать вводную главу курса по FP. Аудитория: JS/TS разработчик без опыта в FP, который пишет императивный код.

Структура:
1. Боль: почему imperative код тяжело тестировать и переиспользовать (показать конкретный грязный пример)
2. Чистые функции: определение через два свойства (determinism + no side effects), примеры чистых и нечистых
3. Почему чистые функции можно безопасно композировать
4. Функциональная композиция на голом TS: написать `compose` и `pipe` самостоятельно
5. fp-ts: `pipe` и `flow` из 'fp-ts/function' — показать разницу между ними, типичные паттерны использования
6. Упражнения: 3 задачи — (а) выделить чистую функцию из нечистой, (б) написать цепочку через pipe, (в) написать pipe с реальными данными (объект пользователя, строки)

Важно: не упоминать функторы и монады — они будут позже. Глава должна быть самодостаточной.

Reference: `src/02-typescript/fp-ts/fp-ts-turorial/1.pipe-and-flow.md`

---

## Chapter 2: Типы как множества, ADT и Option

**Файл:** `src/02-typescript/fp-course/02-types-adt-option/`

**Команда запуска:**
```
/chapter Типы как множества, ADT (сумма и произведение), Option в TypeScript с fp-ts
```

**Подробные инструкции для author-агента:**

Написать главу, которая строит интуицию о типах как о наборах значений, вводит ADT и показывает Option как первый "умный контейнер".

Структура:
1. Боль: `null`/`undefined` — почему это проблема (TypeError в runtime, необходимость везде проверять)
2. Тип = множество: `boolean` это {true, false}, `number` это бесконечное множество, `never` это пустое множество
3. Product types (И): interface/tuple — количество значений перемножается
4. Sum types (ИЛИ): union/discriminated union — количество значений складывается
5. Option/Maybe: написать `Option<A>` самостоятельно как `Some<A> | None`, реализовать `map` и `getOrElse`
6. fp-ts: `O.some`, `O.none`, `O.fromNullable`, `O.map`, `O.getOrElse` из 'fp-ts/Option' — показать те же операции
7. Pattern matching через `O.match` / `O.fold`
8. Упражнения: (а) написать функцию возвращающую Option вместо null, (б) написать цепочку map на Option, (в) конвертировать nullable API ответ в Option цепочку

Reference: `src/02-typescript/functiona-programming-in-ts/15.ADT,Pattern-Matching.md`, `src/02-typescript/fp-ts/fp-ts-turorial/2.Option.md`

---

## Chapter 3: Функтор — обобщение map

**Файл:** `src/02-typescript/fp-course/03-functor/`

**Команда запуска:**
```
/chapter Функтор — что такое map в общем смысле, TypeScript и fp-ts
```

**Подробные инструкции для author-агента:**

Написать главу, которая раскрывает интуицию функтора через знакомые примеры и обобщает её.

Структура:
1. Боль: одна и та же операция (map) работает на Array, Option, Promise — почему? Что между ними общего?
2. Array.map как отправная точка — студент уже это знает
3. Наблюдение: Option.map работает так же — применяет функцию внутри контейнера
4. Обобщение: контейнер + map = функтор. Написать интерфейс `Functor<F>` на голом TS
5. Два закона функтора (identity и composition) — объяснить через аналогию: "map(x => x) ничего не меняет", "map двух функций = две map по отдельности"
6. Either как функтор: map работает только на Right, Left проходит насквозь — показать почему это правильно
7. fp-ts: `Functor` type class, как fp-ts реализует функторы через URI и HKT (коротко, без глубины в HKT)
8. Показать `O.map`, `E.map`, `A.map` из fp-ts — единый интерфейс для разных контейнеров
9. Упражнения: (а) реализовать map для своего контейнера, (б) проверить законы функтора, (в) написать функцию через pipe + map для Option и Either

Reference: `src/02-typescript/functiona-programming-in-ts/22.functor.md`, `src/02-typescript/functiona-programming-in-ts/functors-in-fp-ts/functors-in-fp-ts.md`, `src/01-javascript/patterns/fp/mostly-adequate-guide-to-fp/ch08-functors-and-containers/functors-and-containers.md`

---

## Chapter 4: Теория категорий через код

**Файл:** `src/02-typescript/fp-course/04-category-theory/`

**Команда запуска:**
```
/chapter Теория категорий для программиста без математики — объекты, морфизмы, функторы как отображения категорий
```

**Подробные инструкции для author-агента:**

Написать главу, которая объясняет теорию категорий ПОСЛЕ того как студент уже знает функторы. Идти от кода к теории, не наоборот.

Структура:
1. Зачем это вообще нужно: теория категорий объясняет ПОЧЕМУ законы функтора именно такие, а не произвольные правила
2. Категория Hask (или TypeScript): объекты = типы, морфизмы = функции между типами
3. Три правила категории через код студент уже видел (composition, associativity, identity) — теперь дать им имена
4. Функтор в теории категорий: отображение между категориями, которое сохраняет структуру. Option "отображает" категорию TS в категорию TS, сохраняя морфизмы
5. Почему законы функтора (identity + composition) — это именно то, что значит "сохранять структуру"
6. Natural transformation: отображение между функторами (Option → Array) — это то, что studented видел как `O.toArray`
7. Magma, Semigroup, Monoid как категориальные структуры — коротко, как мост к fp-ts
8. fp-ts: показать как fp-ts использует type classes для выражения этих абстракций
9. Упражнения: (а) доказать что Option — функтор (проверить законы кодом), (б) написать natural transformation

Важно: не уходить в математику. Каждое новое слово должно иметь аналог в коде, показанный в той же главе.

Reference: `src/02-typescript/functiona-programming-in-ts/17.category-theory.md`, `src/02-typescript/functiona-programming-in-ts/18.magma,semigroup,monoid.md`

---

## Chapter 5: Monad — flatMap и цепочки эффектов

**Файл:** `src/02-typescript/fp-course/05-monad/`

**Команда запуска:**
```
/chapter Монада — что такое flatMap, chain и почему монада это не страшно, TypeScript и fp-ts
```

**Подробные инструкции для author-агента:**

Написать главу о монадах. Студент уже знает функтор и Option/Either. Объяснить через конкретную боль.

Структура:
1. Боль: функция возвращает Option, другая функция тоже принимает и возвращает Option — при map получается `Option<Option<A>>`. Показать конкретный пример
2. join/flatten: операция снятия одного слоя вложенности
3. chain = map + flatten: вывести самостоятельно, показать что это решает проблему
4. Promise.then как монада: студент уже использует монады! `.then` это и есть `chain`
5. Array.flatMap как монада
6. Either как монада: chain идёт по Right, при Left цепочка прерывается — показать это как обработку ошибок
7. Законы монады (left identity, right identity, associativity) — объяснить через аналогию с числом 0 в сложении
8. fp-ts: `O.chain`, `E.chain`, `pipe` с цепочкой chain операций
9. "Монада — это просто моноид в категории эндофункторов" — объяснить ЭТУ фразу простыми словами после того как всё предыдущее понятно
10. Упражнения: (а) переписать вложенные if/null-checks как цепочку chain, (б) написать валидацию через Either chain, (в) обработать async операции через TaskEither

Reference: `src/01-javascript/patterns/fp/mostly-adequate-guide-to-fp/ch09-monads/monads.md`, `src/02-typescript/fp-ts/fp-ts-turorial/3.Either.md`

---

## Chapter 6: Applicative — независимые эффекты

**Файл:** `src/02-typescript/fp-course/06-applicative/`

**Команда запуска:**
```
/chapter Аппликативный функтор — ap, liftA2 и независимые эффекты в TypeScript с fp-ts
```

**Подробные инструкции для author-агента:**

Написать главу об аппликативных функторах. Студент знает функтор и монаду.

Структура:
1. Боль: есть два независимых Option/Either, хочется применить к ним двухаргументную функцию — map не справляется, chain создаёт ненужную зависимость
2. Разница между зависимостью (monad) и независимостью (applicative): цепочка vs параллельная комбинация
3. ap: функция внутри контейнера + значение внутри контейнера → результат внутри контейнера
4. Реализовать ap на голом TS для Option
5. liftA2 / liftA3: поднять обычную функцию в мир контейнеров
6. Главное применение: валидация с накоплением ошибок (Either как applicative собирает ВСЕ ошибки, а не падает на первой)
7. sequenceS и sequenceT из fp-ts — практичные утилиты
8. fp-ts: `Apply.ap`, `Apply.sequenceS`, примеры с Either для валидации формы
9. Сводная таблица: Functor vs Applicative vs Monad — когда что использовать
10. Упражнения: (а) написать ap для Option, (б) написать валидацию формы с накоплением ошибок, (в) конвертировать монадический код в аппликативный там где нет зависимости

Reference: `src/01-javascript/patterns/fp/mostly-adequate-guide-to-fp/ch10-applicative-functors/applicative-functors.md`

---

## Chapter 7: fp-ts на практике

**Файл:** `src/02-typescript/fp-course/07-fp-ts-practice/`

**Команда запуска:**
```
/chapter fp-ts на практике — реальные паттерны с pipe, Option, Either, TaskEither в TypeScript
```

**Подробные инструкции для author-агента:**

Написать практическую главу: студент знает теорию, теперь учится писать реальный fp-ts код.

Структура:
1. Архитектура pipe-цепочки: как думать о трансформациях данных как о конвейере
2. Option паттерны: fromNullable, map, chain, getOrElse, fold — разобрать типичные сценарии (работа с DOM, config, API response)
3. Either паттерны: tryCatch, map, mapLeft, bimap, chain, orElse — обработка ошибок без try/catch
4. TaskEither: работа с async кодом в fp-ts стиле. Показать tryCatch для fetch, цепочку async операций
5. Комбинирование: Option → Either (O.toEither), sequenceS для нескольких независимых TaskEither
6. Реальный мини-проект: HTTP клиент с обработкой ошибок через TaskEither + валидация ответа через Either
7. Антипаттерны: когда fp-ts вредит (overkill для простых случаев), как не превратить код в нечитаемый
8. Упражнения: написать функцию fetchUser, которая делает HTTP запрос, валидирует ответ, возвращает TaskEither

Reference: `src/02-typescript/fp-ts/fp-ts-turorial/`, `src/02-typescript/functiona-programming-in-ts/34.IO.md`, `src/02-typescript/functiona-programming-in-ts/36.Task-and-asynchronous-side-effects.md`

---

## Chapter 8: Traversable и ReaderTaskEither

**Файл:** `src/02-typescript/fp-course/08-traversable-rte/`

**Команда запуска:**
```
/chapter Traversable и ReaderTaskEither — продвинутые паттерны в fp-ts
```

**Подробные инструкции для author-агента:**

Написать продвинутую финальную главу. Студент уверенно работает с Option/Either/TaskEither.

Структура:
1. Traversable — часть 1:
   - Боль: `Array<Option<A>>` когда нужен `Option<Array<A>>` (Promise.all аналогия)
   - sequence: переворачивает вложенность
   - traverse = map + sequence в одном шаге
   - fp-ts: `A.traverse(O.Applicative)(arr, fn)`, `A.sequence(O.Applicative)(arr)`
2. Traversable — часть 2:
   - То же с TaskEither: `Array<TaskEither<E, A>>` → `TaskEither<E, Array<A>>`
   - `A.traverse(TE.ApplicativePar)` для параллельного выполнения
   - `A.traverse(TE.ApplicativeSeq)` для последовательного
3. ReaderTaskEither (RTE):
   - Боль: как передавать зависимости (DB, config, logger) в fp-ts пайп без глобального состояния
   - Reader как "функция от окружения"
   - RTE = Reader + Task + Either — три проблемы решены одним типом
   - fp-ts: базовые операции RTE, ask, local
   - Практический пример: сервис с dependency injection через RTE
4. Когда использовать RTE, а когда это overkill
5. Упражнения: написать сервис пользователей с RTE (зависимости: DB, logger)

Reference: `src/01-javascript/patterns/fp/mostly-adequate-guide-to-fp/ch12-traversable/traversable.md`

---

## Порядок запуска

Запускай по одной главе за сессию:

```
/chapter <инструкции из соответствующего раздела выше>
```

После каждой главы:
1. Прочитай главу и задай вопросы если что-то непонятно
2. Сделай упражнения
3. Потом `/chapter` следующей темы

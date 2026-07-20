# Система бронирования мест на Effect

Этот guided project развивает одно приложение от безопасной границы ввода до конкурентного transactional state. Предметная область — удержание и подтверждение мест на мероприятии. Здесь нет monitoring, probes, telemetry или HTTP polling: проект не повторяет Pulse.

Начальная версия уже компилируется, запускается и показывает состояние небольшого зала. Она намеренно доверяет части входных данных, использует глобальные часы и генератор ID, теряет освобождение resource при failure, обрабатывает запросы без worker pool и выполняет конкурентный `read → write` через `Ref`.

## Результат обучения

После завершения проекта вы сможете:

- декодировать внешние команды до входа в domain;
- проектировать actionable errors в канале `E`;
- выражать зависимости через services и собирать их через `Layer`;
- связывать lifetime временного hold с `Scope`;
- координировать producers, workers и subscribers;
- ограничивать конкуренцию внешнего сервиса;
- сохранять инварианты нескольких ресурсов через STM;
- переносить transactional invariant на другую структуру ресурсов.

## Prerequisites

Перед началом нужны:

- TypeScript generics и discriminated unions;
- `Promise`, interruption и базовая асинхронность;
- чтение `Effect<A, E, R>`;
- базовое использование `Effect.gen`;
- умение читать Vitest checks.

Материал проекта опирается на:

- [[src/02-typescript/effect-ts/1.intro/readme|Effect, constructors и runtime]];
- [[src/02-typescript/effect-ts/2.schema/readme|Effect Schema]];
- [[src/02-typescript/effect-ts/3.errors/readme|typed errors и Cause]];
- [[src/02-typescript/effect-ts/4.services-and-layers/readme|services и Layer]];
- [[src/02-typescript/effect-ts/5.resources|Scope и resources]].

Для fibers, coordination и STM используйте mentor lessons 6–8 из `/home/vyacheslav/Documents/bat-effect`.

## Как устроен starter

```text
src/
├── domain.ts    # команды, domain values и события
├── errors.ts    # семейство booking errors
├── services.ts  # contracts и in-memory implementations
├── booking.ts   # use cases и начальный processor
└── index.ts     # read-only smoke scenario

checks/
├── starter.test.ts
├── milestone-1.test.ts
├── milestone-2.test.ts
├── milestone-3.test.ts
├── milestone-4.test.ts
├── milestone-5.test.ts
├── milestone-6.test.ts
└── transfer.test.ts
```

Starter хранит места и accessibility aids в памяти. Это полноценная исходная модель, а не production storage. Не добавляйте HTTP, базу данных или framework: они не дают evidence по целевым Effect-механизмам.

### Карта изменений

В проекте выбран профиль `supported`: вы недавно начали работать с Effect, поэтому guide называет конкретные файлы и symbols, а последняя свёрнутая подсказка этапа может содержать полную локальную реализацию. Если вы её открыли, этап считается практикой с поддержкой; самостоятельность проверяется повторной попыткой без подсказки и финальным transfer.

`checks/*.test.ts` и `checks/support.ts` — проверочная инфраструктура. Их не нужно редактировать. Они подставляют test services и наблюдают публичное поведение.

| Этап | Где менять код | Что уже подготовлено и обычно не меняется |
|---|---|---|
| 1. Schema | `src/domain.ts`: `BookingCommand`, `decodeBookingCommand` | Domain values ниже `decodeBookingCommand`; `checks/milestone-1.test.ts` |
| 2. Typed errors | `src/services.ts`: conflict path внутри repository | Классы ошибок в `src/errors.ts`; публичный repository contract |
| 3. Services и Layer | `src/booking.ts`: `createHold`, `createAccessibleHold`, `confirmReservation`; при необходимости Live wiring в `src/services.ts` | `Context.GenericTag` contracts и test layers в `checks/support.ts` |
| 4. Scope | `src/booking.ts`: `withTemporaryHold`, `openTimedHold` | Repository `release` и публичные сигнатуры функций |
| 5. Coordination | `src/booking.ts`: `makeBookingProcessor` | `BookingProcessor`, request/outcome types и repository operations |
| 6. STM | `src/services.ts`: state storage и repository operations | Domain model, errors и use cases из `src/booking.ts` |
| Transfer | `src/services.ts`: `holdAccessible` | Проверка в `checks/transfer.test.ts`; готового решения и подсказки нет |

Starter содержит не пустые заглушки, а упрощённые работающие реализации. Перед каждым learner seam есть комментарий `Этап N`: он описывает текущее baseline-поведение. Меняйте этот участок, а не переписывайте весь файл.

## Рабочий цикл

Установите зависимости из директории проекта:

```bash
npm install
```

Проверьте исходное состояние:

```bash
npm run lint
npm run build
npm test
npm run smoke
```

Эти команды должны проходить всегда. Milestone checks сначала падают на намеренно отсутствующем поведении.

Для каждого этапа:

1. предскажите наблюдаемый failure текущей версии;
2. запустите check и сопоставьте результат с предсказанием;
3. измените только поведение текущего этапа;
4. повторите cumulative check;
5. объясните механизм на ручной контрольной точке;
6. удалите временную диагностику.

## Этап 1. Schema на границе доверия

### Зачем

`BookingCommand` — TypeScript-тип: после компиляции он исчезает и не способен проверить JSON, аргумент CLI или другое значение `unknown`. `Schema` остаётся runtime-значением. Из неё нужно построить decoder и действительно выполнить его.

Поток данных этапа:

```text
unknown
  → Schema.decodeUnknown(BookingCommandSchema)
  → BookingCommand | ParseError
  → mapError
  → BookingCommand | InvalidCommand
```

То есть нужно сделать обе части: **описать schema** и **запустить decode**. Одного объявления schema недостаточно.

### Где работать

Редактируйте только верхнюю часть `src/domain.ts`:

- import из `effect`;
- объявления schemas перед `BookingCommand`;
- тип `BookingCommand`;
- функцию `decodeBookingCommand`.

Не меняйте `src/booking.ts`, `src/services.ts`, checks и domain types `Reservation`, `VenueSnapshot`, `BookingEvent`: они относятся к следующим этапам или служат scaffold.

### Что уже есть

Сейчас `decodeBookingCommand` проверяет только объект и поле `type`, затем выполняет:

```typescript
const command = input as BookingCommand;
```

Это type assertion, а не runtime-проверка. Поэтому `{ type: "hold", seats: [], durationMs: "oops" }` ошибочно проходит boundary.

`InvalidCommand` уже объявлен. Сохраняйте его как публичную ошибку decoder-а: наружу не должен утекать внутренний `ParseError`.

### Что изменить

После этапа поддерживаются четыре команды:

- `status`;
- `hold`: непустой уникальный массив `seats`, положительный конечный `durationMs`;
- `confirm`: непустой `reservationId`, положительный конечный `amount`;
- `cancel`: непустой `reservationId`.

Успешный decoder возвращает `BookingCommand`. Любое нарушение формы или инварианта возвращает `InvalidCommand` в канале `E`; defect и `throw` наружу не выходят.

### Шаги реализации

1. Добавьте `Schema` в import из `effect`.
2. Создайте маленькие schemas для повторяющихся правил: непустая строка, положительное конечное число, непустой массив уникальных seat IDs.
3. Опишите каждую команду через `Schema.Struct`. Поле `type` задайте через `Schema.Literal`, чтобы оно служило discriminator.
4. Объедините четыре структуры через `Schema.Union` в `BookingCommandSchema`.
5. Получите TypeScript-тип через `Schema.Schema.Type<typeof BookingCommandSchema>` либо проверьте, что результат schema совместим с существующим `BookingCommand`.
6. В `decodeBookingCommand` вызовите `Schema.decodeUnknown(BookingCommandSchema)(input)`.
7. Преобразуйте `ParseError` в уже существующий `InvalidCommand` через `Effect.mapError`.

Документация для этого этапа:

- [Schema: Getting Started — decodeUnknown](https://effect.website/docs/schema/getting-started/)
- [Schema: Basic Usage — Struct, Literal и Union](https://effect.website/docs/schema/basic-usage/)
- [Schema: Filters — дополнительные инварианты](https://effect.website/docs/schema/filters/)

### Проверка

Сначала запустите только этот этап:

```bash
npm run check:1
```

Затем подтвердите, что starter по-прежнему собирается:

```bash
npm run build
npm test
```

Check должен принять корректную `hold`-команду и отклонить пустой список, duplicate seat, неположительный или строковый срок и некорректную `confirm`-команду.

### Ручная контрольная точка

Ответьте своими словами:

1. Почему `input as BookingCommand` ничего не проверяет в runtime?
2. В какой строке вашей реализации заканчивается `unknown`?
3. Чем Type schema отличается от Encoded schema в этом этапе? Если они совпадают, почему transformation не нужна?

> [!tip]- Подсказка 1: концепция
> `Schema.Struct` проверяет форму объекта, `Schema.filter` добавляет правило к уже распознанному значению, а `Schema.decodeUnknown` исполняет parser и возвращает `Effect`.

> [!tip]- Подсказка 2: структура
> Соберите `StatusCommandSchema`, `HoldCommandSchema`, `ConfirmCommandSchema` и `CancelCommandSchema`, затем объедините их. Для `seats` нужны два независимых filter: `length > 0` и `new Set(seats).size === seats.length`.

> [!tip]- Подсказка 3: форма Effect
> Decoder уже возвращает `Effect<BookingCommand, ParseError>`. Не оборачивайте его в `Effect.try`: используйте `.pipe(Effect.mapError(...))`, чтобы заменить только тип ожидаемой ошибки.

> [!warning]- Полная реализация — открыть после попытки
> Замените участок от первого import до `decodeBookingCommand` включительно. Остальную часть `src/domain.ts` оставьте без изменений.
>
> ```typescript
> import { Data, Effect, Schema } from "effect";
>
> export type SeatId = string;
> export type ReservationId = string;
> export type AidId = string;
>
> const NonEmptyString = Schema.String.pipe(
>   Schema.filter(
>     (value) => value.length > 0 || "Expected a non-empty string",
>   ),
> );
>
> const PositiveNumber = Schema.Number.pipe(
>   Schema.filter(
>     (value) =>
>       (Number.isFinite(value) && value > 0) ||
>       "Expected a positive finite number",
>   ),
> );
>
> const UniqueNonEmptySeats = Schema.Array(Schema.String).pipe(
>   Schema.filter(
>     (seats) => seats.length > 0 || "Expected at least one seat",
>   ),
>   Schema.filter(
>     (seats) =>
>       new Set(seats).size === seats.length ||
>       "Expected unique seat ids",
>   ),
> );
>
> export const BookingCommandSchema = Schema.Union(
>   Schema.Struct({ type: Schema.Literal("status") }),
>   Schema.Struct({
>     type: Schema.Literal("hold"),
>     seats: UniqueNonEmptySeats,
>     durationMs: PositiveNumber,
>   }),
>   Schema.Struct({
>     type: Schema.Literal("confirm"),
>     reservationId: NonEmptyString,
>     amount: PositiveNumber,
>   }),
>   Schema.Struct({
>     type: Schema.Literal("cancel"),
>     reservationId: NonEmptyString,
>   }),
> );
>
> export type BookingCommand = Schema.Schema.Type<
>   typeof BookingCommandSchema
> >;
>
> export class InvalidCommand extends Data.TaggedError("InvalidCommand")<{
>   readonly message: string;
>   readonly cause?: unknown;
> }> {}
>
> export const decodeBookingCommand = (
>   input: unknown,
> ): Effect.Effect<BookingCommand, InvalidCommand> =>
>   Schema.decodeUnknown(BookingCommandSchema)(input).pipe(
>     Effect.mapError(
>       (cause) =>
>         new InvalidCommand({
>           message: "Cannot decode booking command",
>           cause,
>         }),
>     ),
>   );
> ```
>
> Здесь `Schema.filter` закрепляет правила, которые нельзя выразить одной формой `Struct`. `decodeUnknown` уже помещает `ParseError` в канал `E`, поэтому `mapError` сохраняет ожидаемую ошибку и не превращает невалидный input в defect.

## Этап 2. Actionable typed errors

### Результат

Конфликт мест возвращает `SeatUnavailable` в `E`. Он не становится defect и не превращается в неструктурированный `Error`. Вызывающий может обработать только этот вариант через `catchTag`, не скрывая остальные ошибки.

Сохраните отдельные ветки:

- `SeatUnavailable`;
- `AidUnavailable`;
- `ReservationNotFound`;
- `PaymentDeclined`.

Внутреннее нарушение инварианта, на которое вызывающий не способен осмысленно отреагировать, не добавляйте в публичный union только ради компиляции.

### Проверка

```bash
npm run check:2
```

Команда cumulative: она повторно запускает Schema checks, затем проверяет typed conflict и точечный recovery.

### Ручная контрольная точка

Объясните для каждого error tag:

- кто его ловит;
- какое полезное действие выполняет;
- почему тот же handler не должен ловить остальные ошибки.

Затем временно замените typed failure на defect, наблюдайте отличие в check и верните корректную реализацию.

> [!tip]- Подсказка 1: вопрос к error
> Для каждого варианта спросите: «кто и как будет это ловить?».

> [!tip]- Подсказка 2: место дефекта
> В starter конфликт обнаруживается в `holdSeats`, но завершается не через typed channel.

> [!tip]- Подсказка 3: проверка модели
> `Effect.either` работает с ожидаемым `E`; defect остаётся в `Cause` и не превращается автоматически в `Left`.

## Этап 3. Services и Layer

### Результат

Booking workflow получает время, ID и оплату через Effect environment:

- `ReservationRepository`;
- `ReservationClock`;
- `ReservationIdGenerator`;
- `PaymentGateway`.

`createHold` использует подставленные clock и ID. `confirmReservation` сначала вызывает payment service и переводит reservation в `confirmed` только после успешной оплаты. Один workflow запускается с Live и Test layers без условных веток внутри use case.

### Проверка

```bash
npm run check:3
```

Check подставляет фиксированные время и ID, затем заменяет payment implementation на отказ. При отказе место остаётся `held`, а не `booked`.

### Ручная контрольная точка

До `provide` прочитайте итоговый тип программы вслух: что находится в `A`, какие варианты остаются в `E`, какие services остаются в `R`. После `provide` подтвердите, что runnable program имеет `R = never`.

> [!tip]- Подсказка 1: dependency graph
> Глобальный вызов внутри use case скрывает зависимость. Запрос service через environment делает её частью `R`.

> [!tip]- Подсказка 2: зона изменения
> Сравните источники `reservationId`, `expiresAt` и результата оплаты в `src/booking.ts` с уже объявленными contracts в `src/services.ts`.

## Этап 4. Scope и lifetime временного hold

### Результат

Временное удержание освобождается:

- после failure в use-зоне;
- после interruption;
- после истечения deadline.

Подтверждённая reservation не освобождается finalizer-ом. Expiration fiber не переживает scope, которому принадлежит hold.

Сохраните публичные функции `withTemporaryHold` и `openTimedHold`; исправьте их lifetime semantics, а не call sites checks.

### Проверка

```bash
npm run check:4
```

Check наблюдает состояние во время hold и после failure, interruption и deadline.

### Ручная контрольная точка

Перед реализацией предскажите порядок `acquire`, `use`, interruption и `release`. После реализации временно запишите finalizer events в массив и подтвердите, что release выполняется ровно один раз. Удалите диагностику.

> [!tip]- Подсказка 1: invariant lifetime
> Освобождение должно зависеть от завершения scope, а не от того, дошёл ли happy path до последней строки.

> [!tip]- Подсказка 2: подходящие primitives
> Для ограниченной use-зоны сопоставьте контракт с `acquireUseRelease`. Для фонового expiration свяжите fiber с текущим `Scope`, а не запускайте detached work.

## Этап 5. Queue, Deferred, PubSub и Semaphore

### Результат

`makeBookingProcessor` становится scoped processor:

- bounded `Queue` принимает requests и задаёт backpressure;
- worker fibers принадлежат processor scope;
- `Deferred` связывает каждый request с его единственным outcome;
- `PubSub` доставляет booking events всем активным subscribers;
- `Semaphore` ограничивает одновременные вызовы `PaymentGateway`;
- закрытие scope прерывает workers и не оставляет ожидающие fibers без завершения.

Сохраните публичный контракт `BookingProcessor`. Не заменяйте очередь одним `Effect.all` над входным массивом: тогда нет живого producer/consumer boundary и backpressure.

### Проверка

```bash
npm run check:5
```

Check отправляет четыре независимых request конкурентно, разрешает трёх workers, но требует не более двух одновременных оплат. Два subscribers должны получить тот же порядок событий, что хранит processor event log.

### Ручная контрольная точка

Установите `workerCount = 1` и `queueCapacity = 1`. Заблокируйте payment service управляемым Effect. Предскажите состояние первого, второго и третьего `submit`, затем подтвердите, где именно producer приостанавливается. После проверки удалите временный сценарий.

> [!tip]- Подсказка
> Разделите responsibilities: очередь переносит request, одноразовый reply channel возвращает outcome конкретному caller, broadcast channel размножает event, а permit ограничивает только критическую внешнюю операцию.

## Этап 6. STM и атомарное состояние

### Результат

Repository сохраняет инварианты в одной STM transaction:

- конкурентные holds одного места дают ровно один успех;
- группа мест удерживается целиком либо не изменяет состояние;
- `confirm`, `release` и hold не видят промежуточное состояние;
- `waitAndHoldSeats` приостанавливается через transactional retry и продолжает работу после освобождения места.

Не закрывайте race process-local mutex вокруг всей программы: цель этапа — выразить read/check/write invariant как transaction над transactional state.

### Проверка

```bash
npm run check:6
```

Check запускает конфликтующие fibers, проверяет all-or-none group hold и отличает ожидание через retry от немедленного failure.

### Диагностическая контрольная точка

До исправления объясните конкретный interleaving starter-а:

1. какие значения читают два fiber-а;
2. где каждый делает вывод «место доступно»;
3. почему атомарный отдельный `Ref.update` не исправляет составной `read → check → write`;
4. какая часть должна войти в одну transaction.

После исправления повторите объяснение через transaction retry/commit, не через фразу «STM предотвращает race».

> [!tip]- Подсказка
> Transaction должна прочитать state, проверить все ресурсы и записать новое состояние как одно целое. Используйте retry только для операции с семантикой ожидания; обычный `holdSeats` по-прежнему должен вернуть actionable conflict.

## Независимый transfer. Составной accessibility resource

### Результат

`holdAccessible` атомарно удерживает:

```text
одно или несколько мест + hearing aid
```

Если устройство уже занято, операция не оставляет частично удержанные места и не создаёт reservation. Механизм тот же, но transaction затрагивает две коллекции ресурсов.

Подсказок для transfer нет. Сначала сформулируйте общий invariant без слов `seat` и `aid`, затем самостоятельно выберите transaction boundary.

### Проверка

```bash
npm run check:transfer
```

После transfer выполните полный набор:

```bash
npm run check
npm run lint
npm run build
npm run smoke
```

## Финальная самопроверка

Проект подтверждает самостоятельное выполнение только если вы можете без algorithm-level hints:

- объяснить encoded и decoded стороны команды;
- прочитать итоговый `Effect<A, E, R>` основного workflow;
- обосновать каждый public error tag реакцией caller-а;
- показать release при failure и interruption;
- объяснить backpressure на конкретном состоянии очереди;
- доказать верхнюю границу payment concurrency наблюдением;
- восстановить interleaving double booking;
- перенести atomic invariant на составной resource.

Passing checks после раскрытия подробной подсказки фиксирует guided practice, но не самостоятельное mastery. Для mastery повторите соответствующий check позднее без подсказки и выполните transfer.

## Следующая итерация

После самостоятельного transfer и изучения mentor lessons 9–12 переходите к [Operations & Delivery](guides/iteration-2-operations.md). Вторая итерация сохраняет booking core и добавляет Stream, Request batching, Cache, Schedule, CLI, HttpApi, SSE и общий ManagedRuntime.

## Sources

- [Effect documentation](https://effect.website/docs/)
- [Effect Schema](https://effect.website/docs/schema/introduction/)
- [Effect Concurrency](https://effect.website/docs/concurrency/basic-concurrency/)
- [Effect STM API](https://effect-ts.github.io/effect/effect/STM.ts.html)


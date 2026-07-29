# Order Catalog Enricher на Effect 4

Этот guided project учит связывать три механизма в одном небольшом backend job: ленивый `Stream` получает страницы строк заказа, `Stream.mapEffect` создаёт ограниченный concurrent demand, а `RequestResolver` объединяет отдельные запросы товаров в вызовы bulk Catalog API.

Starter полностью работает. Он намеренно загружает все страницы заранее, обрабатывает строки последовательно и вызывает Catalog API по одному товару. Каждый этап сохраняет итоговый результат, но меняет наблюдаемый способ исполнения.

<a id="toc"></a>
## Оглавление

- [Результат обучения](#learning-outcome)
- [Почему именно такой scope](#scope)
- [Предварительные знания и источники](#prerequisites)
- [Что starter уже делает](#baseline)
- [Карта файлов и точек изменения](#project-map)
- [Поток данных](#data-flow)
- [Команды и рабочий цикл](#workflow)
- [Этап 1. Ленивый paginated Stream](#milestone-1)
- [Этап 2. Bounded concurrent enrichment](#milestone-2)
- [Этап 3. RequestResolver вместо N+1](#milestone-3)
- [Независимый transfer. Carrier loader без Stream](#transfer)
- [Финальная самопроверка](#self-check)
- [Источники](#sources)

<a id="learning-outcome"></a>
## Результат обучения

После завершения проекта вы сможете провести одну строку заказа по цепочке:

```text
page cursor
→ OrderFeed.fetchPage
→ Stream<OrderLine>
→ concurrency slot
→ GetProduct request
→ RequestResolver batch
→ CatalogGateway.getMany
→ EnrichedOrderLine
```

Наблюдаемое итоговое поведение:

1. частичный consumer не загружает ненужные страницы;
2. одновременно выполняется не больше четырёх product lookups;
3. публичный вызов по-прежнему запрашивает один `productId`;
4. resolver вызывает bulk API для нескольких запросов;
5. batch никогда не содержит больше четырёх entries;
6. каждая entry получает собственный `Product` или `ProductNotFound`;
7. выход сохраняет порядок строк заказа.

Нужно уметь отдельно назвать три границы:

- **page boundary** задаёт, какие элементы источник получает одним вызовом;
- **concurrency window** задаёт, сколько effects может продвигаться одновременно;
- **request batch boundary** задаёт, какие requests resolver обслужит одним bulk-вызовом.

Это разные механизмы. Совпадение их размеров в одном сценарии не делает их одной границей.

> [!info] Evidence
> Прохождение check после открытия полной реализации считается supported practice. Независимое evidence дают повторная реализация без spoiler, объяснение пути request entry и финальный transfer.

[К оглавлению](#toc)

<a id="scope"></a>
## Почему именно такой scope

`projects/guided/notification-batch-dispatcher` уже показывает **явный batching**: `Stream.grouped` превращает несколько значений в один array до внешнего вызова.

В этом проекте изучается **demand batching**:

```text
caller просит Product
→ runtime собирает одновременно возникшие GetProduct
→ RequestResolver вызывает getMany
→ caller получает один Product
```

Вызывающий код не видит array и не обязан знать, сколько соседних requests попало в тот же batch.

Проект намеренно не содержит:

- HTTP server и реальную базу данных;
- `Queue`, `PubSub`, `Semaphore` и STM;
- retry, timeout и `Schedule`;
- TTL cache и `RequestResolver.withCache`;
- UI или transport adapters.

Эти механизмы создадут дополнительные learning units и скроют вопрос: как page demand превращается в concurrent requests, а requests — в resolver batch.

[К оглавлению](#toc)

<a id="prerequisites"></a>
## Предварительные знания и источники

Нужно уметь читать:

- `Effect<A, E, R>`;
- `Effect.gen` и `yield*`;
- tagged errors;
- Effect service в `R` и предоставление через `Layer`;
- `Stream.mapEffect` как effectful transformation.

Не требуется заранее уметь:

- писать `RequestResolver`;
- работать с `Request.Entry`;
- управлять fibers вручную;
- реализовывать собственный scheduler;
- знать внутреннее устройство `Channel`.

Локальные материалы ментора:

- lesson 6 — fibers, `Effect.all` и bounded concurrency;
- lesson 9 — pull-based `Stream`, `mapEffect` и backpressure;
- lesson 10 — `Request`, `RequestResolver`, batch boundaries и N+1.

### Как использовать EffectPatterns

EffectPatterns установлен на Effect 3.19.19. Используйте его для формы паттерна и вопроса, который паттерн решает, но сверяйте API с Effect 4.

Важные расхождения для этого проекта:

- EffectPatterns использует `Stream.paginateEffect`; в Effect 4 функция называется `Stream.paginate`;
- Effect 4 `Stream.runCollect` возвращает `Array`, а не `Chunk`;
- Effect 4 `RequestResolver.make` получает `Request.Entry`, и каждую entry необходимо завершить;
- пример `schema/async-validation/batched-async` не используется: показанный там batch service фактически не вызывается и не является образцом `RequestResolver` batching.

Версионный источник проекта — `effect@4.0.0-beta.101`, а не непроверенный snippet.

[К оглавлению](#toc)

<a id="baseline"></a>
## Что starter уже делает

Starter не содержит `TODO`, пустых handlers или `throw new Error("TODO")`.

`runOrderExport`:

1. получает `OrderFeed` и `CatalogLoader` из Effect environment;
2. вызывает `makeOrderLineStream`;
3. передаёт элементы в `enrichOrderLines`;
4. собирает результат через `Stream.runCollect`.

### Baseline источника

`makeOrderLineStream` выполняет imperative loop:

```text
page-1 → page-2 → page-3 → Array<OrderLine> → Stream
```

Все страницы загружаются до первого элемента downstream. Для полного consumer результат корректен. Для `take(3)` работа лишняя: вторая и третья страницы уже запрошены.

### Baseline enrichment

`enrichOrderLines` использует:

```text
Stream.mapEffect(..., { concurrency: 1 })
```

`CatalogLoader.get` возвращает Effect и имитирует async I/O, но следующий lookup не стартует до завершения предыдущего.

### Baseline resolver

`makeProductResolver` использует `RequestResolver.fromEffect`. Для каждой entry он вызывает:

```text
CatalogGateway.getOne(productId)
```

Девять строк дают девять внешних вызовов. `GetProduct` и публичный `CatalogLoader.get` уже существуют, поэтому этап 3 меняет resolver, а не весь application workflow.

### Запуск baseline

```bash
pnpm run smoke
```

Ожидаемая форма лога:

```text
feed fetched page-1
feed fetched page-2
feed fetched page-3
catalog getOne product-1
...
catalog getOne product-9
order export completed: 9 enriched lines
```

Порядок timestamps и fiber IDs не является контрактом.

[К оглавлению](#toc)

<a id="project-map"></a>
## Карта файлов и точек изменения

```text
src/
├── domain.ts          # OrderLine, Product, EnrichedOrderLine, typed errors
├── services.ts        # OrderFeed, CatalogGateway и demo layers
├── catalog-loader.ts  # GetProduct, resolver и CatalogLoader
├── pipeline.ts        # pagination и concurrent enrichment
├── transfer.ts        # независимый Carrier transfer
└── index.ts           # готовый smoke scenario

checks/
├── support.ts
├── starter.test.ts
├── milestone-1-pagination.test.ts
├── milestone-2-concurrency.test.ts
├── milestone-3-request-batching.test.ts
└── transfer.test.ts
```

| Этап | Редактировать | Публичный symbol | Обычно не менять |
|---|---|---|---|
| 1 | `src/pipeline.ts` | `makeOrderLineStream` | services, domain, checks |
| 2 | `src/pipeline.ts` | `enrichOrderLines` | pagination и loader |
| 3 | `src/catalog-loader.ts` | `makeProductResolver` | `GetProduct`, `CatalogLoader.get`, pipeline |
| Transfer | `src/transfer.ts` | `enrichShipments` и локальные helpers рядом | основные этапы и checks |

`checks/**` наблюдает только публичное поведение: page calls, активные lookups, single/bulk gateway calls, результаты и ошибки. Не меняйте checks, чтобы сделать их зелёными.

`package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`, `src/index.ts`, `src/domain.ts` и `src/services.ts` — supporting scaffold. Они обычно остаются неизменными.

[К оглавлению](#toc)

<a id="data-flow"></a>
## Поток данных

```mermaid
flowchart LR
    Cursor[Page cursor] --> Feed[OrderFeed.fetchPage]
    Feed --> Source[Stream OrderLine]
    Source --> Concurrent[mapEffect concurrency 4]
    Concurrent --> Request[GetProduct]
    Request --> Resolver[RequestResolver batchN 4]
    Resolver --> Bulk[CatalogGateway.getMany]
    Bulk --> Complete[complete each Entry]
    Complete --> Output[EnrichedOrderLine]
```

Responsibilities:

- `OrderFeed` знает, как получить одну страницу;
- `Stream.paginate` владеет переходом между cursors;
- `Stream.mapEffect` владеет числом concurrent lookups;
- `GetProduct` описывает один логический запрос;
- `RequestResolver` владеет batching и completion;
- `CatalogGateway` владеет внешним I/O;
- `runOrderExport` связывает готовые части, но не реализует их заново.

[К оглавлению](#toc)

<a id="workflow"></a>
## Команды и рабочий цикл

Установка выполняется только внутри standalone project:

```bash
cd projects/guided/order-catalog-enricher
pnpm install
```

Baseline-команды должны проходить до и после каждого этапа:

```bash
pnpm run build
pnpm run lint
pnpm test
pnpm run smoke
```

Targeted checks:

```bash
pnpm run check:1
pnpm run check:2
pnpm run check:3
pnpm run check:transfer
pnpm run check
```

`check:2` включает starter и этап 1. `check:3` включает все основные этапы. Поэтому новый этап не должен ломать уже доказанные свойства.

Рабочий цикл этапа:

1. прочитайте `Что уже есть` и контракт поведения;
2. предскажите наблюдаемый failure baseline;
3. запустите targeted check;
4. измените только названный symbol;
5. повторите cumulative check;
6. ответьте на reasoning checkpoint;
7. открывайте подсказки по одной;
8. после полной реализации позднее повторите symbol без guide.

[К оглавлению](#toc)

<a id="milestone-1"></a>
## Этап 1. Ленивый paginated Stream

### Результат

`makeOrderLineStream` запрашивает страницу только тогда, когда downstream требует следующие элементы.

### Зачем

Imperative `fetchAll` смешивает две обязанности:

- переходить между cursors;
- накапливать весь результат в памяти.

Pull-based stream может сохранить pagination state и отдавать страницу по demand. Если consumer прекращает чтение, следующие страницы не запрашиваются.

### Где работать

Редактируйте только:

```text
src/pipeline.ts → makeOrderLineStream
```

После изменения удалите неиспользуемый `Option` из import. Не меняйте `OrderFeed`, page fixtures, `runOrderExport` и checks.

### Что уже есть

Baseline создаёт `Array<OrderLine>`, мутирует локальный `cursor` и завершает loop только после последней страницы. `Stream.fromIterableEffect` начинает эмитить элементы после завершения всего Effect.

### Что изменить

Постройте stream через Effect 4 `Stream.paginate`.

Контракт:

- начальный state равен `FIRST_PAGE_CURSOR`;
- один шаг вызывает `feed.fetchPage(cursor)` ровно один раз;
- элементы шага равны `page.lines`;
- следующий state равен `page.nextCursor`;
- `Option.none()` завершает stream после текущей страницы;
- `OrderFeedError` остаётся в `E`;
- порядок строк и страниц сохраняется.

Для fixtures первая страница содержит четыре строки. Consumer `take(3)` должен вызвать только `page-1`.

### Шаги реализации

1. Замените весь imperative body `makeOrderLineStream`.
2. Передайте `FIRST_PAGE_CURSOR` первым аргументом `Stream.paginate`.
3. Callback получает текущий cursor и возвращает `feed.fetchPage(cursor)`.
4. Через `Effect.map` преобразуйте `OrderPage` в tuple:

   ```text
   [ReadonlyArray<OrderLine>, Option<string>]
   ```

5. Зафиксируйте tuple через `as const`, чтобы TypeScript сохранил его форму.
6. Удалите `Option` из верхнего import: он больше не используется напрямую.
7. Не вызывайте `Stream.runCollect` внутри source constructor.

Полезный внешний паттерн:

- [EffectPatterns: Turn a Paginated API into a Single Stream](https://github.com/PaulJPhilp/EffectPatterns/blob/main/content/published/patterns/building-data-pipelines/stream-from-paginated-api.mdx)
- [Effect 4 `Stream.paginate` declaration](https://unpkg.com/effect@4.0.0-beta.101/dist/Stream.d.ts)

> [!warning]
> В EffectPatterns используется Effect 3 `Stream.paginateEffect`. Не копируйте имя функции и работу с `Chunk`: в этом проекте нужны Effect 4 `Stream.paginate` и `ReadonlyArray`.

### Проверка

Сначала запустите:

```bash
pnpm run check:1
```

Check доказывает два поведения:

1. `take(3)` возвращает первые три строки и фиксирует только вызов `page-1`;
2. полный consumer возвращает девять строк и фиксирует cursors `page-1`, `page-2`, `page-3` ровно по одному разу.

Baseline падает по первой причине: он вызывает все три страницы до emission.

### Reasoning checkpoint

До реализации предскажите:

```text
take(3) → какие cursors вызваны?
runCollect → какие cursors вызваны?
```

После проверки объясните:

1. Почему stream остаётся lazy, хотя `feed.fetchPage` является готовым Effect?
2. Кто решает запросить следующую страницу: `OrderFeed`, `Stream.paginate` или downstream?
3. Почему `Option.none()` не выбрасывает элементы последней страницы?

> [!tip]- Подсказка 1: концепция
> State pagination — это cursor. Один pull-step должен вернуть элементы текущей страницы и optional state следующего шага.

> [!tip]- Подсказка 2: место
> Вся eager-семантика находится внутри `makeOrderLineStream`: локальный array и `while` заставляют Effect завершить все fetches до emission.

> [!tip]- Подсказка 3: форма
> ```text
> Stream.paginate(initialCursor, cursor =>
>   fetchPage(cursor)
>     → [page.lines, page.nextCursor]
> )
> ```

> [!example]- Полная реализация — открыть после попытки
> Измените import и замените только `makeOrderLineStream`:
>
> ```typescript
> import { Effect, Stream } from "effect";
> ```
>
> ```typescript
> export const makeOrderLineStream = (
>   feed: OrderFeedShape,
> ): Stream.Stream<OrderLine, OrderFeedError> =>
>   Stream.paginate(FIRST_PAGE_CURSOR, (cursor) =>
>     feed.fetchPage(cursor).pipe(
>       Effect.map((page) => [page.lines, page.nextCursor] as const),
>     ),
>   );
> ```
>
> `Stream.paginate` хранит cursor внутри stream execution, а не в заранее выполненном loop. Tuple разделяет emitted values и optional next state. `feed.fetchPage` остаётся единственным владельцем получения страницы и её typed error.

[К оглавлению](#toc)

<a id="milestone-2"></a>
## Этап 2. Bounded concurrent enrichment

### Результат

`enrichOrderLines` держит не больше четырёх product lookups в работе и сохраняет входной порядок результата.

### Зачем

Асинхронность и concurrency отвечают на разные вопросы:

- async Effect способен приостановиться на I/O, не блокируя JavaScript thread;
- concurrency определяет, сколько независимых Effects runtime продвигает одновременно.

Baseline `get` уже async, но `concurrency: 1` ожидает каждый результат перед стартом следующего lookup.

### Где работать

Редактируйте только:

```text
src/pipeline.ts → enrichOrderLines
```

Сохраните реализацию этапа 1. Не добавляйте `Effect.all`, ручные fibers, `Semaphore`, promises или `unordered`.

### Что уже есть

`Stream.mapEffect` уже:

1. получает одну `OrderLine`;
2. вызывает `loader.get(productId)`;
3. строит `EnrichedOrderLine`;
4. сохраняет `CatalogError` в error channel.

Единственная отсутствующая семантика — требуемая concurrency boundary.

### Что изменить

Установите `concurrency: 4` в существующем `Stream.mapEffect`.

Контракт:

- первые четыре lookups могут стартовать до завершения любого из них;
- пятый не стартует, пока занят каждый из четырёх slots;
- `maxActive` равен четырём;
- число slots не зависит от числа страниц;
- output остаётся в порядке `OrderLine`;
- `unordered` остаётся выключенным;
- типы ошибок не меняются.

### Шаги реализации

1. Найдите options единственного `Stream.mapEffect` в `enrichOrderLines`.
2. Измените значение `concurrency` с `1` на `4`.
3. Не переносите лимит в `CatalogGateway`: gateway не должен знать размер pipeline window.
4. Не меняйте `lineTotalCents` и mapping результата.
5. Запустите cumulative check.

Полезный паттерн:

- [EffectPatterns: Process Items Concurrently](https://github.com/PaulJPhilp/EffectPatterns/blob/main/content/published/patterns/building-data-pipelines/stream-process-concurrently.mdx)
- [Effect 4 `Stream.mapEffect` declaration](https://unpkg.com/effect@4.0.0-beta.101/dist/Stream.d.ts)

### Проверка

```bash
pnpm run check:2
```

Check использует общий закрытый gate:

1. запускает stream в child fiber;
2. позволяет lookup effects дойти до gate;
3. до открытия gate наблюдает started IDs;
4. требует ровно `product-1` … `product-4`;
5. подтверждает, что `product-5` ещё не стартовал;
6. открывает gate и проверяет итоговый порядок.

Это проверка состояния, а не сравнение случайных wall-clock durations.

### Reasoning checkpoint

До изменения заполните timeline:

```text
concurrency 1: start p1 → ...
concurrency 4: start p1, p2, p3, p4 → ...
```

После проверки объясните:

1. Почему baseline был async при `concurrency: 1`?
2. Какое новое свойство добавляет число `4`?
3. Почему стабильный output order не означает последовательное выполнение gateway calls?
4. Где возникает backpressure, когда все четыре slots заняты?

> [!tip]- Подсказка 1: концепция
> `mapEffect` владеет запуском effectful transformation для каждого элемента. Поэтому лимит относится к options этого оператора.

> [!tip]- Подсказка 2: место
> Не меняйте callback. Нужное значение уже находится рядом с ним в `{ concurrency: 1 }`.

> [!tip]- Подсказка 3: граница
> Четыре slots означают «не больше четырёх in-flight effects», а не «разбить весь вход на постоянные массивы по четыре».

> [!example]- Полная реализация — открыть после попытки
> Замените только `enrichOrderLines`:
>
> ```typescript
> export const enrichOrderLines = <E, R>(
>   source: Stream.Stream<OrderLine, E, R>,
>   loader: CatalogLoaderShape,
> ): Stream.Stream<EnrichedOrderLine, E | CatalogError, R> =>
>   source.pipe(
>     Stream.mapEffect(
>       (line) =>
>         loader.get(line.productId).pipe(
>           Effect.map((product): EnrichedOrderLine => ({
>             ...line,
>             product,
>             lineTotalCents: product.priceCents * line.quantity,
>           })),
>         ),
>       { concurrency: 4 },
>     ),
>   );
> ```
>
> Ограничение находится у оператора, который планирует product lookups. Отсутствие `unordered: true` сохраняет исходный порядок emission, даже если отдельные Effects завершаются в другом порядке.

[К оглавлению](#toc)

<a id="milestone-3"></a>
## Этап 3. RequestResolver вместо N+1

### Результат

`CatalogLoader.get(productId)` по-прежнему выглядит как единичный lookup, но concurrent `GetProduct` requests обслуживаются через `CatalogGateway.getMany` batches размером не больше четырёх.

### Зачем

Concurrency сама по себе не устраняет N+1. После этапа 2 девять `getOne` выполняются быстрее, но внешних вызовов по-прежнему девять.

`Request` разделяет:

- **описание demand** — какой `Product` нужен caller;
- **исполнение demand** — как resolver объединит requests и получит данные.

Resolver обязан завершить каждую принятую entry. `return products` из resolver callback недостаточно: waiting fiber связан со своей `Request.Entry`.

### Где работать

Редактируйте:

```text
src/catalog-loader.ts → makeProductResolver
```

Также добавьте runtime import `ProductNotFound` из `domain.ts`.

Не меняйте:

- interface и constructor `GetProduct`;
- `CatalogLoaderShape`;
- `makeCatalogLoader`;
- `CatalogLoaderLive`;
- `enrichOrderLines`;
- gateway contracts и checks.

### Что уже есть

`GetProduct` уже содержит:

```text
success: Product
error: CatalogError
field: productId
```

`makeCatalogLoader` уже вызывает:

```typescript
Effect.request(GetProduct({ productId }), resolver)
```

Baseline resolver использует `RequestResolver.fromEffect` и для каждой entry делегирует `gateway.getOne`.

### Что изменить

Соберите batched resolver через `RequestResolver.make` и ограничьте его `RequestResolver.batchN(4)`.

Для каждого вызова resolver:

1. извлеките `productId` всех entries;
2. один раз вызовите `gateway.getMany(productIds)`;
3. для каждой исходной entry найдите соответствующий `Product`;
4. завершите найденный product через `Request.completeEffect(entry, Effect.succeed(product))`;
5. завершите отсутствие через `ProductNotFound`;
6. не завершайте одну entry результатом соседнего request.

Контракт:

- `getOne` не вызывается;
- один bulk batch содержит максимум четыре IDs;
- все IDs доходят до gateway ровно один раз в fixtures без дубликатов;
- request неизвестного товара завершается `ProductNotFound`;
- `CatalogGateway.getMany` failure остаётся typed failure resolver-а;
- output основного pipeline совпадает с baseline.

### Важная граница наблюдения

`batchN(4)` задаёт **верхнюю границу**, а не обещает, что каждый runtime batch обязательно будет заполнен до четырёх.

В end-to-end Stream на фактический batch влияют:

- сколько `mapEffect` slots свободно;
- когда downstream запросил следующую страницу;
- какие requests успели дойти до resolver collection point.

Поэтому integration check требует:

```text
single calls = 0
каждый bulk batch <= 4
все product IDs присутствуют ровно один раз
bulk calls меньше 9
```

Отдельный resolver-сценарий создаёт девять requests через `Effect.forEach(..., { concurrency: "unbounded" })`. Там check наблюдает детерминированные batches `4, 4, 1` и доказывает именно `batchN(4)`.

### Шаги реализации

1. Получите `CatalogGateway` один раз при создании resolver-а.
2. Замените `RequestResolver.fromEffect` на `RequestResolver.make<GetProduct>`.
3. Callback `make` получает `entries`, а не один request.
4. Постройте `productIds` в порядке entries.
5. Выполните один `gateway.getMany(productIds)`.
6. Пройдите по исходным entries.
7. Завершите каждую entry через `Request.completeEffect`.
8. После `RequestResolver.make(...)` примените `.pipe(RequestResolver.batchN(4))`.
9. Не добавляйте cache: одинаковые IDs и reuse результатов не входят в этот этап.

Источники:

- mentor lesson 10: `Request`, `RequestResolver`, batching;
- [Effect 4 `RequestResolver.make` и `batchN`](https://unpkg.com/effect@4.0.0-beta.101/dist/RequestResolver.d.ts);
- [Effect 4 `Request.completeEffect`](https://unpkg.com/effect@4.0.0-beta.101/dist/Request.d.ts).

Для сравнения, но не как решение:

- [EffectPatterns: Process Items in Batches](https://github.com/PaulJPhilp/EffectPatterns/blob/main/content/published/patterns/building-data-pipelines/stream-process-in-batches.mdx).

`Stream.grouped` изменил бы публичную единицу pipeline на array. `RequestResolver` сохраняет единичный `CatalogLoader.get(productId)`.

### Проверка

```bash
pnpm run check:3
```

Check ловит следующие правдоподобные ошибки:

- оставлен `fromEffect` и девять `getOne`;
- вызван `getMany`, но не применён `batchN(4)`;
- resolver завершил не каждую entry;
- products сопоставлены entries по неправильному ID;
- отсутствующий product завершён success или defect вместо `ProductNotFound`.

### Reasoning checkpoint

Нарисуйте путь `product-6`:

```text
OrderLine
→ loader.get("product-6")
→ GetProduct
→ Request.Entry
→ resolver batch
→ getMany result map
→ completeEffect(entry, ...)
→ waiting mapEffect fiber
```

Затем объясните:

1. Почему `concurrency: 4` необходимо для появления нескольких одновременных requests?
2. Почему concurrency не равна batching?
3. Почему `return product` из callback resolver-а не завершает entry?
4. Почему `batchN(4)` — maximum, а не minimum batch size?
5. Чем это отличается от `Stream.grouped(4)`?

> [!tip]- Подсказка 1: концепция
> `Request` описывает один demand. Resolver получает несколько `Request.Entry` и обязан доставить отдельный `Exit` каждой waiting fiber.

> [!tip]- Подсказка 2: место
> Публичный `CatalogLoader.get` уже использует `Effect.request`. N+1 находится только в `makeProductResolver`, где каждая entry вызывает `getOne`.

> [!tip]- Подсказка 3: форма
> ```text
> entries
>   → ids
>   → gateway.getMany(ids)
>   → for each entry:
>       lookup by entry.request.productId
>       completeEffect(entry, succeed | ProductNotFound)
> resolver → batchN(4)
> ```

> [!example]- Полная реализация — открыть после попытки
> Добавьте `ProductNotFound` к import из `domain.ts`:
>
> ```typescript
> import {
>   ProductNotFound,
>   type CatalogError,
>   type Product,
> } from "./domain.js";
> ```
>
> Замените только `makeProductResolver`:
>
> ```typescript
> export const makeProductResolver = Effect.gen(function* () {
>   const gateway = yield* CatalogGateway;
>
>   return RequestResolver.make<GetProduct>(
>     Effect.fnUntraced(function* (entries) {
>       const productIds = entries.map((entry) => entry.request.productId);
>       const products = yield* gateway.getMany(productIds);
>
>       for (const entry of entries) {
>         const productId = entry.request.productId;
>         const product = products.get(productId);
>         yield* Request.completeEffect(
>           entry,
>           product === undefined
>             ? Effect.fail(new ProductNotFound({ productId }))
>             : Effect.succeed(product),
>         );
>       }
>     }),
>   ).pipe(RequestResolver.batchN(4));
> });
> ```
>
> `getMany` выполняется один раз на runtime batch. Lookup выполняется по ID самой entry, поэтому порядок ответа backend-а не используется как скрытая гарантия. `completeEffect` доставляет каждой waiting fiber её собственный success или typed failure.

[К оглавлению](#toc)

<a id="transfer"></a>
## Независимый transfer. Carrier loader без Stream

### Результат

`enrichShipments` получает обычный `ReadonlyArray<Shipment>`, но использует demand batching для Carrier API:

```text
7 shipments
→ Effect.forEach concurrency 3
→ GetCarrier requests
→ resolver batches max 3
→ CarrierGateway.getMany
→ 7 EnrichedShipment в исходном порядке
```

### Где работать

Редактируйте:

```text
src/transfer.ts → enrichShipments
```

Локальный request constructor и resolver helpers можно объявить непосредственно над функцией. Не меняйте `CarrierGatewayShape`, основные pipeline files и `checks/transfer.test.ts`.

### Что уже есть

Baseline выполняет семь последовательных `gateway.getOne` и корректно возвращает enriched shipments.

### Что изменить

Контракт:

- определить request одного carrier lookup;
- success request равен `Carrier`;
- typed error равен `CarrierNotFound`;
- resolver вызывает `gateway.getMany`;
- максимальный batch size равен трём;
- `Effect.forEach` создаёт concurrent demand с лимитом три;
- `getOne` не вызывается;
- семь fixtures дают bulk batches `3, 3, 1`;
- отсутствующая carrier entry завершается `CarrierNotFound`;
- результат сохраняет порядок shipments.

### Шаги реализации

1. Сформулируйте тип request и его data field без копирования names из product domain.
2. Соберите один resolver на время выполнения `enrichShipments`.
3. В resolver выполните один bulk lookup на полученные entries и завершите каждую entry.
4. Ограничьте resolver batch размером три.
5. Запустите единичные requests через `Effect.forEach` с concurrency три.
6. Преобразуйте каждый success в `EnrichedShipment`.
7. Проверьте call trace и объясните каждую boundary.

Здесь намеренно меняются:

- domain: product → carrier;
- source representation: `Stream` → `ReadonlyArray`;
- concurrent combinator: `Stream.mapEffect` → `Effect.forEach`.

Механизм `Request` / `RequestResolver` должен сохраниться.

### Проверка

```bash
pnpm run check:transfer
```

Check требует:

```text
single calls: []
bulk calls: [3, 3, 1]
output order: shipment-1 ... shipment-7
carrier mapping: carrier-1 ... carrier-7
```

Это independent transfer. Полной реализации, pseudocode-callout и algorithm-level подсказок здесь нет. Используйте только публичные contracts файла, знания из этапа 3 и официальные Effect 4 declarations.

### Reasoning checkpoint

После прохождения объясните:

1. Где возникает concurrency без `Stream`?
2. Какая часть кода формирует demand, а какая исполняет batch?
3. Почему `Effect.forEach` не обязан принимать arrays по три?
4. Как waiting shipment получает именно своего carrier?

[К оглавлению](#toc)

<a id="self-check"></a>
## Финальная самопроверка

Запустите:

```bash
pnpm run build
pnpm run lint
pnpm run check
pnpm run smoke
```

Затем без кода объясните:

```text
почему take(3) не вызывает page-2
почему async get при concurrency 1 остаётся последовательным
почему concurrency 4 не гарантирует batch size 4
почему RequestResolver должен завершать Entry
почему Stream.grouped и RequestResolver решают разные задачи
```

Проект даёт independent evidence только если:

- transfer выполнен без готовой реализации;
- вы можете проследить одну request entry от caller до completion;
- можете предсказать верхние границы page calls, in-flight effects и batch size;
- не объясняете batching фразой «Effect сам оптимизировал запросы» без указания resolver boundary.

Если был открыт milestone spoiler, завершите этап, затем повторите соответствующий symbol через несколько дней без guide. Сам факт зелёного check после копирования — практика, но не evidence самостоятельного владения.

[К оглавлению](#toc)

<a id="sources"></a>
## Источники

### Локальные материалы

- `/home/vyacheslav/Documents/bat-effect/6` — fibers и concurrency;
- `/home/vyacheslav/Documents/bat-effect/9` — `Stream`, pull и `mapEffect`;
- `/home/vyacheslav/Documents/bat-effect/10` — `Request` и batching.

### EffectPatterns

- [Turn a Paginated API into a Single Stream](https://github.com/PaulJPhilp/EffectPatterns/blob/main/content/published/patterns/building-data-pipelines/stream-from-paginated-api.mdx)
- [Process Items Concurrently](https://github.com/PaulJPhilp/EffectPatterns/blob/main/content/published/patterns/building-data-pipelines/stream-process-concurrently.mdx)
- [Process Items in Batches](https://github.com/PaulJPhilp/EffectPatterns/blob/main/content/published/patterns/building-data-pipelines/stream-process-in-batches.mdx)

### Версионные первичные источники

- [`effect@4.0.0-beta.101`](https://www.npmjs.com/package/effect/v/4.0.0-beta.101)
- [Effect 4 `Stream.d.ts`](https://unpkg.com/effect@4.0.0-beta.101/dist/Stream.d.ts)
- [Effect 4 `Request.d.ts`](https://unpkg.com/effect@4.0.0-beta.101/dist/Request.d.ts)
- [Effect 4 `RequestResolver.d.ts`](https://unpkg.com/effect@4.0.0-beta.101/dist/RequestResolver.d.ts)
- [`@effect/vitest@4.0.0-beta.101`](https://www.npmjs.com/package/@effect/vitest/v/4.0.0-beta.101)

[К оглавлению](#toc)

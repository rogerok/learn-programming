---
tags: [architecture, client-server, http, networking, exercises]
aliases: [Практика пути HTTPS-запроса]
---

# Упражнения: путь HTTPS-запроса

[[../../MOC|К карте архитектуры]] · [[01-client-server-request-lifecycle|К главе]]

Целевая способность: по URL, client trace и server-side evidence восстановить фактический path, назвать last confirmed boundary и выбрать следующий probe. Задания идут от prediction к самостоятельной реализации и incident diagnosis. Готовых решений нет.

## 1. Predict: сравнить fresh и reused path

**Результат обучения:** вы предсказываете не один заученный pipeline, а фактически необходимые этапы для заданных условий.

Рассмотрите URL:

```text
https://shop.example/orders/42?view=full#payment
```

До запуска инструментов заполните таблицу для четырёх случаев:

| Случай | Нужен network request? | Нужен новый DNS lookup? | Нужен новый transport connection? | Нужен новый TLS handshake? | Может ли application handler не запуститься? |
|---|---|---|---|---|---|
| A. Fresh navigation, caches пусты | … | … | … | … | … |
| B. Response пригоден в browser cache | … | … | … | … | … |
| C. Connection к origin уже открыт и пригоден для reuse | … | … | … | … | … |
| D. Service worker возвращает local response | … | … | … | … | … |

Для каждой ячейки укажите не только `да/нет`, но и условие, от которого зависит ответ. Затем:

1. выпишите origin;
2. укажите default remote port;
3. объясните судьбу fragment;
4. нарисуйте fresh path от browser до application через reverse proxy;
5. отдельно подпишите два transport connections при TLS termination на proxy.

**Критерий проверки:** DNS, connection и TLS показаны как переиспользуемое состояние, а не как безусловные действия каждого request. Local response не требует выдуманного обращения к application.

**Evidence rubric:**

- обязательный механизм — output каждого этапа является prerequisite следующего;
- supporting evidence — для каждого пропущенного этапа названа cache/reuse boundary;
- признак заблуждения — один и тот же полный pipeline для всех четырёх случаев.

> [!tip]- Подсказка 1: что именно переиспользуется
> Отдельно рассматривайте cached content, DNS result и открытое connection. Это три разных вида state.

> [!tip]- Подсказка 2: две линии
> DNS query идёт к resolver. HTTP request после установки channel идёт к edge. Не объединяйте эти стрелки.

## 2. Explain: доказать path через DevTools и curl

**Результат обучения:** вы связываете каждое утверждение с наблюдением конкретного инструмента и не выходите за его visibility boundary.

### Часть A. Chrome DevTools

1. Откройте **Network**.
2. Включите **Preserve log** и **Disable cache**.
3. Очистите log и откройте `https://example.com/`.
4. Выберите request типа `document`.
5. Сохраните Headers и Timing.

Заполните evidence ledger:

| Claim | DevTools field | Observed value | Что доказано | Что не доказано |
|---|---|---|---|---|
| Browser адресовал resource | Request URL | … | … | … |
| Browser подключался к endpoint | Remote Address | … | … | … |
| Получен HTTP response | Status Code | … | … | … |
| Было ожидание до first byte | Waiting (TTFB) | … | … | … |
| Body читался отдельно | Content Download | … | … | … |

Сделайте второй reload. Объясните отсутствие или изменение DNS Lookup и Initial connection, не используя фразу «browser пропустил сеть» без evidence.

### Часть B. curl

Выполните:

```bash
curl --http1.1 --verbose --output /dev/null https://example.com/
```

И затем:

```bash
curl --http1.1 --silent --show-error --output /dev/null \
  --write-out 'dns=%{time_namelookup}\ntcp=%{time_connect}\ntls=%{time_appconnect}\nttfb=%{time_starttransfer}\ntotal=%{time_total}\nremote=%{remote_ip}:%{remote_port}\nstatus=%{http_code}\n' \
  https://example.com/
```

Из собственного output извлеките:

- выбранный IP:port;
- подтверждение transport connection;
- подтверждение certificate verification;
- negotiated HTTP version;
- request line;
- response status;
- пять cumulative timestamps.

Вычислите интервалы TCP, TLS, ожидания first byte и download вычитанием соседних timestamps. Не называйте интервал `ttfb - tls` чистым временем handler.

**Критерий проверки:** минимум шесть claims привязаны к строкам текущего trace; для каждого claim названа одна недоказанная гипотеза.

**Evidence rubric:**

- обязательный механизм — event trace и cumulative timing интерпретируются раздельно;
- supporting evidence — сохранены command, дата и raw fragments;
- признак заблуждения — Remote Address объявлен IP application host без проверки architecture.

> [!tip]- Подсказка 1: last confirmed boundary
> Для каждой строки завершите две фразы: «после неё известно…» и «после неё всё ещё неизвестно…».

> [!tip]- Подсказка 2: TTFB
> Между TLS completion и first response byte помещаются request transfer, latency, edge work, upstream work и начало response transfer.

## 3. Modify: разделить time to first byte и download

**Результат обучения:** вы меняете поведение HTTP server и предсказываете, какой участок client timing изменится.

Сохраните следующий starter как `server.mjs`:

> [!example]- `server.mjs`
> ```javascript
> import { createServer } from "node:http";
>
> const server = createServer((request, response) => {
>   if (request.method === "GET" && request.url === "/fast") {
>     response.writeHead(200, {
>       "content-type": "text/plain; charset=utf-8",
>     });
>     response.end("fast\n");
>     return;
>   }
>
>   response.writeHead(404, {
>     "content-type": "text/plain; charset=utf-8",
>   });
>   response.end("not found\n");
> });
>
> server.listen(3000, "127.0.0.1", () => {
>   console.log("http://127.0.0.1:3000");
> });
> ```

Убедитесь, что `/fast` отвечает сразу. Затем сохраните его поведение и добавьте два route:

- `/slow-header` — server ждёт не менее `700 ms` до отправки status/headers, затем сразу завершает небольшой body;
- `/slow-body` — server немедленно отправляет status/headers и первый chunk body, ждёт не менее `700 ms`, затем отправляет последний chunk и завершает response.

Не блокируйте event loop busy loop. Задержка должна позволять server обслуживать другие requests.

Проверьте каждый route:

```bash
curl --silent --output /dev/null \
  --write-out 'start=%{time_starttransfer} total=%{time_total}\n' \
  http://127.0.0.1:3000/fast
```

Повторите для `/slow-header` и `/slow-body`.

**Observable contract:**

- `/slow-header`: `time_starttransfer` и `time_total` увеличиваются минимум примерно на `0.6 s` относительно `/fast`;
- `/slow-body`: `time_starttransfer` остаётся близким к `/fast`, а `time_total` увеличивается минимум примерно на `0.6 s`;
- server остаётся responsive: пока открыт один slow request, отдельный `/fast` завершается без ожидания его timer.

**Критерий проверки:** изменение до headers отражается в TTFB, изменение между chunks — преимущественно в download/total. Проверка опирается на behavior, а не на чтение source.

> [!tip]- Подсказка 1: граница response
> First byte появляется после записи status/headers. Complete response появляется только после завершения body.

> [!tip]- Подсказка 2: non-blocking delay
> Нужен timer, который планирует продолжение позже, а не цикл, занимающий thread.

> [!tip]- Подсказка 3: форма стратегии
> Для slow body response можно записать начало, запланировать последний chunk и только затем завершить response.

## 4. Implement: сделать границу reverse proxy наблюдаемой

**Результат обучения:** вы реализуете два независимых HTTP hops и доказываете, какой process сформировал response.

Создайте два Node processes без Express/Fastify:

```text
curl client
→ proxy.mjs  127.0.0.1:3000
→ app.mjs    127.0.0.1:3001
```

### Контракт `app.mjs`

- принимает любой `GET`;
- логирует `request:start` с `x-request-id`, method и target;
- возвращает `200` JSON и тот же `x-request-id` в response header;
- завершает response.

### Контракт `proxy.mjs`

- принимает request на port `3000`;
- использует входящий `x-request-id` или создаёт новый;
- создаёт отдельный upstream HTTP request к `127.0.0.1:3001` с тем же method и target;
- передаёт `x-request-id` upstream;
- streams upstream status, headers и body обратно client;
- при невозможности открыть upstream connection возвращает собственный `502` JSON;
- логирует отдельно downstream request, upstream outcome и downstream response.

Не используйте framework, готовый proxy package или in-process вызов функции app handler.

### Checks

При запущенных app и proxy:

```bash
curl --silent --show-error --dump-header - \
  http://127.0.0.1:3000/orders/42?view=full
```

Должны наблюдаться:

- status `200`;
- один `x-request-id` в client response;
- тот же ID в proxy и app logs;
- разные transport peers/ports на двух hops.

Затем остановите только `app.mjs` и повторите request:

```bash
curl --silent --show-error --output /dev/null \
  --write-out 'status=%{http_code}\n' \
  http://127.0.0.1:3000/orders/42
```

Ожидается `status=502`; новый app log отсутствует, proxy log фиксирует upstream connection error и собственный response.

**Критерий проверки:** failure upstream не маскируется под application `500`, client status связан с proxy log, а два hops существуют физически как отдельные connections.

> [!tip]- Подсказка 1: Node API boundary
> Один `http.Server` принимает downstream request. Для upstream нужен отдельный `http.request()` или эквивалентный Node core client.

> [!tip]- Подсказка 2: streams
> Incoming request и upstream response уже являются streams. Не обязательно буферизовать body целиком для proxying.

> [!tip]- Подсказка 3: error path
> Upstream object должен иметь error handler, который формирует `502`, только если downstream response ещё можно начать.

## 5. Diagnose: найти last confirmed boundary

**Результат обучения:** вы локализуете incident до изменения timeout, retry или configuration.

Для каждого случая заполните таблицу:

| Incident | Last confirmed boundary | First unconfirmed boundary | Две совместимые причины | Probe, который их различит |
|---|---|---|---|---|
| `Could not resolve host: api.example` | … | … | … | … |
| DNS возвращает IP, затем `Connection refused` | … | … | … | … |
| TCP connection есть, certificate hostname mismatch | … | … | … | … |
| DevTools показывает `403`, response header указывает CDN | … | … | … | … |
| `502`, proxy log содержит upstream connect error | … | … | … | … |
| `504`, application start log с тем же request ID существует | … | … | … | … |
| `500`, request ID отсутствует во всех application logs | … | … | … | … |
| `200`, Content Download оборван | … | … | … | … |
| API вернул данные curl, browser не отдаёт response JavaScript | … | … | … | … |

Ограничения:

- не используйте `server down` как самостоятельную причину;
- не увеличивайте timeout до локализации;
- не включайте retry для non-idempotent operation;
- каждый probe должен наблюдать одну boundary и различать минимум две гипотезы.

**Критерий проверки:** status code не используется для угадывания producer без correlation evidence; browser policy incident отделён от network/server outcome.

**Evidence rubric:**

- обязательный механизм — last confirmed и first unconfirmed events названы отдельно;
- supporting evidence — probe обращён к resolver, transport, TLS, edge или application в соответствии с гипотезой;
- признак заблуждения — одинаковый probe или root cause для всех incidents.

> [!tip]- Подсказка 1: двигайтесь слева направо
> Не спрашивайте сначала «что сломалось?». Спросите «какое событие точно успело произойти?».

## 6. Transfer: восстановить production request path

**Результат обучения:** вы переносите модель с учебного localhost на production architecture без превращения всех компонентов в один `server`.

Выберите знакомый product scenario: checkout, загрузка profile, выдача catalog или создание support ticket. Постройте incident-ready схему:

```text
Browser
→ DNS
→ CDN/WAF
→ load balancer или reverse proxy
→ application instance
→ database/cache/external API
→ response path
```

Для каждого hop заполните boundary card:

```text
Role toward previous participant:
Role toward next participant:
Address or logical target:
Protocol visible here:
Can terminate request without forwarding?:
Evidence emitted:
Timeout owner:
Failure seen by previous participant:
```

Затем разберите три изменения:

1. CDN отвечает из cache и application log пуст.
2. TLS завершается на edge, upstream использует отдельное TLS connection.
3. Application commit завершён, но client не получил response.

Объясните схему без заметок. Проверяющий может в любой момент спросить: «Какое evidence это доказывает?». Исправления после вопроса запишите отдельно: они показывают границы, которые пока не извлекаются автоматически.

**Критерий проверки:** на схеме видны отдельные roles, connections и producers response; timeout не превращён в confirmed failure, а Remote Address не объявлен application machine без evidence.

**Evidence rubric:**

- обязательный механизм — один component может быть server downstream и client upstream;
- supporting evidence — минимум один correlation ID проходит через edge и application;
- признак заблуждения — единая стрелка `frontend → backend` без DNS, security, transport и proxy boundaries.

## Критерий завершения практики

Независимое evidence получено, если без раскрытых подсказок вы можете:

- предсказать fresh, cached и reused paths;
- связать DevTools/curl fields с конкретными boundaries;
- наблюдаемо разделить TTFB и body download;
- провести request через два Node HTTP hops и получить proxy-generated `502` при недоступном upstream;
- диагностировать incidents методом last confirmed boundary;
- перенести модель на production scenario и защитить каждый вывод evidence.

Запишите commands, raw output, найденные ошибки и открытые подсказки. Passing behavior после Hint 3 — практика с высокой поддержкой; для independent evidence повторите Diagnose или Transfer позже без подсказок.

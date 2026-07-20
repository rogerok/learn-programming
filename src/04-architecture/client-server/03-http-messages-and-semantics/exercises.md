---
tags: [architecture, client-server, http, networking, exercises]
aliases: [Практика HTTP messages и semantics]
---

# Упражнения: HTTP messages и semantics

[[../../MOC|К карте архитектуры]] · [[03-http-messages-and-semantics|К главе]]

> [!info] Контракт практики
> Целевая способность: по raw exchange и client/server evidence разобрать HTTP message, выбрать method/status/fields, предсказать redirect и conditional behavior и отделить HTTP outcome от transport failure. Выполняйте этапы по порядку. Записывайте commands, raw output, найденные defects и открытые подсказки. Passing behavior после Hint 3 полезен для обучения, но independent evidence требует повторить Diagnose или Transfer позже без подсказок.

## Общие правила evidence

Для каждого ответа укажите:

1. **observation** — конкретную line, field, status или API value;
2. **interpretation** — какой HTTP fact из этого следует;
3. **boundary** — что observation не доказывает;
4. **next action** — что должен сделать client/server или какой probe нужен дальше.

Не засчитываются формулировки «request успешен», «API упал» или «неверный header» без названного layer и evidence.

## 1. Predict: предскажите parsing и client behavior

Сначала ответьте без запуска code. Затем проверьте спорные случаи через Node.js или `curl`.

### 1.1. Anatomy

Дан request:

```http
PUT /profiles/7?notify=false HTTP/1.1
Host: api.example.test
Accept: application/json
Content-Type: application/json
Content-Length: 14
If-Match: "v3"

{"name":"Ada"}
```

Предскажите:

1. method, request target и protocol version;
2. authority, path и query; присутствует ли fragment;
3. какие fields описывают request content, response preference и precondition;
4. сколько octets ожидает recipient после пустой строки;
5. какой outcome возможен при current ETag `"v4"`;
6. станет ли `PUT` non-idempotent из-за `notify=false` в query.

### 1.2. Status и Fetch

Для каждого observation предскажите:

| Observation | Promise fulfilled/rejected | `response.ok` | Есть ли final HTTP response | Следующее действие |
|---|---|---|---|---|
| `fetch()` получил `204` | ? | ? | ? | ? |
| `fetch()` получил `404` JSON | ? | ? | ? | ? |
| `fetch()` получил `500` HTML | ? | ? | ? | ? |
| connection закрыта до status | ? | отсутствует? | ? | ? |
| request заблокирован browser policy | ? | отсутствует? | ? | ? |

Объясните, почему `await response.json()` отдельно может reject даже после fulfilled `fetch()`.

### 1.3. Safe и idempotent

Предскажите intended effect двух identical requests:

1. `GET /reports/7` записывает access log;
2. `GET /reports/7?do=delete` реально удаляет report;
3. `PUT /profiles/7` дважды задаёт один representation;
4. `DELETE /profiles/7` первый раз возвращает `204`, второй — `404`;
5. `POST /emails` дважды отправляет письмо;
6. `POST /imports` использует application-level deduplication key.

Для каждого отделите property **standard method** от property конкретной **operation**.

### 1.4. Redirect

Исходный request — `POST /orders` с JSON body. Server возвращает один из codes с `Location: /orders/8472`:

- `302`;
- `303`;
- `307`;
- `308`.

Предскажите method и body следующего automatic request. Где behavior допускает client-specific historical choice, а где method preservation обязателен?

### Evidence rubric

- **Passing:** все части message названы; `404/500` не смешаны с rejection; safe/idempotent объяснены через semantics, а не одинаковый output; redirects различены.
- **Признак заблуждения:** `Content-Length` считают JavaScript character count, `Content-Type` называют preference response, либо `DELETE` считают non-idempotent из-за разных statuses.

> [!tip]- Подсказка 1: разные contracts
> `fetch()` сообщает доступность `Response`; `Response.ok` классифицирует `2xx`; decoder вроде `.json()` проверяет representation отдельно.

> [!tip]- Подсказка 2: intended effect
> Сравнивайте requested final state, а не logs, timestamps или status каждого attempt.

## 2. Explain: докажите semantics по raw exchange

Дан transcript:

```http
POST /documents HTTP/1.1
Host: api.example.test
Content-Type: text/markdown; charset=utf-8
Accept: application/json
Content-Length: 9

# Chapter
```

```http
HTTP/1.1 303 See Other
Location: /documents/91
Content-Length: 0
```

```http
GET /documents/91 HTTP/1.1
Host: api.example.test
Accept: application/json
If-None-Match: "doc-91-v1"
```

```http
HTTP/1.1 304 Not Modified
ETag: "doc-91-v1"
```

Объясните последовательность как state machine:

1. что описывают `Content-Type` и `Accept` в первом request;
2. почему `201` мог бы быть допустимым, но `303` задаёт дополнительное client action;
3. почему следующий request — `GET`, а не повтор `POST`;
4. откуда client получает representation после `304`;
5. почему `304` без stored response недостаточен;
6. какие четыре messages видны, а какие transport events не показаны.

Нарисуйте таблицу:

| Message | Control data | Fields | Content | Client/server transition |
|---|---|---|---|---|

> [!question] Контроль переноса
> Если заменить `303` на `307`, какие две строки state machine изменятся и почему?

### Evidence rubric

Passing explanation связывает каждое решение с concrete code/field, не объявляет `304` «пустым 200» и не выводит transport version второго hop из semantics первого.

## 3. Modify: исправьте неоднозначный API exchange

Команда создаёт user:

```http
POST /users HTTP/1.1
Host: api.example.test
Content-Type: text/plain
Accept: application/json

{"email":"ada@example.test"}
```

Server отвечает:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"error":"wrong format"}
```

### Задание A: unsupported media type

Измените exchange так, чтобы client и generic tooling однозначно увидели:

- request действительно содержит JSON;
- response preference — JSON;
- unsupported request format даёт HTTP outcome, а не success envelope;
- framing content однозначен.

Запишите corrected request и response. Обоснуйте `400` против `415`.

### Задание B: creation outcomes

Спроектируйте три distinct responses:

1. user создан немедленно и доступен по `/users/91`;
2. request принят в queue, но user ещё не создан;
3. request успешно обработан, но server намеренно не отправляет content.

Для каждого выберите status, обязательные для вашего contract fields и body/no-body. Объясните различия `201`, `202`, `204`.

### Задание C: concurrent update

Добавьте update `PUT /users/91` с `If-Match`. Покажите два responses:

- validator совпал;
- validator устарел.

Не превращайте lost update в `500` и не сообщайте success envelope через `200`.

### Проверка через `curl`

После реализации следующего этапа сохраните request/response headers:

```bash
curl --http1.1 --include \
  --header 'Accept: application/json' \
  http://127.0.0.1:3000/users/91
```

`--include` показывает status-line и response headers. Для raw client/server bytes используйте `--verbose`, помня, что `curl` formatting — observation tool, а не literal packet capture.

## 4. Implement: semantic HTTP server

Создайте `semantic-server.mjs` без framework dependencies. Используйте `node:http`, чтобы упражнение проверяло HTTP behavior, а не manual parser edge cases.

### Startup contract

```bash
node semantic-server.mjs
```

После `listen` process обязан вывести ровно одну JSON line:

```json
{"event":"listening","port":3000}
```

Используйте ephemeral port (`listen(0, "127.0.0.1")`), поэтому реальное число определяется OS. Не печатайте другие values в stdout; diagnostics можно писать в stderr.

### Resource model

Server хранит in-memory document:

```javascript
{
  id: "42",
  title: "HTTP boundaries",
  version: 1
}
```

Current validator: quoted entity-tag `"doc-42-v<version>"`, например `"doc-42-v1"`.

### Endpoint contract

#### `GET /documents/42`

- при `Accept: application/json` или `Accept: */*` вернуть `200`;
- `Content-Type: application/json; charset=utf-8`;
- current `ETag`;
- JSON representation `{ id, title, version }`;
- при exact matching `If-None-Match` вернуть `304`, current `ETag` и **без content**;
- при `Accept: text/csv` вернуть `406 Not Acceptable` с JSON problem representation.

#### `PUT /documents/42`

- принимать только `Content-Type: application/json` с optional parameters;
- body должен быть JSON object с non-empty string `title`;
- missing/unsupported media type → `415 Unsupported Media Type`;
- malformed JSON или invalid shape → `400 Bad Request`;
- missing `If-Match` → `428 Precondition Required`;
- stale `If-Match` → `412 Precondition Failed` и current `ETag`;
- matching `If-Match` → заменить title, увеличить version и вернуть `200` с new representation и new `ETag`.

#### `POST /documents`

- те же `Content-Type` и body rules;
- создать логический document result и вернуть `303 See Other`;
- `Location: /documents/42`;
- response без content.

POST не обязан изменять in-memory document в этом упражнении: проверяется redirect semantics, а не persistence model.

#### Остальные cases

- unknown path → `404 Not Found` с JSON problem;
- known path с unsupported method → `405 Method Not Allowed` и `Allow`;
- все JSON responses имеют корректный `Content-Type`;
- server не возвращает `200` с `{ error: ... }` для protocol errors;
- graceful shutdown по `SIGTERM`.

### Response problem shape

```json
{
  "error": "short stable description"
}
```

Text может отличаться; checker проверяет status, fields и parseable JSON, а не exact prose.

### Behavioral checker

Сохраните рядом `check-semantic-server.mjs`. Checker запускает implementation как black box и не читает source.

> [!example]- `check-semantic-server.mjs`
> ```javascript
> import assert from "node:assert/strict";
> import { spawn } from "node:child_process";
> import { once } from "node:events";
>
> const child = spawn(process.execPath, ["semantic-server.mjs"], {
>   stdio: ["ignore", "pipe", "pipe"],
> });
> child.stdout.setEncoding("utf8");
> child.stderr.setEncoding("utf8");
>
> let stdout = "";
> let stderr = "";
> child.stdout.on("data", (chunk) => { stdout += chunk; });
> child.stderr.on("data", (chunk) => { stderr += chunk; });
>
> const listening = await new Promise((resolve, reject) => {
>   const timeout = setTimeout(() => {
>     child.kill("SIGKILL");
>     reject(new Error("startup timeout"));
>   }, 2_000);
>   child.once("exit", (code) => {
>     clearTimeout(timeout);
>     reject(new Error(`server exited ${code}: ${stderr}`));
>   });
>   child.stdout.on("data", () => {
>     if (!stdout.includes("\n")) return;
>     const line = stdout.slice(0, stdout.indexOf("\n")).trim();
>     if (line === "") return;
>     clearTimeout(timeout);
>     try {
>       resolve(JSON.parse(line));
>     } catch (error) {
>       child.kill("SIGKILL");
>       reject(new Error(`invalid startup JSON: ${error.message}`));
>     }
>   });
> });
>
> assert.equal(listening.event, "listening");
> assert.equal(Number.isInteger(listening.port), true);
> const base = `http://127.0.0.1:${listening.port}`;
>
> const json = async (response) => {
>   assert.match(response.headers.get("content-type") ?? "", /^application\/json\b/i);
>   return response.json();
> };
>
> try {
>   const initial = await fetch(`${base}/documents/42`, {
>     headers: { Accept: "application/json" },
>   });
>   assert.equal(initial.status, 200);
>   assert.deepEqual(await json(initial), {
>     id: "42", title: "HTTP boundaries", version: 1,
>   });
>   const etag1 = initial.headers.get("etag");
>   assert.equal(etag1, '"doc-42-v1"');
>
>   const notModified = await fetch(`${base}/documents/42`, {
>     headers: { Accept: "application/json", "If-None-Match": etag1 },
>   });
>   assert.equal(notModified.status, 304);
>   assert.equal(notModified.headers.get("etag"), etag1);
>   assert.equal(await notModified.text(), "");
>
>   const unacceptable = await fetch(`${base}/documents/42`, {
>     headers: { Accept: "text/csv" },
>   });
>   assert.equal(unacceptable.status, 406);
>   assert.equal(typeof (await json(unacceptable)).error, "string");
>
>   const wrongType = await fetch(`${base}/documents/42`, {
>     method: "PUT",
>     headers: { "Content-Type": "text/plain", "If-Match": etag1 },
>     body: JSON.stringify({ title: "Changed" }),
>   });
>   assert.equal(wrongType.status, 415);
>   await json(wrongType);
>
>   const missingPrecondition = await fetch(`${base}/documents/42`, {
>     method: "PUT",
>     headers: { "Content-Type": "application/json" },
>     body: JSON.stringify({ title: "Changed" }),
>   });
>   assert.equal(missingPrecondition.status, 428);
>   await json(missingPrecondition);
>
>   const stale = await fetch(`${base}/documents/42`, {
>     method: "PUT",
>     headers: {
>       "Content-Type": "application/json",
>       "If-Match": '"doc-42-v0"',
>     },
>     body: JSON.stringify({ title: "Changed" }),
>   });
>   assert.equal(stale.status, 412);
>   assert.equal(stale.headers.get("etag"), etag1);
>   await json(stale);
>
>   const updated = await fetch(`${base}/documents/42`, {
>     method: "PUT",
>     headers: { "Content-Type": "application/json", "If-Match": etag1 },
>     body: JSON.stringify({ title: "Updated" }),
>   });
>   assert.equal(updated.status, 200);
>   assert.deepEqual(await json(updated), {
>     id: "42", title: "Updated", version: 2,
>   });
>   assert.equal(updated.headers.get("etag"), '"doc-42-v2"');
>
>   const redirected = await fetch(`${base}/documents`, {
>     method: "POST",
>     redirect: "manual",
>     headers: { "Content-Type": "application/json" },
>     body: JSON.stringify({ title: "New" }),
>   });
>   assert.equal(redirected.status, 303);
>   assert.equal(redirected.headers.get("location"), "/documents/42");
>   assert.equal(await redirected.text(), "");
>
>   const missing = await fetch(`${base}/missing`);
>   assert.equal(missing.status, 404);
>   assert.equal(missing.ok, false);
>   await json(missing);
>
>   const methodNotAllowed = await fetch(`${base}/documents/42`, {
>     method: "DELETE",
>   });
>   assert.equal(methodNotAllowed.status, 405);
>   assert.match(methodNotAllowed.headers.get("allow") ?? "", /GET/);
>   assert.match(methodNotAllowed.headers.get("allow") ?? "", /PUT/);
>   await json(methodNotAllowed);
>
>   console.log("semantic server checks: PASS");
> } finally {
>   child.kill("SIGTERM");
>   await Promise.race([
>     once(child, "exit"),
>     new Promise((_, reject) => {
>       const timer = setTimeout(() => reject(new Error("shutdown timeout")), 2_000);
>       timer.unref();
>     }),
>   ]);
> }
> ```

Запуск:

```bash
node check-semantic-server.mjs
```

**Критерий проверки:** output `semantic server checks: PASS`; checker различает `200/304/406/412/415/428`, проверяет no-content responses, ETag transition, redirect без auto-follow, `404` как fulfilled Fetch response и `405 Allow`.

> [!tip]- Подсказка 1: response helpers
> Сделайте маленькие helpers `sendJson(response, status, value, fields)` и `sendEmpty(response, status, fields)`. `Content-Length` для JSON считайте через `Buffer.byteLength(serialized)`.

> [!tip]- Подсказка 2: media type parameters
> Для сравнения `Content-Type` отделите часть до `;`, trim и приведите к lowercase. Не сравнивайте всю строку с literal `application/json`.

> [!tip]- Подсказка 3: порядок preconditions
> Сначала подтвердите route/method/media type/body shape, затем требуйте `If-Match`, сравните current ETag и только после этого меняйте state.

## 5. Diagnose: найдите last confirmed HTTP boundary

Для каждого incident заполните:

| Incident | Last confirmed boundary | HTTP response есть? | Root cause доказана? | Следующий probe/fix |
|---|---|---|---|---|

### A. Fulfilled error response

```text
fetch fulfilled
response.status = 500
response.ok = false
content-type = text/html
response.json() -> SyntaxError
```

Отделите server-reported `500` от decoder failure. Что нужно логировать до parsing body?

### B. Client-side timeout

```text
AbortError: This operation was aborted
DevTools: no Status Code
server log: request.start id=abc
server log: request.complete id=abc status=201
```

Можно ли утверждать, что operation не выполнена? Почему новый `POST` опасен? Retry policy пока не проектируйте — назовите только uncertainty.

### C. Gateway outcome

```http
HTTP/1.1 504 Gateway Timeout
Via: 1.1 edge.example
Content-Type: application/problem+json

{"title":"upstream timeout"}
```

Чем это evidence отличается от browser timeout без response? Какая boundary reported failure?

### D. Content negotiation defect

```http
GET /report HTTP/1.1
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: text/html

<html>...</html>
```

Какие варианты допустимы по contract: обработать HTML, считать server contract defect, запросить другой representation, получить `406`? Почему `Accept` не является абсолютной transport guarantee?

### E. Redirect confusion

```text
curl -i POST /orders -> 302 Location: /login
browser final panel -> 200 GET /login
```

Почему два tools показывают разные statuses? Какие настройки redirect-follow нужно проверить? Сколько requests фактически могло быть?

### Критерий завершения

Диагноз принят, если он:

- не выводит root cause только из class status;
- отделяет response acquisition, status interpretation и content decoding;
- называет конкретный hop для `504`;
- не предлагает automatic retry unsafe operation без знания outcome.

## 6. Transfer: спроектируйте semantics для другого домена

Сценарий — image conversion API:

```text
POST /conversions
GET /conversions/{id}
PUT /profiles/{id}
GET /images/{id}
```

### Требования

1. Conversion может длиться минуты.
2. Client отправляет `image/png` и хочет metadata как JSON.
3. Polling resource сначала сообщает `queued`, затем `done`.
4. Image representation имеет ETag и может быть large.
5. Profile update нельзя применять поверх stale version.
6. Старый endpoint `/jobs/{id}` переезжает, но существующий `POST` нельзя превращать в `GET`.

### Спроектируйте

- method, target и request/response `Content-Type`/`Accept` для создания conversion;
- `202` response с URI status resource;
- outcomes polling для queued/done/missing;
- conditional `GET` image через `If-None-Match`;
- conditional `PUT` profile через `If-Match` и `412`;
- status для unsupported input image media type;
- redirect code, сохраняющий method и body при temporary migration;
- Fetch handling, которое отдельно проверяет `ok` и media type до decoder.

Создайте decision table:

| Operation | Method | Safe | Idempotent | Success status | Relevant fields | Failure status |
|---|---|---:|---:|---:|---|---:|

### Transfer evidence

Решение достаточно, если другой разработчик может составить raw messages без устного уточнения, а automated client способен различить accepted, completed, stale, unsupported и missing outcomes только по HTTP contract.

## Журнал evidence

Заполните после работы:

```text
Date:
Predict corrections:
Raw exchange explained:
Modified contract:
Implementation command/output:
Checker result:
Diagnosed incidents:
Transfer artifact:
Hints opened:
Remaining uncertainty:
Next cold review date:
```

## Related Topics

- [[03-http-messages-and-semantics|HTTP messages и semantics]] — source chapter.
- [[../02-dns-tcp-tls/exercises|Практика DNS, TCP и TLS]] — предыдущие transport/security boundaries.
- `04-browser-state-and-security.md` — browser policy, credentials и CORS failures.
- `05-http-caching.md` — полноценная freshness/validation model.
- `06-reliable-client-server-interaction.md` — retry после ambiguous outcome.

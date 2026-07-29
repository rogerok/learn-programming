---
tags: [architecture, client-server, browser, cookies, cors, csrf, security, exercises]
aliases: [Практика browser state и security]
---

# Упражнения: browser state и security

[[../../MOC|К карте архитектуры]] · [[04-browser-state-and-security|К главе]]

> [!info] Контракт практики
> Целевая способность: по page/request context и HTTP evidence независимо восстановить cookie selection, CORS/preflight, server authentication/authorization и CSRF decision. Выполняйте этапы по порядку. Сохраняйте Network screenshots/exports, raw headers, server logs, corrections и открытые подсказки. Passing после Hint 3 — supported practice; independent evidence требует повторить Diagnose или Transfer без подсказок.

## Evidence model

Каждый диагноз должен содержать:

```text
Page origin:
Request URL/origin:
Same-origin? Same-site?:
Preflight sent/result:
Actual request sent?:
Cookie selected/sent?:
Server outcome/side effect?:
Response exposed to script?:
Evidence:
Unknowns:
Next probe/fix:
```

Не используйте «CORS не пускает», пока не определили, какой request реально дошёл и был ли side effect.

## 1. Predict: разделите origin, site, cookie и read policy

### 1.1. Origin/site matrix

Для page `https://app.example.com/dashboard` классифицируйте targets:

1. `https://app.example.com/api`;
2. `https://app.example.com:8443/api`;
3. `https://api.example.com/profile`;
4. `http://api.example.com/profile`;
5. `https://example.net/profile`.

Заполните:

| Target | Same origin | Schemeful same-site | Нужен CORS для Fetch read | `SameSite=Strict` potentially eligible |
|---|---:|---:|---:|---:|

Не выводите cookie send только из последнего столбца: ещё нужны Domain/Path/Secure/credentials/privacy checks.

### 1.2. Cookie selection

Response `https://api.example.com/login` установил:

```http
Set-Cookie: __Host-session=abc; Path=/; Secure; HttpOnly; SameSite=Lax
```

Предскажите send/read для:

1. `document.cookie` на `https://api.example.com`;
2. same-origin `fetch("/profile")`;
3. cross-origin, same-site fetch с `https://app.example.com` при default credentials;
4. тот же fetch с `credentials: "include"`;
5. fetch к `http://api.example.com`;
6. request к `https://sub.api.example.com`;
7. cross-site subresource request с `https://attacker.test`.

Для каждого attribute назовите только его responsibility. `HttpOnly` не используйте как объяснение send/no-send.

### 1.3. Simple/preflight

Какие cross-origin requests запускают preflight?

```text
A. GET, no manually set fields
B. POST, Content-Type: application/x-www-form-urlencoded
C. POST, Content-Type: application/json
D. PUT, Content-Type: text/plain
E. POST, Content-Type: text/plain, X-CSRF-Token: abc
F. HEAD, Accept: application/json
```

Для preflight cases составьте `OPTIONS` fields. Для остальных объясните, почему отсутствие preflight не означает отсутствие CSRF risk.

### 1.4. Credentialed CORS

Предскажите script readability:

| Fetch | Response CORS fields | Readable? |
|---|---|---:|
| omit credentials | `ACAO: *` | ? |
| include credentials | `ACAO: *`, `ACAC: true` | ? |
| include credentials | explicit ACAO, no ACAC | ? |
| include credentials | matching ACAO, `ACAC: true` | ? |
| include credentials | another origin ACAO, `ACAC: true` | ? |

### Evidence rubric

Passing answer не смешивает same-origin с same-site, preflight с authorization и cookie storage с cookie send.

> [!tip]- Подсказка 1: два tuples
> Origin сравнивает scheme/host/port; schemeful site — scheme/registrable domain.

> [!tip]- Подсказка 2: credentials default
> Для cross-origin `fetch()` default `same-origin` не прикрепляет cookies; `include` лишь разрешает рассмотреть cookie, но не отменяет её attributes.

## 2. Explain: восстановите два независимых failures

Дан Network/server transcript.

```text
Page: https://app.example.com
Fetch: PATCH https://api.example.com/email
credentials: include
headers: Content-Type: application/json, X-CSRF-Token: t1
```

```http
OPTIONS /email HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PATCH
Access-Control-Request-Headers: content-type, x-csrf-token
```

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: PATCH
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

Server log не содержит `PATCH`.

1. Назовите exact mismatch.
2. Был ли CSRF token проверен application handler?
3. Мог ли email измениться?
4. Какой field исправить?

Второй transcript:

```http
OPTIONS /email -> 204 (all requested method/fields allowed)
PATCH /email Cookie: session=abc; X-CSRF-Token: t1
```

```text
server: email.updated user=7
response: 204, no Access-Control-Allow-Origin
browser console: CORS error
fetch: TypeError
```

1. Почему frontend видит rejection?
2. Почему нельзя повторять `PATCH` вслепую?
3. Где должна добавляться ACAO?
4. Какие facts одновременно истинны?

### Контроль переноса

Объясните, почему server-side CSRF check всё ещё нужен, даже если первый transcript останавливает actual request на preflight.

## 3. Modify: исправьте небезопасный session API

Исходный contract:

```http
HTTP/1.1 200 OK
Set-Cookie: auth=<jwt>; Domain=example.com; SameSite=None
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

```javascript
fetch("https://api.example.com/change-email", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "text/plain" },
  body: JSON.stringify({ email: "new@example.com" }),
});
```

Server меняет email, если cookie signature valid. CSRF check отсутствует.

### Задание

Измените contract:

1. минимизируйте cookie scope и добавьте suitable `Secure`/`HttpOnly`/`SameSite`;
2. замените wildcard на explicit origin allowlist и `Vary: Origin`;
3. добавьте synchronizer CSRF token или framework-equivalent;
4. проверяйте token/origin до mutation;
5. не принимайте `text/plain` как disguised JSON;
6. определите status для unauthenticated, unauthorized, invalid CSRF и unsupported media type;
7. сохраните legitimate cross-origin flow, если он действительно нужен.

Покажите login response, preflight, actual request и actual response. Объясните, почему JWT внутри cookie не устранял CSRF.

### Adversarial review

Другой разработчик предлагает только `SameSite=Lax`. Назовите minimum два случая, когда defense in depth всё равно нужна: same-site sibling threat, browser/legacy behavior, top-level flow, application endpoint semantics или XSS.

## 4. Implement: session, CORS и CSRF boundary server

Создайте `security-server.mjs` на `node:http`, без dependencies.

### Startup

```bash
node security-server.mjs
```

Первая stdout line:

```json
{"event":"listening","port":3000}
```

Используйте `listen(0, "127.0.0.1")`; diagnostics — stderr. Разрешённый frontend origin фиксирован:

```text
https://app.example.test
```

### State

- in-memory sessions keyed by cryptographically random opaque session ID;
- session record: `{ userId: "ada", csrfToken, email }`;
- random CSRF token создаётся при login;
- session/CSRF values не логируются.

### CORS policy

Для matching `Origin: https://app.example.test` на API responses:

```http
Access-Control-Allow-Origin: https://app.example.test
Access-Control-Allow-Credentials: true
Vary: Origin
```

Никогда не возвращайте `ACAO: *` вместе с credentials. Unknown origin не получает allow fields.

Preflight `OPTIONS /profile` и `OPTIONS /email`:

- matching origin → `204`;
- `Access-Control-Allow-Methods` перечисляет methods соответствующего endpoint;
- `Access-Control-Allow-Headers: Content-Type, X-CSRF-Token`;
- credential CORS fields выше;
- unknown origin → `403`, actual handler не вызывается.

### `POST /login`

- требует matching `Origin` и `Content-Type: application/json`;
- принимает `{ "user": "ada" }`;
- invalid media type → `415`; invalid body → `400`;
- создаёт session;
- response `200` JSON `{ "csrfToken": "..." }`;
- устанавливает:

```http
Set-Cookie: __Host-session=<opaque>; Path=/; Secure; HttpOnly; SameSite=Lax
```

> [!note] Local checker и `Secure`
> Checker не использует browser cookie jar: он извлекает cookie pair и отправляет её явно. Реальный browser на plain HTTP может reject `Secure` cookie. Production contract требует HTTPS; local HTTP нужен только black-box verification server policy.

### `GET /profile`

- valid session cookie → `200` JSON `{ userId, email }`;
- absent/unknown session → `401` JSON problem;
- matching origin получает CORS fields.

### `PATCH /email`

Порядок checks до mutation:

1. matching Origin, иначе `403`;
2. valid session, иначе `401`;
3. `Content-Type: application/json`, иначе `415`;
4. `X-CSRF-Token` exact match session token, иначе `403`;
5. JSON `{ email: non-empty string }`, иначе `400`;
6. update email → `204` без content.

`GET /profile` после rejected mutation должен показать old email.

### Behavioral checker

Сохраните рядом как `check-security-server.mjs`.

> [!example]- `check-security-server.mjs`
> ```javascript
> import assert from "node:assert/strict";
> import { spawn } from "node:child_process";
> import { once } from "node:events";
>
> const allowedOrigin = "https://app.example.test";
> const evilOrigin = "https://evil.example.net";
> const child = spawn(process.execPath, ["security-server.mjs"], {
>   stdio: ["ignore", "pipe", "pipe"],
> });
> child.stdout.setEncoding("utf8");
> child.stderr.setEncoding("utf8");
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
>     try { resolve(JSON.parse(line)); }
>     catch (error) {
>       child.kill("SIGKILL");
>       reject(new Error(`invalid startup JSON: ${error.message}`));
>     }
>   });
> });
>
> assert.equal(listening.event, "listening");
> const base = `http://127.0.0.1:${listening.port}`;
> const cors = (response) => {
>   assert.equal(response.headers.get("access-control-allow-origin"), allowedOrigin);
>   assert.equal(response.headers.get("access-control-allow-credentials"), "true");
>   assert.match(response.headers.get("vary") ?? "", /Origin/i);
> };
> const json = async (response) => {
>   assert.match(response.headers.get("content-type") ?? "", /^application\/json\b/i);
>   return response.json();
> };
>
> try {
>   const preflight = await fetch(`${base}/email`, {
>     method: "OPTIONS",
>     headers: {
>       Origin: allowedOrigin,
>       "Access-Control-Request-Method": "PATCH",
>       "Access-Control-Request-Headers": "content-type, x-csrf-token",
>     },
>   });
>   assert.equal(preflight.status, 204);
>   cors(preflight);
>   assert.match(preflight.headers.get("access-control-allow-methods") ?? "", /PATCH/);
>   assert.match(preflight.headers.get("access-control-allow-headers") ?? "", /X-CSRF-Token/i);
>
>   const evilPreflight = await fetch(`${base}/email`, {
>     method: "OPTIONS",
>     headers: {
>       Origin: evilOrigin,
>       "Access-Control-Request-Method": "PATCH",
>     },
>   });
>   assert.equal(evilPreflight.status, 403);
>   assert.equal(evilPreflight.headers.has("access-control-allow-origin"), false);
>
>   const login = await fetch(`${base}/login`, {
>     method: "POST",
>     headers: { Origin: allowedOrigin, "Content-Type": "application/json" },
>     body: JSON.stringify({ user: "ada" }),
>   });
>   assert.equal(login.status, 200);
>   cors(login);
>   const { csrfToken } = await json(login);
>   assert.equal(typeof csrfToken, "string");
>   assert.ok(csrfToken.length >= 16);
>   const setCookie = login.headers.get("set-cookie") ?? "";
>   assert.match(setCookie, /^__Host-session=[^;]+;/);
>   assert.match(setCookie, /Path=\//i);
>   assert.match(setCookie, /Secure/i);
>   assert.match(setCookie, /HttpOnly/i);
>   assert.match(setCookie, /SameSite=Lax/i);
>   assert.doesNotMatch(setCookie, /Domain=/i);
>   const cookie = setCookie.split(";", 1)[0];
>
>   const anonymous = await fetch(`${base}/profile`, {
>     headers: { Origin: allowedOrigin },
>   });
>   assert.equal(anonymous.status, 401);
>   cors(anonymous);
>   await json(anonymous);
>
>   const initial = await fetch(`${base}/profile`, {
>     headers: { Origin: allowedOrigin, Cookie: cookie },
>   });
>   assert.equal(initial.status, 200);
>   cors(initial);
>   assert.deepEqual(await json(initial), { userId: "ada", email: "ada@example.test" });
>
>   const forged = await fetch(`${base}/email`, {
>     method: "PATCH",
>     headers: { Origin: allowedOrigin, Cookie: cookie, "Content-Type": "application/json" },
>     body: JSON.stringify({ email: "attacker@example.test" }),
>   });
>   assert.equal(forged.status, 403);
>   cors(forged);
>   await json(forged);
>
>   const unchanged = await fetch(`${base}/profile`, {
>     headers: { Origin: allowedOrigin, Cookie: cookie },
>   });
>   assert.equal((await json(unchanged)).email, "ada@example.test");
>
>   const wrongOrigin = await fetch(`${base}/email`, {
>     method: "PATCH",
>     headers: {
>       Origin: evilOrigin,
>       Cookie: cookie,
>       "Content-Type": "application/json",
>       "X-CSRF-Token": csrfToken,
>     },
>     body: JSON.stringify({ email: "evil@example.test" }),
>   });
>   assert.equal(wrongOrigin.status, 403);
>   assert.equal(wrongOrigin.headers.has("access-control-allow-origin"), false);
>
>   const updated = await fetch(`${base}/email`, {
>     method: "PATCH",
>     headers: {
>       Origin: allowedOrigin,
>       Cookie: cookie,
>       "Content-Type": "application/json",
>       "X-CSRF-Token": csrfToken,
>     },
>     body: JSON.stringify({ email: "new@example.test" }),
>   });
>   assert.equal(updated.status, 204);
>   cors(updated);
>   assert.equal(await updated.text(), "");
>
>   const finalProfile = await fetch(`${base}/profile`, {
>     headers: { Origin: allowedOrigin, Cookie: cookie },
>   });
>   assert.equal((await json(finalProfile)).email, "new@example.test");
>
>   console.log("security server checks: PASS");
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
node check-security-server.mjs
```

**Критерий:** `security server checks: PASS`; wrong origin не получает ACAO, forged mutation не меняет state, cookie attributes ограничены, credentialed responses используют explicit origin, valid CSRF token разрешает update.

> [!tip]- Подсказка 1: policy helpers
> Отделите `corsFields(origin)`, `authenticate(cookie)`, `requireJson(request)` и `sendJson`. Не объединяйте CORS permission с user authorization.

> [!tip]- Подсказка 2: cookie parser
> `Cookie` содержит `name=value` pairs через `;`. Для упражнения достаточно split/trim parser, но не логируйте raw credential.

> [!tip]- Подсказка 3: mutation last
> Вычислите все validation results до присваивания `session.email`. Checker специально читает profile после rejected attempts.

## 5. Diagnose: пять browser incidents

### A. Cookie сохранена, но Fetch anonymous

```text
Page origin: https://app.example.com
Request: https://api.example.com/profile
Cookie: Domain absent, Secure, HttpOnly, SameSite=Lax
Fetch options: default
Server: Cookie header absent
```

Что проверить первым? Почему `HttpOnly` не root cause? Какое изменение Fetch нужно и какие CORS fields должны соответствовать?

### B. Cookie rejected

```text
Set-Cookie: session=abc; SameSite=None; HttpOnly
DevTools issue: SameSite=None cookie must also specify Secure
```

Где failure: storage или send? Как исправить production response?

### C. Preflight passes, actual hidden

```text
OPTIONS -> ACAO matching, ACAM PATCH, ACAH Content-Type
PATCH -> 403 JSON, no ACAO
Browser -> TypeError
Server -> csrf.invalid
```

Как сохранить real `403` доступным trusted frontend, не разрешая attacker origin?

### D. CORS works, authorization absent

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

Endpoint возвращает profile любому request с `Origin: https://app.example.com`, даже без session. Почему allowlisted Origin нельзя считать identity?

### E. CSRF despite unreadable response

Attacker отправляет cross-site HTML form `POST /email` с cookie пользователя. Bank response не имеет ACAO, attacker page не может его read, но email меняется. Назовите minimum server-side fix и defense-in-depth fields.

### Completion rubric

Passing diagnosis называет exact boundary, подтверждает/отрицает side effect по server evidence и не предлагает wildcard CORS или отключение browser security.

## 6. Transfer: multi-origin dashboard

System:

```text
https://dashboard.example.com   first-party UI
https://api.example.com         session API
https://uploads.example.net     third-party upload service
https://admin.example.com       privileged UI
```

Requirements:

1. Dashboard и API используют cookie session.
2. Admin actions требуют stronger CSRF/user confirmation.
3. Upload service принимает bearer token только для одного upload.
4. Public thumbnails readable from any origin без credentials.
5. Private profile readable только dashboard/admin origins.
6. Sibling subdomain compromise входит в threat model.

Спроектируйте:

- origin/site matrix;
- cookie name/prefix/attributes и host scope;
- explicit CORS allowlists, credentials и `Vary`;
- preflight methods/headers для profile update;
- CSRF defense и validation order;
- public thumbnail ACAO policy;
- short-lived upload bearer storage/attachment contract;
- evidence/log fields без credential leakage;
- behavior при missing `Origin`/Fetch Metadata для non-browser clients.

Итоговая decision table:

| Endpoint | Credential transport | CORS read origins | Preflight | CSRF defense | Authorization | Failure evidence |
|---|---|---|---|---|---|---|

### Transfer evidence

Другой разработчик должен по таблице предсказать: cookie send, `OPTIONS`, actual request, server mutation и script readability для trusted, attacker и CLI clients.

## Журнал evidence

```text
Date:
Origin/site predictions corrected:
Preflight transcript explained:
Modified session contract:
Implementation command/output:
Checker result:
Incidents diagnosed:
Transfer table:
Hints opened:
Remaining uncertainty:
Next cold review date:
```

## Related Topics

- [[04-browser-state-and-security|Browser state и security]] — source chapter.
- [[../03-http-messages-and-semantics/exercises|Практика HTTP semantics]] — methods, fields, statuses и conditional requests.
- [[../05-http-caching/05-http-caching|HTTP caching]] — `Vary: Origin`, private/shared cache и validation.
- [[../06-reliable-client-server-interaction/06-reliable-client-server-interaction|Надёжное взаимодействие]] — retry после hidden/ambiguous outcomes.

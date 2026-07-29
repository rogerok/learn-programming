---
tags: [architecture, client-server, networking, dns, tcp, tls, exercises]
aliases: [Практика DNS TCP TLS]
---

# Упражнения: DNS, TCP и TLS boundaries

[[../../MOC|К карте архитектуры]] · [[02-dns-tcp-tls|К главе]]

Целевая способность: по hostname, port и client evidence восстановить фактические DNS, TCP и TLS transitions, назвать last confirmed boundary и проверить гипотезу минимальным probe. Задания идут от prediction к black-box implementation и incident diagnosis. Готовых решений нет.

## 1. Predict: определить необходимые stages

**Результат обучения:** вы предсказываете stages по состоянию cache/channel, а не воспроизводите один неизменный pipeline.

Для каждого сценария до запуска tools заполните таблицу:

| Сценарий | Нужен новый network DNS query? | Нужен TCP handshake? | Нужен TLS handshake? | Какой remote endpoint ожидается? | Что может быть last confirmed boundary? |
|---|---|---|---|---|---|
| Первый вызов `https://api.example.test` после запуска OS | ? | ? | ? | ? | ? |
| DNS answer находится в recursive resolver cache | ? | ? | ? | ? | ? |
| Application имеет address, но connection pool пуст | ? | ? | ? | ? | ? |
| Открытый TLS channel переиспользуется | ? | ? | ? | ? | ? |
| Hostname заменили literal IP | ? | ? | ? | ? | ? |
| TCP connect успешен, certificate не подходит hostname | ? | ? | ? | ? | ? |

Затем для каждого сценария подпишите:

1. какой state существовал до operation;
2. какой event создаёт следующий state;
3. какой факт success этого event **не** доказывает.

**Критерий проверки:** cache hit не изображён как новый DNS exchange; known IP не превращается в authenticated identity; reused TLS channel не содержит выдуманных handshakes.

**Evidence rubric:**

- обязательный механизм — dependency order отделён от действий конкретного request;
- supporting evidence — для каждого пропущенного stage назван reusable state;
- признак заблуждения — все шесть строк содержат одинаковый `DNS → TCP → TLS` независимо от условий.

> [!tip]- Подсказка 1: состояние важнее URL
> Один и тот же URL может использовать fresh path, cached DNS answer или уже защищённое connection.

> [!tip]- Подсказка 2: три независимых cache-like состояния
> Отдельно рассматривайте DNS record state, TCP connection state и TLS session/channel state.

## 2. Explain: сравнить OS resolution и DNS protocol view

**Результат обучения:** вы связываете claim о hostname с visibility конкретного resolver/tool.

Выполните:

```bash
node --input-type=module --eval '
  import { lookup, resolve4, getServers } from "node:dns/promises";
  console.log({ servers: getServers() });
  console.log({ lookup: await lookup("example.com", { all: true }) });
  console.log({ resolve4: await resolve4("example.com", { ttl: true }) });
'
```

Если установлен `dig`, добавьте:

```bash
dig +noall +answer example.com A
dig +noall +answer example.com AAAA
```

Зафиксируйте raw output и ответьте:

1. Какие addresses являются candidates?
2. Какой tool использует OS name-service path?
3. Какой output показывает DNS TTL?
4. Доказывает ли совпадение answers общий cache?
5. Почему отсутствие address в одном output ещё не доказывает отсутствие authoritative record?
6. Как container, VPN или `/etc/hosts` может изменить только один из outputs?

Затем добавьте временную строку в `/etc/hosts` **только если вы умеете безопасно отменить изменение**. Если не хотите менять host configuration, используйте disposable container. Сравните `lookup()` и `resolve4()` для переопределённого имени.

**Критерий проверки:** утверждения о DNS protocol опираются на `resolve*()`/`dig`, а утверждения о фактическом Node application resolution — на `lookup()`. TTL не объявлен временем жизни TCP connection.

**Evidence rubric:**

- обязательное различие — OS resolver facilities и explicit DNS query;
- supporting evidence — raw outputs и configured resolver addresses;
- признак заблуждения — `dig` объявлен точной копией resolution path любого application.

> [!tip]- Подсказка 1: прочитайте имя API буквально
> `dns.lookup()` может вообще не отправлять DNS packet. `dns.resolve4()` запрашивает DNS records.

> [!tip]- Подсказка 2: `/etc/hosts`
> OS name-service policy может учитывать local files. Explicit DNS resolver Node их не использует.

## 3. Modify: добавить stage timings и единый deadline

**Результат обучения:** вы изменяете working probe так, чтобы общий timeout сохранял информацию о текущем stage.

Сохраните следующий working starter как `inspect-channel.mjs`:

> [!example]- `inspect-channel.mjs`
> ```javascript
> import { lookup } from "node:dns/promises";
> import { once } from "node:events";
> import { connect as connectTcp } from "node:net";
> import { connect as connectTls } from "node:tls";
>
> const [hostname, portText] = process.argv.slice(2);
> const port = Number(portText);
> if (!hostname || !Number.isInteger(port) || port < 1 || port > 65_535) {
>   console.error("usage: node inspect-channel.mjs <hostname> <port>");
>   process.exit(2);
> }
>
> const stageTimeoutMs = 2_000;
>
> function timeout(stage) {
>   return new Promise((_, reject) => {
>     const timer = setTimeout(() => {
>       const error = new Error(`${stage} timeout`);
>       error.code = "ETIMEDOUT";
>       reject(error);
>     }, stageTimeoutMs);
>     timer.unref();
>   });
> }
>
> function withinStage(stage, promise) {
>   return Promise.race([promise, timeout(stage)]);
> }
>
> let stage = "dns";
> let activeSocket;
>
> try {
>   const { address, family } = await withinStage(stage, lookup(hostname));
>   console.log(JSON.stringify({ stage, status: "ok", address, family }));
>
>   stage = "tcp";
>   const tcpSocket = connectTcp({ host: address, port });
>   activeSocket = tcpSocket;
>   await withinStage(stage, once(tcpSocket, "connect"));
>   console.log(JSON.stringify({
>     stage,
>     status: "ok",
>     remoteAddress: tcpSocket.remoteAddress,
>     remotePort: tcpSocket.remotePort,
>   }));
>
>   stage = "tls";
>   const tlsSocket = connectTls({ socket: tcpSocket, servername: hostname });
>   activeSocket = tlsSocket;
>   await withinStage(stage, once(tlsSocket, "secureConnect"));
>   console.log(JSON.stringify({
>     stage,
>     status: "ok",
>     authorized: tlsSocket.authorized,
>     protocol: tlsSocket.getProtocol(),
>   }));
>   tlsSocket.end();
> } catch (error) {
>   activeSocket?.destroy();
>   console.log(JSON.stringify({
>     stage,
>     status: "error",
>     code: error.code ?? "ERROR",
>   }));
>   process.exitCode = 1;
> }
> ```

Сначала запустите starter без изменений и сохраните его output. Затем добавьте:

- `startedAt` и `durationMs` для `dns`, `tcp` и `tls`;
- аргумент `--deadline <milliseconds>` для всей operation;
- remaining time для каждого следующего stage вместо нового полного timeout;
- финальный record `operation` со `status: "ok" | "error"`;
- при failure — `stage`, `code`, `durationMs` и последний подтверждённый stage;
- закрытие всех созданных sockets в success и failure paths.

Не добавляйте HTTP request. Probe заканчивается после TLS `secureConnect`.

Проверьте success path:

```bash
node inspect-channel.mjs example.com 443 --deadline 5000
```

Проверьте DNS failure на зарезервированном TLD:

```bash
node inspect-channel.mjs no-such-host.invalid 443 --deadline 1500
```

Проверьте TCP failure на local port, где предварительно подтверждено отсутствие listener:

```bash
ss --tcp --listening --numeric
node inspect-channel.mjs 127.0.0.1 1 --deadline 1500
```

Не используйте port `1`, если `ss` показывает listener; выберите другой заведомо свободный local port.

**Критерий проверки:** общий deadline не перезапускается после DNS; failure record называет фактический stage; DNS failure не маркируется как TCP timeout; process завершается без висящего socket.

> [!tip]- Подсказка 1: абсолютная граница
> Вычислите один `deadlineAt`, а перед stage используйте `deadlineAt - now`.

> [!tip]- Подсказка 2: stage transition
> Меняйте current stage непосредственно перед запуском соответствующей async operation, а successful boundary записывайте только после её event.

> [!tip]- Подсказка 3: cleanup
> Храните ссылки на созданные sockets вне локального блока stage и уничтожайте только реально созданные objects.

## 4. Implement: создать black-box channel probe

**Результат обучения:** вы самостоятельно реализуете наблюдаемую границу `hostname → TCP → TLS` и проходите проверки success, TCP failure и TLS identity failure.

Создайте `channel-probe.mjs` без HTTP libraries и third-party dependencies.

### CLI contract

```text
node channel-probe.mjs \
  --host <hostname-or-ip> \
  --port <number> \
  --servername <tls-reference-name> \
  [--ca <pem-file>] \
  [--timeout <milliseconds>]
```

- `--host` проходит через OS resolution path;
- `--servername` передаётся как TLS SNI и reference identity;
- `--ca` добавляет test CA к trust material;
- default timeout — `2000` ms;
- probe не отправляет application bytes.

### Output contract

Печатайте NDJSON: один JSON object на строку.

Success содержит ровно три stage records в порядке `dns`, `tcp`, `tls`:

```json
{"stage":"dns","status":"ok","addresses":[{"address":"127.0.0.1","family":4}]}
{"stage":"tcp","status":"ok","localAddress":"127.0.0.1","localPort":53000,"remoteAddress":"127.0.0.1","remotePort":443}
{"stage":"tls","status":"ok","authorized":true,"protocol":"TLSv1.3","alpn":false}
```

Dynamic values не обязаны совпадать с примером. На failure:

- уже завершённые stages остаются в output;
- добавляется один `{ "stage": ..., "status": "error", "code": ..., "message": ... }`;
- process завершается с exit code `1`;
- stage после failure не печатается.

Prohibited shortcuts:

- `rejectUnauthorized: false`;
- подмена TCP/TLS реальным HTTP request;
- трактовка любого error как DNS failure;
- hardcoded output;
- чтение certificate без проверки reference identity.

### Behavioral checker

Сохраните следующий checker как `check-channel-probe.mjs` рядом с вашей реализацией. Нужны Node.js и OpenSSL с option `-addext`. Checker генерирует временный CA certificate, запускает local TLS server и проверяет behavior, не читая source.

> [!example]- `check-channel-probe.mjs`
> ```javascript
> import assert from "node:assert/strict";
> import { execFileSync, spawn } from "node:child_process";
> import { mkdtempSync, readFileSync, rmSync } from "node:fs";
> import { tmpdir } from "node:os";
> import { join } from "node:path";
> import { once } from "node:events";
> import { createServer as createTcpServer } from "node:net";
> import { createServer } from "node:tls";
>
> const directory = mkdtempSync(join(tmpdir(), "channel-probe-"));
> const keyPath = join(directory, "key.pem");
> const certificatePath = join(directory, "certificate.pem");
>
> const runProbe = (args) => new Promise((resolve) => {
>   const child = spawn(process.execPath, ["channel-probe.mjs", ...args], {
>     stdio: ["ignore", "pipe", "pipe"],
>   });
>   let stdout = "";
>   let stderr = "";
>   child.stdout.setEncoding("utf8");
>   child.stderr.setEncoding("utf8");
>   child.stdout.on("data", (chunk) => { stdout += chunk; });
>   child.stderr.on("data", (chunk) => { stderr += chunk; });
>   child.on("close", (exitCode) => {
>     const events = stdout.trim().split("\n").filter(Boolean).map(JSON.parse);
>     resolve({ exitCode, events, stderr });
>   });
> });
>
> try {
>   execFileSync("openssl", [
>     "req", "-x509", "-newkey", "rsa:2048", "-nodes",
>     "-keyout", keyPath,
>     "-out", certificatePath,
>     "-days", "1",
>     "-subj", "/CN=localhost",
>     "-addext", "subjectAltName=DNS:localhost",
>   ], { stdio: "ignore" });
>
>   const server = createServer({
>     key: readFileSync(keyPath),
>     cert: readFileSync(certificatePath),
>   }, (socket) => socket.end());
>
>   server.listen(0, "127.0.0.1");
>   await once(server, "listening");
>   const { port } = server.address();
>   const common = ["--host", "127.0.0.1", "--port", String(port), "--ca", certificatePath, "--timeout", "1500"];
>
>   const success = await runProbe([...common, "--servername", "localhost"]);
>   assert.equal(success.exitCode, 0, success.stderr);
>   assert.deepEqual(success.events.map(({ stage, status }) => [stage, status]), [
>     ["dns", "ok"], ["tcp", "ok"], ["tls", "ok"],
>   ]);
>   assert.equal(success.events[2].authorized, true);
>
>   const wrongName = await runProbe([...common, "--servername", "wrong.invalid"]);
>   assert.equal(wrongName.exitCode, 1, wrongName.stderr);
>   assert.deepEqual(wrongName.events.map(({ stage, status }) => [stage, status]), [
>     ["dns", "ok"], ["tcp", "ok"], ["tls", "error"],
>   ]);
>
>   const silentSockets = new Set();
>   const silentServer = createTcpServer((socket) => {
>     silentSockets.add(socket);
>     socket.on("close", () => silentSockets.delete(socket));
>   });
>   silentServer.listen(0, "127.0.0.1");
>   await once(silentServer, "listening");
>   const silentPort = silentServer.address().port;
>   const stalled = await runProbe([
>     "--host", "127.0.0.1",
>     "--port", String(silentPort),
>     "--servername", "localhost",
>     "--ca", certificatePath,
>     "--timeout", "200",
>   ]);
>   assert.equal(stalled.exitCode, 1, stalled.stderr);
>   assert.deepEqual(stalled.events.map(({ stage, status }) => [stage, status]), [
>     ["dns", "ok"], ["tcp", "ok"], ["tls", "error"],
>   ]);
>   assert.equal(stalled.events.at(-1).code, "ETIMEDOUT");
>   const silentClosed = once(silentServer, "close");
>   silentServer.close();
>   for (const socket of silentSockets) socket.destroy();
>   await silentClosed;
>
>   const serverClosed = once(server, "close");
>   server.close();
>   await serverClosed;
>
>   const refused = await runProbe([...common, "--servername", "localhost"]);
>   assert.equal(refused.exitCode, 1, refused.stderr);
>   assert.deepEqual(refused.events.map(({ stage, status }) => [stage, status]), [
>     ["dns", "ok"], ["tcp", "error"],
>   ]);
>
>   console.log("channel probe checks: PASS");
> } finally {
>   rmSync(directory, { recursive: true, force: true });
> }
> ```

Запустите:

```bash
node check-channel-probe.mjs
```

**Критерий проверки:** checker печатает `channel probe checks: PASS`; wrong service identity не превращается в success; молчащий TLS peer завершается `ETIMEDOUT` на TLS stage; после остановки listener failure относится к TCP.

> [!tip]- Подсказка 1: API boundaries
> Используйте OS-equivalent lookup, затем `node:net`, затем оберните connected socket через `node:tls`.

> [!tip]- Подсказка 2: SNI и verification
> Low-level `tls.connect()` требует явного `servername`. Default certificate verification отключать не нужно и нельзя.

## 5. Diagnose: найти первый неподтверждённый stage

**Результат обучения:** вы выбираете probe по evidence, а не увеличиваете timeout или отключаете TLS verification наугад.

Для каждого incident заполните:

```text
confirmed:
not confirmed:
leading hypotheses:
next probe:
expected discriminating outcomes:
unsafe workaround to reject:
```

### Incident A: application и dig расходятся

```text
container $ node lookup.mjs api.internal.example
{ code: "ENOTFOUND", syscall: "getaddrinfo" }

container $ dig +short api.internal.example A
10.24.8.17

host $ node lookup.mjs api.internal.example
[{ address: "10.24.8.17", family: 4 }]
```

Объясните, почему `ENOTFOUND` здесь не доказывает authoritative NXDOMAIN. Выберите probe между container NSS configuration, `/etc/hosts`, configured resolver и network namespace.

### Incident B: address и connection есть, identity не совпадает

```text
dns     ok  [{ address: "198.51.100.24", family: 4 }]
tcp     ok  local=10.0.4.12:53320 remote=198.51.100.24:443
tls     error code=ERR_TLS_CERT_ALTNAME_INVALID
message Hostname/IP does not match certificate's altnames
```

Configuration:

```text
host=198.51.100.24
servername=payments.example.com
certificate SAN=DNS:api.example.com
```

Сравните три гипотезы: wrong DNS/deployment target, wrong SNI/reference name, wrong certificate on correct service. Назовите evidence, которое различит их, не используя `rejectUnauthorized: false`.

### Incident C: один внешний timeout

```text
client error: ETIMEDOUT after 2000 ms
resolver log: query answered in 12 ms
server access log: no HTTP request
```

Access log не показывает TCP accepts и TLS handshakes. Перечислите все ещё возможные boundaries и добавьте минимальную instrumentation, после которой timeout станет локализованным.

### Incident D: TCP success, TLS endpoint молчит

```text
dns duration=8 ms
tcp duration=24 ms remote=203.0.113.25:443
tls timeout after 1500 ms
```

Проверьте минимум три версии: wrong protocol на port, TLS packets filtered after connect, overloaded TLS terminator. Для каждой версии назовите client- или server-side observation с разными expected outcomes.

**Критерий проверки:** каждый диагноз ограничен last confirmed boundary; `dig` не заменяет application lookup; TCP success не объявлен доказательством TLS; certificate verification не отключается как diagnostic fix.

**Evidence rubric:**

- обязательная структура — confirmed / not confirmed / discriminating probe;
- supporting evidence — stage-specific logs или trace с tuple;
- признак заблуждения — root cause выбран из одного generic error без проверки альтернатив.

> [!tip]- Подсказка 1: двигайтесь слева направо
> Сначала назовите последний успешный event. Затем исследуйте ровно следующую boundary.

> [!tip]- Подсказка 2: absence of evidence
> Отсутствие HTTP access log не различает TCP failure, TLS failure и request, отвергнутый до выбранного logger.

## 6. Transfer: применить модель к PostgreSQL over TLS

**Результат обучения:** вы переносите DNS/TCP/TLS model на protocol, где browser и HTTP отсутствуют.

Команда application использует configuration:

```text
hostname=db.prod.internal
port=5432
TLS servername=db.prod.internal
connect timeout=3s
query timeout=2s
```

Production path:

```text
service container
→ cluster DNS
→ private load balancer
→ PostgreSQL-compatible proxy
→ database node
```

Составьте диагностический contract:

1. какие records запрашивает application resolver;
2. как фиксируется выбранный IP и full TCP tuple;
3. где может завершаться TLS;
4. какое reference name должен проверять client;
5. чем connect timeout отличается от query timeout;
6. что доказывает successful TLS, если proxy открывает второй connection к database;
7. какие fields нужно добавить в logs, чтобы не смешивать downstream и upstream connections.

Затем рассмотрите migration: private load balancer сменил IP, но hostname и certificate identity остались прежними. Объясните, почему hostname является устойчивой service identity, а hardcoded IP создаёт deployment coupling. Укажите, как DNS TTL и existing connection pool влияют на момент перехода clients.

**Критерий проверки:** модель работает без HTTP terminology; port не объявлен identity database; TLS boundary proxy→database рассматривается отдельно; query timeout не используется как доказательство failed TCP handshake.

**Evidence rubric:**

- обязательный перенос — те же DNS/TCP/TLS invariants в другом application protocol;
- supporting evidence — два connection tuples при TLS termination на proxy;
- признак заблуждения — `db.prod.internal` после lookup заменён IP во всех identity checks.

## Критерий завершения практики

Independent evidence получено, если без раскрытых implementation hints вы можете:

- предсказать fresh, cached и reused stages;
- объяснить расхождение `lookup()` и `resolve*()` через их actual mechanisms;
- сохранить stage identity при общем timeout;
- пройти black-box checks success, TCP failure и TLS identity failure;
- диагностировать incident по last confirmed boundary;
- перенести модель на non-HTTP TLS service.

Запишите commands, raw output, найденные defects и открытые подсказки. Passing после algorithm-level hint — полезная practice, но не independent evidence; повторите Diagnose или Transfer позже без подсказок.

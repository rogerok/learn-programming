# Разработка фичи дешёвыми субагентами

## Главный риск

Параллельные workers быстро создают несовместимые локальные решения, если общий контракт ещё не определён. Поэтому исследование можно распараллелить сразу, реализацию — только после design barrier.

## Этап 1: локализовать изменения

Параллельные задания `cheap-scout`:

- существующий пользовательский flow и entry point;
- domain state и invariants;
- storage/schema implications;
- API consumers и compatibility;
- существующие тестовые и runtime способы проверки.

`cheap-librarian` исследует только внешние API, от которых зависит решение.

## Этап 2: design barrier

Основная модель самостоятельно фиксирует:

```text
Observable behavior
Domain invariants
Shared API/schema/types
Error and authorization semantics
Migration/cutover strategy
Ownership границы workers
End-to-end acceptance scenario
```

Пока эти пункты не определены, `cheap-worker` запускать нельзя.

## Этап 3: независимая реализация

Хорошие срезы после фиксации контракта:

- backend handler на уже определённом service API;
- UI на уже определённом payload/state contract;
- storage adapter на уже определённом repository interface;
- независимая platform implementation;
- документация внешнего API, если она входит в пользовательский deliverable;
- группы consumers, мигрируемые на зафиксированный новый API.

Плохие срезы:

- один worker придумывает payload, второй одновременно пишет consumer;
- два workers меняют общий schema/type;
- worker получает «сделай backend» без error/authorization semantics;
- worker сам решает, какие acceptance criteria считать достаточными.

## Запрос

```text
Реализуй фичу волнами.

Волна 1: сам выдели независимые вопросы и параллельно назначь cheap-scout/
cheap-librarian для существующих flows, domain invariants, consumers и внешних API.
Никому не разрешай edits.

Барьер: сам синтезируй результаты и зафиксируй observable contract, shared types,
error/auth semantics, ownership файлов, clean-cutover и end-to-end scenario.

Волна 2: только если срезы действительно независимы, параллельно назначь cheap-worker.
Каждому передай Target, Change, Contract, Non-goals и Acceptance. Запрети менять
shared contract и запускать project-wide проверки.

Барьер: сам проверь все references общих символов, интегрируй срезы и устрани
несовместимости. Не оставляй shims или старый путь.

Волна 3: назначь cheap-reviewer на разные risk lenses, а не одинаковое общее review.
Сам проверь подтверждённые findings и выполни полный пользовательский сценарий.
```

## Пример разбиения frontend/backend

Сначала основная модель задаёт:

```text
POST /items
request: { name: string }
response 201: { id: string, name: string, createdAt: ISO8601 }
errors: 400 InvalidName, 401 Unauthorized, 409 DuplicateName
```

Только после этого:

- worker A реализует domain/service и handler;
- worker B реализует UI flow и отображение известных errors;
- worker C мигрирует независимый CLI consumer;
- verifier выполняет заранее определённый end-to-end сценарий.

Если contract появляется в реализации worker A, остальные workers фактически зависят от A и не могут корректно работать параллельно.

## Проверка результата

Основная модель должна наблюдать:

1. фича доступна через реальный entry point;
2. happy path проходит от входа до persistence/output;
3. один важный error path имеет ожидаемую semantics;
4. старый несовместимый путь отсутствует после cutover;
5. соседний существующий сценарий не регрессировал.

Набор зелёных unit tests отдельных workers не заменяет эту интеграционную проверку.
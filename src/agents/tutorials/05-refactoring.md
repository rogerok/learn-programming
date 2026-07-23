# Рефакторинг и массовые миграции

## Когда дешёвый fan-out особенно полезен

- много независимых consumers одного API;
- одинаковое механическое преобразование в разных пакетах;
- platform adapters с общим интерфейсом;
- перенос тестов на уже проверенный новый helper;
- удаление старого пути после полного списка references.

## Сначала эталон, потом масштабирование

Безопасная последовательность:

1. `cheap-scout` строит inventory definitions/references/implementations.
2. Основная модель проектирует целевой interface и cutover.
3. Основная модель мигрирует один репрезентативный consumer.
4. Выполняется узкая поведенческая проверка эталона.
5. Рецепт превращается в точный контракт для workers.
6. Workers получают непересекающиеся группы consumers.
7. Основная модель повторно проверяет references старого API.
8. Старый implementation удаляется без shim/alias.
9. Выполняется интеграционный сценарий.

Эталон важен: он превращает открытую дизайнерскую задачу в механическое применение уже проверенного паттерна.

## Запрос для массовой миграции

```text
Проведи clean-cutover рефакторинг.

Сначала параллельно используй cheap-scout для:
- определения exported symbols и всех references через LSP;
- группировки consumers по независимым пакетам/подсистемам;
- поиска dynamic/config/generated usages, которые LSP может не видеть;
- определения существующих поведенческих проверок.

Сам зафиксируй новый API и invariants. Мигрируй один репрезентативный consumer
и проверь его поведение. Только затем сформулируй механический рецепт.

Параллельно назначь cheap-worker на непересекающиеся группы consumers.
Запрети workers менять новый API, shared types и compatibility strategy.

После их завершения сам:
- проверь references старого symbol через LSP;
- проверь текстовые/dynamic usages;
- удали старую реализацию, aliases и shims;
- запусти сборку или целевой интеграционный сценарий;
- проверь, что новый API используется канонически, без второго соглашения.
```

## Как назначать ownership

Хорошо:

```text
Worker A: packages/api-consumers/**
Worker B: packages/cli/**
Worker C: packages/background-jobs/**
```

при условии, что общий exported API уже зафиксирован и эти области не меняют один shared barrel/config.

Плохо:

```text
Worker A: изменить definition
Worker B: изменить половину call sites
Worker C: изменить types, если понадобится
```

Workers B и C зависят от незавершённого A, а фраза «если понадобится» разрешает самовольное изменение контракта.

## Кейс: rename

Cross-file rename должен выполняться symbol-aware средствами LSP основной моделью или одним worker, владеющим всем rename. Нельзя раздавать текстовую замену нескольким агентам: shadowed symbols, re-exports и generated names создадут пропущенные или ложные изменения.

После rename scouts полезны для поиска:

- строковых ключей;
- environment/config names;
- документационных примеров;
- serialized fields;
- reflection/registration;
- внешних integration contracts.

Это отдельные семантики, их нельзя автоматически считать частью symbol rename.

## Кейс: миграция schema

Schema migration обычно имеет строгий порядок и плохо подходит для полного параллелизма. Можно параллельно исследовать:

- readers;
- writers;
- backfill constraints;
- rollout/rollback;
- внешних consumers.

Но стратегия expand/migrate/contract, порядок deployment и data verification остаются у основной модели. Workers допустимы только для независимых adapters после фиксации каждой фазы.

## Финальная проверка clean cutover

- у старого symbol/API нет references;
- старый runtime path недостижим;
- нет alias, deprecated wrapper или двойной записи без явного требования rollout;
- новый паттерн совпадает с эталоном;
- representative consumer и end-to-end flow проходят;
- dynamic/config/serialized contracts либо мигрированы, либо намеренно неизменны и перечислены.
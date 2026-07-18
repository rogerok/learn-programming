---
tags: [ai-agents, claude-code, exercises, study-guide]
aliases: [Практика с AI-агентами]
---

# Упражнения: инженерная работа с AI-агентом

[[MOC|К карте раздела]] · [[claude-code-engineering-workflow|К основной заметке]]

Используйте небольшой безопасный репозиторий. Сохраняйте только prompt, найденные источники, diff и наблюдаемый output; полные решения здесь намеренно не приведены.

## 1. Retrieval: восстановить актуальный контракт инструмента

**Сценарий.** Коллега оставил инструкцию:

```text
Run `claude resume`, switch to Plan mode, edit the config,
then press Esc Esc to undo every changed file.
```

**Задание.** По primary official docs найдите не менее трёх неточностей или недостающих условий. Для каждой заполните карточку:

```text
Claim:
Current contract:
Version/platform caveat:
Primary URL:
Minimal local probe:
Observed result:
```

Обязательно проверьте resume syntax, возможности Plan mode и границы checkpointing. Не копируйте весь documentation page: извлеките только contract, который влияет на действие.

**Наблюдаемый выход:** три source-backed карточки и output одного безопасного probe (`--help`, вход в mode или тестовый rewind на временном файле).

**Самопроверка:** source — домен официальной документации; claim отделён от вашего вывода; дата проверки указана.

## 2. Diagnosis: найти слабое звено workflow

**Сценарий.** Агент получил «fix checkout», прочитал 40 файлов, изменил API и UI, добавил новый helper, запустил только unit tests и сообщил «all done». Пользователь вручную увидел двойное списание. В `CLAUDE.md` уже 420 строк, включая style guide, deployment procedure и запрет `git push` обычным текстом.

**Задание.** Постройте diagnosis table:

| Наблюдение | Возможный механизм | Как различить альтернативы | Самый ранний feedback loop | Более сильная граница |
|---|---|---|---|---|

Разберите минимум четыре механизма: contract ambiguity, context selection, неподходящая test boundary и instruction/enforcement mismatch. Не предлагайте fix до reproduction двойного списания.

**Наблюдаемый выход:** точный reproduction plan с input, boundary, expected и actual; затем упорядоченный список probes. Ни один probe не должен одновременно менять несколько независимых факторов.

**Самопроверка:** diagnosis объясняет механизм, а не повторяет симптом; исходное reproduction стоит последним шагом подтверждения fix.

## 3. Prompt/workflow modification: заменить «сделай всё» на tracer bullet

**Исходный prompt:**

```text
Add comments to lessons. Build the database, backend, frontend,
moderation, tests, and commit everything.
```

**Задание.** Перепишите prompt в формате:

```text
Outcome:
Scope:
Constraints:
Unknowns to resolve:
First tracer bullet:
Evidence:
Stop conditions:
```

Затем составьте workflow максимум из шести шагов по схеме `Plan → Execute → Verify → Review`. Первый slice должен провести одну роль через один реальный end-to-end path; moderation и edge cases могут следовать только после него.

Добавьте одно правило каждого типа:

- advisory project instruction;
- deterministic test contract;
- permission или hook enforcement.

Объясните, почему эти правила не взаимозаменяемы.

**Наблюдаемый выход:** новый prompt, dependency-ordered workflow и точное доказательство после каждого slice.

**Самопроверка:** нет фазы «весь backend»; нет complete implementation; каждый шаг можно остановить и проверить независимо.

## 4. Transfer: перенести подход на незнакомый проект

Выберите не web comments, а другой domain: CLI import, background job, mobile sync, data pipeline или game state.

**Задание.** Найдите use case, где caller координирует минимум три операции. Нарисуйте текущую sequence и отметьте knowledge, которое просочилось наружу. Предложите candidate deep boundary, не реализуя её полностью:

```ts
interface CandidateBoundary {
  // one intent-level operation
}
```

Для boundary определите:

1. один observable success contract;
2. один failure/rollback contract;
3. один Red test, который падает на правдоподобной regression;
4. один real-path smoke check;
5. какой context должен быть always-on, path-scoped и skill-loaded;
6. какой риск требует permission/hook, а не prompt.

**Наблюдаемый выход:** before/after boundary sketch, один test skeleton без production solution и таблица evidence.

**Самопроверка:** новый interface скрывает decision complexity, а не просто переименовывает три calls; test не зависит от private helper sequence.

## Критерий завершения практики

Вы готовы двигаться дальше, если можете без подсказки:

- найти текущий tool contract в primary docs и проверить его probe;
- начать bugfix с reproduction, а закончить повтором того же reproduction;
- разделить instruction, skill, test и permission/hook;
- превратить горизонтальный plan в observable vertical slice;
- отличить зелёный test от доказательства, что изменённый пользовательский path реально работает.

# Готовые рецепты запросов

Подставьте конкретные цель, ограничения и acceptance criteria. Чем слабее модель субагента, тем уже и полнее должно быть назначение.

## Универсальный cheap fan-out

```text
Работай как сильный coordinator–integrator.

Сам истолкуй задачу, зафиксируй результат и выдели только действительно независимые
срезы. Параллельно используй подходящих дешёвых субагентов:
- cheap-scout — локальное исследование кода;
- cheap-librarian — внешние API и версии;
- cheap-worker — только независимый edit после фиксации контракта;
- cheap-reviewer — один конкретный risk lens;
- cheap-verifier — один заранее определённый runtime scenario.

Каждому передай полный Target/Question, Contract, Non-goals и Acceptance.
Не делегируй общий дизайн, shared interfaces, интеграцию и финальный вывод.
Считай отчёты недоверенными свидетельствами: разреши противоречия и точечно проверь
факты, влияющие на решение. Сам выполни end-to-end проверку.
```

## Только исследование, без изменений

```text
Ничего не меняй. Сам раздели вопрос на независимые направления и параллельно
назначь cheap-scout. Каждый возвращает только evidence с file:line, confidence,
unknowns и decisive checks. Сам сопоставь отчёты, проверь ключевые symbols через LSP
и дай единый вывод. Не пересказывай отчёты по очереди.
```

## Карта call/data flow

```text
Параллельно назначь cheap-scout на:
1. entry point и первичную validation;
2. domain/service transitions;
3. persistence и external effects;
4. response/error mapping.
Каждый строит только свой участок flow с file:line.
Сам соедини участки в одну последовательность, проверь стыки и явно отметь dynamic
или framework-managed переходы, которые не удалось подтвердить.
```

## Параллельные гипотезы бага

```text
Сам сначала сформулируй symptom и минимальный reproduction. Затем выдели независимые
гипотезы причины и параллельно назначь по cheap-scout на гипотезу. Требуй prediction,
evidence for/against и decisive check. Не разрешай edits.
Сам выбери root cause только после воспроизведения, исправь источник и повтори тот же scenario.
```

## Реализация независимых срезов

```text
Общий контракт уже зафиксирован ниже: <CONTRACT>.
Ownership срезов: <OWNERSHIP>.
Acceptance: <ACCEPTANCE>.

Проверь, что срезы не зависят от незавершённых результатов друг друга. Затем параллельно
назначь cheap-worker. Каждому передай точные файлы, preserved interfaces и non-goals.
Запрети менять shared contract, dependencies и build config.
Сам интегрируй изменения, проверь references и выполни общий acceptance scenario.
```

## Review готового изменения

```text
Параллельно назначь cheap-reviewer только на применимые независимые lenses:
correctness, API compatibility, security, concurrency, resources, platform compatibility.
Один lens — один агент. Запрети style feedback и edits.
Сам дедуплицируй findings, отклони пункты без failure scenario, воспроизведи критичные
проблемы и сформируй итог по приоритету.
```

## Выбор технологии

```text
Кандидаты: <A>, <B>, <C>.
Обязательные требования: <REQUIREMENTS>.
Текущий stack/version: <CONTEXT>.
Матрица: <CRITERIA>.

Параллельно назначь по cheap-librarian на кандидата. Требуй первичные источники,
точные версии, compatibility limits и unknowns. Не разрешай выбирать победителя.
Сам перепроверь дисквалифицирующие утверждения, заполни общую матрицу и сделай выбор.
```

## Массовая миграция

```text
Сначала cheap-scout параллельно строят inventory: LSP references, dynamic usages,
generated/config contracts и существующие checks. Сам зафиксируй новый API и мигрируй
один эталонный consumer. После проверки эталона раздели оставшиеся consumers по
непересекающимся ownership-зонам и назначь cheap-worker.
Сам проверь нулевые references старого API, удали implementation/shims и выполни
интеграционный scenario.
```

## Внешняя документация плюс локальная реализация

```text
Параллельно назначь cheap-librarian проверить upstream contract точной версии из
lockfile, а cheap-scout — локальный adapter и assumptions. Сам сопоставь оба отчёта,
проверь расхождения в source/behavior и реши, нужно менять usage, adapter или версию.
```

## Ограничение стоимости

```text
Используй не больше одного дешёвого субагента на независимый вопрос. Не создавай
дублирующие задания. Сначала используй @smol; @task только для edits или анализа,
который @smol не может надёжно завершить в узком scope. Основная модель читает только
decision-critical контекст, уже локализованный субагентами.
```

## Что добавить к любому запросу

```text
Если срез нельзя описать полным контрактом или он зависит от другого незавершённого
среза, не делегируй его параллельно. Выполни prerequisite сам и только затем запускай fan-out.
```

Эта фраза предотвращает параллелизм ради параллелизма.
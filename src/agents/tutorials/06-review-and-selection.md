# Review, аудит и выбор технологий

## Сфокусированное review

Несколько одинаковых запросов «сделай review» создают дубли. Делите по risk lens:

1. correctness и state transitions;
2. API compatibility и пропущенные call sites;
3. authorization и trust boundaries;
4. concurrency, cancellation и lifecycle;
5. resources, performance и avoidable allocations;
6. platform/version compatibility.

Каждый `cheap-reviewer` получает один lens и один change set/subsystem.

### Запрос

```text
Параллельно проведи сфокусированное review с помощью cheap-reviewer.
Сам выдели только применимые risk lenses и назначь по одному агенту на lens.
Запрети generic style feedback и edits.

Каждая находка должна содержать конкретный failure scenario, impact, file:line,
call path, confidence и минимальную решающую проверку. Агент обязан отличать
confirmed defect от needs reproduction.

Сам удали дубли, отклони findings без достижимого failure path, проверь через LSP
пропущенные references и воспроизведи критичные утверждения. Только после этого
назначь итоговый severity и предложи исправления.
```

## Security-аудит

Полезные независимые области:

- authentication/session lifecycle;
- authorization/object ownership;
- input parsing и injection boundaries;
- secret/config handling;
- outbound requests и SSRF-like boundaries;
- filesystem/path handling;
- dependency/supply chain;
- audit/log redaction.

Severity остаётся у основной модели. Найденная потенциально опасная строка без достижимого untrusted input и impact — не подтверждённая уязвимость.

### Требования к security finding

```text
Attacker capability
Entry point
Trust boundary crossed
Exact data/control flow
Impact
Existing mitigating control
Evidence
Reproduction or decisive check
Confidence
```

## Производительность

Разделяйте по ресурсам:

- CPU/hot paths;
- allocations/copies;
- I/O batching и request amplification;
- database query shape;
- cache behavior;
- startup/build path.

Статическое подозрение не равно bottleneck. `cheap-reviewer` локализует потенциальные причины, но основная модель должна связать их с измеренным сценарием или явно отметить finding как inference.

## Выбор библиотеки или технологии

Каждому `cheap-librarian` назначается один кандидат, но всем выдаётся одна матрица критериев.

Пример матрицы:

| Критерий | Тип |
|---|---|
| Обязательные функции | pass/fail |
| Совместимость с текущим runtime и лицензией | pass/fail |
| Сложность интеграции | weighted |
| Maintenance и release cadence | weighted |
| Производительность для нашего workload | weighted или experiment |
| Operational complexity | weighted |
| Migration/exit cost | weighted |

### Запрос

```text
Сравни кандидатов A, B и C.

Сам сначала зафиксируй обязательные требования, текущие версии проекта,
одинаковую матрицу оценки и критерии дисквалификации.
Параллельно назначь по одному cheap-librarian на кандидата.

Каждый агент должен использовать первичные источники, фиксировать version/date,
отделять документированный факт от marketing claim и перечислять неизвестные данные.
Не разрешай агентам выбирать победителя.

Сам перепроверь утверждения, влияющие на дисквалификацию или итоговый выбор.
Для performance claims потребуй сопоставимый benchmark нашего workload либо отметь
данные как неприменимые. Затем сам заполни общую матрицу и выбери вариант.
```

## Анализ issue/PR или нескольких решений

Можно назначить scouts/librarians по одному источнику, но дать общий набор вопросов:

- какая проблема решается;
- какие invariants предполагаются;
- какие компромиссы приняты;
- какие edge cases известны;
- какой evidence подтверждает результат;
- применимо ли это к текущей версии проекта.

Основная модель строит сравнительную таблицу. Последовательная склейка summaries скрывает противоречия и различия assumptions.

## Отбор findings

Итоговый отчёт должен включать только finding, который отвечает на четыре вопроса:

1. Какой конкретный сценарий ломается или эксплуатируется?
2. Где находится доказательство?
3. Каков наблюдаемый impact?
4. Какая проверка подтверждает или опровергает утверждение?

Остальное переносится в `Unknowns` или отклоняется как недостаточно обоснованное.
---
tags: [ai-agents, claude-code, workflow, testing, architecture]
aliases: [Инженерная работа с Claude Code, AI-agent tutorial]
source_checked: 2026-07-18
---

# Инженерная работа с Claude Code

Практический маршрут для разработчика: как превратить диалог с coding agent в ограниченный, наблюдаемый и воспроизводимый процесс. Примеры интерфейса относятся к Claude Code и сверены с официальной документацией **2026-07-18**. Доступность отдельных команд зависит от версии, платформы, тарифа и окружения; актуальный список всегда показывают `/` и `claude --help`.

> [!important]
> Агент не является источником истины о собственном результате. Истина — это наблюдаемое поведение программы, diff, вывод инструмента или первичный источник.

[[MOC|К карте раздела]] · [[exercises|К упражнениям]]

## 1. Контекст и ментальная модель

### Новая сессия — новое рабочее окно

Каждая сессия начинает со свежего context window. Между сессиями знания переносят не «воспоминания модели», а явные механизмы Claude Code:

- `CLAUDE.md` и path-scoped rules — инструкции разработчика;
- auto memory — записи, которые ведёт Claude Code;
- сохранённый transcript, если вы продолжили или возобновили сессию;
- файлы, которые агент заново прочитал из репозитория.

Отсюда базовая дисциплина: важный контракт должен жить в коде, тесте или проектной инструкции, а не только в старом чате.

### Что расходует контекст

В context window конкурируют system prompt, memory, project instructions, описания skills и tools, сообщения, результаты поиска, прочитанные файлы и вывод команд. Поэтому:

1. давайте точный target и критерий результата;
2. просите сначала искать, затем читать только релевантные участки;
3. выносите объёмное независимое исследование в отдельный контекст только тогда, когда результатом будет компактная сводка;
4. не вставляйте документацию «на всякий случай» — дайте ссылку или путь и условие, когда её читать.

Универсальной границы вида «после N токенов» или «после 40% модель глупеет» официальная документация не устанавливает. Размер окна зависит от модели и окружения, а качество зависит ещё и от состава контекста. Используйте `/context` как диагностику, а смену задачи, потерю требований и повторные ошибки — как сигналы завершить или очистить сессию.

### `/clear`, `/compact`, `/resume`

| Механизм | Что делает | Когда применять |
|---|---|---|
| `/clear [name]` | начинает новый разговор с пустым conversation context; прошлый разговор остаётся доступен для resume | новая независимая задача или загрязнённый контекст |
| `/compact [instructions]` | суммирует текущую беседу, освобождая место | длинная связная задача, где нужна часть накопленной истории |
| `/resume` | открывает сохранённый разговор | нужно продолжить именно прежнюю цепочку решений |
| `/context [all]` | визуализирует состав текущего context window | нужно понять, что занимает место |

`/compact` — lossy operation: summary не гарантирует сохранение всех нюансов. Перед ним зафиксируйте критичные решения в plan или task artifact и задайте фокус, например:

```text
/compact Preserve the accepted API contract, failing reproduction,
files already changed, and the exact verification command.
```

### Knowledge gaps и hallucinations

Модель может убедительно назвать несуществующий API или устаревшую команду. Для version-sensitive информации:

1. найдите первичную документацию текущей версии;
2. сопоставьте пример с установленной версией (`claude --version`, package lockfile, `--help`);
3. выполните минимальный probe;
4. только затем меняйте production workflow.

**Exit check раздела:** без подсказки объясните, откуда новая сессия получает проектный контекст, и выберите между `/clear`, `/compact` и `/resume` для трёх разных сценариев.

---

## 2. Инструменты и границы полномочий

### Запуск и продолжение

```bash
claude                         # новая interactive session
claude -c                      # продолжить последнюю беседу в текущей директории
claude -r "session-name"       # возобновить беседу по id или имени
claude -p "explain this repo"  # non-interactive query, затем выход
```

Формы `claude --continue` и `claude --resume <id>` также документированы. Команда `claude resume` из старого туториала не является текущей формой CLI и заменена на flags `-c`/`-r`.

### Полезный минимум внутри сессии

| Команда | Назначение |
|---|---|
| `/model` | выбрать доступную модель без жёстко зашитых названий |
| `/plan` | применить Plan mode к задаче |
| `/context` | увидеть состав контекста |
| `/clear` / `/compact` | начать свежий разговор / суммировать текущий |
| `/resume` | выбрать сохранённый разговор |
| `/permissions` | посмотреть и изменить permission rules |
| `/diff` | просмотреть изменения |
| `/tasks` | посмотреть background shells и subagents |
| `/usage` | посмотреть доступную usage-информацию |

Не полагайтесь на учебный список как на исчерпывающий: в самой сессии введите `/`.

### Ввод и управление

- `@path` — file path autocomplete для явной ссылки на файл.
- `!` в начале сообщения — shell mode: команда выполняется, а вывод добавляется в сессию.
- `Esc` — прервать ответ или tool call.
- `Esc Esc` при пустом prompt — открыть rewind menu; при непустом prompt очищает draft.
- `Ctrl+B` — перевести Bash command или agent в background.
- `Ctrl+Z`, затем `fg` — приостановить и вернуть CLI на Unix.
- `Shift+Tab` — циклически переключить доступные permission modes.

Keyboard shortcuts зависят от terminal и platform; окончательная проверка — `?` на пустом input и [Interactive mode](https://code.claude.com/docs/en/interactive-mode).

### Plan mode и permission modes

Plan mode разрешает исследовать и предлагать изменения, но не редактировать source files. Read-only shell commands могут выполняться; команды вне встроенного read-only набора запрашивают permission. Это не «режим без Bash», а режим без изменения исходников.

Основные режимы:

| Mode | Смысл |
|---|---|
| `default` / Manual | чтение без запроса; остальное по permission policy |
| `acceptEdits` | автоматически принимает edits и некоторые filesystem operations в рабочей области |
| `plan` | исследование и plan без edits исходников |
| `dontAsk` | неразрешённые заранее tools автоматически отклоняются |
| `bypassPermissions` | пропускает почти все prompts; только для изолированной среды |

Instructions не заменяют permissions. Фраза «не делай push» просит модель; deny rule `Bash(git push *)` блокирует действие на уровне Claude Code.

```json
{
  "permissions": {
    "allow": ["Bash(pnpm test *)"],
    "deny": ["Bash(git push *)"]
  }
}
```

Сохранённые локально approvals для Bash обычно попадают в `.claude/settings.local.json`; team-shared policy размещайте осознанно в version-controlled settings.

### Checkpoints и rewind

Claude Code сохраняет checkpoint перед каждым user prompt и умеет восстановить code, conversation или оба состояния. Но checkpointing отслеживает edits, сделанные file-editing tools. Изменения файлов через Bash и внешние/manual edits не гарантированно откатываются. Это session-level undo, а не замена Git.

Перед risky experiment:

1. проверьте clean/known working state;
2. сформулируйте ожидаемый сигнал;
3. сделайте один ограниченный эксперимент;
4. используйте rewind для tool edits или Git для долговременной истории.

### Subagents

Subagent имеет отдельный context window, tools, permissions и system prompt, затем возвращает результат в основную сессию. Это полезно для независимого поиска, больших логов или review. Это не бесплатная «умность»: плохая постановка просто распределяет неоднозначность по нескольким агентам.

Делегируйте, когда одновременно верны условия:

- задача независима от текущего решения;
- вход и формат выхода можно описать явно;
- merge результата дешевле, чем держать все детали в основной сессии.

**Exit check раздела:** запустите Plan mode, попросите исследовать один файл, убедитесь, что edits не появились, затем назовите permission rule и checkpoint limitation для потенциально опасной команды.

---

## 3. Steering: инструкция не равна ограничению

Steering — способы устойчиво сообщить агенту цель, конвенции и локальные знания. Выберите механизм по природе правила.

| Содержание | Механизм |
|---|---|
| факт, нужный почти в каждой сессии | `CLAUDE.md` |
| правило только для части paths | `.claude/rules/*.md` с `paths` frontmatter |
| task-specific procedure или reference | skill |
| механический инвариант | formatter, linter, typechecker или test |
| запрет/разрешение действия | permission rule или hook |

### `CLAUDE.md`

Claude Code читает `CLAUDE.md`, а не `AGENTS.md` напрямую. Если репозиторий уже использует `AGENTS.md`, создайте `CLAUDE.md` с import:

```markdown
@AGENTS.md

## Claude Code

Use plan mode before changes under `src/billing/`.
```

В `CLAUDE.md` помещайте только постоянные, конкретные и проверяемые сведения:

```markdown
# Project

- API handlers live in `src/api/handlers/`.
- Run `pnpm typecheck` and the relevant test target before finishing.
- Never edit files under `src/generated/`; regenerate them with `pnpm generate`.
```

Официальная документация на дату проверки рекомендует target **under 200 lines per CLAUDE.md**, а не прежние произвольные лимиты 30–50 или 100 строк. Это ориентир, не метрика качества. Если содержание нужно лишь для одного subtree или procedure, вынесите его в rules или skill.

`/init` — поддерживаемый способ сгенерировать starting `CLAUDE.md`; он не является автоматически «мусором». Результат всё равно нужно review: удалить очевидное, проверить команды и добавить невыводимые из кода решения.

### Progressive disclosure

Не загружайте каждый reference в каждую сессию. Держите короткую карту и раскрывайте детали по условию:

```text
CLAUDE.md                      always-on facts
.claude/rules/testing.md       when matching test paths are read
.claude/skills/migrate-db/     when the migration workflow is invoked
vendor docs                    when version-sensitive API is needed
```

Критерий: агент должен уметь найти деталь до действия, но деталь не обязана постоянно занимать context.

### Сильные и слабые правила

```text
Weak:  Write clean code.
Strong: API handlers return Result<T, DomainError>; do not throw domain errors.
        Verify with pnpm test api-errors.
```

Если правило можно нарушить и ни один tool этого не заметит, это advisory instruction. Для обязательного инварианта добавьте deterministic enforcement.

**Exit check раздела:** возьмите реальное проектное правило и объясните, почему оно должно жить именно в `CLAUDE.md`, path rule, skill, test или permission/hook.

---

## 4. Skills и progressive disclosure

Agent Skill — директория с обязательным `SKILL.md` и optional scripts, templates, examples и references. Claude Code следует открытому формату [Agent Skills](https://agentskills.io).

```text
.claude/skills/check-migration/
├── SKILL.md
├── reference.md
└── scripts/
    └── verify.sh
```

Минимальный skill:

```markdown
---
name: check-migration
description: Validate a database migration against this repository's rollback policy. Use when a migration is added or changed.
disable-model-invocation: true
allowed-tools: Read Grep Bash
---

1. Read `reference.md` for the rollback contract.
2. Inspect the changed migration.
3. Run `scripts/verify.sh`.
4. Report the command, exit status, and any violated contract.
```

Project skills живут в `.claude/skills/<name>/SKILL.md`, personal skills — в `~/.claude/skills/<name>/SKILL.md`.

### Управление вызовом

- По умолчанию skill может вызвать и пользователь, и Claude.
- `disable-model-invocation: true` оставляет ручной вызов `/name`.
- `user-invocable: false` скрывает skill из пользовательского `/` menu, оставляя его модели.
- `context: fork` запускает skill в forked subagent context.

Description — routing contract. В нём должны быть capability и trigger, а не рекламная формулировка:

```yaml
description: Diagnose better-sqlite3 native ABI mismatch. Use when loading the module fails after switching Node or container environments.
```

Тело skill загружается при использовании и остаётся в context текущей беседы; поэтому оно тоже должно быть компактным. Длинные справочники держите рядом и явно указывайте, когда их читать.

### Как извлечь skill из повторяющейся проблемы

1. Сохраните точный симптом и verified fix.
2. Опишите preconditions: когда fix безопасен и когда нет.
3. Добавьте verification, а не только команду изменения.
4. Проверьте routing прямым вызовом и естественным prompt.
5. Не кодируйте одноразовую догадку как постоянное правило.

Пример полезной узкой процедуры: после ABI mismatch у native dependency проверить версии runtime и binary, выполнить repository-approved rebuild command, затем повторить исходный failing import. Команда без reproduction и повторной проверки — ещё не feedback loop.

**Exit check раздела:** создайте на бумаге frontmatter для ручного skill и перечислите наблюдаемые доказательства, которые он обязан вернуть.

---

## 5. Планирование и выполнение

### Сначала outcome и ограничения

Начальный prompt должен отвечать хотя бы на четыре вопроса:

```text
Outcome: какое поведение изменится?
Scope: какие области можно и нельзя менять?
Constraints: какие контракты и решения обязательны?
Evidence: что наблюдаемо докажет результат?
```

Пример:

```text
Add comment moderation for instructors.
Students can create comments; instructors can hide and restore them.
Do not change authentication or introduce a new queue.
First reproduce the missing authorization boundary, then propose the
smallest end-to-end slice and name the exact runtime and test evidence.
```

Перед plan уточните неоднозначности: edit/delete semantics, visibility, permissions, limits, migration and rollback, error behavior. Агент не должен незаметно превращать неизвестное в design decision.

### PRD и task plan

PRD фиксирует destination:

- problem и user outcome;
- numbered user stories;
- contracts and boundaries;
- decisions already accepted;
- out of scope;
- observable acceptance.

Task plan фиксирует route: конкретные slices, files/boundaries, dependency order и check после каждого slice. Не смешивайте «что нужно пользователю» с случайной последовательностью файлов.

### Tracer bullets вместо горизонтальных слоёв

Horizontal plan:

```text
1. Build every database table.
2. Build every API endpoint.
3. Build the UI.
4. Add tests.
```

Vertical tracer bullet:

```text
1. One authorized request changes one record and becomes visible in one UI path.
2. Verify the real request, persistence, response, and rendered state.
3. Add remaining states and errors one observable contract at a time.
```

После первого slice уже существует минимальный end-to-end signal. Он рано выявляет неверные assumptions на границах.

### Рабочий цикл

```text
PLAN → EXECUTE → VERIFY → REVIEW → CLEAR/CONTINUE
```

1. **Plan:** исследовать существующие patterns и зафиксировать contract.
2. **Execute:** сделать минимальное изменение; не расширять scope «заодно».
3. **Verify:** сначала targeted static/test feedback, затем запустить реальный path.
4. **Review:** прочитать diff, проверить errors, permissions и unintended changes.
5. **Clear/continue:** новая независимая задача → `/clear`; тот же связный contract → продолжить или осознанно `/compact`.

Commit не является доказательством качества. Pre-commit hook — gate, а не замена smoke test.

### Новый и существующий проект

Для нового проекта сначала стабилизируйте один walking skeleton: запуск, minimal feature path, typecheck/test commands. Для существующего — сначала найдите текущие boundaries, authorization, data flow, conventions и test seams. Новый pattern рядом с уже существующим создаёт энтропию, даже если локально выглядит лучше.

**Exit check раздела:** перепишите реальную задачу в outcome/scope/constraints/evidence и выделите первый tracer bullet, который можно запустить end-to-end.

---

## 6. Feedback loops

Feedback loop состоит из действия, сигнала, интерпретации и следующего действия. Фраза «агент прогнал тесты» не завершает loop без command, exit status и связи проверки с изменённым contract.

### Иерархия сигналов

| Сигнал | Что ловит | Чего не доказывает |
|---|---|---|
| formatter/linter | syntax, style, часть suspicious patterns | runtime behavior |
| typecheck/build | type and module integration | business semantics и UX |
| unit test | локальный observable contract | wiring между системами |
| integration test | interaction boundaries | реальный пользовательский путь целиком |
| application smoke test | runtime wiring и основной path | все edge cases |
| manual/visual check | perceived behavior и UX | regression safety всего проекта |

Запускайте самый узкий релевантный check первым, но заканчивайте проверкой «вещи самой»: CLI — выполнить команду, API — сделать request, UI — пройти flow в браузере.

### Deterministic enforcement

- Formatter/linter/typechecker превращают style и static invariants в machine feedback.
- Tests защищают observable contracts.
- Git hooks или CI могут блокировать переход состояния.
- Claude Code hooks выполняют команды в lifecycle events и подходят для deterministic policy.
- Permission rules блокируют опасные tool calls независимо от текста prompt.

Официальный Hooks guide прямо отличает hooks, которые выполняются детерминированно, от инструкции, которую LLM ещё должна решить применить. Не отправляйте через hook огромный лог в context: возвращайте короткий actionable result и сохраняйте полный artifact отдельно.

### Диагностический цикл

```text
REPRODUCE → LOCALIZE → HYPOTHESIZE → PROBE → FIX → RE-RUN REPRODUCTION
```

- **Reproduce:** зафиксировать команду/input и наблюдаемое неверное поведение.
- **Localize:** сузить boundary, не редактируя всё подряд.
- **Hypothesize:** назвать механизм, а не пересказать error.
- **Probe:** отличить гипотезу от альтернатив минимальным экспериментом.
- **Fix:** изменить источник проблемы.
- **Re-run:** повторить исходное reproduction, затем regression checks.

**Exit check раздела:** для одного недавнего bug запишите исходный reproduction и два разных feedback signals; объясните, какой доказывает fix, а какой лишь снижает риск.

---

## 7. Тестирование с агентом

### Red → Green → Refactor

1. **Red:** написать один тест observable behavior и увидеть ожидаемое падение.
2. **Green:** внести минимальное изменение и увидеть прохождение этого теста.
3. **Refactor:** улучшить структуру, не меняя contract; повторить checks.

Red обязателен: тест, который был зелёным до fix, не доказывает, что он ловит regression. Тест должен падать на правдоподобной поломке, а не на исходном тексте файла или внутреннем вызове helper.

```ts
it("rejects an expired coupon at the checkout boundary", async () => {
  // Arrange externally meaningful state.
  // Act through the public boundary.
  // Assert the observable result and absence of a charge.
});
```

Это skeleton требования, не готовое решение: concrete fixtures и API зависят от проекта.

### Выбор границы

Хороший тест отвечает на вопрос пользователя или caller:

- какое input/state дано;
- через какой public boundary идёт действие;
- какой output, transition или error наблюдаем;
- какой важный side effect отсутствует.

Не тестируйте private helper только потому, что его проще вызвать. Если contract находится на endpoint/module/CLI boundary, тестируйте его там.

### Где строгий TDD не лучший первый шаг

- exploratory spike, цель которого — выяснить возможен ли подход;
- визуальная UX-итерация до согласования поведения;
- внешняя интеграция, где сначала нужен минимальный live probe для понимания protocol.

После discovery перенесите найденный contract в устойчивую автоматическую проверку, если изменение остаётся в продукте.

### Тесты не заменяют smoke test

Даже зелёный suite может проверить не тот wiring. После fix выполните реальный path. Для frontend откройте приложение и взаимодействуйте с изменённым состоянием; для CLI проверьте stdout, stderr и exit code; для API сделайте реальный request в контролируемом окружении.

**Exit check раздела:** покажите один Red failure и последующий Green output для одного contract, затем отдельно приложите наблюдение из real-path smoke test.

---

## 8. Архитектура: deep modules

John Ousterhout определяет deep module как большой объём functionality за сравнительно простым interface; shallow module почти не скрывает complexity. Цель — не «больше кода в одном файле», а information hiding и стабильная boundary.

| Boundary | Interface | Скрытая реализация |
|---|---|---|
| Shallow | много взаимозависимых calls и knowledge у caller | мало decisions |
| Deep | малая cohesive surface | policy, orchestration и details внутри |

### Почему это помогает человеку и агенту

- Чтобы изменить caller, нужно прочитать меньше внутренних файлов.
- Tests могут защищать public contract, не фиксируя implementation sequence.
- Локальные решения не расползаются в prompts и call sites.
- Снижается число мест, где агент может воспроизвести несовместимый pattern.

### Признаки shallow boundary

- caller обязан вызвать три services в правильном порядке;
- один domain operation требует raw DB knowledge в разных местах;
- изменение implementation ломает tests без изменения результата;
- соседние modules реализуют одну policy разными способами;
- parameter list раскрывает внутреннюю orchestration вместо intent.

### Пример направления рефакторинга

До:

```ts
await quizStore.saveAttempt(input);
const score = await quizScoring.calculate(input.answers);
await xpService.award(input.userId, score);
```

Caller знает sequence и policy. Возможная более глубокая boundary:

```ts
const result = await quiz.submitAttempt({ userId, quizId, answers });
```

Это ещё не готовый design. До реализации нужно ответить:

- атомарны ли save, score и award;
- что возвращает public contract;
- где authorization и idempotency;
- какой failure rollback ожидается;
- какой test boundary наблюдает весь transition.

Не объединяйте modules только ради меньшего числа файлов. Cohesion и скрытая decision complexity важнее размера.

**Exit check раздела:** нарисуйте текущую sequence одного use case, отметьте knowledge caller и предложите interface, скрывающий хотя бы одно устойчивое design decision; проверьте его contract-based test case.

---

## 9. Контролируемая автономность и Ralph

Ralph — паттерн повторного запуска coding agent с тем же backlog-oriented prompt до выполнения условия остановки. Geoffrey Huntley популяризировал название в статье [“Ralph Wiggum as a ‘software engineer’”](https://ghuntley.com/ralph/) (2025-07-14).

Это не отменяет инженерный процесс, а многократно повторяет его. Поэтому автономный loop разумен только при наличии:

- маленьких независимых work items;
- machine-readable acceptance;
- быстрых feedback loops;
- лимита итераций и стоимости;
- sandbox/permissions, ограничивающих blast radius;
- явного stop condition и escalation path.

Плохой prompt, flaky checks или неоднозначный backlog в loop масштабируют ошибку. Сначала добейтесь надёжности одного human-in-the-loop цикла, затем автоматизируйте повторение.

---

## 10. Рабочие чеклисты

### Перед изменением

- [ ] Outcome, scope, constraints и evidence записаны.
- [ ] Version-sensitive API проверен по primary docs и installed version.
- [ ] Existing pattern и test boundary найдены.
- [ ] Permission mode соответствует риску.
- [ ] Есть reproduction или минимальный tracer bullet.

### Перед завершением

- [ ] Исходный reproduction повторён и теперь проходит.
- [ ] Relevant static/test feedback зелёный.
- [ ] Real path запущен и наблюдаем.
- [ ] Diff прочитан на unintended changes.
- [ ] Документирован command/output, а не только утверждение агента.
- [ ] Следующая независимая задача начнётся с `/clear` или новой сессии.

### Антипаттерны

- Фиксированные «smart/dumb zone» проценты без измерения и первичного источника.
- Жёстко зашитые model names и context limits в долгоживущей заметке.
- `CLAUDE.md` как склад всей документации.
- Advisory prompt вместо test, permission или hook для обязательного правила.
- Plan по слоям без раннего end-to-end signal.
- Tests-only verification без запуска изменённого path.
- Delegation нескольких агентов при общем изменяемом state и неясном merge contract.
- Автономный loop без stop condition и sandbox.

---

## Источники

### Первичные, проверены 2026-07-18

- Anthropic, [CLI reference](https://code.claude.com/docs/en/cli-reference) — формы `claude`, `-c/--continue`, `-r/--resume`, `-p`.
- Anthropic, [Commands](https://code.claude.com/docs/en/commands) — `/clear`, `/compact`, `/context`, `/resume`, `/plan`, `/permissions`, `/tasks`, доступность команд.
- Anthropic, [Interactive mode](https://code.claude.com/docs/en/interactive-mode) — `@`, `!`, `Esc`, `Esc Esc`, `Ctrl+B`, `Ctrl+Z`, `Shift+Tab`.
- Anthropic, [Permission modes](https://code.claude.com/docs/en/permission-modes) и [Permissions](https://code.claude.com/docs/en/permissions) — поведение Plan mode, permission modes, allow/ask/deny и сохранение local approvals.
- Anthropic, [Memory](https://code.claude.com/docs/en/memory) — свежий context каждой сессии, scopes `CLAUDE.md`, import `AGENTS.md`, path rules, `/init`, рекомендация under 200 lines.
- Anthropic, [Explore the context window](https://code.claude.com/docs/en/context-window) — категории startup и runtime context; оснований для универсального процента «smart zone» не заявлено.
- Anthropic, [Skills](https://code.claude.com/docs/en/skills) — locations, progressive loading, frontmatter invocation controls и supporting files.
- Anthropic, [Subagents](https://code.claude.com/docs/en/sub-agents) — отдельный context, tools/permissions и summary в parent conversation.
- Anthropic, [Checkpointing](https://code.claude.com/docs/en/checkpointing) — restore options и ограничение для Bash/external file changes.
- Anthropic, [Hooks guide](https://code.claude.com/docs/en/hooks-guide) — deterministic lifecycle automation.
- Agent Skills, [Open format specification](https://agentskills.io) — переносимый формат skills.
- John Ousterhout, Stanford, [Modular Design lecture](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php?topic=modularDesign) и [A Philosophy of Software Design](https://web.stanford.edu/~ouster/cgi-bin/aposd.php) — deep/shallow modules.

### Сохранённые дополнительные ссылки

- Kyle, HumanLayer, [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) (2025-11-25) — практическое мнение о concise onboarding и progressive disclosure; при расхождении приоритет у официальной документации.
- Geoffrey Huntley, [Ralph Wiggum as a “software engineer”](https://ghuntley.com/ralph/) (2025-07-14) — исходная статья о Ralph loop.
- [ccstatusline on npm](https://www.npmjs.com/package/ccstatusline) — сохранённая из исходного туториала third-party ссылка; инструмент optional, встроенная `/context` остаётся первичным способом диагностики context usage.
- John Ousterhout, *A Philosophy of Software Design* — deep modules.
- David Thomas, Andrew Hunt, *The Pragmatic Programmer* — tracer bullets и software entropy.
- Kent Beck, *Extreme Programming Explained* — TDD и Red-Green-Refactor.

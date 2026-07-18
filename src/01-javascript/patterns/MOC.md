---
tags: [javascript, moc, functional-programming, patterns]
aliases: [JavaScript Patterns, JavaScript FP]
---

# JavaScript FP и паттерны

## Цель

Перейти от функций как синтаксиса к композиции поведения: уметь контролировать эффекты, специализировать и соединять функции, прослеживать continuation и отличать каноническую концепцию от последовательности конкретной книги или курса.

## Пререквизиты

- [[../core/functions/closure|Closure]].
- [[../core/functions/pure-functions|Чистые функции]].
- [[../core/functions/cqs|CQS]].
- Для CPS: [[../core/async/2.call-stack|call stack]], [[../core/async/3.asynchronous-code|callbacks]] и [[../core/async/5.asynchronous-flow|async flow]].
- Для контейнеров: уверенная function composition и чтение сигнатур функций.

## Учебный путь по зависимостям

Порядок ниже задают зависимости понятий, а не авторство заметок. Материалы HowProgrammingWorks помечены как источниковый трек и повторно собраны в отдельном разделе.

### 1. Подготовка функций

1. Повторить [[../core/functions/closure|closure]] и [[../core/functions/pure-functions|pure functions]].
2. Пройти [[partial-application/readme|partial application и currying]] — материал источникового трека HowProgrammingWorks.
3. Закрепить сценарии в [[partial-application/use-cases-curry|use cases для currying]] из того же трека.

**Наблюдаемая проверка:** из функции нескольких аргументов получить специализированную функцию, назвать сохранённое окружение и не спутать currying с фиксацией нескольких аргументов.

### 2. Композиция

1. [[fp/function-composition/function-composition|Currying, compose, pipe и pointfree]].
2. [[memoization/memoization|Memoization]] — после понимания чистоты и аргументов cache key.
3. [[chaining/readme|Chaining]] — пример источникового трека; сравнить с внешней композиционной функцией.
4. [[fp/fp-example-app/fp-example-app|FP example app]] — перенос приёмов в связный пример.

**Наблюдаемая проверка:** без запуска перечислить порядок вызовов `compose`; собрать pipeline из функций одного входа; вставить диагностический этап без изменения результата; объяснить, когда memoization небезопасна из-за эффекта или изменяемого аргумента.

### 3. Явное управление потоком

1. [[fp/cps/cps|Continuation-Passing Style]].
2. [[fp/cps/exercises|CPS exercises]] в сохранённом порядке: transform → trampoline → async pipeline.
3. [[event-emitter/readme|EventEmitter]] и [[high-order-func-events-callbacks/readme|events/callbacks]] как соседние модели передачи управления.

**Наблюдаемая проверка:** отметить continuation в сигнатуре, вручную проследить один CPS-вызов, объяснить отсутствие обычного `return` и выбрать отдельный error continuation либо error-first callback.

## Источниковые треки

### HowProgrammingWorks и примеры паттернов

Эти заметки следуют курсу и демонстрационным реализациям. Они дополняют канонический путь, но не задают порядок понятий:

1. [[high-order-func-events-callbacks/readme|Higher-order functions, events, callbacks]].
2. [[partial-application/readme|Partial application]].
3. [[event-emitter/readme|EventEmitter]].
4. [[fabrics-pools/readme|Фабрики и пулы]].
5. [[chaining/readme|Chaining]].

### Mostly Adequate Guide

Главы проходятся последовательно; каталог не перемещается, принадлежность треку выражена ссылками:

1. [[fp/mostly-adequate-guide-to-fp/hindley-milner/hindley-milner|Hindley–Milner]] — справочник, полезный до чтения сигнатур.
2. [[fp/mostly-adequate-guide-to-fp/ch08-functors-and-containers/functors-and-containers|Functors and containers]].
3. [[fp/mostly-adequate-guide-to-fp/ch09-monads/monads|Monads]].
4. [[fp/mostly-adequate-guide-to-fp/ch10-applicative-functors/applicative-functors|Applicative functors]].
5. [[fp/mostly-adequate-guide-to-fp/ch11-natural-transformations/natural-transformations|Natural transformations]].
6. [[fp/mostly-adequate-guide-to-fp/ch12-traversable/traversable|Traversable]].

**Наблюдаемая проверка:** для каждого контейнерного этапа назвать операцию предыдущего этапа, от которой он зависит (`map`, `chain`, `ap`, смена контекста, `traverse`), и привести собственный тип значения до и после операции.

## Практика

- `partial-application/exercises/` — короткие задания на closure, `bind`, partial application и curry.
- Соседние `.js`-файлы в `fp/function-composition/` — наблюдение за порядком composition.
- [[fp/cps/exercises|CPS exercises]] — самостоятельный набор; готовые решения в индекс не добавляются.
- У глав Mostly Adequate Guide есть соседние папки `exercises/` и локальные `anki-cards.txt`.

## Проверки выхода

- Реализовать специализацию функции и объяснить её closure.
- Собрать `pipe`/`compose`-цепочку и предсказать порядок вычисления.
- Отделить чистое преобразование от I/O на границе pipeline.
- Проследить success/error continuation без скрытой потери управления.
- Выбрать concept note для ответа на вопрос, а book/course track — для последовательного углубления.

## Справочные материалы

- [[../MOC|Общий JavaScript MOC]].
- [[../core/MOC|JavaScript Core]].
- [[../anki-cards.txt|Общие Anki cards]].
- Локальные `anki-cards.txt` рядом с CPS и главами книги.

## Связанные темы

- [[../core/async/MOC|Async/runtime]].
- [[../core/oop-in-js/prototype|Prototype chain]].
- [[../core/functions/cqs|CQS]].

## Источники

- [HowProgrammingWorks — индекс курса](https://github.com/HowProgrammingWorks/Index).
- [Patterns for JavaScript & Node.js — Тимур Шемсединов](https://github.com/tshemsedinov/Patterns-JavaScript).
- [Mostly Adequate Guide to Functional Programming](https://github.com/MostlyAdequate/mostly-adequate-guide).
- [Ramda](https://ramdajs.com/) — справочник по функциям композиции, указанный в заметке о composition.

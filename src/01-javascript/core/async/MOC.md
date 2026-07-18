---
tags: [javascript, moc, async, runtime]
aliases: [JavaScript Async, Async Runtime]
---

# JavaScript Async и Runtime

## Цель

Научиться прослеживать асинхронную операцию от регистрации до завершения, не терять её результат или ошибку и осознанно выбирать последовательное, конкурентное либо параллельное выполнение.

## Пререквизиты

- [[../syntax/control-flow|Control flow и try/catch/finally]].
- [[../functions/closure|Closure и лексическая область видимости]].
- Умение читать функцию, callback и stack trace.

## Путь по зависимостям

### 1. Модель исполнения

1. [[1.theory-unit|Событийная модель]].
2. [[2.call-stack|Call stack, runtime и event loop]].
3. [[3.asynchronous-code|Callback-based async]].

**Наблюдаемая проверка:** до запуска записать порядок синхронных логов и callback, затем объяснить каждый переход между call stack и очередью задач.

### 2. Результат, порядок и ошибка callback

1. [[4.asynchronous-return|Почему async-результат не возвращается синхронным return]].
2. [[5.asynchronous-flow|Последовательный callback-flow и callback hell]].
3. [[6.error-handling|Граница try/catch и error-first callback]].
4. [[8.timers|Timers и задержка выполнения]].

**Наблюдаемая проверка:** написать wrapper, который вызывает error-first callback ровно один раз; на успехе отдаёт данные, на ошибке сохраняет исходный `Error`; объяснить, почему timer delay — нижняя граница, а не точное время запуска.

### 3. Promise и непрерывность цепочки

1. [[9.promise|Promise и новый Promise из then]].
2. [[10.promise-catch|Передача и восстановление ошибки через catch]].
3. [[11.chain-of-promise|Возврат каждого Promise и последовательная динамическая цепочка]].

**Наблюдаемая проверка:** по Promise chain указать значение каждого следующего `then`; найти отсутствующий `return`; показать, какой `catch` получит ошибку; построить последовательную обработку списка неизвестной длины.

### 4. Расширенная модель конкурентности

Этот этап проходите после уверенной работы с Promise:

1. [[async-2/8.concurrency-parallel|Асинхронность, конкурентность и параллелизм]].
2. [[async-2/9.axes-and-flows|Push/pull, владение состоянием и eager/lazy]].
3. [[async-2/10.concurrency-tools|Очереди, semaphore, mutex и гонки]].
4. [[async-2/11.context-and-effects|Контекст, actors, STM и Effect]] — обзор моделей, не базовый синтаксис.

**Наблюдаемая проверка:** для I/O-bound и CPU-bound сценария выбрать механизм; обнаружить race condition вокруг общего состояния; назвать канал результата, ошибки и отмены для выбранной модели.

## Практика

- [[../exercises#2. Explain — порядок выполнения|Explain: call stack и timer]].
- [[../exercises#3. Modify — error-first callback|Modify: error-first callback]].
- [[../exercises#4. Implement — последовательная Promise-цепочка|Implement: последовательная Promise-цепочка]].
- [[../exercises#5. Diagnose — потерянный Promise|Diagnose: потерянный Promise]].
- [[../exercises#6. Transfer — управляемый async-pipeline|Transfer: управляемый async-pipeline]].
- После callback-этапа можно отдельно пройти [[../../patterns/fp/cps/exercises|существующие упражнения по CPS]].

## Проверки выхода

- Предсказать порядок выполнения callback и обосновать его через stack/queue.
- Не использовать синхронный `return` как результат незавершённой операции.
- Сохранить error-first контракт без двойного callback.
- Вернуть Promise из функции и каждого вложенного шага.
- Отличить восстановление после `catch` от проброса ошибки дальше.
- Выбрать последовательность или конкурентный запуск по зависимости данных, а не по привычке.

## Справочные материалы

- [[../MOC|JavaScript Core]].
- [[../../MOC|Общий JavaScript MOC]].
- [[../../anki-cards.txt|Anki cards]].

## Связанные темы

- [[../../patterns/fp/cps/cps|Continuation-Passing Style]].
- [[../../patterns/event-emitter/readme|EventEmitter и push-модель]].
- [[../../patterns/chaining/readme|Chaining]].

## Источники

- [JavaScript Visualized: Promise Execution](https://lydiahallie.framer.website/blog/promise-execution) — дополнительная визуализация Promise и event loop из общего MOC.
- [Web Workers: Параллельные вычисления](https://habr.com/ru/articles/767494/) — дополнительный материал к различию конкурентности и параллелизма.

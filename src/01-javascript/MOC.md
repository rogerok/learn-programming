---
tags: [javascript, moc, index, functional-programming]
aliases: [JavaScript]
---

# JavaScript — Map of Content

## Цель

Пройти от базовой семантики JavaScript к асинхронному runtime, прототипной объектной модели и функциональным способам композиции. После маршрута ученик должен не только узнавать конструкции, но и предсказывать их поведение, объяснять причины результата, исправлять потерю управления и переносить приёмы в новую задачу.

## Пререквизиты

- Умение запускать `.js`-файл через `node` и читать `stdout`/stack trace.
- Базовое знакомство с переменными, функциями, объектами и массивами.
- Для ветки FP сначала нужны замыкания и чистые функции; для CPS дополнительно нужен стек вызовов и callback-based async.

## Как выбрать следующий шаг

1. Начинайте с [[core/MOC|маршрута по ядру JavaScript]].
2. Не переходите дальше, пока не можете выполнить проверку текущего этапа без подсказки.
3. После языка выберите основную ветку: [[core/async/MOC|async/runtime]] или объектную модель; затем пройдите вторую.
4. Переходите к [[patterns/MOC|FP и паттернам]] только после проверок по замыканиям, `this`, Promise и обработке ошибок.
5. Книга и курсы ниже — отдельные источниковые треки, а не замена каноническим заметкам.

## Маршрут по зависимостям

### Этап 1. Ядро языка

1. [[core/syntax/statements-vs-expressions|Выражения и инструкции]] — отличать значение от управляющей инструкции.
2. [[core/syntax/control-flow|Control flow и try/catch/finally]] — прослеживать ветвления и завершение блока.
3. [[core/syntax/with-statement|with и цепочка областей видимости]] — исторический контекст; не использовать `with` в новом коде.
4. [[core/functions/closure|Лексическая область видимости и замыкания]] — объяснять, какое окружение сохраняет функция.
5. [[core/functions/pure-functions|Чистые функции]] — отделять вычисление от эффекта.
6. [[core/functions/cqs|CQS]] — различать запрос и команду.

**Проверка выхода:** по короткому фрагменту предсказать возвращаемое значение и изменение состояния; для замыкания указать, откуда берётся каждая свободная переменная; разделить смешанную функцию на запрос и команду.

### Этап 2. Async и runtime

Пройдите [[core/async/MOC|маршрут async/runtime]]: call stack → callback → error-first callback → timers → Promise → непрерывная цепочка → модели конкурентности.

**Проверка выхода:** до запуска объяснить порядок синхронных логов и timer-callback; вернуть Promise из каждого уровня цепочки; показать, где ошибка сменит стек или перейдёт в `catch`; отличить конкурентность от параллелизма для I/O-bound и CPU-bound работы.

### Этап 3. Объектная модель и прототипы

1. [[core/oop-in-js/this|Динамический this]].
2. [[core/oop-in-js/arrow-functions|Стрелочные функции и лексический контекст]].
3. [[core/oop-in-js/bind|bind, call, apply]].
4. [[core/oop-in-js/constructor|Функции-конструкторы и new]].
5. [[core/oop-in-js/prototype|Prototype chain и поиск свойств]].
6. [[core/oop-in-js/boxing|Boxing примитивов]].
7. [[core/oop-in-js/encapsulation|Инкапсуляция]].

**Проверка выхода:** для четырёх форм вызова определить `this`; вручную описать шаги `new`; найти свойство по prototype chain и объяснить shadowing собственного свойства; выбрать границу инкапсуляции без копирования метода в каждый экземпляр.

### Этап 4. FP и управление потоком

Канонический путь находится в [[patterns/MOC|MOC по FP и паттернам]]:

1. чистота и замыкания;
2. partial application/currying;
3. function composition;
4. CPS как явная передача продолжения;
5. контейнеры и композиция эффектов — только после базового FP.

**Проверка выхода:** собрать преобразование из малых чистых функций; объяснить порядок `compose`; проследить continuation; выбрать Promise, callback или CPS-представление и обосновать границы ошибок и эффектов.

## Канонические заметки и источниковые треки

### Канонические концепции

- [[core/functions/closure|Замыкания]] и [[core/functions/pure-functions|чистые функции]].
- [[patterns/fp/function-composition/function-composition|Function composition]].
- [[patterns/fp/cps/cps|Continuation-Passing Style]].
- [[patterns/memoization/memoization|Memoization]].

### Трек HowProgrammingWorks и примеры паттернов

Это материалы курса и демонстрационные реализации. Если для понятия нет отдельной канонической заметки, маршрут использует этот материал как точку входа, не меняя его происхождение.

- [[patterns/high-order-func-events-callbacks/readme|Higher-order functions, events и callbacks]].
- [[patterns/partial-application/readme|Partial application и currying]].
- [[patterns/event-emitter/readme|EventEmitter]].
- [[patterns/fabrics-pools/readme|Фабрики и пулы]].
- [[patterns/chaining/readme|Chaining]].

### Трек Mostly Adequate Guide

Это последовательность глав книги, а не каталог базовых понятий:

1. [[patterns/fp/mostly-adequate-guide-to-fp/hindley-milner/hindley-milner|Нотация Hindley–Milner]] — справочник по сигнатурам.
2. [[patterns/fp/mostly-adequate-guide-to-fp/ch08-functors-and-containers/functors-and-containers|Functors and containers]].
3. [[patterns/fp/mostly-adequate-guide-to-fp/ch09-monads/monads|Monads]].
4. [[patterns/fp/mostly-adequate-guide-to-fp/ch10-applicative-functors/applicative-functors|Applicative functors]].
5. [[patterns/fp/mostly-adequate-guide-to-fp/ch11-natural-transformations/natural-transformations|Natural transformations]].
6. [[patterns/fp/mostly-adequate-guide-to-fp/ch12-traversable/traversable|Traversable]].

## Практика

- [[core/exercises|Core и async: predict → explain → modify → implement → diagnose → transfer]].
- [[patterns/fp/cps/exercises|Упражнения по CPS]] — существующий набор сохраняет отдельный порядок прохождения.
- Примеры композиции: [[patterns/fp/function-composition/function-composition|глава о composition]] и соседние `.js`-файлы.
- Каррирование: задания в `patterns/partial-application/exercises/` после соответствующей заметки.

## Итоговые наблюдаемые проверки

Маршрут завершён, если без готового решения вы можете:

- предсказать результат кода с closure, `this`, timer и Promise chain, затем подтвердить его запуском;
- объяснить результат через lexical environment, call stack, очередь задач или prototype chain;
- исправить error-first callback и потерянный Promise так, чтобы вызывающий код наблюдал результат и ошибку;
- реализовать последовательную обработку неизвестного заранее числа async-операций;
- диагностировать различие между отсутствующим `return`, перехваченной ошибкой и подавленной ошибкой;
- перенести те же правила в небольшой pipeline с внедрёнными I/O-функциями.

## Справочные материалы

- [[01-javascript/anki-cards.txt|Anki cards по JavaScript]].
- [[core/MOC|Индекс ядра языка]].
- [[core/async/MOC|Индекс async/runtime]].
- [[patterns/MOC|Индекс FP и паттернов]].

## Связанные темы

- [[../02-typescript/MOC|TypeScript]].
- [[../03-oop/MOC|OOP]].
- [[../08-internals/jit-compilation|JIT-компиляция в V8]].

## Источники

### Основы и runtime

- [JavaScript Visualized: Promise Execution](https://lydiahallie.framer.website/blog/promise-execution) — визуализация Promise и event loop.
- [33 Concepts Every JavaScript Developer Should Know](https://github.com/leonardomso/33-js-concepts) — внешний каталог тем.
- [Web Workers: Параллельные вычисления](https://habr.com/ru/articles/767494/).

### Паттерны и FP

- [Patterns for JavaScript & Node.js — Тимур Шемсединов](https://github.com/tshemsedinov/Patterns-JavaScript).
- [HowProgrammingWorks — индекс курса](https://github.com/HowProgrammingWorks/Index).
- [Mostly Adequate Guide to Functional Programming](https://github.com/MostlyAdequate/mostly-adequate-guide).

### Справочные блоги

- [Dmitri Pavlutin — JavaScript](https://dmitripavlutin.com/).
- [2ality — JavaScript and more](https://2ality.com/index.html).

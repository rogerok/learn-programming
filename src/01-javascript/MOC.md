---
tags: [javascript, moc, index, functional-programming]
aliases: [JavaScript]
---

# JavaScript — Map of Content

## Core: Основы языка

### Синтаксис
- [[core/syntax/statements-vs-expressions|Выражения и инструкции]]
- [[core/syntax/control-flow|Control Flow: try / catch / finally]]
- [[core/syntax/with-statement|with statement и цепочка областей видимости]]

### Функции
- [[core/functions/closure|Замыкания (Closures)]]
- [[core/functions/pure-functions|Чистые функции]]
- [[core/functions/cqs|CQS: Разделение команд и запросов]]

### Асинхронность
- [[core/async/1.theory-unit|1. Введение: браузерная модель событий]]
- [[core/async/2.call-stack|2. Call Stack и среда исполнения (V8)]]
- [[core/async/3.asynchronous-code|3. Асинхронный код и коллбэки]]
- [[core/async/4.asynchronous-return|4. Возврат значений в async коде]]
- [[core/async/5.asynchronous-flow|5. Упорядочивание операций]]
- [[core/async/6.error-handling|6. Обработка ошибок в асинхронном коде]]
- [[core/async/8.timers|8. Таймеры: setTimeout / setInterval]]
- [[core/async/9.promise|9. Промисы]]
- [[core/async/10.promise-catch|10. Promise.catch и обработка ошибок]]
- [[core/async/11.chain-of-promise|11. Цепочка промисов]]

### ООП в JavaScript
- [[core/oop-in-js/this|this: контекст вызова]]
- [[core/oop-in-js/prototype|Прототипы и цепочка прототипов]]
- [[core/oop-in-js/constructor|Конструкторы и оператор new]]
- [[core/oop-in-js/arrow-functions|Стрелочные функции и контекст]]
- [[core/oop-in-js/bind|bind, call, apply]]
- [[core/oop-in-js/boxing|Упаковка примитивов (Boxing)]]
- [[core/oop-in-js/encapsulation|Инкапсуляция в JS]]

## Паттерны функционального программирования

Курс [Т. Шемсединова](https://github.com/HowProgrammingWorks):

- [[patterns/readme|Введение]]
- [[patterns/partial-application/readme|Частичное применение и каррирование]]
- [[patterns/partial-application/use-cases-curry|Практические примеры каррирования]]
- [[patterns/function-composition/function-composition|Композиция функций (pipe, compose)]]
- [[patterns/fp/mostly-adquate-guide-fp/readme|Контейнеры, `map`, `Maybe`, `Either`, `IO`, `Task`]]
- [[patterns/memoization/memoization|Мемоизация функций]]
- [[patterns/chaining/readme|Цепочки вызовов (Chaining)]]
- [[patterns/event-emitter/readme|EventEmitter / Observer]]
- [[patterns/fabrics-pools/readme|Фабрики и пулы объектов]]
- [[patterns/high-order-func-events-callbacks/readme|Функции высшего порядка, callbacks]]

## Anki Cards

Карточки вынесены в отдельный файл: [[anki-cards.txt]]

## Связанные темы

- [[../02-typescript/MOC|TypeScript]]
- [[../03-oop/MOC|OOP]]
- [[../08-internals/jit-compilation|JIT-компиляция в V8]]

## Sources

### Основы и концепции
- [JavaScript Visualized: Promise Execution](https://lydiahallie.framer.website/blog/promise-execution) — визуализация работы промисов и event loop
- [Паттерны реактивности в современном JavaScript](https://habr.com/ru/articles/757770/)
- [Все, что вам нужно знать о Proxy в JavaScript](https://webdevblog.ru/proxy/)
- [Array Grouping in JavaScript: Object.groupBy()](https://dmitripavlutin.com/javascript-array-group/)
- [What Removing Object Properties Tells Us About JavaScript](https://www.smashingmagazine.com/2023/10/removing-object-properties-javascript/)
- [Web Workers: Параллельные вычисления](https://habr.com/ru/articles/767494/)

### Паттерны и практика
- [🧩 Patterns for JavaScript & Node.js — Шемсединов](https://github.com/tshemsedinov/Patterns-JavaScript)
- [JS. Валидация данных. Пишем свой YUP](https://habr.com/ru/articles/800713/)
- [Let's learn how modern JavaScript frameworks work by building one](https://nolanlawson.com/2023/12/02/lets-learn-how-modern-javascript-frameworks-work-by-building-one/)
- [33 Concepts Every JavaScript Developer Should Know](https://github.com/leonardomso/33-js-concepts)
- [How to parse HTML in JavaScript](https://blog.apify.com/javascript-parse-html/)

### Блоги
- [Dmitri Pavlutin — статьи про JavaScript](https://dmitripavlutin.com/)
- [2ality – JavaScript and more — Dr. Axel Rauschmayer](https://2ality.com/index.html)
- [HowProgrammingWorks — Тимур Шемсединов](https://github.com/HowProgrammingWorks/Index)

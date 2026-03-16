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
- [[patterns/memoization/memoization|Мемоизация функций]]
- [[patterns/chaining/readme|Цепочки вызовов (Chaining)]]
- [[patterns/event-emitter/readme|EventEmitter / Observer]]
- [[patterns/fabrics-pools/readme|Фабрики и пулы объектов]]
- [[patterns/high-order-func-events-callbacks/readme|Функции высшего порядка, callbacks]]

## Связанные темы

- [[../02-typescript/MOC|TypeScript]]
- [[../03-oop/MOC|OOP]]
- [[../08-internals/jit-compilation|JIT-компиляция в V8]]

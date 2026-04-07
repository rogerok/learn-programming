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

> [!tip] Flashcard
> **Q:** Что такое Event Loop?
> **A:** Механизм, который следит за стеком вызовов и очередью задач. Когда стек пуст — берёт первую задачу из очереди и помещает в стек для выполнения.

> [!tip] Flashcard
> **Q:** Почему setTimeout(fn, 0) не выполняется немедленно?
> **A:** Колбек попадает в очередь задач и ждёт, пока стек вызовов полностью очистится.

> [!tip] Flashcard
> **Q:** Почему try/catch не перехватывает ошибки из асинхронных колбеков?
> **A:** Колбек вызывается в отдельном стеке вызовов. try/catch работает только в рамках текущего стека.

> [!tip] Flashcard
> **Q:** Какая сигнатура у колбека в Node.js-стиле?
> **A:** callback(error, result) — первый параметр всегда ошибка, второй — результат операции.

> [!tip] Flashcard
> **Q:** Что такое callback hell?
> **A:** Глубокая вложенность колбеков при последовательных асинхронных операциях: каждая следующая запускается внутри колбека предыдущей.

> [!tip] Flashcard
> **Q:** Что такое Promise?
> **A:** Объект, который отслеживает асинхронную операцию и хранит её результат. Возвращается асинхронными функциями, построенными на промисах.

> [!tip] Flashcard
> **Q:** Что всегда возвращает вызов .then()?
> **A:** Новый Promise. Возвращаемое значение колбека становится параметром следующего .then().

> [!tip] Flashcard
> **Q:** Как ошибка распространяется по цепочке промисов?
> **A:** Пропускает все .then() и попадает в первый встреченный .catch(). Если catch возвращает значение, цепочка .then() продолжается.

> [!tip] Flashcard
> **Q:** Что произойдёт, если не вернуть промис внутри .then()?
> **A:** Цепочка прервётся. Ошибки пройдут незамеченными, нет гарантии что операция завершится вовремя.

> [!tip] Flashcard
> **Q:** Как создать начальный промис для динамической цепочки (например, в reduce)?
> **A:** Promise.resolve(initialValue) — возвращает уже выполненный промис, с которого можно начать цепочку.

> [!tip] Flashcard
> **Q:** Что такое замыкание?
> **A:** Функция, которая запоминает лексическое окружение, в котором была создана, и сохраняет доступ к нему даже после завершения внешней функции.

> [!tip] Flashcard
> **Q:** Что такое LexicalEnvironment?
> **A:** Скрытый объект у каждого блока кода: 1) Environment Record (локальные переменные, this) и 2) ссылка на внешнее лексическое окружение.

> [!tip] Flashcard
> **Q:** Что такое чистая функция (pure function)?
> **A:** Детерминированная функция без побочных эффектов: зависит только от входных аргументов и всегда возвращает одинаковый результат.

> [!tip] Flashcard
> **Q:** Что такое побочные эффекты (side effects)?
> **A:** Любые взаимодействия функции с внешней средой: I/O, сетевые запросы, вывод в консоль, изменение внешних переменных.

> [!tip] Flashcard
> **Q:** В чём суть принципа CQS?
> **A:** Функция — либо команда (действие, возвращает только успех/ошибку), либо запрос (возвращает данные, не изменяет состояние). Не то и другое одновременно.

> [!tip] Flashcard
> **Q:** Что такое позднее связывание (late binding) в JS?
> **A:** Значение this определяется не при объявлении, а в момент вызова метода — зависит от объекта, из которого произошёл вызов.

> [!tip] Flashcard
> **Q:** Какой this у стрелочной функции?
> **A:** Стрелочная функция не имеет собственного this. Она захватывает this из лексического окружения, где была определена.

> [!tip] Flashcard
> **Q:** Чем отличаются bind, call и apply?
> **A:** bind — возвращает новую функцию с привязанным контекстом. call — вызывает сразу, аргументы позиционно. apply — вызывает сразу, аргументы массивом.

> [!tip] Flashcard
> **Q:** Что делает оператор new?
> **A:** Создаёт пустой объект, устанавливает его как this при вызове конструктора, неявно возвращает этот объект.

> [!tip] Flashcard
> **Q:** Почему нельзя использовать new со стрелочной функцией?
> **A:** Стрелочные функции не имеют собственного this и не являются конструкторами. Вызов new выбросит TypeError.

> [!tip] Flashcard
> **Q:** Что такое прототипная цепочка?
> **A:** Если свойство не найдено в объекте, JS ищет его в [[prototype]], затем в прототипе прототипа — до тех пор, пока не достигнет null.

> [!tip] Flashcard
> **Q:** Что такое autoboxing?
> **A:** При вызове метода на примитиве JS автоматически оборачивает его во временный объект, вызывает метод, затем распаковывает обратно в примитив.

> [!tip] Flashcard
> **Q:** Что такое частичное применение (partial application)?
> **A:** Техника фиксации одного или нескольких аргументов функции, возвращающая новую функцию с меньшим числом параметров.

> [!tip] Flashcard
> **Q:** Что такое каррирование (currying)?
> **A:** Преобразование функции от N аргументов в цепочку функций, каждая из которых принимает по одному аргументу: f(a, b, c) → f(a)(b)(c).

> [!tip] Flashcard
> **Q:** Что показывает свойство fn.length?
> **A:** Количество ожидаемых параметров функции. Function.prototype.bind уменьшает это значение — на этом основана реализация curry.

> [!tip] Flashcard
> **Q:** Чем expression отличается от statement?
> **A:** Expression вычисляется в значение (5, getUser()). Statement выполняет действие и не становится значением (if, for, while).

> [!tip] Flashcard
> **Q:** Гарантирует ли setTimeout точное время выполнения?
> **A:** Нет. Колбек выполнится не раньше указанного времени, но может задержаться — он ждёт, пока стек вызовов опустеет.

> [!tip] Flashcard
> **Q:** Что вернёт вызов асинхронной функции (fs.readFile)? Можно ли получить данные через return?
> **A:** Вернёт undefined. Данные доступны только внутри колбека — вернуть их через return из колбека наружу невозможно.

> [!tip] Flashcard
> **Q:** Где хранится прототип объекта и как его получить?
> **A:** В служебном поле [[prototype]], недоступном напрямую. Получить: Object.getPrototypeOf(obj). Сам прототип — объект из свойства Constructor.prototype.

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

---
tags: [javascript, moc, core]
aliases: [JavaScript Core]
---

# JavaScript Core

## Цель

Освоить семантический минимум, от которого зависят async-код, прототипы и функциональные паттерны: выражения, управление потоком, область видимости, функции, эффекты и контекст вызова.

## Пререквизиты

- Умение запускать `.js` через `node`.
- Базовые переменные, функции, объекты и массивы.
- Специальных знаний async, OOP или FP не требуется.

## Путь по зависимостям

### 1. Значения и управление

1. [[syntax/statements-vs-expressions|Выражения и инструкции]].
2. [[syntax/control-flow|Control flow, try/catch/finally]].
3. [[syntax/with-statement|with и области видимости]] — только для понимания старого кода.

**Наблюдаемый результат:** ученик отмечает в фрагменте все выражения, предсказывает выбранную ветвь и объясняет, выполнится ли `finally`.

### 2. Функции и состояние

1. [[functions/closure|Лексическая область видимости и closure]].
2. [[functions/pure-functions|Чистые функции]].
3. [[functions/cqs|Command–Query Separation]].

**Наблюдаемый результат:** ученик называет окружение каждой свободной переменной, отделяет возвращаемое значение от эффекта и делит смешанную операцию на command/query.

### 3. Runtime и async

Продолжите по [[async/MOC|маршруту async/runtime]]. Он опирается на control flow и closure, а затем вводит call stack, callbacks, timers, Promise и конкурентность.

**Наблюдаемый результат:** ученик предсказывает порядок событий и сохраняет наблюдаемую ошибку и результат через callback или Promise.

### 4. Контекст и прототипы

1. [[oop-in-js/this|Динамический this]].
2. [[oop-in-js/arrow-functions|Arrow functions и лексический контекст]].
3. [[oop-in-js/bind|bind, call, apply]].
4. [[oop-in-js/constructor|Функции-конструкторы и new]].
5. [[oop-in-js/prototype|Prototype chain]].
6. [[oop-in-js/boxing|Boxing]].
7. [[oop-in-js/encapsulation|Инкапсуляция]].

**Наблюдаемый результат:** ученик определяет `this` из формы вызова, описывает создание объекта через `new`, прослеживает поиск свойства до `null` и отличает собственное свойство от унаследованного.

## Практика

- [[core/exercises|Core и async: шесть ступеней практики]].
- Для этапа функций сначала выполните задания Predict и Explain.
- Перед Promise-заданиями завершите базовую часть [[async/MOC|async-маршрута]].
- После всех проверок переходите к [[../patterns/MOC|FP и паттернам]].

## Проверки выхода

- По коду с двумя closure предсказать независимое изменение их состояний.
- Объяснить, почему `try/catch` вокруг регистрации callback не ловит позднюю ошибку.
- Исправить callback-wrapper, сохранив error-first контракт и ровно один вызов callback.
- Для метода, arrow function и функции после `bind` определить `this`.
- Нарисовать prototype chain экземпляра пользовательского конструктора и место поиска метода.

## Справочные материалы

- [[../anki-cards.txt|Anki cards по JavaScript]].
- [[../MOC|Общий JavaScript MOC]].
- [[async/MOC|Async/runtime MOC]].

## Связанные темы

- [[../patterns/fp/function-composition/function-composition|Function composition]].
- [[../patterns/fp/cps/cps|Continuation-Passing Style]].
- [[../patterns/event-emitter/readme|EventEmitter]].

## Источники

- [MDN: Statements and declarations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements) — источник, уже связанный с заметкой о выражениях и инструкциях.
- [Hexlet: Expressions vs. Statements](https://hexlet.io/courses/intro_to_programming/lessons/expressions/theory_unit) — источник той же заметки.

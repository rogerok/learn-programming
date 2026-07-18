---
tags: [dashboard, moc, index]
aliases: [Dashboard, Главная]
---

# Learn Programming — Dashboard

> [!info] Контекст
> Главная карта учебного vault: выбирай не следующий файл, а следующий проверяемый навык. Текущий цикл и evidence фиксируются в [[00-learning/MOC|Learning System]].

## Карта знаний

| № | Раздел | Что внутри |
|---|--------|-----------|
| 00 | [[00-learning/MOC\|Learning System]] | Учебные сессии, evidence, интервальные повторения и следующий шаг |
| 01 | [[01-javascript/MOC\|JavaScript]] | Синтаксис, замыкания, async/промисы, ООП в JS, функциональные паттерны |
| 02 | [[02-typescript/MOC\|TypeScript]] | Типы, generics, conditional types, type-level, unsound |
| 03 | [[03-oop/MOC\|OOP + SOLID]] | Концепции, абстракции, классы, полиморфизм (8 паттернов), SOLID |
| 04 | [[04-architecture/MOC\|Architecture]] | MVC, MVVM, VM, DDD, Clean Architecture |
| 05 | [[05-frontend/MOC\|Frontend]] | React (internals, patterns, refactoring) + MobX (state, tips) |
| 06 | [[06-algorithms/MOC\|Algorithms]] | Grokking Algorithms, структуры данных, рекурсия |
| 07 | [[07-craftsmanship/MOC\|Craftsmanship]] | Code Complete: классы, методы, переменные, циклы |
| 08 | [[08-internals/MOC\|Internals]] | JIT-компиляция, V8, Hidden Classes, TurboFan |
| 09 | [[09-practice/MOC\|Practice]] | Задания, Zod-like валидатор с нуля |
| 10 | [[10-ai-agents/MOC\|AI Agents]] | Контекст, tools, steering, skills, feedback loops и архитектура agent workflows |
| — | [[golang/MOC\|Golang]] | Функции, switch |
| — | [[css/MOC\|CSS]] | Диагностика устаревших техник и перенос на современные layout-механизмы |
| — | [[cs/computer-system/MOC\|Computer Systems]] | CS:APP, представление данных, процессор, память и системные механизмы |

## Как работать с vault

1. Начни с cold retrieval через `/study <topic>`, не перечитывая заметку заранее.
2. Закрой один обнаруженный пробел и выполни проверяемое задание.
3. Зафиксируй evidence в [[00-learning/session-template|шаблоне учебной сессии]].
4. Используй `/review` для следующего интервального повторения.
5. Переходи к [[09-practice/MOC|Practice]] и guided projects после объяснения базового механизма.

> [!important]
> «Прочитано» не считается mastery. Нужны наблюдаемые evidence: recall, prediction, implementation, diagnosis или transfer.

## Быстрый доступ

### Язык
[[01-javascript/core/async/9.promise\|Промисы]] · [[01-javascript/core/functions/closure\|Замыкания]] · [[01-javascript/core/oop-in-js/prototype\|Прототипы]] · [[02-typescript/unsound/unsound\|TypeScript Unsound]] · [[08-internals/jit-compilation\|JIT V8]]

### Паттерны
[[03-oop/polymorphism/6.factory-strategy\|Factory & Strategy]] · [[03-oop/polymorphism/8.state-pattern\|State Pattern]] · [[03-oop/polymorphism/7.object-composition\|Composition]] · [[03-oop/classes/template-method\|Template Method]]

### Архитектура
[[04-architecture/ddd/clean-architecture\|Clean Architecture]] · [[04-architecture/ddd/entity-vs-value-object\|Entity vs Value Object]] · [[04-architecture/mvvm/MVVM\|MVVM]] · [[03-oop/solid/MOC\|SOLID]]

### Функциональное программирование
[[02-typescript/fp/MOC\|TypeScript FP learning map]] · [[01-javascript/patterns/partial-application/readme\|Каррирование]] · [[01-javascript/patterns/fp/function-composition/function-composition\|Composition]] · [[01-javascript/patterns/memoization/memoization\|Мемоизация]] · [[01-javascript/core/functions/cqs\|CQS]]

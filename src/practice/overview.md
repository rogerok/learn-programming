---
tags: [practice, tasks, oop, javascript, typescript, hexlet]
aliases: [Practice Tasks, Задания]
---

# Practice — Задания и курсы

## Задания

1. **Router** — переделать с поддержкой middleware, validation, Context merging, Radix tree routing
   - Добавить Zod-схему. `res.status(200).send({})` должен быть типизированным по статусу
   - Все методы роутера через `use()` (middleware-first архитектура)
   - Внутренняя реализация: [Radix Tree](https://en.wikipedia.org/wiki/Radix_tree) (см. [find-my-way](https://github.com/delvedor/find-my-way/tree/main))

2. **memoize** — переделать на LRU cache + добавить `wrapper.clear()` для очистки кэша

3. **dna decode** — дописать `decode(val: string)` через битовую строку

4. **tagged-templates (css-in-js)** — добавить "оптимизирующий компилятор": когда внутри calc два значения одного типа (`px`, `rem`, `%`) — вычислять сразу

5. **TypeScript unsound** — найти и покрыть тестами 10 примеров, где TypeScript оказывается unsound

## Курсы (Hexlet)

- [JS Objects](https://ru.hexlet.io/courses/js-objects) → Испытания: DNA to RNA, Query String builder, Вычислитель отличий, Римские цифры
- [JS Data Abstraction](https://ru.hexlet.io/courses/js-data-abstraction) → Испытания: Онлайн-магазин, Обработка ссылок
- [JS Introduction to OOP](https://ru.hexlet.io/courses/js-introduction-to-oop)
- [JS Polymorphism](https://ru.hexlet.io/courses/js-polymorphism)
- [JS Classes](https://ru.hexlet.io/courses/js-classes)
  - [Booking system](https://ru.hexlet.io/challenges/js_classes_booking_system_exercise)
  - [Logger](https://ru.hexlet.io/challenges/js_classes_logger_exercise)

## Читать

- [Полиморфизм](https://medium.com/devschacht/polymorphism-207d9f9cd78)
- [JIT в V8](https://medium.com/@rahul.jindal57/understanding-just-in-time-jit-compilation-in-v8-a-deep-dive-c98b09c6bf0c)
- [Habr: ООП](https://habr.com/ru/articles/492106/)
- [Агрегирование](https://ru.wikipedia.org/wiki/Агрегирование_(программирование))
- [Habr: Агрегация vs Композиция](https://habr.com/ru/articles/354046/)
- [Monkey Patching](https://jelf.github.io/ru/ruby/2017/08/26/about-monkey-patching.html)

## Смотреть

- [YouTube: OOP](https://www.youtube.com/watch?v=8OuzIAuMfjw)
- [YouTube: Patterns](https://www.youtube.com/watch?v=X1HSGEADAhE&t=11s)

## Связанные темы

- [[../oop/MOC|OOP]]
- [[../typescript/unsound/unsound|TypeScript Unsound]]
- [[../internals/jit-compilation|JIT V8]]
- [[../itx-workshop/MOC|ITX Workshop (Zod-like validator)]]

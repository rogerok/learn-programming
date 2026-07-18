---
tags: [typescript, moc, index]
aliases: [TypeScript]
---

# TypeScript — Map of Content

## Цель раздела

Построить рабочую модель системы типов TypeScript: рассматривать типы как множества значений, предсказывать assignability, объяснять structural typing, безопасно сужать `unknown` и unions, сохранять связи через generics, проверять variance и узнавать намеренно unsound границы языка.

Итог должен быть наблюдаемым: вы умеете заранее предсказать результат `tsc --strict`, подтвердить его compile-time проверкой, а для границ доверия добавить runtime-проверку.

## Предпосылки

- [[../01-javascript/MOC|JavaScript]]: значения и объекты, функции, mutation и runtime-ошибки.
- Умение запустить отдельный файл командой `tsc --strict --noEmit file.ts`.
- Понимание разницы между compile time и runtime.

**Входная проверка:** объявите значение типа `unknown`. Доступ к методу до проверки должен отклоняться компилятором, а после корректного `typeof`-сужения — компилироваться. Если причина двух результатов неясна, начните с шага 1 и заметки про `unknown`.

## Канонический маршрут: fundamentals

Идите по порядку: каждый шаг использует модель предыдущего. Это основные заметки раздела, а не порядок глав конкретной книги или курса.

### 1. Типы как множества

1. [[basics/code-basic/type-as-set|Типы как множества]]
2. [[basics/code-basic/literal-types|Литеральные типы]]
3. [[basics/code-basic/never|never]] и [[basics/code-basic/unknown|unknown]]
4. [[basics/code-basic/type-hirarcy|Иерархия типов]]

**Результат:** для literal, union, intersection, `never` и `unknown` назвать более узкий и более широкий тип.

**Проверка:** до запуска `tsc` предсказать оба направления присваивания для `"ok"` и `string`, затем подтвердить прогноз с `@ts-expect-error`.

### 2. Assignability и structural typing

1. [[basics/code-basic/assignability|Присваиваемость]]
2. [[basics/code-basic/structural-typing|Структурная типизация]]
3. [[basics/code-basic/interface|Интерфейсы]]
4. [[basics/code-basic/intersections-types|Intersection types]]

**Результат:** объяснить совместимость через множество допустимых значений и требуемые поля, не через совпадение имён типов.

**Проверка:** один объект с дополнительным полем должен приниматься через переменную, но аналогичный свежий object literal — отклоняться Excess Property Check.

### 3. Control-flow narrowing

1. [[basics/code-basic/narrowing|Сужение типов]]
2. [[basics/code-basic/assert|Assert-функции]]

**Результат:** превратить `unknown` или union в проверенный тип через runtime-условия и исчерпывающе обработать discriminated union.

**Проверка:** добавление нового варианта union без нового `case` должно дать ошибку на проверке `never`; после обработки варианта ошибка должна исчезнуть.

### 4. Generics и сохранение связей

1. [[basics/code-basic/generics|Дженерики]]
2. [[basics/code-basic/function-as-param|Сигнатуры функций-параметров]]
3. [[basics/code-basic/mapping-modifiers|Mapped types и mapping modifiers]]

**Результат:** связать тип объекта, допустимый ключ и тип результата без `any`, assertions и ручного union.

**Проверка:** generic getter принимает только `keyof T`, выводит `T[K]` для конкретного ключа и отклоняет отсутствующий ключ.

### 5. Variance и mutation

1. [[basics/code-basic/variability|Ковариантность и контравариантность]]
2. [[basics/code-basic/readonly-array|Readonly arrays]]
3. [[basics/code-basic/void|Контекстная семантика void]]

**Результат:** предсказать совместимость параметров и возвратов функций под `strictFunctionTypes`, а также влияние mutation на generic-контейнеры.

**Проверка:** узкий callback должен отклоняться там, где вызывающая сторона вправе передать более широкий тип; readonly-представление массива должно запрещать опасную запись.

### 6. Unsoundness как граница модели

1. [[unsound/unsound|Небезопасность TypeScript]]
2. Повторно: [[basics/code-basic/structural-typing|structural typing]] и [[basics/code-basic/variability|variance]]

**Результат:** отличать «компилятор доказал» от «TypeScript намеренно допустил» и выбирать runtime validation, `unknown`, immutability или nominal marker на нужной границе.

**Проверка:** воспроизвести хотя бы один принятый `--strict` пример, который падает в runtime, назвать точную дыру и изменить контракт так, чтобы опасная операция больше не компилировалась.

## Практика и перенос

- [[basics/exercises|Практика fundamentals]] — обязательная последовательность predict → explain → modify → implement → diagnose → transfer.
- [[dsl/fluent-builder-dsl|Fluent Builder DSL]] — применение generics, polymorphic `this`, immutability и type-state к дизайну API.
- [[dsl/exercises|Упражнения Fluent Builder DSL]] — практика после шагов 1–5.

## Effective TypeScript: source-oriented трек

Эти файлы — конспект последовательных глав источника. Они углубляют и повторяют canonical fundamentals, но не заменяют маршрут выше.

1. [[effective-ts/6.type-hierarchy|Глава 6: иерархия типов и проверки]]
2. [[effective-ts/7.type-refinement|Глава 7: inference и refinement]]
3. [[effective-ts/8.generics-overload|Глава 8: generics и overloads]]
4. [[effective-ts/9.type compatibility|Глава 9: совместимость типов]]
5. [[effective-ts/10.structure-typing|Глава 10: structural typing]]
6. [[effective-ts/11.variants|Глава 11: variance]]
7. [[effective-ts/12.variants|Глава 12: бивариантность методов]]
8. [[effective-ts/13.readonly|Глава 13: readonly]]
9. [[effective-ts/anki-cards.txt|Карточки source-oriented трека]]

## Справочник по остальным темам

### Объекты и классы

- [[advanced/types-vs-interfaces|Type vs Interface: детальное сравнение]]
- [[basics/code-basic/type-object|Типы object, Object и {}]]
- [[basics/code-basic/class-as-types|Классы как типы]]
- [[basics/code-basic/class-members-visibility|Видимость private/protected/public]]
- [[basics/code-basic/static-property|Статические свойства]]

### Коллекции и синтаксис

- [[basics/code-basic/tuples|Кортежи]]
- [[basics/code-basic/spread|Spread/Rest]]
- [[basics/code-basic/assert|Assert-функции]]

### Type-level программирование

- [[advanced/infer|infer: извлечение типов из conditional types]]
- [[advanced/type-level-programming/type-level-programming|Type-level программирование]]

### Повторение

- [[basics/code-basic/FULL-SUMMARY|TypeScript: полный конспект]]
- [[basics/code-basic/anki-cards.txt|Карточки по fundamentals]]

## Функциональное программирование: канонический путь понятий

- [[fp/MOC|Функциональное программирование в TypeScript — карта обучения]] — dependency-ordered путь понятий от чистых функций и ADT к композиции эффектов. Начинайте его после generics, narrowing и readonly из fundamentals.

Эта карта задаёт канонический порядок понятий FP. Курсовые, книжные и библиотечные директории ниже остаются отдельными треками и не меняют этот порядок.

## Курсовые, книжные и библиотечные треки

Эти маршруты имеют собственный порядок и предпосылки; сверяйте новые понятия с [[fp/MOC|канонической картой FP]], а type-system prerequisites — с fundamentals выше.

- [[fp-ts/fp-ts-roadmap|Study Plan: fp-ts]]
- [[fp-ts/fp-ts-phase-1-2|fp-ts — теория и Core Types]]
- [[functiona-programming-in-ts/reflection-without-remorse|Reflection without Remorse]]
- [[fp-ts/mostly-adequate/ch03-pure-functions|Pure Functions через призму fp-ts]]
- [[fp-ts/mostly-adequate/ch04-currying/ch04-currying|Currying через призму fp-ts]]
- [[fp-ts/mostly-adequate/ch08-functors-and-containers/ch08-functors-and-containers|Функторы и контейнеры]]
- [[fp-ts/mostly-adequate/ch09-monads/ch09-monads|Монады]]
- [[fp-ts/mostly-adequate/ch10-applicative-functors/ch10-applicative-functors|Applicative functors]]

## Выходные проверки

Раздел пройден, если без обращения к тексту заметок вы можете:

1. Предсказать и подтвердить `tsc --strict`, в каком направлении присваиваются literal и primitive, object types разной ширины, `never` и `unknown`.
2. Отличить structural assignability от Excess Property Check на двух исполняемых примерах.
3. Принять `unknown`, проверить runtime-форму, получить discriminated union и доказать исчерпывающую обработку через `never`.
4. Реализовать generic-связь `T`, `K extends keyof T`, `T[K]` и наблюдать отклонение неизвестного ключа.
5. Объяснить contravariance параметров и covariance возврата, подтвердив оба направления compile-time проверками.
6. Воспроизвести unsound runtime-сбой, который проходит строгий компилятор, и закрыть конкретную дыру более точным контрактом.
7. Пройти [[basics/exercises|набор fundamentals]]: все ожидаемые compile-time ошибки защищены `@ts-expect-error`, runtime checkpoints не падают.

## Связанные темы

- [[../01-javascript/MOC|JavaScript]] — runtime-модель, на которую накладывается TypeScript.
- [[../03-oop/MOC|OOP]] — классы, интерфейсы и подстановка объектов.

## Sources

### Основы и система типов

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript в деталях. Часть 1](https://habr.com/ru/companies/timeweb/articles/685954/)
- [TypeScript в деталях (шпаргалка)](https://my-js.org/docs/cheatsheet/mastering-ts/)
- [Понять TypeScript c помощью теории множеств](https://habr.com/ru/articles/713800/)
- [Typescript: принцип подстановки функций](https://habr.com/ru/articles/779458/)
- [The Concise TypeScript Book](https://github.com/gibbok/typescript-book)

### Продвинутые типы и практика

- [TypeScript: infer и conditional types](https://habr.com/ru/articles/778190/)
- [Type-level программирование в TypeScript](https://habr.com/ru/articles/871336/)
- [Testing Types in TypeScript](https://frontendmasters.com/blog/testing-types-in-typescript/)
- [YouTube: Matt Pocock — TypeScript канал](https://www.youtube.com/@mattpocockuk)

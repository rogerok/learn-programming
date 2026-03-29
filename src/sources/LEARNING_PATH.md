# Learning Path

Приоритизированный список чтения из коллекции, составленный относительно стека:
**TypeScript / JavaScript → React / MobX → Architecture → Algorithms → Go**

---

## Tier 1 — Читать в первую очередь

Фундамент, который непосредственно применяется в работе каждый день.

### JavaScript
- [JavaScript Visualized: Promise Execution](https://lydiahallie.framer.website/blog/promise-execution) — визуализация, закрывает многие пробелы по промисам
- [Паттерны реактивности в современном JavaScript](https://habr.com/ru/articles/757770/)
- [Все, что вам нужно знать о Proxy в JavaScript](https://webdevblog.ru/proxy/) — нужно для понимания MobX

### TypeScript
- [TypeScript в деталях. Часть 1](https://habr.com/ru/companies/timeweb/articles/685954/)
- [TypeScript: infer и conditional types](https://habr.com/ru/articles/778190/)
- [Понять TypeScript c помощью теории множеств](https://habr.com/ru/articles/713800/)
- [Typescript: принцип подстановки функций](https://habr.com/ru/articles/779458/)
- [Type-level программирование в TypeScript](https://habr.com/ru/articles/871336/)

### Architecture
- [Явный дизайн в разработке приложений — Беспоясов (серия)](https://bespoyasov.ru/blog/explicit-design-series/) — длинная серия, читать по одной части
- [Чистая архитектура фронтенд приложений — Беспоясов](https://bespoyasov.ru/blog/clean-architecture-on-frontend/)
- [Modularizing React Applications — Martin Fowler](https://martinfowler.com/articles/modularizing-react-apps.html)

### React
- [How React Works — детальный разбор под капотом](https://incepter.github.io/how-react-works/)
- [Decoupling UI and Logic in React: Headless Components](https://itnext.io/decoupling-ui-and-logic-in-react-a-clean-code-approach-with-headless-components-82e46b5820c)
- [Оптимизация React: useTransition, useDeferredValue и useOptimistic](https://habr.com/ru/articles/870748/)

### MobX
- [Под капотом у MobX. Пишем свою реактивную библиотеку с нуля](https://habr.com/ru/articles/689374/)
- [Как MobX делает объекты реактивными с помощью Proxy](https://habr.com/ru/companies/gnivc/articles/893108/)
- [Отладка и мониторинг в MobX: trace, introspection и spy](https://habr.com/ru/companies/gnivc/articles/855346/)

---

## Tier 2 — Важно, но можно по мере необходимости

### TypeScript (продвинутое)
- [Вывод типов с as const и ключевым словом infer](https://habr.com/ru/companies/ruvds/articles/493716/)
- [Learn Advanced TypeScript Types (curry/ramda)](https://medium.com/free-code-camp/typescript-curry-ramda-types-f747e99744ab)
- [Typesafe Routing with React-Router](https://iamsahaj.xyz/blog/typesafe-routing-with-react-router/)
- [Testing Types in TypeScript](https://frontendmasters.com/blog/testing-types-in-typescript/)

### Architecture (продвинутое)
- [The 20 Essential Principles of Software Development](https://medium.com/@techievinay01/the-20-essential-principles-of-software-development-lod-soc-solid-and-beyond-6fd50774f994)
- [Patterns.dev](https://www.patterns.dev/)
- [Tale of a Refactor](https://commerce.nearform.com/blog/2024/tale-of-a-refactor)

### Performance
- [Understanding and Improving LCP](https://www.speedcurve.com/web-performance-guide/understanding-and-improving-largest-contentful-paint/)
- [Understanding and Improving CLS](https://www.speedcurve.com/web-performance-guide/understanding-and-improving-cumulative-layout-shift/)
- [How To Improve INP: React](https://kurtextrem.de/posts/improve-inp-react)
- [Optimize resource loading with the Fetch Priority API](https://web.dev/articles/fetch-priority)

### React
- [React Server Components, without a framework?](https://timtech.blog/posts/react-server-components-rsc-no-framework/)
- [Wait for pending: A Suspense algorithm exploration](https://dev.to/alexandereardon/wait-for-pending-a-not-great-alternative-suspense-algorithm-1gdl)
- [Compound components](https://habr.com/ru/companies/alfa/articles/647013/)

### Algorithms
- [LeetCode was HARD until I Learned these 15 Patterns](https://blog.algomaster.io/p/15-leetcode-patterns)
- [Алгоритмы и структуры данных на JavaScript — trekhleb](https://github.com/trekhleb/javascript-algorithms)
- [Структуры данных для frontend-разработчиков](https://habr.com/ru/companies/habr_rutube/articles/934130/)

---

## Tier 3 — Справочное / по запросу

Читать, когда возникает конкретная задача или тема.

### Go
- [Учимся разрабатывать REST API на Go](https://habr.com/ru/companies/selectel/articles/747738/)
- [Как работать с Postgres в Go](https://habr.com/ru/companies/oleg-bunin/articles/461935/)
- [Хороший курс по Go от ВК — Stepik](https://stepik.org/course/187490/syllabus)
- [Best Practices for Designing a Pragmatic RESTful API](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)

### CSS
- [Conditional CSS — ishadeed](https://ishadeed.com/article/conditional-css/)
- [Media Queries vs Container Queries](https://www.freecodecamp.org/news/media-queries-vs-container-queries/)

### Security
- [Ликбез по Client-Side уязвимостям](https://habr.com/ru/companies/bastion/articles/757590/)
- [Стреляем себе в ногу из localStorage](https://habr.com/ru/articles/828912/)

### Web & Browser
- [Как работает браузер](https://habr.com/ru/companies/skillfactory/articles/678400/)
- [How Internet Works](https://explained-from-first-principles.com/internet/)

---

## Книги (долгосрочно)

| Книга | Приоритет | Зачем |
|-------|-----------|-------|
| [JavaScript Allonge](https://leanpub.com/javascriptallongesix/read) | Высокий | ФП в JS, замыкания, каррирование |
| [Функционально-Лёгкий JavaScript](https://github.com/fxzhukov/Functional-Light-JS-RU) | Высокий | Практичное ФП без хардкора |
| [Fluent React](https://www.oreilly.com/library/view/fluent-react/9781098138707/) | Высокий | React под капотом + паттерны |
| [The Concise TypeScript Book](https://github.com/gibbok/typescript-book) | Средний | Справочник по TS |
| [System Design](https://habr.com/ru/companies/piter/articles/598791/) | Средний | Подготовка к интервью senior+ |

---
tags: [react, moc, index]
aliases: [React]
---

# React — Map of Content

## Цель

Построить проверяемую модель React: от браузерного события к render и reconciliation, от effect к cleanup, от композиции к обоснованной оптимизации. После маршрута можно предсказать судьбу state и объяснить каждый повторный render до выбора внешнего state manager.

## Пререквизиты

- [[../../01-javascript/MOC|JavaScript]]: функции, массивы, объекты, `Promise`, event loop.
- [[../../01-javascript/core/functions/closure|Замыкания]] и referential equality.
- DOM API и цикл браузера `event → JavaScript → DOM mutation → layout/paint`.
- Базовый React: component, props, JSX, `useState`; для запуска — существующий playground без обязательного project scaffold.

**Входная проверка:** вручную разделите вызов функции компонента, создание React elements, commit изменений в DOM и browser paint. Эти события не должны называться одним словом «перерисовка».

## Путь по зависимостям

### 0. Браузер и rendering

До React восстановите цепочку браузера: event handler выполняет JavaScript, код меняет состояние или DOM, после чего браузер рассчитывает и рисует видимый результат. React не заменяет DOM и не выполняет paint.

**Проверка этапа:** для клика по кнопке запишите отдельно task/event, handler, возможный state update, render, commit и paint; отметьте, какие пункты могут отсутствовать.

### 1. Render, identity и state

1. [[advanced/1.rerenders|Re-renders: владелец state и граница поддерева]].
2. Зафиксируйте базовую модель identity: state связан с типом, позицией и `key` элемента, а не с текстом JSX.

**Проверка этапа:** до запуска предскажите, какие компоненты выполнятся после обновления локального state, какие DOM-узлы изменятся и сохранится ли state при смене позиции или `key`.

### 2. Effects и внешний мир

1. [[6-react-use-effect-secrets|useEffect: setup, dependency и cleanup]].
2. Не переходите к data fetching, пока не можете объяснить порядок setup/cleanup для mount, повторного запуска и unmount.

**Проверка этапа:** спроектируйте подписку на browser event так, чтобы в каждый момент существовал не более чем один listener, а callback видел актуальные данные.

### 3. Композиция

Читайте последовательно:

1. [[advanced/2.elements,children as props, and re-renders|Elements и children как props]].
2. [[advanced/3.Configuration concerns with elements as props|Конфигурация через elements как props]].
3. [[advanced/4.Advanced configuration with render props|Render props]].

**Проверка этапа:** перенесите локальный state в минимальное поддерево и передайте content/configuration через element или render prop. Родитель не должен получать state только ради управления вложенной деталью.

### 4. Производительность и асинхронность

Здесь сходятся знания render, composition, identity и effects:

1. [[advanced/6.Deep dive into diffing and reconciliation|Diffing, reconciliation и `key`]] — после elements as props.
2. [[advanced/5.Memoization with useMemo, useCallback and React.memo|Мемоизация]] — после модели re-render и referential equality.
3. [[advanced/7.Closures and state references|Stale closures и ссылки на state]] — после memoization и JavaScript closures.
4. [[advanced/14.data_fetching_client_performance|Data fetching и клиентская производительность]].
5. [[advanced/15.data_fetching_and_race_conditions|Data fetching и race conditions]] — только после предыдущей главы.

**Проверка этапа:** воспроизведите лишний render или гонку, измерьте console log/порядок ответов, затем выберите минимальную границу исправления. «Добавить `useMemo` везде» не является объяснением.

### 5. Граница state management

1. [[6-react-context-secrets|Context]] — после composition и memoization; используйте для передачи зависимостей, а не автоматически для любого изменяемого state.
2. [[../mobx/MOC|MobX]] — только когда можете назвать срок жизни state и объяснить, почему локального state/Context недостаточно.

**Проверка этапа:** для Global, Page и component state обоснуйте владельца, срок жизни, способ доставки и границу повторного render.

## Практика

- После этапа 1: [[../exercises#1. Predict: граница повторного render|1. Predict]] → [[../exercises#2. Explain: identity и сохранение state|2. Explain]].
- После этапа 2: [[../exercises#3. Modify: effect с актуальным запросом и cleanup|3. Modify]]; после race conditions на этапе 4 повторите проверку гонки.
- После этапа 3: [[../exercises#4. Implement: композиция и локализация state|4. Implement]].
- После MobX: [[../exercises#5. Diagnose: динамическая зависимость MobX|5. Diagnose]] → [[../exercises#6. Transfer: React + MobX по границам жизненного цикла|6. Transfer]].

## Выходная проверка

Маршрут React завершён, если вы можете без запуска:

- предсказать render-границу при обновлении state и отделить её от DOM commit;
- определить сохранение/сброс state по type, position и `key`;
- перечислить setup/cleanup effect при смене dependency;
- сначала локализовать state и применить композицию, а memoization рассматривать после наблюдения;
- не допустить, чтобы устаревший запрос победил актуальный;
- аргументировать переход к Context или MobX сроком жизни и графом потребителей.

Затем подтвердите прогнозы заданиями 1–4 из [[../exercises|практики]].

## Справочники и треки по источникам

Эти материалы не заменяют основной маршрут и читаются после указанных пререквизитов.

### Реализация React с нуля

1. [[build-your-own-react/build-your-own-react|Didact: createElement, Fiber, reconciliation и hooks]] — после этапа 4.
2. [[build-your-own-react/summary|Краткое резюме]] — после полной версии.

### Refactor Like a Superhero

Отдельный трек о качестве кода, а не каноническая последовательность React:

- [[refactor-like-a-superhero/05-low-hanging-fruit|Низко висящие плоды]]
- [[refactor-like-a-superhero/06-names|Именование]]
- [[refactor-like-a-superhero/07-code-duplication|Дублирование кода (DRY)]]
- [[refactor-like-a-superhero/09-functional-pipeline|Функциональный pipeline]]
- [[refactor-like-a-superhero/10-side-effects|Side effects]]
- [[refactor-like-a-superhero/12-errors-handling|Обработка ошибок]]
- [[refactor-like-a-superhero/13-module-integration|Интеграция модулей]]
- [[refactor-like-a-superhero/14-generics-inheritance-composition|Generics, наследование, композиция]]

## Связанные темы

- [[../MOC|Frontend]]
- [[../../02-typescript/MOC|TypeScript]]
- [[../../04-architecture/MOC|Architecture]]

## Источники

### Под капотом
- [How React Works — детальный разбор](https://incepter.github.io/how-react-works/)
- [Let's learn how modern JavaScript frameworks work by building one](https://nolanlawson.com/2023/12/02/lets-learn-how-modern-javascript-frameworks-work-by-building-one/)

### Архитектура компонентов
- [Decoupling UI and Logic in React: Headless Components](https://itnext.io/decoupling-ui-and-logic-in-react-a-clean-code-approach-with-headless-components-82e46b5820c)
- [React Advanced: Decoupling your components in the right way](https://dev.to/argonauta/react-advance-decoupling-your-components-in-the-right-way-4pkn)
- [Улучшаем дизайн React приложения с помощью Compound components](https://habr.com/ru/companies/alfa/articles/647013/)
- [Попытка создать идеальный компонент формы](https://habr.com/ru/articles/813551/)

### Производительность
- [Оптимизация React: useTransition, useDeferredValue и useOptimistic](https://habr.com/ru/articles/870748/)
- [5 tips to effectively optimize INP in React](https://calendar.perfplanet.com/2024/5-tips-to-effectively-optimize-inp-react/)
- [How To Improve INP: React](https://kurtextrem.de/posts/improve-inp-react)

### Server Components и Suspense
- [React Server Components, without a framework?](https://timtech.blog/posts/react-server-components-rsc-no-framework/)
- [Wait for pending: A Suspense algorithm exploration](https://dev.to/alexandereardon/wait-for-pending-a-not-great-alternative-suspense-algorithm-1gdl)

### Блоги
- [Developer Way — Nadia Makarevich](https://www.developerway.com/)
- [Vladimir Klepov — статьи про React](https://blog.thoughtspile.tech/tags/react/)

### Книги
- [Fluent React — O'Reilly](https://www.oreilly.com/library/view/fluent-react/9781098138707/)

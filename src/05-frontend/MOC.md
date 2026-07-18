---
tags: [frontend, moc, index, react, mobx]
aliases: [Frontend]
---

# Frontend — Map of Content

## Цель

Пройти путь от событий браузера и обновления DOM до управляемого React render, а затем до реактивного графа MobX. На выходе уметь выбрать владельца state, отделить effect от вычисления, спроектировать композицию и объяснить наблюдаемое поведение интерфейса.

## Пререквизиты

- [[../01-javascript/MOC|JavaScript]]: функции, объекты, `Promise`, event loop и модули.
- [[../01-javascript/core/functions/closure|Замыкания]]: нужны перед stale closures и memoization.
- Базовые HTML/CSS и DOM API: найти элемент, обработать событие, изменить атрибут или текст.
- Для запуска JSX-примеров — любой **уже имеющийся** React playground с hooks; создавать новый проект не требуется.

**Входная проверка:** объясните цепочку `click → handler → state update → render → DOM update → paint` и отдельно отметьте, какие шаги выполняет браузер, а какие React. Если цепочка не складывается, сначала повторите JavaScript и DOM.

## Путь по зависимостям

1. **Браузер и rendering.** Повторите DOM, event loop, layout/paint и различие между вычислением нового дерева и записью в DOM. Контроль: по одному `click` перечислить синхронный handler, запланированную работу и видимое изменение.
2. **React render, identity и state.** Начните с [[react/MOC#1. Render, identity и state|первого этапа React]]. Контроль: предсказать владельца обновления, повторно выполненные компоненты и судьбу state при смене `key`.
3. **Effects.** Затем [[react/MOC#2. Effects и внешний мир|effects и cleanup]]. Контроль: для mount, смены dependency и unmount указать порядок setup/cleanup.
4. **Композиция.** Продолжите [[react/MOC#3. Композиция|elements, children и render props]]. Контроль: локализовать state без глобального Context и без преждевременной memoization.
5. **Производительность.** Пройдите [[react/MOC#4. Производительность и асинхронность|memoization, reconciliation и data fetching]]. Контроль: сначала измерить лишний render, затем назвать минимальную границу оптимизации.
6. **State management и MobX.** Пройдите [[react/MOC#5. Граница state management|границу Context/state management]], затем переходите к [[mobx/MOC|MobX]]. Контроль: отличить `observable`, `computed`, `reaction` и `action`, затем связать срок жизни store с Global/Page/VM-слоем.

## Практика

- [[exercises|Практика React и MobX]] — единая лестница `predict → explain → modify → implement → diagnose → transfer`.
- После каждого этапа выполняйте только соответствующее задание; финальный transfer предполагает прохождение обоих MOC.

## Выходная проверка

Разберите сценарий `click → запрос → ответ → observable update → observer render → DOM`:

- для каждого перехода назовите владельца данных и срок его жизни;
- укажите, где нужна отмена или cleanup;
- отделите чистое derived-значение от side effect;
- предскажите повторные render и изменение DOM;
- объясните, что уничтожается при unmount страницы и что остаётся глобальным.

Маршрут завершён, если прогноз можно проверить console log или ручной трассой и фактическое поведение не требует объяснения «React/MobX сам обновил».

## Справочники и учебные треки

- [[react/MOC#Справочники и треки по источникам|React: реализация с нуля, рефакторинг и внешние источники]].
- [[mobx/MOC#Справочники и треки по источникам|MobX: архитектурный цикл, SSR и прикладные snippets]].

## Связанные темы

- [[../04-architecture/MOC|Architecture (MVC, MVVM, DDD)]]
- [[../09-practice/MOC|Practice]]

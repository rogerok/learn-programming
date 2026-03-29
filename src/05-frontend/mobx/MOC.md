---
tags: [mobx, moc, index, reactive, state-management]
aliases: [MobX]
---

# MobX — Map of Content

## Теория

- [[in-depth-explanation-of-MobX|MobX: глубокое объяснение (observable, computed, reaction)]]
- [[mobx-in-50-lines-of-code|MobX за 50 строк кода (реализация с нуля)]]

## Архитектура MobX (по материалам Dmitry Kazakov)

- [[dk-layered-architecture|Трёхслойная архитектура: Global / Page / ViewModel]]
- [[dk-actions-and-api-layers|Actions и API как отдельные слои]]
- [[dk-view-model-pattern|ViewModel Pattern: анемичный стор + VM]]
- [[dk-context-and-di|Context, DI и циклические зависимости]]
- [[dk-ssr-and-ssg|SSR и SSG с MobX без Next.js]]

## Практические паттерны

- [[HttpMobxRequest|HTTP запросы с MobX]]
- [[http-service|HTTP сервис]]
- [[mobx-ssr|MobX + SSR (Next.js)]]
- [[paginatedStore|Пагинированный стор]]
- [[ssr-store-serealization-mobx|Сериализация стора для SSR]]
- [[mobx-react-hook-form-integration/mobx-react-hook-form|MobX + React Hook Form интеграция]]

## Связанные темы

- [[../react/MOC|React]]
- [[../../04-architecture/MOC|Architecture (MVC, MVVM)]]

## Sources

- [Как MobX делает объекты реактивными с помощью Proxy](https://habr.com/ru/companies/gnivc/articles/893108/)
- [Под капотом у MobX. Пишем свою реактивную библиотеку с нуля](https://habr.com/ru/articles/689374/)
- [Реализация архитектуры Redux на MobX](https://habr.com/ru/articles/546628/)
- [Отладка и мониторинг в MobX: trace, introspection и spy](https://habr.com/ru/companies/gnivc/articles/855346/)
- [Как организовать API при помощи декларативных конфигов](https://github.com/mobxjs-ru/api-by-config/tree/main)
- [Репозиторий с примерами использования MobX](https://github.com/mobxjs-ru)

---
tags: [mobx, moc, index, reactive, state-management]
aliases: [MobX]
---

# MobX — Map of Content

## Цель

Научиться моделировать состояние как минимальный динамический граф `observable → computed → reaction`, изменять его через `action` и согласовывать срок жизни store с React-границами. MobX здесь следует после React, а не заменяет понимание render, effects и Context.

## Пререквизиты

- [[../react/MOC|Маршрут React]] как минимум до этапа state management.
- [[../../01-javascript/MOC|JavaScript]]: объекты, классы, функции, `Promise`.
- [[../../01-javascript/core/functions/closure|Замыкания]] и referential equality.
- Для архитектурной части — направление зависимостей и [[../../04-architecture/MOC|MVC/MVVM]].

**Входная проверка:** для нового значения сначала решите, является ли оно исходным state, чистым derivation или side effect. Если его можно оставить локальным React state без дублирования и дальних потребителей, внешний store пока не нужен.

## Путь по зависимостям

### 1. Реактивный граф

1. [[in-depth-explanation-of-MobX|Observable, computed, reaction и action]].
2. Проследите динамическую ветку: reaction подписывается только на значения, фактически прочитанные при последнем запуске.
3. Разделяйте чистый `computed` и выполняющую side effect `reaction`; изменение state оформляйте как `action`.

**Проверка этапа:** по псевдокоду с условной веткой нарисуйте текущие рёбра графа, предскажите invalidation и объясните, почему неиспользуемая ветка перестала вызывать reaction.

### 2. Границы store и React

Читайте в порядке зависимостей:

1. [[dk-layered-architecture|Global Store → Page Store → ViewModel]].
2. После общей схемы — [[dk-actions-and-api-layers|Actions и API как отдельные слои]].
3. Затем [[dk-view-model-pattern|ViewModel: локальная логика и computed]].
4. После определения слоёв — [[dk-context-and-di|Context, DI и циклические зависимости]].

Правило направления: VM знает Page и Global, Page знает Global, Global не знает нижние слои. React Context доставляет уже созданную зависимость, но не делает любой state глобальным.

**Проверка этапа:** распределите пользователя, данные страницы и состояние одной карточки по слоям; для каждого назовите создание, уничтожение и допустимые зависимости. Проверьте две одновременные инстанции страницы.

### 3. Асинхронное состояние и жизненный цикл

1. Сначала примените разделение Store / Actions / API из предыдущего этапа.
2. Для статусов и derived-флагов разберите [[paginatedStore|Paginated Store]]; заметка также требует TypeScript generics.
3. Для запроса с runtime-валидацией — [[HttpMobxRequest|HTTP Request Store]]; это углубление требует `zod` и `fp-ts`, а не вводит их автоматически.

**Проверка этапа:** для `idle → loading → success/error` назовите action, observable state и computed-флаги; при unmount Page Store незавершённый запрос и принадлежащие ему reactions должны освобождаться.

## Практика

- [[../exercises#5. Diagnose: динамическая зависимость MobX|Diagnose]] — после этапа 1.
- [[../exercises#6. Transfer: React + MobX по границам жизненного цикла|Transfer]] — после этапов 2–3.

Задания выполняются ручной трассой и не требуют установки MobX, router или SSR framework.

## Выходная проверка

Маршрут завершён, если вы можете:

- по фактическим чтениям восстановить динамический dependency graph;
- отличить `computed` от локальной копии derived-данных и `reaction` от `action`;
- обосновать, почему state должен покинуть React-компонент;
- создать независимый Page Store на mount и уничтожить его ресурсы на unmount;
- провести зависимости только в направлении `VM → Page → Global`;
- объяснить, какой observer render произойдёт после action и почему.

Подтвердите это финальным сценарием из [[../exercises#6. Transfer: React + MobX по границам жизненного цикла|Transfer]].

## Справочники и треки по источникам

Материалы ниже не входят автоматически в основной маршрут: у каждого есть собственные пререквизиты.

### Реализация реактивности с нуля

- [[mobx-in-50-lines-of-code|MobX за 50 строк кода]] — после теории реактивного графа.

### Архитектурный трек по материалам Dmitry Kazakov

- Основной цикл: [[dk-layered-architecture|слои]] → [[dk-actions-and-api-layers|Actions/API]] → [[dk-view-model-pattern|ViewModel]] → [[dk-context-and-di|Context/DI]].
- SSR-ветка после цикла: [[dk-ssr-and-ssg|SSR и SSG без Next.js]] → [[ssr-store-serealization-mobx|сериализация store]].

### Framework- и project-specific примеры

- [[mobx-ssr|MobX + SSR в Next.js App Router]] — требует Next.js App Router.
- [[mobx-react-hook-form-integration/mobx-react-hook-form|MobX + React Hook Form]] — требует React Hook Form и Zod.
- [[http-service|Axios HTTP service]] — project snippet с Axios/Next.js и локальными DTO, не базовый MobX API.

## Связанные темы

- [[../MOC|Frontend]]
- [[../react/MOC|React]]
- [[../../04-architecture/MOC|Architecture (MVC, MVVM)]]

## Источники

- [Как MobX делает объекты реактивными с помощью Proxy](https://habr.com/ru/companies/gnivc/articles/893108/)
- [Под капотом у MobX. Пишем свою реактивную библиотеку с нуля](https://habr.com/ru/articles/689374/)
- [Реализация архитектуры Redux на MobX](https://habr.com/ru/articles/546628/)
- [Отладка и мониторинг в MobX: trace, introspection и spy](https://habr.com/ru/companies/gnivc/articles/855346/)
- [Как организовать API при помощи декларативных конфигов](https://github.com/mobxjs-ru/api-by-config/tree/main)
- [Репозиторий с примерами использования MobX](https://github.com/mobxjs-ru)

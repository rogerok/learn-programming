# Похожие репозитории по Effect / Effect-TS

Полного аналога [EffectPatterns](https://github.com/PaulJPhilp/EffectPatterns) с сотнями отдельных рецептов почти нет. Ниже — наиболее близкие учебные материалы, примеры и реальные проекты.

## Наиболее близкие

### 1. [Effect-TS/examples](https://github.com/Effect-TS/examples)

Официальные примеры и шаблоны:

- полноценный HTTP-сервер;
- authentication и authorization;
- сервисы и `Layer`;
- SQL, миграции и тестирование;
- шаблоны для CLI, библиотек и монорепозиториев.

Это лучший следующий репозиторий после `EffectPatterns`, особенно для изучения архитектуры реального приложения.

### 2. [typeonce-dev/effect-getting-started-course](https://github.com/typeonce-dev/effect-getting-started-course)

Последовательный учебный проект, охватывающий:

- typed errors;
- `Effect.gen`;
- `Schema`;
- `Config`;
- сервисы и dependency injection;
- `Layer` и `ManagedRuntime`;
- тестирование Effect-приложений.

Материала меньше, чем в `EffectPatterns`, зато есть связный путь от обычных `Promise` и `fetch` до полноценной архитектуры.

### 3. [Effect-TS/effect — website/docs](https://github.com/Effect-TS/effect/tree/main/website/docs)

Исходники официальной документации находятся в основном репозитории. Подход более справочный, чем cookbook, но документация покрывает:

- error management;
- concurrency;
- streams;
- resource management;
- services и layers;
- scheduling;
- observability и tracing;
- testing.

## Реальные проекты как источник архитектурных паттернов

### 4. [beep-effect/beep-effect](https://github.com/beep-effect/beep-effect)

Большой Effect-first монорепозиторий. Особенно интересен для изучения:

- hexagonal architecture;
- vertical slices;
- DDD и bounded contexts;
- schema-first domain modeling;
- `Context.Tag`, ports и adapters;
- организации `Layer`;
- HTTP handlers и repository implementations.

Это не учебник, а крупная production-oriented кодовая база. Входить лучше через `standards/architecture`.

### 5. [TylorS/typed](https://github.com/TylorS/typed)

Фреймворк для веб-приложений поверх Effect:

- routing;
- server-side и client-side архитектура;
- управление состоянием;
- streams;
- интеграция Effect с DOM и веб-приложениями.

Полезен, если интересует Effect не только на backend.

### 6. [typeonce-dev/sync-engine-web](https://github.com/typeonce-dev/sync-engine-web)

Полноценное приложение с React, TanStack Router, Web Workers, Effect и CRDT. Хороший источник паттернов для:

- Effect в браузере;
- worker-based архитектуры;
- синхронизации данных;
- разделения runtime и UI.

### 7. [typeonce-dev/calories-tracker-local-only-app](https://github.com/typeonce-dev/calories-tracker-local-only-app)

Более компактный frontend-проект:

- Effect;
- TanStack Router;
- PGlite;
- Drizzle;
- XState;
- реактивное локальное хранение.

## Репозитории для конкретных интеграций

- [alchemy-run/distilled](https://github.com/alchemy-run/distilled) — Effect-native SDK для AWS, Cloudflare и других cloud-провайдеров.
- [floydspace/effect-aws](https://github.com/floydspace/effect-aws) — паттерны интеграции Effect с AWS SDK.
- [mcrovero/effect-nextjs](https://github.com/mcrovero/effect-nextjs) — Effect в Next.js App Router, server components и server actions.
- [utopyin/effect-orpc](https://github.com/utopyin/effect-orpc) — интеграция Effect с oRPC.
- [OperationalFallacy/biome-effect-linting-rules](https://github.com/OperationalFallacy/biome-effect-linting-rules) — opinionated lint-правила для Effect-кода.

## Где искать дальше

В GitHub-теме [effect-ts](https://github.com/topics/effect-ts?l=typescript) собрано более 300 TypeScript-репозиториев. Сортировка по звёздам помогает найти библиотеки, а сортировка по дате обновления — современные реальные приложения.

## Рекомендуемый порядок изучения

1. [EffectPatterns](https://github.com/PaulJPhilp/EffectPatterns)
2. [Effect-TS/examples](https://github.com/Effect-TS/examples)
3. [effect-getting-started-course](https://github.com/typeonce-dev/effect-getting-started-course)
4. [Официальная документация](https://github.com/Effect-TS/effect/tree/main/website/docs)
5. [beep-effect](https://github.com/beep-effect/beep-effect) как пример большой архитектуры
6. Специализированный проект под нужный стек — Next.js, AWS, React или HTTP

---
tags: [tips, moc, index, mobx, architecture, patterns]
aliases: [Tips, Советы]
---

# Tips — справочный каталог

## Роль раздела

Это каталог точечных reference notes: сюда приходят за примером конкретного приёма, а не проходят материалы по порядку. Для изучения темы сначала откройте канонический маршрут в колонке «Концепция», затем используйте связанную заметку как справочник или пример применения.

## Архитектура

| Справочная заметка | Каноническая концепция |
|---|---|
| [[../04-architecture/ddd/clean-architecture|Clean Architecture + DDD]] | [[../04-architecture/MOC#6. Clean Architecture: защитить ядро направлением зависимостей|Правило зависимостей и место Clean Architecture в архитектурном маршруте]] |
| [[../04-architecture/ddd/entity-vs-value-object|Entity vs Value Object]] | [[../04-architecture/MOC#5. DDD: моделировать идентичность и правила только при наличии доменной сложности|DDD: идентичность, значение и инварианты]] |

## MobX: прикладные паттерны

Каноническая точка входа: [[../05-frontend/mobx/MOC|MobX MOC]]. Теория об `observable`, `computed` и `reaction` находится там же; записи ниже отвечают на узкие вопросы реализации.

- [[../05-frontend/mobx/HttpMobxRequest|HTTP-запросы с MobX]]
- [[../05-frontend/mobx/http-service|HTTP-сервис]]
- [[../05-frontend/mobx/mobx-ssr|MobX + SSR в Next.js]]
- [[../05-frontend/mobx/paginatedStore|Пагинированный store]]
- [[../05-frontend/mobx/ssr-store-serealization-mobx|Сериализация store для SSR]]
- [[../05-frontend/mobx/mobx-react-hook-form-integration/mobx-react-hook-form|Интеграция MobX и React Hook Form]] — канонические маршруты: [[../05-frontend/mobx/MOC|MobX]] и [[../05-frontend/react/MOC|React]].

## Валидация и TypeScript

- [[../09-practice/zod-validator/readme|Reference implementation Zod-like validator]] — полный листинг для чтения после собственной попытки; связанные концепции собраны в [[../02-typescript/MOC|TypeScript MOC]].

## Куда идти за обучением

- [[../04-architecture/MOC|Architecture]] — последовательный маршрут по архитектурным решениям.
- [[../05-frontend/mobx/MOC|MobX]] и [[../05-frontend/react/MOC|React]] — теория и тематическая навигация.
- [[../09-practice/MOC|Practice]] — упражнения `predict → explain → diagnose → transfer` вокруг Zod-like validator.
- [[../itx-workshop/MOC|ITX Workshop]] — короткий упорядоченный source/workshop track по тому же материалу.

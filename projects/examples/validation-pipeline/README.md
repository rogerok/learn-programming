---
tags: [typescript, validation, discriminated-union, example]
aliases: [Validation Pipeline, Конвейер валидации]
---

# Validation Pipeline

Самостоятельный TypeScript-проект: CLI читает JSON-заявку на отправку посылки, а чистый конвейер либо возвращает нормализованный `ParcelOrder`, либо **все** найденные ошибки. Домен посылок намеренно не связан с планировщиками и асинхронными задачами.

## Запуск

Требуется Node.js 22+ и pnpm 10. Команды выполняются из этой директории и не используют зависимости корня репозитория:

```bash
pnpm install --ignore-workspace --frozen-lockfile
pnpm build
pnpm lint
pnpm test
pnpm cli -- examples/valid-parcel.json
```

Полная локальная проверка:

```bash
pnpm lint && pnpm check
```

## Поток данных

1. `src/cli.ts` выполняет эффекты: читает файл, разбирает JSON, печатает результат и задаёт exit code.
2. `validateParcelOrder(input: unknown)` остаётся чистой функцией: одинаковый вход всегда даёт одинаковый `Validation<ParcelOrder>`.
3. Маленькие `Validator<T>` проверяют тип, уточняют ограничения через `refineValidator` и преобразуют значение через `mapValidator`.
4. `combineValidations` обходит независимые результаты и накапливает их ошибки. Вложенные ошибки сохраняют точный путь, например `$input.recipient.email`.
5. Только полностью валидные части собираются в доменную модель.

## Связь с концепциями TypeScript

| Часть | Концепция | Что показывает |
|---|---|---|
| `Validation<T>` | discriminated union | Проверка `kind` сужает тип до `value` или `errors` без исключений и unsafe-доступа. |
| `Delivery` | discriminated union домена | `kind: "courier" | "locker"` определяет доступные поля конкретного способа доставки. |
| `Validator<T>` | generics и функции высшего порядка | Один контракт связывает неизвестный вход с типизированным результатом; `mapValidator` и `refineValidator` композиционно строят новые валидаторы. |
| `combineValidations` | generic tuple inference | Типы отдельных результатов сохраняются в итоговом tuple, а ошибки объединяются в один список. |
| Нормализация | transformations | Пробелы сворачиваются, email приводится к lowercase, идентификаторы — к uppercase, денежная строка — к целому числу центов. |
| `parcel-order.ts` / `cli.ts` | pure core, impure shell | Доменная логика не знает про файлы, консоль и процесс; эффекты остаются на внешней границе. |

## Структура

- `src/validation.ts` — переиспользуемые типы и комбинаторы.
- `src/parcel-order.ts` — чистая доменная схема и конвейер.
- `src/cli.ts` — единственная impure-граница.
- `test/parcel-order.test.ts` — проверки преобразований, обеих веток `Delivery` и накопления ошибок.
- `examples/valid-parcel.json` — вход для smoke-запуска CLI.

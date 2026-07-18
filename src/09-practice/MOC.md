---
tags: [practice, moc, index, workshop, zod]
aliases: [Practice, Практика]
---

# Практика — маршрут и типы материалов

## Цель

Использовать практические материалы осознанно: сначала извлечь модель из памяти, затем проверить её по коду, диагностировать расхождение между типами и runtime behavior и только после этого переносить приём в новый контекст.

Наблюдаемый результат зависит от выбранного формата: для complete example — запустить систему и объяснить её границы; для guided project — пройти накопительные checkpoints собственной реализацией; для reference note — проследить type flow и runtime parsing и диагностировать неподтверждённый контракт.

## Предварительные знания

1. [[../02-typescript/MOC|TypeScript]] — generics, union types и mapped types.
2. [[../03-oop/MOC|OOP]] — class, наследование и abstract method.
3. [[../02-typescript/advanced/type-level-programming/type-level-programming|Type-level programming]] — после базового TypeScript.
4. [[../02-typescript/advanced/infer|`infer` и извлечение типа]] — полезно для сравнения с phantom field.
5. [[../01-javascript/MOC|JavaScript]] — `Promise`, `async`/`await` и event loop перед guided project.

**Входная проверка:** для validation-ветки объясни отличие compile-time type от runtime validation и набросай сигнатуру `unknown → string | error`. Для async-ветки отдельно предскажи, чем порядок запуска `Promise` может отличаться от порядка завершения. Пробел определяет prerequisite, к которому нужно вернуться.

## Что здесь считается практикой

| Категория | Что опубликовано | Как использовать |
|---|---|---|
| **Упражнения** | Retrieval- и diagnosis-задачи ниже; системные упражнения собраны в [[../cs/computer-system/MOC#Зависимый маршрут|маршруте CS:APP]] | Выполнять до чтения полного разбора; фиксировать предсказание и наблюдаемый результат. |
| **Workshops** | Пошаговых workshops с общей live-сессией пока нет | Не называть готовый листинг workshop: он не оставляет учащемуся реализацию по этапам. |
| **Complete examples** | [Validation Pipeline](../../projects/examples/validation-pipeline/README.md) | Запустить неизменённым, проследить pure core/impure shell, затем использовать как проверяемую reference architecture. |
| **Reference implementations** | [[zod-validator/readme|Упрощённый Zod-like validator]] | Читать после собственной модели как локальный листинг для retrieval и диагностики. Это не задание «реализуй с нуля». |
| **Guided projects** | [Планировщик асинхронных задач](../../projects/guided/async-task-scheduler/GUIDE.md) | Изменять только указанный файл, идти по milestones и открывать progressive hints по одной. |
| **Будущие guided projects** | Пока не опубликованы | Не смешивать намерение с доступным материалом; новый проект должен иметь outcomes, checkpoints, hints и reflection. |

## Маршрут по форматам

После входной проверки выбери не тему, а требуемое действие.

### Complete example: понять работающую систему

1. До чтения кода предскажи границу между вводом/выводом и чистой validation logic.
2. Открой [README Validation Pipeline](../../projects/examples/validation-pipeline/README.md), затем выполни его `pnpm build`, `pnpm test` и CLI smoke command.
3. Проследи один valid input и один invalid input от JSON до `Validation<ParcelOrder>`.
4. Закрой README и объясни, почему ошибки накапливаются, а не останавливают pipeline на первом сбое.

**Готово, когда:** `pnpm check` проходит в директории example; по выводу CLI можно показать normalization, точный error path и exit behavior; роли `validation.ts`, `parcel-order.ts` и `cli.ts` объясняются без кода.

### Guided project: построить поведение по milestones

1. Открой [guide планировщика](../../projects/guided/async-task-scheduler/GUIDE.md) и выполни начальные `npm run build` и `npm run smoke`.
2. Для каждого этапа сначала запиши prediction, затем запусти только соответствующий накопительный `npm run check:N`.
3. Измени `src/scheduler.ts`, подтверди manual checkpoint и только при затруднении открывай hints по одной.
4. После этапа 4 пройди final self-check из guide и объясни перенос принципа worker pool на другую очередь задач.

**Готово, когда:** `check:1`–`check:4` проходят по порядку; наблюдаемы стабильный порядок результатов, переходы состояний, isolated errors, предел concurrency и задача, добавленная во время `run()`.

### Reference note: извлечь модель и найти пробел

Следующий маршрут относится только к локальному Zod-like листингу.

## Маршрут чтения Zod reference


### 1. Сначала построить модель

Не открывая reference implementation, предскажи:

1. где schema должна хранить output type, если это значение нужно только TypeScript;
2. какой тип должен получить результат `string().optional()`;
3. какие runtime-проверки нужны `array(number())` и `object({ name: string() })`;
4. должен ли parser возвращать исходное значение или результат вложенных parsers.

Сохрани ответы: они нужны как baseline для диагностики, а не как экзамен на угадывание.

### 2. Прочитать reference implementation по зависимостям

1. [[zod-validator/readme#Архитектура|Карта файлов]] — назови ответственность каждого слоя.
2. [[zod-validator/readme#util.ts — вспомогательные типы|`Flatten` и `AddQuestionMarks`]] — вручную разверни один объект с required и optional полем.
3. [[zod-validator/readme#schema.ts — ядро валидатора|`ZodType` и concrete schemas]] — проследи отдельно type flow и value flow.
4. [[zod-validator/readme#Тесты (z.spec.ts)|Наблюдаемые контракты тестов]] — сопоставь каждый тест с методом, поведение которого он защищает.
5. [[zod-validator/readme#Ключевые паттерны|Ключевые паттерны]] — закрой заметку и воспроизведи их своими словами.

**Проверка завершения:** нарисуй две цепочки для `object({ name: string().optional() })`: compile-time цепочку от schema до inferred type и runtime цепочку от `parse` до результата. В каждой стрелке назови конкретный type alias или method.

## Малые задания

### Retrieval: предсказать и объяснить

**Результат:** без подглядывания объяснить роль `_type`, `TypeOf<T>`, `AddQuestionMarks` и `parse`.

**Предварительные знания:** входная проверка и шаги 1–3 маршрута.

**Задание:** сначала предскажи inferred type объекта с одним обязательным и одним optional полем. Затем объясни, какие runtime methods будут вызваны для отсутствующего optional поля и для неверного обязательного поля.

**Критерий приёмки:** есть две отдельные трассы — type-level и runtime; в каждой указаны вход, промежуточные звенья и наблюдаемый результат. Ответ проверен по reference implementation только после записи предсказания.

**Проверка:** сопоставь каждое звено с определением в разделах `util.ts` или `schema.ts`; несовпадение пометь как пробел, а не исправляй ответ задним числом.

> [!hint]- Подсказка 1
> Начни с `TypeOf<T> = T["_type"]` и двигайся наружу к mapped type объекта.

> [!hint]- Подсказка 2
> Для runtime trace начни с `ZodObject.parse`, затем найди вызов parser каждого поля.

> [!hint]- Подсказка 3
> Отдельно проверь ветку `value === undefined` в optional schema.

**Рефлексия:** какая часть API существует только для compiler, а какая обязана проверять реальные данные?

### Diagnosis: найти неподтверждённый контракт

**Результат:** обнаружить одно расхождение между ожидаемым поведением validator и тем, что действительно проверяет reference implementation.

**Предварительные знания:** завершённая retrieval-задача и прочитанный раздел с тестами.

**Задание:** выбери composite schema (`array` или `object`), сформулируй один негативный пример и предскажи, вернётся ли значение или возникнет ошибка. После этого проследи method body и опиши минимальный тест, который различает ожидаемое и фактическое поведение. Реализацию исправления не добавляй.

**Критерий приёмки:** указаны входные данные, ожидаемый контракт, фактическая ветка кода и наблюдение, по которому тест проходит или падает. Диагноз ссылается на конкретный `parse`, а не на общее предположение о Zod.

**Ручная проверка:** убедись, что предложенный тест не дублирует три уже приведённых теста и падает по причине выбранного контракта.

> [!hint]- Подсказка 1
> Сравни проверку контейнера с проверкой его элементов или полей.

> [!hint]- Подсказка 2
> В `ZodArray.parse` проследи, вызывается ли `this.element.parse` для каждого элемента.

> [!hint]- Подсказка 3
> В `ZodObject.parse` сравни проверенные вложенные значения с тем значением, которое возвращает method.

**Рефлексия:** какой дополнительный тест сильнее всего изменил бы твою уверенность в runtime contract и почему?

## Transfer checkpoint

Выбери другой composite validator, например tuple или record, и только спроектируй его контракт: inferred type, допустимые runtime inputs, error case и один boundary test. Не копируй готовую реализацию и не начинай coding, пока четыре пункта не согласованы между собой.

## Справочные материалы и источники

- [Complete example: Validation Pipeline](../../projects/examples/validation-pipeline/README.md) — запускаемый TypeScript CLI с тестами и `pnpm check`.
- [Guided project: планировщик асинхронных задач](../../projects/guided/async-task-scheduler/GUIDE.md) — четыре накопительных milestone и manual checkpoints.
- [[zod-validator/readme|Локальная reference implementation Zod-like validator]] — полный учебный листинг и три теста.
- Внешний список источников для этой реализации в vault не зафиксирован; он намеренно не подменяется предположениями.

## Связанные темы

- [[../02-typescript/MOC|TypeScript]]
- [[../03-oop/MOC|OOP]]
- [[../02-typescript/unsound/unsound|TypeScript Unsound]]
- [[../cs/computer-system/MOC|CS:APP]]

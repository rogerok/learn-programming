---
tags: [learning, study-session]
topic: Effect PubSub и subscriber fibers
date: 2026-07-25
mode: study
objective: Доставить события всем активным subscribers через scoped consumer fibers
review_due: 2026-07-28
review_interval_days: 3
---

# Учебная сессия — PubSub и subscriber fibers

[[00-learning/MOC|← Учебный цикл]]

## Контекст

- Тема или заметка: `projects/guided/seat-reservation-engine`, этап 5 — broadcast событий через `PubSub`.
- Режим: `study`
- Дата: 2026-07-25
- Одна наблюдаемая цель: доставить каждому активному subscriber одинаковую упорядоченную последовательность `BookingEvent` через личную subscription queue и consumer fiber.

## Cold retrieval

- Prompt: предсказать влияние медленного callback на worker, следующую публикацию и остальных subscribers при последовательном вызове callbacks из `Ref`.
- Ответ учащегося или ссылка на артефакт: предположил задержку на 5 секунд; выбрал отдельную fiber для чтения subscription queue и scope processor для её lifetime, но первоначально не объяснил причину выбора scope.
- Использованная помощь: `hint`
- Наблюдаемый результат: блокировка worker медленным callback определена самостоятельно; lifecycle subscription и consumer fiber потребовал объяснения.

## Выявленный пробел и чтение

- Конкретный пробел, показанный попыткой: различие между коротким эффектом регистрации `subscribe` и бесконечным consumer effect; привязка acquisition и fiber к уже существующему scope processor.
- Прочитанный фрагмент или ссылка: сигнатуры `PubSub.subscribe`, `Scope.extend` и `Effect.forkIn` из установленной версии Effect; текущие `publish`, `subscribe` и `eventLog` в `src/booking.ts`.
- Что учащийся воспроизвёл после закрытия материала: subscription queue и consumer fiber должны закрываться вместе с processor; `eventLog` обновляется синхронно в `publish`, а внешние callbacks выполняются consumer fibers.

## Практика

- Задача: заменить прямой список callbacks на `PubSub` subscriptions, сохранив публичный `subscribe(...): Effect<void>` и порядок событий каждого subscriber.
- Артефакт или описание попытки: `publish` обновляет `eventLog` и выполняет `PubSub.publish`; `subscribe` создаёт личную subscription через `Scope.extend`, формирует бесконечный цикл `take → callback` и запускает его через `Effect.forkIn` в scope processor.
- Результат узкой проверки: `npm run build` проходит; `npm run check:5` — 15/15 тестов проходят, оба subscribers получают тот же порядок восьми событий, что и `eventLog`.

## Feedback и повторная попытка

- Что уже работает: producer публикует Effect через `yield*`; event log не зависит от асинхронного consumer; внешний `subscribe` завершается после запуска фоновой fiber.
- Минимальная подсказка: созданный `PubSub.publish` не выполняется без `yield*`; event log должен обновляться в publication boundary; consumer — прежний бесконечный цикл, вложенный в отдельный Effect и запущенный через `forkIn`.
- Что изменилось после подсказки: пустой event log восстановлен до восьми событий; callbacks подключены к личным subscription queues; milestone check стал проходить.

## Self-explanation

- Вопрос о механизме, правиле или инварианте: объяснить отдельно, почему `subscribe` возвращает управление и почему бесконечный consumer прекращает работу.
- Объяснение учащегося: `forkIn` возвращает `RuntimeFiber`; consumer привязан к scope processor.
- Названная граница или failure mode: если выполнять бесконечный consumer внутри самого `subscribe`, регистрация не завершится; без processor scope consumer может завершиться слишком рано или пережить processor.

## Evidence

| Измерение | Категория | Наблюдаемый факт |
|---|---|---|
| Retrieval | `with-hint` | Отдельная consumer fiber и scope processor выбраны, но lifecycle-механизм потребовал объяснения. |
| Application | `with-hint` | После подсказок реализованы `Scope.extend` и `Effect.forkIn`; `npm run check:5` проходит 15/15. |
| Self-explanation | `with-hint` | После разделяющего вопроса отдельно названы немедленный возврат `RuntimeFiber` и остановка через scope processor. |

## Следующий review

- Фокус следующего cold retrieval: без подсказок проследить lifetime `PubSub.subscribe`, короткого эффекта регистрации и бесконечной consumer fiber, включая медленного subscriber и закрытие processor scope.
- Применённое правило интервала: retrieval, application и self-explanation потребовали подсказок; используется интервал 3 дня.
- Интервал в днях: 3
- Дата `YYYY-MM-DD`: 2026-07-28

## История review

<!-- Новые delayed review добавляются ниже; прежние evidence не перезаписываются. -->

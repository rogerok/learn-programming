---
tags: [learning, study-session]
topic: Effect Queue, Deferred и worker fibers
date: 2026-07-24
mode: study
objective: Проследить путь BookingRequest через Queue и worker к соответствующему BookingOutcome через Deferred
review_due: 2026-07-27
review_interval_days: 3
---

# Учебная сессия — coordination в booking processor

[[00-learning/MOC|← Учебный цикл]]

## Контекст

- Тема или заметка: `projects/guided/seat-reservation-engine`, этап 5 — Queue, Deferred, PubSub и Semaphore
- Режим: `study`
- Дата: 2026-07-24
- Одна наблюдаемая цель: проследить путь одного `BookingRequest` от `submit` через `Queue` и worker до возврата соответствующего `BookingOutcome` через `Deferred`.

## Cold retrieval

- Prompt: объяснить, зачем каждому конкурентному request нужен отдельный одноразовый канал ответа и кто должен его создать.
- Ответ учащегося или ссылка на артефакт: сначала предположил общий race condition и создание `Deferred` worker-ом; после вопросов связал отдельный `Deferred` с конкретным request и outcome.
- Использованная помощь: `hint`
- Наблюдаемый результат: механизм не был воспроизведён самостоятельно в начале; после последовательных концептуальных подсказок маршрут request/result был объяснён корректно.

## Выявленный пробел и чтение

- Конкретный пробел, показанный попыткой: различие между `Deferred` как одноразовым каналом, значением `BookingOutcome` и действием завершения канала; роль постоянно работающего worker fiber.
- Прочитанный фрагмент или ссылка: [Effect Deferred](https://effect.website/docs/v3/concurrency/deferred), [Effect Basic Concurrency](https://effect.website/docs/v3/concurrency/basic-concurrency), этап 5 в `GUIDE.md`.
- Что учащийся воспроизвёл после закрытия материала: `submit` создаёт отдельный `Deferred`, помещает `{ request, reply }` в общую очередь и ожидает reply; worker забирает элемент, выполняет booking flow и завершает reply полученным outcome; при `workerCount = 3` одну очередь читают три worker fibers.

## Практика

- Задача: начать перенос немедленной обработки из `submit` в producer/consumer flow этапа 5.
- Артефакт или описание попытки: в `src/booking.ts` добавлены bounded `Queue`, отдельный эффект `book`, worker-циклы, создание `Deferred` в `submit`, `Queue.offer` и ожидание reply. Workers пока не запущены; присутствуют несколько экспериментальных вариантов worker-а.
- Результат узкой проверки: `npm run check:5` — 14 предыдущих тестов прошли; milestone 5 завершился timeout через 5000 ms. После добавления пропущенного `yield*` к `Queue.offer` timeout сохранился, потому что worker effect ещё не запущен.

## Feedback и повторная попытка

- Что уже работает: учащийся корректно разделил `book`, транспорт request через `Queue` и возврат результата через `Deferred`; самостоятельно обнаружил пропущенный `yield*` у `Queue.offer` после диагностической подсказки.
- Минимальная подсказка: Effect является ленивым описанием вычисления; проверить, какие созданные эффекты фактически выполняются. Для workers оставить один вариант цикла и отдельно разобраться с запуском как scoped fiber.
- Что изменилось после подсказки: `Queue.offer` начал выполняться через `yield*`; учащийся установил, что ни один worker/loop пока не запускается.

## Self-explanation

- Вопрос о механизме, правиле или инварианте: описать путь request A от `submit(A)` до outcome A и объяснить количество циклов при `workerCount = 3`.
- Объяснение учащегося: `submit` создаёт reply, передаёт request и reply через `Queue.offer`, worker забирает оба значения, выполняет booking и завершает `Deferred`, после чего `Deferred.await(reply)` возвращает outcome; одну очередь должны читать три worker-цикла.
- Названная граница или failure mode: общий `Deferred` для нескольких requests создаёт конфликт результата; Effect, который создан, но не выполнен через Effect composition, не производит действие.

## Evidence

| Измерение | Категория | Наблюдаемый факт |
|---|---|---|
| Retrieval | `with-hint` | Изначально механизм отдельного `Deferred` и сторона его создания определены неверно; после вопросов объяснение исправлено. |
| Application | `with-hint` | Producer-side wiring начато; пропущенный `yield*` исправлен после подсказки; milestone 5 всё ещё завершается timeout, workers не запущены. |
| Self-explanation | `with-hint` | После поэтапных вопросов корректно прослежен путь request → Queue → worker → Deferred → outcome и определено число workers. |

## Следующий review

- Фокус следующего cold retrieval: без подсказок нарисовать путь одного request и объяснить, почему worker должен быть отдельной scoped fiber, а последовательный запуск бесконечных workers не создаёт требуемую concurrency.
- Применённое правило интервала: retrieval и application потребовали подсказок; используется интервал 3 дня.
- Интервал в днях: 3
- Дата `YYYY-MM-DD`: 2026-07-27

## История review

<!-- Новые delayed review добавляются ниже; прежние evidence не перезаписываются. -->

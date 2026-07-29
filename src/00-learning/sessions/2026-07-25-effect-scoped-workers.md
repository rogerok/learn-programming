---
tags: [learning, study-session]
topic: Effect scoped worker fibers
date: 2026-07-25
mode: study
objective: Запустить workerCount конкурентных worker fibers в scope booking processor
review_due: 2026-07-28
review_interval_days: 3
---

# Учебная сессия — scoped workers в booking processor

[[00-learning/MOC|← Учебный цикл]]

## Контекст

- Тема или заметка: продолжение [[sessions/2026-07-24-effect-booking-coordination|сессии о Queue, Deferred и worker fibers]]; `projects/guided/seat-reservation-engine`, этап 5.
- Режим: `study`
- Дата: 2026-07-25
- Одна наблюдаемая цель: запустить `options.workerCount` конкурентных worker fibers так, чтобы они принадлежали scope процессора.

## Cold retrieval

- Prompt: определить, какие из созданных эффектов `worker`, `worker2` и `loop` реально выполняются после возврата processor и почему `submit` остаётся на `Deferred.await`.
- Ответ учащегося или ссылка на артефакт: самостоятельно указал, что `loop` не запущен; затем правильно предсказал, что при простом `yield* loop` начнёт работу только один worker, но первоначально связал это с выбором `worker2`, а не с последовательным ожиданием первой бесконечной итерации.
- Использованная помощь: `hint`
- Наблюдаемый результат: отсутствие consumer-а воспроизведено самостоятельно; причина блокировки последовательного `Effect.forEach` уточнена после концептуальной подсказки.

## Выявленный пробел и чтение

- Конкретный пробел, показанный попыткой: различие между конкурентным ожиданием бесконечных эффектов и запуском фоновых fibers; место зависимости `Scope.Scope` и сервисов worker-а в `R` эффекта.
- Прочитанный фрагмент или ссылка: контракт этапа 5 в `GUIDE.md`; сигнатура `Effect.forkScoped` из установленной версии Effect.
- Что учащийся воспроизвёл после закрытия материала: `Effect.forEach` должен использовать `options.workerCount`; worker fibers должны быть scoped; зависимости сервисов принадлежат эффекту, внутри которого booking flow фактически запускается.

## Практика

- Задача: оставить один worker-loop и запустить `options.workerCount` экземпляров как scoped fibers, не переходя к `Semaphore` и `PubSub`.
- Артефакт или описание попытки: в `src/booking.ts` добавлен `Effect.forEach(Array.from({ length: options.workerCount }), () => Effect.forkScoped(worker))`; требования worker-а и `Scope.Scope` перенесены в environment `makeBookingProcessor`.
- Результат узкой проверки: `npm run build` проходит; `npm run check:5` больше не завершается timeout, но фиксирует `maxActivePayments = 3` при контракте `2`, поскольку `Semaphore` ещё не реализован.

## Feedback и повторная попытка

- Что уже работает: bounded queue читается несколькими workers; `Deferred` завершаются; processor setup возвращается; worker lifetime связан со scope.
- Минимальная подсказка: `concurrency: "unbounded"` у `Effect.forEach` не отделяет lifetime бесконечных вычислений от setup; для каждого worker нужен `Effect.forkScoped`. Зависимости находятся в `R` того эффекта, который запускает вычисление, а не того, который только создаёт замыкание.
- Что изменилось после подсказки: worker-ы запущены как scoped fibers, TypeScript environment `makeBookingProcessor` дополнен зависимостями worker-а, сборка проходит, timeout устранён.

## Self-explanation

- Вопрос о механизме, правиле или инварианте: объяснить, почему сервисы `book` раньше требовались от `submit`, а после запуска workers потребовались от `makeBookingProcessor`; предсказать обратный перенос зависимостей при возврате `book` внутрь `submit`.
- Объяснение учащегося: зависимости останутся у `submit`, если он отвечает за выполнение бронирования, потому что `submit` не выполняется при создании processor.
- Названная граница или failure mode: последовательное ожидание бесконечного worker-а не позволяет processor setup завершиться; перенос места выполнения эффекта переносит его требования к environment.

## Evidence

| Измерение | Категория | Наблюдаемый факт |
|---|---|---|
| Retrieval | `with-hint` | Самостоятельно определено, что `loop` не запущен; причина выполнения только первой итерации последовательного бесконечного `forEach` потребовала уточнения. |
| Application | `with-hint` | После подсказки использован `Effect.forkScoped`, сборка проходит и timeout этапа 5 устранён; следующий контракт `Semaphore` ещё не выполнен. |
| Self-explanation | `independent` | Самостоятельно связал принадлежность зависимостей с эффектом, который фактически выполняет booking flow, и с ленивым `submit`. |

## Следующий review

- Фокус следующего cold retrieval: без подсказок сравнить `yield* Effect.forEach(workers)` и запуск каждого бесконечного worker через `Effect.forkScoped`, включая завершение setup, location зависимостей и поведение при закрытии scope.
- Применённое правило интервала: retrieval и application потребовали подсказок; используется интервал 3 дня.
- Интервал в днях: 3
- Дата `YYYY-MM-DD`: 2026-07-28

## История review

<!-- Новые delayed review добавляются ниже; прежние evidence не перезаписываются. -->

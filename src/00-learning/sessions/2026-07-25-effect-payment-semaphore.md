---
tags: [learning, study-session]
topic: Effect Semaphore для PaymentGateway
date: 2026-07-25
mode: study
objective: Ограничить одновременные PaymentGateway.charge через общий Semaphore
review_due: 2026-07-28
review_interval_days: 3
---

# Учебная сессия — Semaphore для оплаты

[[00-learning/MOC|← Учебный цикл]]

## Контекст

- Тема или заметка: `projects/guided/seat-reservation-engine`, этап 5 — ограничение внешней операции оплаты.
- Режим: `study`
- Дата: 2026-07-25
- Одна наблюдаемая цель: при любом `workerCount` выполнять не больше `options.paymentConcurrency` одновременных вызовов `PaymentGateway.charge`.

## Cold retrieval

- Prompt: определить минимальную часть booking flow, которую должен защищать permit semaphore.
- Ответ учащегося или ссылка на артефакт: сначала выбрал весь `confirmReservation`, после диагностического вопроса указал точную операцию `payment.charge(reservationId, amount)`.
- Использованная помощь: `hint`
- Наблюдаемый результат: нужная граница определена после подсказки; самостоятельно указано, что один общий semaphore должен создаваться внутри `makeBookingProcessor`.

## Выявленный пробел и чтение

- Конкретный пробел, показанный попыткой: как передать ограниченную политику выполнения оплаты в общий confirmation flow без изменения публичной сигнатуры; отличие общего числа permits от числа permits на одну операцию; гарантированное освобождение permit.
- Прочитанный фрагмент или ссылка: сигнатуры `Effect.makeSemaphore` и `Semaphore.withPermits` из установленной версии Effect; реализация `confirmReservation` в `src/booking.ts`.
- Что учащийся воспроизвёл после закрытия материала: semaphore должен быть один на processor; одна оплата занимает один permit; публичный wrapper может сохранить два аргумента, делегируя приватному module-level helper с переданной функцией `charge`.

## Практика

- Задача: ограничить только `PaymentGateway.charge`, не дублируя confirmation flow и не меняя публичный API `confirmReservation`.
- Артефакт или описание попытки: извлечён приватный `confirmReservationUsing`; processor передаёт callback, оборачивающий `payment.charge` через общий semaphore; восстановлена публикация `ReservationConfirmed` после успешной оплаты.
- Результат узкой проверки: `npm run build` проходит; `npm run check:5` — 15/15 тестов проходят.

## Feedback и повторная попытка

- Что уже работает: helper сохраняет публичную сигнатуру; permit охватывает только внешний charge; semaphore разделяется всеми workers.
- Минимальная подсказка: `withPermits(n)` задаёт вес одной операции, а не общий лимит; при двух permits запрос двух permits одной оплатой сериализует charges. `withPermits` освобождает permit при success, failure и interruption.
- Что изменилось после подсказки: число permits на charge исправлено с `options.paymentConcurrency` на `1`; наблюдаемая payment concurrency изменилась с `1` на требуемые `2`; event log дополнен событием `ReservationConfirmed`.

## Self-explanation

- Вопрос о механизме, правиле или инварианте: описать поведение semaphore при interruption оплаты A, когда B выполняется, а C ждёт.
- Объяснение учащегося: A не будет выполнена; C перейдёт к выполнению; судьба permit первоначально была не определена.
- Названная граница или failure mode: после подсказки уточнено, что permit возвращается в счётчик semaphore, а ручной acquire/charge/release без finalizer может утечь при failure или interruption.

## Evidence

| Измерение | Категория | Наблюдаемый факт |
|---|---|---|
| Retrieval | `with-hint` | Точная граница `payment.charge` определена после сужающего вопроса; место создания общего semaphore выбрано самостоятельно. |
| Application | `with-hint` | После подсказок исправлен вес операции и восстановлено confirmed event; `npm run check:5` проходит 15/15. |
| Self-explanation | `with-hint` | Поведение прерванной оплаты и ожидающей fiber определено; автоматическое возвращение permit потребовало объяснения. |

## Следующий review

- Фокус следующего cold retrieval: без подсказок объяснить разницу между общим числом permits и весом одной операции, а также судьбу permit при failure и interruption.
- Применённое правило интервала: retrieval, application и self-explanation потребовали подсказок; используется интервал 3 дня.
- Интервал в днях: 3
- Дата `YYYY-MM-DD`: 2026-07-28

## История review

<!-- Новые delayed review добавляются ниже; прежние evidence не перезаписываются. -->

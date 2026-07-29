---
tags: [learning, study-session]
topic: Effect bounded Queue backpressure
date: 2026-07-25
mode: study
objective: Предсказать и подтвердить состояния трёх submit при заполненной bounded Queue
review_due: 2026-07-28
review_interval_days: 3
---

# Учебная сессия — backpressure bounded Queue

[[00-learning/MOC|← Учебный цикл]]

## Контекст

- Тема или заметка: ручная контрольная точка этапа 5 в `projects/guided/seat-reservation-engine`.
- Режим: `study`
- Дата: 2026-07-25
- Одна наблюдаемая цель: предсказать и экспериментально подтвердить состояния `submit(A)`, `submit(B)` и `submit(C)` при `workerCount = 1`, `queueCapacity = 1` и заблокированной оплате.

## Cold retrieval

- Prompt: определить, где окажутся A, B и C после блокировки единственного worker на оплате A.
- Ответ учащегося или ссылка на артефакт: после поэтапных вопросов определил, что A находится у worker, request B занимает queue, `submit(B)` ждёт `Deferred`, а `submit(C)` приостановлен на `Queue.offer`.
- Использованная помощь: `hint`
- Наблюдаемый результат: итоговая трассировка producer/consumer boundary выполнена корректно после разбиения сценария на отдельные requests.

## Выявленный пробел и чтение

- Конкретный пробел, показанный попыткой: различие между местом request и точкой приостановки соответствующей submit fiber; способ управляемо заблокировать и затем продолжить `PaymentGateway.charge`.
- Прочитанный фрагмент или ссылка: ручная контрольная точка этапа 5 в `GUIDE.md`; механизм `Deferred<void>` как управляемого gate.
- Что учащийся воспроизвёл после закрытия материала: request B находится в queue, хотя его submit fiber уже ждёт reply; request C ещё не принят queue и остаётся внутри `Queue.offer`.

## Практика

- Задача: предоставить временный `PaymentGateway`, который сигнализирует о входе в `charge` и ожидает отдельный release gate, затем наблюдать `Queue.offer` для B и C.
- Артефакт или описание попытки:
- Результат узкой проверки: эксперимент не выполнен; наблюдаемого application evidence нет.

## Feedback и повторная попытка

- Что уже работает: словесная трассировка A, B и C соответствует bounded queue capacity и состоянию единственного worker.
- Минимальная подсказка: разделить request location и submit-fiber suspension point; использовать два `Deferred<void>` — сигнал входа в payment и управляемое освобождение.
- Что изменилось после подсказки: учащийся правильно определил все три состояния; временный сценарий не запускался.

## Self-explanation

- Вопрос о механизме, правиле или инварианте: объяснить, где возникает backpressure при занятом worker и заполненной queue.
- Объяснение учащегося: A находится внутри worker; B после успешного offer ждёт `Deferred`; C останавливается на `Queue.offer`.
- Названная граница или failure mode: capacity учитывает ожидающие элементы queue, но не request, уже извлечённый worker-ом.

## Evidence

| Измерение | Категория | Наблюдаемый факт |
|---|---|---|
| Retrieval | `with-hint` | Состояния A, B и C определены после последовательных диагностических вопросов. |
| Application | `not-observed` | Управляемый PaymentGateway и временная диагностика не запускались. |
| Self-explanation | `with-hint` | Различие между request в queue и fiber на `Deferred.await` воспроизведено после уточнения. |

## Следующий review

- Фокус следующего cold retrieval: без подсказок проследить A, B и C при `workerCount = 1`, `queueCapacity = 1`, затем подтвердить блокировку C управляемым payment gate.
- Применённое правило интервала: retrieval потребовал подсказок, application не наблюдался; используется интервал 3 дня.
- Интервал в днях: 3
- Дата `YYYY-MM-DD`: 2026-07-28

## История review

<!-- Новые delayed review добавляются ниже; прежние evidence не перезаписываются. -->

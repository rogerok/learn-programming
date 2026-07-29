Начни с support-ticket-workflow

Это самый безопасный вход в Effect v4 среди имеющихся проектов:

- нет frontend;
- нет HTTP, БД, Stream, retry, Queue, STM и ручной работы с fibers;
- starter уже работает — сначала можно проследить готовый путь, а не писать с нуля;
- изучаются основные вещи: Effect<A, E, R>, Effect.gen, typed errors, Schema, services и Layer;
- каждый этап ограничен конкретным файлом;
- есть отдельные накопительные проверки.

Я проверил исходное состояние:

 ```text
   pnpm test     → 2 tests passed
   pnpm run smoke → OpenTicket принят, итоговое состояние Open
 ```

Frontend здесь вообще не нужен. Проблема не в том, что ты «глупый»: Effect действительно непривычен, потому что код
часто описывает вычисление, а не исполняет его немедленно. Плюс одновременно приходится различать success A, ожидаемую
ошибку E и зависимости R.

Пока не начинай

- notification-batch-dispatcher — добавляет Stream, batching, concurrency и retry.
- order-catalog-enricher — ещё сложнее: lazy pagination и RequestResolver.
- expense-approval-api — добавляет HTTP wiring.
- seat-reservation-engine, parcel-status-radar, expense-claim-decider — используют Effect 3.22.0. При изучении Effect v4
  смешивание версий создаст лишнюю путаницу в API.
- async-task-scheduler — не Effect. Полезен только если пока неясны сами Promise, порядок завершения и ограниченная
  конкурентность.

Рекомендуемый порядок

1. support-ticket-workflow
2. expense-approval-api
3. notification-batch-dispatcher
4. order-catalog-enricher

С чего начать

Начни с async-task-scheduler. Это лучший нулевой этап перед Effect:

- обычные Promise, без Effect;
- изменяется один файл — src/scheduler.ts;
- четыре последовательных этапа: порядок результатов → состояние → ошибки → ограниченная параллельность;
- можно сначала понять саму асинхронную модель, не борясь одновременно с Effect<A, E, R>, Layer и Stream.

После него переходи к seat-reservation-engine, но только к этапам 1–3:

1. Schema и декодирование unknown;
2. typed errors и канал E;
3. services, R и Layer.

Этот проект прямо рассчитан на недавно начавшего работать с Effect: профиль supported, точные edit surfaces и отдельная
проверка каждого этапа. Первый этап затрагивает только верхнюю часть src/domain.ts и запускается через:

 ```bash
   npm run check:1
 ```

Не воспринимай весь seat-reservation-engine как одну задачу. Этапы 4–6 (Scope, coordination, STM) — уже следующий
уровень.

Что пока не брать

- notification-batch-dispatcher — уже требует уверенного понимания Effect.gen, errors, services и Layer, после чего
  добавляет Stream и retry.
- order-catalog-enricher — Stream, concurrency и RequestResolver.
- parcel-status-radar — сразу Stream, batching, retry, timeout и CLI.
- expense-approval-api — Effect HTTP API плюс полный vertical slice.
- expense-claim-decider и support-ticket-workflow — Effect смешан с Decider/event sourcing, поэтому трудно понять, что
  именно вызывает затруднение.

Про frontend

Frontend здесь практически ни при чём: среди guided нет зависимостей React, Vue, Svelte или Angular. Это
backend/domain/CLI-проекты. Неумение писать UI не является препятствием.

Рекомендуемый маршрут:

 ```text
   async-task-scheduler
   → seat-reservation-engine: этапы 1–3
   → notification-batch-dispatcher
   → order-catalog-enricher
   → parcel-status-radar
 ```

Первое конкретное действие: открой async-task-scheduler/GUIDE.md, прочитай только разделы до «Этап 1. Порядок
результатов» и работай исключительно над первым этапом.
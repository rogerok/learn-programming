import { Deferred, Effect, Queue, Scope } from "effect";

export interface WorkItem {
  readonly input: number;
  readonly reply: Deferred.Deferred<number>;
}

/** Упражнение 1: producer создаёт личный reply channel и ожидает результат. */
export const submitWork = (_queue: Queue.Queue<WorkItem>, _input: number): Effect.Effect<number> =>
  Effect.die(new Error("Реализуйте submitWork"));

/** Упражнение 1: consumer обрабатывает ровно один элемент очереди. */
export const processOne = (
  _queue: Queue.Queue<WorkItem>,
  _transform: (input: number) => number,
): Effect.Effect<void> => Effect.die(new Error("Реализуйте processOne"));

/** Упражнение 2: запускает count копий worker в текущем Scope и возвращает управление. */
export const startWorkers = (
  _count: number,
  _worker: Effect.Effect<never>,
): Effect.Effect<void, never, Scope.Scope> => Effect.die(new Error("Реализуйте startWorkers"));

/** Упражнение 3: выполняет operation для всех inputs с общим лимитом concurrency. */
export const runLimited = (
  _inputs: ReadonlyArray<number>,
  _concurrency: number,
  _operation: (input: number) => Effect.Effect<void>,
): Effect.Effect<void> => Effect.die(new Error("Реализуйте runLimited"));

export interface StringBroadcaster {
  readonly publish: (message: string) => Effect.Effect<void>;
  readonly subscribe: (callback: (message: string) => Effect.Effect<void>) => Effect.Effect<void>;
}

/** Упражнение 4: создаёт scoped broadcast boundary для строковых сообщений. */
export const makeBroadcaster = (
  _capacity: number,
): Effect.Effect<StringBroadcaster, never, Scope.Scope> =>
  Effect.die(new Error("Реализуйте makeBroadcaster"));

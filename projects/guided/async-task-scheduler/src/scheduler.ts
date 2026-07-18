export type TaskState = "queued" | "running" | "fulfilled" | "rejected";

export type TaskOutcome<T = unknown> =
  | { id: string; status: "fulfilled"; value: T }
  | { id: string; status: "rejected"; reason: unknown };

export interface TaskSnapshot {
  id: string;
  state: TaskState;
}

export type Task<T = unknown> = () => T | Promise<T>;

interface TaskRecord {
  id: string;
  execute: Task;
  state: TaskState;
}

/**
 * Начальная версия уже хранит очередь и запускает добавленные задачи.
 * Дальнейшие свойства планировщика ученик добавляет по этапам из GUIDE.md.
 */
export class TaskScheduler {
  private readonly records: TaskRecord[] = [];

  constructor(options: { concurrency: number }) {
    void options;
  }

  add<T>(id: string, task: Task<T>): void {
    this.records.push({ id, execute: task, state: "queued" });
  }

  snapshot(): TaskSnapshot[] {
    return this.records.map(({ id, state }) => ({ id, state }));
  }

  async run(): Promise<TaskOutcome[]> {
    const initialBatch = [...this.records];
    const outcomes: TaskOutcome[] = [];

    await Promise.all(
      initialBatch.map(async ({ id, execute }) => {
        const value = await execute();
        outcomes.push({ id, status: "fulfilled", value });
      }),
    );

    return outcomes;
  }
}

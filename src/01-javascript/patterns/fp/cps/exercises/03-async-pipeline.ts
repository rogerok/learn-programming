/**
 * Упражнение 3: Async CPS Pipeline
 * ====================================
 *
 * Цель: понять связь между CPS и асинхронным кодом через построение
 * конвейера обработки данных в трёх стилях.
 *
 * Сценарий:
 * Нужно построить pipeline обработки данных пользователя:
 * 1. fetchUser(id) -- "загружает" данные пользователя
 * 2. validateUser(user) -- проверяет, что данные корректны
 * 3. formatUser(user) -- форматирует данные для отображения
 *
 * Задания:
 *
 * 3a) Реализовать pipeline в чистом CPS-стиле (callbacks)
 * 3b) Реализовать универсальную функцию pipe для CPS-функций
 * 3c) Реализовать обработку ошибок в CPS-стиле (error continuation)
 *
 * Запуск тестов: npx tsx src/01-javascript/patterns/fp/cps/exercises/03-async-pipeline.ts
 */

import { strict as assert } from "node:assert";

// ============================================================
// Типы
// ============================================================

/** Continuation для результата */
type Cont<T> = (result: T) => void;

/** Continuation с обработкой ошибок (Node.js стиль) */
type ErrCont<T> = (error: Error | null, result: T) => void;

/** CPS-функция: принимает вход и continuation */
type CPSFn<A, B> = (input: A, k: Cont<B>) => void;

/** CPS-функция с обработкой ошибок */
type CPSFnWithErr<A, B> = (input: A, k: ErrCont<B>) => void;

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface ValidatedUser extends User {
  isValid: true;
}

interface FormattedUser {
  displayName: string;
  contactEmail: string;
  ageGroup: string;
}

// ============================================================
// Вспомогательные данные (имитация базы данных)
// ============================================================

const usersDB: Record<number, User> = {
  1: { id: 1, name: "Alice", email: "alice@example.com", age: 30 },
  2: { id: 2, name: "Bob", email: "bob@example.com", age: 17 },
  3: { id: 3, name: "", email: "noname@example.com", age: 25 },
  4: { id: 4, name: "Diana", email: "", age: 22 },
};

// ============================================================
// 3a) CPS Pipeline -- реализуй три функции в CPS-стиле
// ============================================================

/**
 * Загружает пользователя по id.
 * Если пользователь найден -- передаёт его в k.
 * Имитирует асинхронную операцию через setTimeout.
 */
function fetchUserCPS(id: number, k: Cont<User | null>): void {
  // Имитация задержки -- эту часть НЕ нужно менять
  setTimeout(() => {
    const user = usersDB[id] ?? null;
    k(user);
  }, 10);
}

/**
 * Проверяет пользователя: имя не пустое, email не пустой, возраст >= 18.
 * Если валиден -- передаёт ValidatedUser в k.
 * Если невалиден -- передаёт null в k.
 */
function validateUserCPS(
  user: User,
  k: Cont<ValidatedUser | null>
): void {
  // TODO: реализуй валидацию в CPS-стиле
  // Правила: name не пустая строка, email не пустая строка, age >= 18
  // Если всё ок: k({ ...user, isValid: true })
  // Если нет: k(null)
  throw new Error("Not implemented");
}

/**
 * Форматирует данные пользователя для отображения.
 */
function formatUserCPS(
  user: ValidatedUser,
  k: Cont<FormattedUser>
): void {
  // TODO: реализуй форматирование в CPS-стиле
  // displayName: "User: <name>"
  // contactEmail: "<email>"
  // ageGroup: age < 25 ? "young" : age < 50 ? "adult" : "senior"
  throw new Error("Not implemented");
}

/**
 * Собери полный pipeline: fetchUser -> validateUser -> formatUser.
 * Каждый шаг вызывается внутри continuation предыдущего.
 *
 * Если пользователь не найден или невалиден -- передай null в k.
 */
function processUserCPS(
  id: number,
  k: Cont<FormattedUser | null>
): void {
  // TODO: реализуй цепочку CPS-вызовов
  // fetchUserCPS -> если найден -> validateUserCPS -> если валиден -> formatUserCPS
  throw new Error("Not implemented");
}

// ============================================================
// 3b) Универсальная функция pipeCPS
// ============================================================

/**
 * Реализуй функцию pipeCPS, которая принимает массив CPS-функций
 * и возвращает новую CPS-функцию -- их последовательную композицию.
 *
 * pipeCPS([f, g, h]) эквивалентно:
 *   (input, k) => f(input, (r1) => g(r1, (r2) => h(r2, k)))
 *
 * Каждая CPS-функция в массиве имеет тип CPSFn<any, any>.
 * Типизация здесь упрощена -- в реальности это потребовало бы
 * вариативных типов.
 */
function pipeCPS(fns: CPSFn<any, any>[]): CPSFn<any, any> {
  // TODO: реализуй последовательную композицию CPS-функций
  throw new Error("Not implemented");
}

// ============================================================
// 3c) CPS с обработкой ошибок (error continuation)
// ============================================================

/**
 * Реализуй те же три функции, но с обработкой ошибок через
 * Node.js-style callback: (error, result) => void
 *
 * Если операция не удалась -- вызови k(new Error("описание"), null)
 * Если удалась -- вызови k(null, result)
 */

function fetchUserWithErr(id: number, k: ErrCont<User>): void {
  setTimeout(() => {
    const user = usersDB[id];
    if (!user) {
      k(new Error(`User with id ${id} not found`), null as any);
    } else {
      k(null, user);
    }
  }, 10);
}

function validateUserWithErr(
  user: User,
  k: ErrCont<ValidatedUser>
): void {
  // TODO: реализуй валидацию с error continuation
  // При невалидных данных: k(new Error("описание проблемы"), null as any)
  // При валидных: k(null, { ...user, isValid: true })
  throw new Error("Not implemented");
}

function formatUserWithErr(
  user: ValidatedUser,
  k: ErrCont<FormattedUser>
): void {
  // TODO: реализуй форматирование с error continuation
  // Ошибок здесь быть не должно -- просто оберни результат
  throw new Error("Not implemented");
}

/**
 * Собери полный pipeline с обработкой ошибок.
 * Если на любом шаге произошла ошибка -- сразу передай её в финальный k,
 * не продолжая цепочку.
 */
function processUserWithErr(
  id: number,
  k: ErrCont<FormattedUser>
): void {
  // TODO: реализуй цепочку с ранним выходом при ошибке
  throw new Error("Not implemented");
}

// ============================================================
// Тесты
// ============================================================

async function runTests(): Promise<void> {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.log(`  [FAIL] ${name}: ${(e as Error).message}`);
      failed++;
    }
  }

  // Вспомогательная функция -- оборачивает CPS в Promise для тестирования
  function toPromise<T>(cpsFn: (k: Cont<T>) => void): Promise<T> {
    return new Promise<T>((resolve) => cpsFn(resolve));
  }

  function toPromiseErr<T>(
    cpsFn: (k: ErrCont<T>) => void
  ): Promise<T> {
    return new Promise<T>((resolve, reject) =>
      cpsFn((err, result) => (err ? reject(err) : resolve(result)))
    );
  }

  console.log("=== 3a) CPS Pipeline ===\n");

  await test("validateUserCPS: валидный пользователь", async () => {
    const user: User = { id: 1, name: "Alice", email: "a@b.com", age: 25 };
    const result = await toPromise<ValidatedUser | null>((k) =>
      validateUserCPS(user, k)
    );
    assert.notEqual(result, null);
    assert.equal(result!.isValid, true);
    assert.equal(result!.name, "Alice");
  });

  await test("validateUserCPS: слишком молодой", async () => {
    const user: User = { id: 2, name: "Bob", email: "b@c.com", age: 17 };
    const result = await toPromise<ValidatedUser | null>((k) =>
      validateUserCPS(user, k)
    );
    assert.equal(result, null);
  });

  await test("validateUserCPS: пустое имя", async () => {
    const user: User = { id: 3, name: "", email: "c@d.com", age: 25 };
    const result = await toPromise<ValidatedUser | null>((k) =>
      validateUserCPS(user, k)
    );
    assert.equal(result, null);
  });

  await test("validateUserCPS: пустой email", async () => {
    const user: User = { id: 4, name: "X", email: "", age: 25 };
    const result = await toPromise<ValidatedUser | null>((k) =>
      validateUserCPS(user, k)
    );
    assert.equal(result, null);
  });

  await test("formatUserCPS: корректное форматирование", async () => {
    const user: ValidatedUser = {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      age: 30,
      isValid: true,
    };
    const result = await toPromise<FormattedUser>((k) =>
      formatUserCPS(user, k)
    );
    assert.equal(result.displayName, "User: Alice");
    assert.equal(result.contactEmail, "alice@example.com");
    assert.equal(result.ageGroup, "adult");
  });

  await test("formatUserCPS: young age group", async () => {
    const user: ValidatedUser = {
      id: 1,
      name: "Eve",
      email: "eve@example.com",
      age: 22,
      isValid: true,
    };
    const result = await toPromise<FormattedUser>((k) =>
      formatUserCPS(user, k)
    );
    assert.equal(result.ageGroup, "young");
  });

  await test("processUserCPS: полный pipeline для валидного пользователя", async () => {
    const result = await toPromise<FormattedUser | null>((k) =>
      processUserCPS(1, k)
    );
    assert.notEqual(result, null);
    assert.equal(result!.displayName, "User: Alice");
    assert.equal(result!.contactEmail, "alice@example.com");
    assert.equal(result!.ageGroup, "adult");
  });

  await test("processUserCPS: несуществующий пользователь", async () => {
    const result = await toPromise<FormattedUser | null>((k) =>
      processUserCPS(999, k)
    );
    assert.equal(result, null);
  });

  await test("processUserCPS: невалидный пользователь (age < 18)", async () => {
    const result = await toPromise<FormattedUser | null>((k) =>
      processUserCPS(2, k)
    );
    assert.equal(result, null);
  });

  console.log("\n=== 3b) pipeCPS ===\n");

  await test("pipeCPS: пустой pipeline", async () => {
    const identity = pipeCPS([]);
    const result = await toPromise<number>((k) => identity(42, k));
    assert.equal(result, 42);
  });

  await test("pipeCPS: один элемент", async () => {
    const double: CPSFn<number, number> = (x, k) => k(x * 2);
    const pipeline = pipeCPS([double]);
    const result = await toPromise<number>((k) => pipeline(5, k));
    assert.equal(result, 10);
  });

  await test("pipeCPS: несколько элементов", async () => {
    const double: CPSFn<number, number> = (x, k) => k(x * 2);
    const addTen: CPSFn<number, number> = (x, k) => k(x + 10);
    const toString: CPSFn<number, string> = (x, k) => k(`Result: ${x}`);

    const pipeline = pipeCPS([double, addTen, toString]);
    const result = await toPromise<string>((k) => pipeline(5, k));
    // 5 * 2 = 10, 10 + 10 = 20, "Result: 20"
    assert.equal(result, "Result: 20");
  });

  await test("pipeCPS: порядок выполнения слева направо", async () => {
    const log: string[] = [];
    const step1: CPSFn<number, number> = (x, k) => {
      log.push("step1");
      k(x + 1);
    };
    const step2: CPSFn<number, number> = (x, k) => {
      log.push("step2");
      k(x * 2);
    };
    const step3: CPSFn<number, number> = (x, k) => {
      log.push("step3");
      k(x - 3);
    };

    const pipeline = pipeCPS([step1, step2, step3]);
    const result = await toPromise<number>((k) => pipeline(10, k));
    // (10 + 1) * 2 - 3 = 19
    assert.equal(result, 19);
    assert.deepEqual(log, ["step1", "step2", "step3"]);
  });

  console.log("\n=== 3c) CPS с обработкой ошибок ===\n");

  await test("validateUserWithErr: валидный пользователь", async () => {
    const user: User = { id: 1, name: "Alice", email: "a@b.com", age: 25 };
    const result = await toPromiseErr<ValidatedUser>((k) =>
      validateUserWithErr(user, k)
    );
    assert.equal(result.isValid, true);
  });

  await test("validateUserWithErr: невалидный -- ошибка", async () => {
    const user: User = { id: 2, name: "Bob", email: "b@c.com", age: 17 };
    await assert.rejects(
      () =>
        toPromiseErr<ValidatedUser>((k) => validateUserWithErr(user, k)),
      { message: /age|young|18/ }
    );
  });

  await test("processUserWithErr: успешный pipeline", async () => {
    const result = await toPromiseErr<FormattedUser>((k) =>
      processUserWithErr(1, k)
    );
    assert.equal(result.displayName, "User: Alice");
  });

  await test("processUserWithErr: ошибка на этапе fetch", async () => {
    await assert.rejects(
      () =>
        toPromiseErr<FormattedUser>((k) => processUserWithErr(999, k)),
      { message: /not found/ }
    );
  });

  await test("processUserWithErr: ошибка на этапе validate", async () => {
    await assert.rejects(
      () =>
        toPromiseErr<FormattedUser>((k) => processUserWithErr(2, k)),
      (err: Error) => {
        assert.ok(err instanceof Error);
        return true;
      }
    );
  });

  await test("processUserWithErr: ошибка не продолжает цепочку", async () => {
    let formatCalled = false;
    const originalFormat = formatUserWithErr;

    // Проверяем, что при ошибке валидации format не вызывается
    // Это косвенно проверяется тем, что мы получаем ошибку, а не результат
    await assert.rejects(
      () =>
        toPromiseErr<FormattedUser>((k) => processUserWithErr(3, k)),
      (err: Error) => {
        assert.ok(err instanceof Error);
        return true;
      }
    );
  });

  // Итоги
  console.log(`\n=============================`);
  console.log(`Результат: ${passed} passed, ${failed} failed`);
  console.log(`=============================\n`);
}

runTests();

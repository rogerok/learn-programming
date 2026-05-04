/**
 * Упражнение 2: Trampoline с нуля
 * ==================================
 *
 * Цель: понять, как trampolining эмулирует tail call optimization (TCO)
 * через цикл, и применить его к рекурсивным алгоритмам.
 *
 * Концепция:
 * - Thunk -- функция без аргументов, представляющая отложенное вычисление
 * - Trampoline -- цикл, который выполняет thunk-и один за другим,
 *   пока не получит финальное значение
 * - Вместо рекурсивного вызова функция возвращает thunk ("инструкцию"),
 *   и trampoline выполняет его на следующей итерации цикла
 *
 * Задания:
 *
 * 2a) Реализовать тип Thunk и функцию trampoline
 * 2b) Реализовать factorial с использованием trampoline (с аккумулятором)
 * 2c) Реализовать fibonacci с trampoline (итеративный подход с аккумуляторами)
 * 2d) Реализовать sumRange -- сумма чисел от 1 до n с trampoline
 *
 * Запуск тестов: npx tsx src/01-javascript/patterns/fp/cps/exercises/02-trampoline.ts
 */

import { strict as assert } from "node:assert";

// ============================================================
// 2a) Тип Thunk и функция trampoline
// ============================================================

/**
 * Thunk<T> -- тип, описывающий либо финальное значение T,
 * либо функцию без аргументов, возвращающую следующий шаг.
 *
 * Проблема: typeof result === "function" не работает
 * для значений-функций. Поэтому используем tagged union.
 */

// Вариант с tagged union (надёжный -- работает для любых типов T):
type Bounce<T> = { done: false; thunk: () => Trampoline<T> };
type Done<T> = { done: true; value: T };
type Trampoline<T> = Bounce<T> | Done<T>;

// Вспомогательные конструкторы:
function done<T>(value: T): Done<T> {
  return { done: true, value };
}

function bounce<T>(thunk: () => Trampoline<T>): Bounce<T> {
  return { done: false, thunk };
}

/**
 * Реализуй функцию trampoline.
 * Она принимает Trampoline<T> и выполняет thunk-и в цикле,
 * пока не получит Done<T>, из которого извлекает значение.
 */
function trampoline<T>(computation: Trampoline<T>): T {
  // TODO: реализуй цикл, который выполняет thunk-и
  // до получения финального значения
  throw new Error("Not implemented");
}

// ============================================================
// 2b) Factorial с trampoline
// ============================================================

/**
 * Реализуй factorialT с аккумулятором.
 * Функция должна возвращать Trampoline<number>, а не вызывать себя напрямую.
 *
 * В базовом случае: done(acc)
 * В рекурсивном: bounce(() => factorialT(n - 1, n * acc))
 */
function factorialT(n: number, acc: number = 1): Trampoline<number> {
  // TODO: реализуй factorial с trampoline
  throw new Error("Not implemented");
}

// ============================================================
// 2c) Fibonacci с trampoline
// ============================================================

/**
 * Реализуй fibonacciT с двумя аккумуляторами (a и b).
 * Итеративная идея: fib(n) вычисляется за n шагов,
 * на каждом шаге a = b, b = a + b.
 *
 * fibonacciT(n, a=0, b=1):
 *   если n === 0: done(a)
 *   иначе: bounce(() => fibonacciT(n - 1, b, a + b))
 */
function fibonacciT(
  n: number,
  a: number = 0,
  b: number = 1
): Trampoline<number> {
  // TODO: реализуй fibonacci с trampoline
  throw new Error("Not implemented");
}

// ============================================================
// 2d) Sum Range с trampoline
// ============================================================

/**
 * Реализуй sumRangeT -- сумму всех целых чисел от 1 до n включительно.
 * Использует аккумулятор.
 *
 * sumRangeT(n, acc=0):
 *   если n === 0: done(acc)
 *   иначе: bounce(() => sumRangeT(n - 1, acc + n))
 */
function sumRangeT(n: number, acc: number = 0): Trampoline<number> {
  // TODO: реализуй sum range с trampoline
  throw new Error("Not implemented");
}

// ============================================================
// Тесты
// ============================================================

function runTests(): void {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void): void {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.log(`  [FAIL] ${name}: ${(e as Error).message}`);
      failed++;
    }
  }

  console.log("=== 2a) Trampoline ===\n");

  test("trampoline(done(42)) = 42", () => {
    assert.equal(trampoline(done(42)), 42);
  });

  test("trampoline(done('hello')) = 'hello'", () => {
    assert.equal(trampoline(done("hello")), "hello");
  });

  test("trampoline с одним bounce", () => {
    const computation = bounce(() => done(100));
    assert.equal(trampoline(computation), 100);
  });

  test("trampoline с тремя bounce", () => {
    const computation = bounce(() => bounce(() => bounce(() => done(999))));
    assert.equal(trampoline(computation), 999);
  });

  console.log("\n=== 2b) Factorial с trampoline ===\n");

  test("factorial(0) = 1", () => {
    assert.equal(trampoline(factorialT(0)), 1);
  });

  test("factorial(1) = 1", () => {
    assert.equal(trampoline(factorialT(1)), 1);
  });

  test("factorial(5) = 120", () => {
    assert.equal(trampoline(factorialT(5)), 120);
  });

  test("factorial(10) = 3628800", () => {
    assert.equal(trampoline(factorialT(10)), 3628800);
  });

  test("factorial(20) = 2432902008176640000", () => {
    assert.equal(trampoline(factorialT(20)), 2432902008176640000);
  });

  test("factorial(100_000) не вызывает stack overflow", () => {
    // Результат будет Infinity из-за числового переполнения,
    // но стек не должен переполниться
    const result = trampoline(factorialT(100_000));
    assert.equal(typeof result, "number");
    assert.equal(result, Infinity); // числовое переполнение, но не ошибка стека
  });

  console.log("\n=== 2c) Fibonacci с trampoline ===\n");

  test("fibonacci(0) = 0", () => {
    assert.equal(trampoline(fibonacciT(0)), 0);
  });

  test("fibonacci(1) = 1", () => {
    assert.equal(trampoline(fibonacciT(1)), 1);
  });

  test("fibonacci(6) = 8", () => {
    assert.equal(trampoline(fibonacciT(6)), 8);
  });

  test("fibonacci(10) = 55", () => {
    assert.equal(trampoline(fibonacciT(10)), 55);
  });

  test("fibonacci(30) = 832040", () => {
    assert.equal(trampoline(fibonacciT(30)), 832040);
  });

  test("fibonacci(100_000) не вызывает stack overflow", () => {
    const result = trampoline(fibonacciT(100_000));
    assert.equal(typeof result, "number");
    // Результат -- Infinity, но стек цел
  });

  console.log("\n=== 2d) Sum Range с trampoline ===\n");

  test("sumRange(0) = 0", () => {
    assert.equal(trampoline(sumRangeT(0)), 0);
  });

  test("sumRange(1) = 1", () => {
    assert.equal(trampoline(sumRangeT(1)), 1);
  });

  test("sumRange(10) = 55", () => {
    assert.equal(trampoline(sumRangeT(10)), 55);
  });

  test("sumRange(100) = 5050", () => {
    assert.equal(trampoline(sumRangeT(100)), 5050);
  });

  test("sumRange(100_000) не вызывает stack overflow", () => {
    const result = trampoline(sumRangeT(100_000));
    assert.equal(result, 5000050000);
  });

  // Итоги
  console.log(`\n=============================`);
  console.log(`Результат: ${passed} passed, ${failed} failed`);
  console.log(`=============================\n`);
}

runTests();

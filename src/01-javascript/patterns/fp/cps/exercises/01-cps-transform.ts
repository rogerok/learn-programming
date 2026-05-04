/**
 * Упражнение 1: CPS-трансформация вручную
 * =========================================
 *
 * Цель: научиться механически переводить функции из direct style в CPS.
 *
 * Правила CPS-трансформации:
 * 1. Функция получает дополнительный параметр k (continuation)
 * 2. Возвращаемый тип становится void
 * 3. Вместо return value пишем k(value)
 * 4. Использование результата рекурсивного вызова оборачивается в новый continuation
 *
 * Задания:
 *
 * 1a) Трансформировать fibonacci из direct style в CPS
 * 1b) Трансформировать функцию map для массива из direct style в CPS
 * 1c) Трансформировать функцию глубины бинарного дерева из direct style в CPS
 *
 * Запуск тестов: npx tsx src/01-javascript/patterns/fp/cps/exercises/01-cps-transform.ts
 */

import { strict as assert } from "node:assert";

// ============================================================
// Типы
// ============================================================

type Continuation<T> = (result: T) => void;

interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
}

// ============================================================
// Вспомогательная функция для создания узлов дерева
// ============================================================

function node<T>(
  value: T,
  left: TreeNode<T> | null = null,
  right: TreeNode<T> | null = null
): TreeNode<T> {
  return { value, left, right };
}

// ============================================================
// 1a) Fibonacci
// ============================================================

// Direct style (для справки):
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// CPS версия -- реализуй эту функцию:
function fibonacciCPS(n: number, k: Continuation<number>): void {
  // TODO: реализуй CPS-версию fibonacci
  // Подсказка: fibonacci имеет ДВА рекурсивных вызова.
  // Нужно вложить один continuation в другой.
  throw new Error("Not implemented");
}

// ============================================================
// 1b) Map для массива
// ============================================================

// Direct style (для справки):
function map<T, U>(arr: T[], fn: (x: T) => U): U[] {
  if (arr.length === 0) return [];
  const [head, ...tail] = arr;
  return [fn(head), ...map(tail, fn)];
}

// CPS версия -- реализуй эту функцию:
function mapCPS<T, U>(
  arr: T[],
  fn: (x: T, k: Continuation<U>) => void,
  k: Continuation<U[]>
): void {
  // TODO: реализуй CPS-версию map
  // Обрати внимание: fn тоже принимает continuation (она тоже в CPS).
  // Базовый случай: пустой массив -> k([])
  // Рекурсивный: применить fn к head, затем mapCPS к tail, собрать результат.
  throw new Error("Not implemented");
}

// ============================================================
// 1c) Глубина бинарного дерева
// ============================================================

// Direct style (для справки):
function treeDepth<T>(tree: TreeNode<T> | null): number {
  if (tree === null) return 0;
  return 1 + Math.max(treeDepth(tree.left), treeDepth(tree.right));
}

// CPS версия -- реализуй эту функцию:
function treeDepthCPS<T>(
  tree: TreeNode<T> | null,
  k: Continuation<number>
): void {
  // TODO: реализуй CPS-версию treeDepth
  // Подсказка: как и fibonacci, здесь два рекурсивных вызова (left и right).
  // Каждый нужно обернуть в continuation.
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

  console.log("=== 1a) Fibonacci CPS ===\n");

  test("fibonacciCPS(0) = 0", () => {
    let result: number | undefined;
    fibonacciCPS(0, (r) => {
      result = r;
    });
    assert.equal(result, 0);
  });

  test("fibonacciCPS(1) = 1", () => {
    let result: number | undefined;
    fibonacciCPS(1, (r) => {
      result = r;
    });
    assert.equal(result, 1);
  });

  test("fibonacciCPS(6) = 8", () => {
    let result: number | undefined;
    fibonacciCPS(6, (r) => {
      result = r;
    });
    assert.equal(result, 8);
  });

  test("fibonacciCPS(10) = 55", () => {
    let result: number | undefined;
    fibonacciCPS(10, (r) => {
      result = r;
    });
    assert.equal(result, 55);
  });

  test("fibonacciCPS совпадает с direct style для n=0..12", () => {
    for (let i = 0; i <= 12; i++) {
      let cpsResult: number | undefined;
      fibonacciCPS(i, (r) => {
        cpsResult = r;
      });
      assert.equal(cpsResult, fibonacci(i), `Mismatch at n=${i}`);
    }
  });

  console.log("\n=== 1b) Map CPS ===\n");

  // Вспомогательная CPS-функция для трансформации
  const doubleCPS = (x: number, k: Continuation<number>): void => k(x * 2);
  const toStringCPS = (x: number, k: Continuation<string>): void =>
    k(String(x));

  test("mapCPS([]) = []", () => {
    let result: number[] | undefined;
    mapCPS([], doubleCPS, (r) => {
      result = r;
    });
    assert.deepEqual(result, []);
  });

  test("mapCPS([1, 2, 3], double) = [2, 4, 6]", () => {
    let result: number[] | undefined;
    mapCPS([1, 2, 3], doubleCPS, (r) => {
      result = r;
    });
    assert.deepEqual(result, [2, 4, 6]);
  });

  test("mapCPS([10, 20], toString) = ['10', '20']", () => {
    let result: string[] | undefined;
    mapCPS([10, 20], toStringCPS, (r) => {
      result = r;
    });
    assert.deepEqual(result, ["10", "20"]);
  });

  test("mapCPS сохраняет порядок элементов", () => {
    let result: number[] | undefined;
    mapCPS([5, 3, 1, 4, 2], doubleCPS, (r) => {
      result = r;
    });
    assert.deepEqual(result, [10, 6, 2, 8, 4]);
  });

  console.log("\n=== 1c) Tree Depth CPS ===\n");

  test("treeDepthCPS(null) = 0", () => {
    let result: number | undefined;
    treeDepthCPS(null, (r) => {
      result = r;
    });
    assert.equal(result, 0);
  });

  test("treeDepthCPS(leaf) = 1", () => {
    let result: number | undefined;
    treeDepthCPS(node(1), (r) => {
      result = r;
    });
    assert.equal(result, 1);
  });

  test("treeDepthCPS сбалансированное дерево глубины 3", () => {
    //       1
    //      / \
    //     2   3
    //    / \
    //   4   5
    const tree = node(1, node(2, node(4), node(5)), node(3));

    let result: number | undefined;
    treeDepthCPS(tree, (r) => {
      result = r;
    });
    assert.equal(result, 3);
  });

  test("treeDepthCPS правое поддерево глубже", () => {
    //   1
    //    \
    //     2
    //      \
    //       3
    //        \
    //         4
    const tree = node(1, null, node(2, null, node(3, null, node(4))));

    let result: number | undefined;
    treeDepthCPS(tree, (r) => {
      result = r;
    });
    assert.equal(result, 4);
  });

  test("treeDepthCPS совпадает с direct style", () => {
    const tree = node(
      1,
      node(2, node(4, node(7), null), node(5)),
      node(3, null, node(6))
    );

    let cpsResult: number | undefined;
    treeDepthCPS(tree, (r) => {
      cpsResult = r;
    });
    assert.equal(cpsResult, treeDepth(tree));
  });

  // Итоги
  console.log(`\n=============================`);
  console.log(`Результат: ${passed} passed, ${failed} failed`);
  console.log(`=============================\n`);
}

runTests();

---
tags: [javascript, typescript, fp, cps, exercises]
---

# Упражнения: Continuation-Passing Style (CPS)

> [!info] Как работать с упражнениями
> Каждое упражнение — отдельный TypeScript-файл в папке `exercises/`.
> Файлы самодостаточны: содержат описание задачи, заготовки функций (TODO) и тесты.
> Запуск: `npx tsx <путь к файлу>`

---

## 01. CPS-трансформация вручную

**Файл:** `exercises/01-cps-transform.ts`
**Сложность:** beginner → intermediate
**Концепция:** механический перевод функций из direct style в CPS

### Задания

| # | Задача | Особенность |
|---|--------|-------------|
| 1a | `fibonacciCPS` | Два рекурсивных вызова — нужно вложить continuations |
| 1b | `mapCPS` | CPS-функция применяется к каждому элементу массива |
| 1c | `treeDepthCPS` | Два рекурсивных вызова (left/right) + Math.max |

### Подсказки

- **1a:** Сначала вычисли `fib(n-1)` в CPS, затем внутри его continuation вычисли `fib(n-2)`, затем сложи оба результата и передай в `k`.
- **1b:** Базовый случай — пустой массив → `k([])`. Рекурсивный: примени `fn` к `head`, внутри его continuation вызови `mapCPS` для `tail`, затем собери `[headResult, ...tailResult]`.
- **1c:** Аналогично fibonacci: два рекурсивных вызова (left, right), затем `k(1 + Math.max(leftDepth, rightDepth))`.

---

## 02. Trampoline с нуля

**Файл:** `exercises/02-trampoline.ts`
**Сложность:** intermediate
**Концепция:** эмуляция TCO через цикл и thunk-и

### Задания

| # | Задача | Особенность |
|---|--------|-------------|
| 2a | `trampoline` | Цикл, разворачивающий Bounce до Done |
| 2b | `factorialT` | Factorial с аккумулятором, возвращает Trampoline |
| 2c | `fibonacciT` | Fibonacci с двумя аккумуляторами (a, b) |
| 2d | `sumRangeT` | Сумма 1..n с аккумулятором |

### Подсказки

- **2a:** `while (!computation.done) { computation = computation.thunk(); } return computation.value;`
- **2b:** Базовый случай `n <= 1` → `done(acc)`. Рекурсивный: `bounce(() => factorialT(n - 1, n * acc))`.
- **2c:** Два аккумулятора: `a` = текущее значение, `b` = следующее. На каждом шаге сдвигаем: `fibonacciT(n-1, b, a+b)`.
- **2d:** Аналогично factorial: `bounce(() => sumRangeT(n - 1, acc + n))`.

### Проверка

После реализации тесты проверят, что `factorial(100_000)` и `fibonacci(100_000)` не вызывают stack overflow.

---

## 03. Async CPS Pipeline

**Файл:** `exercises/03-async-pipeline.ts`
**Сложность:** intermediate → advanced
**Концепция:** связь CPS с реальным асинхронным кодом, композиция CPS-функций, обработка ошибок

### Задания

| # | Задача | Особенность |
|---|--------|-------------|
| 3a | Pipeline из 3 CPS-функций | Ручная вложенность continuations |
| 3b | `pipeCPS` | Универсальная композиция массива CPS-функций |
| 3c | Error continuation | Node.js-стиль `(err, result)`, ранний выход при ошибке |

### Подсказки

- **3a (validateUserCPS):** Проверь три условия (name, email, age). Если все ок → `k({...user, isValid: true})`, иначе → `k(null)`.
- **3a (processUserCPS):** `fetchUserCPS(id, (user) => { if (!user) k(null); else validateUserCPS(user, (valid) => { ... }) })`.
- **3b:** Используй `reduceRight` или рекурсию. Пустой pipeline = identity: `(input, k) => k(input)`.
- **3c:** На каждом шаге проверяй `err`. Если есть — сразу вызывай финальный `k(err, null)`, не продолжая цепочку.

---

## Порядок выполнения

1. Начни с **01** — это фундамент (CPS-трансформация).
2. Затем **02** — применение CPS для решения реальной проблемы (stack overflow).
3. Закончи **03** — связь с практикой (async, error handling, композиция).

> [!tip] Совет
> Если застрял — перечитай раздел трассировки выполнения в главе (`cps.md`, Stage 3).
> Трассировка для n=3 показывает механику разворачивания continuations.

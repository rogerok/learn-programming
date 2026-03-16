---
tags: [typescript, spread, rest, arrays]
aliases: [Spread оператор]
---

# Spread-оператор и типизация

## Проблема: spread массива в функцию с фиксированными параметрами

```ts
function sum(a: number, b: number): number {
  return a + b;
}

const args = [1, 2];
sum(...args);
// Error: A spread argument must either have a tuple type
// or be passed to a rest parameter.
```

TypeScript выводит `args` как `number[]` — «ноль или более чисел». Он не может гарантировать, что элементов ровно два.

## Решения

### 1. `as const` — превращает в readonly tuple

```ts
const args = [1, 2] as const; // readonly [1, 2]
sum(...args); // OK
```

### 2. Явная аннотация кортежа

```ts
const args: [number, number] = [1, 2];
sum(...args); // OK
```

### 3. Rest-параметр в функции

```ts
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
sum(...[1, 2]); // OK — rest принимает любое количество
```

## Spread для объектов

Spread объектов типизируется как intersection, но с перезаписью одноимённых полей:

```ts
const defaults = { color: 'red', size: 10 };
const custom = { size: 20, weight: 5 };
const merged = { ...defaults, ...custom };
// { color: string; size: number; weight: number }
// size берётся из custom (последний wins)
```

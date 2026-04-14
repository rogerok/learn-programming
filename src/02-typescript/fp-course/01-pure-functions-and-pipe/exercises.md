---
tags: [typescript, functional-programming, exercises, pure-functions, pipe]
---

# Упражнения: Чистые функции, композиция и pipe

## Упражнение 1: Определи чистоту

Для каждой функции определите: чистая или нет? Если нечистая — какое свойство нарушено?

```typescript
// A
const multiply = (a: number, b: number): number => a * b;

// B
let tax = 0.2;
const addTax = (price: number): number => price * (1 + tax);

// C
const shuffle = <A>(arr: A[]): A[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// D
const first = <A>(arr: readonly A[]): A | undefined => arr[0];

// E
const appendToLog = (message: string): string[] => {
  const log: string[] = [];
  log.push(message);
  return log;
};
```

<details>
<summary>Ответы</summary>

- **A** — чистая.
- **B** — нечистая: зависит от внешней переменной `tax` (недетерминированная — результат изменится, если `tax` изменится).
- **C** — нечистая: `Math.random()` делает результат недетерминированным. При этом входной массив не мутируется — но этого недостаточно для чистоты.
- **D** — чистая: всегда возвращает одинаковый результат для одинакового входа, не мутирует массив.
- **E** — чистая (неожиданно!): `log` создаётся внутри функции, `push` мутирует только локальную переменную. Результат детерминирован, побочных эффектов нет.

</details>

---

## Упражнение 2: Сделай функцию чистой

Перепишите функцию так, чтобы она стала чистой — без мутации входных данных, без глобальных зависимостей:

```typescript
let discountPercent = 10;

function applyDiscount(items: { name: string; price: number }[]) {
  for (const item of items) {
    item.price = item.price * (1 - discountPercent / 100);
  }
  console.log(`Discount applied to ${items.length} items`);
  return items;
}
```

<details>
<summary>Подсказка</summary>

Скидку передайте аргументом. Вместо мутации создайте новый массив с новыми объектами. Уберите `console.log`.

</details>

<details>
<summary>Решение</summary>

```typescript
const applyDiscount = (
  items: readonly { name: string; price: number }[],
  discountPercent: number
): { name: string; price: number }[] =>
  items.map((item) => ({
    ...item,
    price: item.price * (1 - discountPercent / 100),
  }));
```

</details>

---

## Упражнение 3: Referential transparency

Можно ли заменить вызов `f(10)` на его результат без изменения поведения программы? Обоснуйте.

```typescript
const cache: Record<number, number> = {};

const f = (x: number): number => {
  if (cache[x] !== undefined) return cache[x];
  const result = x * x + 1;
  cache[x] = result;
  return result;
};

const a = f(10) + f(10);
```

<details>
<summary>Ответ</summary>

Формально — **нет**, функция нечистая: она мутирует внешний объект `cache`. Но **наблюдаемый результат** при подстановке совпадает: `f(10)` всегда вернёт `101`, и `101 + 101 === 202`. Это пример мемоизации — побочный эффект (запись в кэш) не влияет на возвращаемое значение. На практике мемоизированные функции часто считаются "достаточно чистыми", но формально referential transparency нарушена.

</details>

---

## Упражнение 4: Напиши pipeline через pipe

Дана строка с email-адресом. Напиши pipeline, который:
1. Убирает пробелы по краям
2. Приводит к нижнему регистру
3. Проверяет, содержит ли символ `@`
4. Возвращает `true`/`false`

Сделай два варианта: через вложенные вызовы и через `pipe` из fp-ts.

<details>
<summary>Решение</summary>

```typescript
import { pipe, flow } from 'fp-ts/function';

const trim = (s: string): string => s.trim();
const toLower = (s: string): string => s.toLowerCase();
const containsAt = (s: string): boolean => s.includes("@");

// Вложенные вызовы
const isEmailNested = (input: string): boolean =>
  containsAt(toLower(trim(input)));

// pipe
const isEmailPipe = (input: string): boolean =>
  pipe(input, trim, toLower, containsAt);

// flow (point-free)
const isEmailFlow = flow(trim, toLower, containsAt);
```

</details>

---

## Упражнение 5: Построй конвейер обработки данных

Есть массив продуктов. Нужно написать pipeline, который:
1. Отфильтрует продукты дороже 100
2. Применит скидку 15%
3. Округлит цены до двух знаков
4. Отсортирует по цене (от дешёвых к дорогим)
5. Вернёт строку с именами и ценами: `"Product1: $85.00, Product2: $127.50"`

Используй `pipe` из fp-ts. Каждый шаг — отдельная чистая функция.

```typescript
interface Product {
  name: string;
  price: number;
}

const products: Product[] = [
  { name: "Keyboard", price: 150 },
  { name: "Mouse", price: 50 },
  { name: "Monitor", price: 400 },
  { name: "Cable", price: 15 },
  { name: "Headset", price: 120 },
];
```

<details>
<summary>Решение</summary>

```typescript
import { pipe } from 'fp-ts/function';

const filterExpensive = (min: number) =>
  (products: Product[]): Product[] =>
    products.filter((p) => p.price > min);

const applyDiscount = (percent: number) =>
  (products: Product[]): Product[] =>
    products.map((p) => ({ ...p, price: p.price * (1 - percent / 100) }));

const roundPrices = (products: Product[]): Product[] =>
  products.map((p) => ({ ...p, price: Math.round(p.price * 100) / 100 }));

const sortByPrice = (products: Product[]): Product[] =>
  [...products].sort((a, b) => a.price - b.price);

const formatList = (products: Product[]): string =>
  products.map((p) => `${p.name}: $${p.price.toFixed(2)}`).join(", ");

const result = pipe(
  products,
  filterExpensive(100),
  applyDiscount(15),
  roundPrices,
  sortByPrice,
  formatList
);
// "Headset: $102.00, Keyboard: $127.50, Monitor: $340.00"
```

</details>

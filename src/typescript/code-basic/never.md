# never

`never` — **пустое множество** (bottom type). Не содержит ни одного значения.

## Когда функция возвращает never

Функция имеет тип возврата `never`, если она **гарантированно не завершается нормально**:

```ts
function throwError(msg: string): never {
  throw new Error(msg);
}

function infiniteLoop(): never {
  while (true) { /* ... */ }
}
```

**Отличие от `void`**: `void` — функция завершается, но не возвращает полезного значения. `never` — функция не завершается вообще (throw, бесконечный цикл, process.exit).

## never в системе типов

| Свойство | Следствие |
|---|---|
| `never` — подтип всех типов | `never` присваивается чему угодно |
| Ничего не присваивается `never` | Кроме самого `never` |
| `T \| never` = `T` | Пустое множество не расширяет union |
| `T & never` = `never` | Пересечение с пустым → пустое |

## Фильтрация типов (Distributive Conditional Types)

```ts
type NonNumbers<T> = T extends number ? never : T;
type Result = NonNumbers<string | number | boolean>;
// → string | boolean
```

Работает потому что conditional type **распределяется** по union: каждый член проверяется отдельно, `never` выбрасывается из результата.

## Exhaustive check

```ts
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

type Shape = 'circle' | 'square';

function area(s: Shape) {
  switch (s) {
    case 'circle': return /* ... */;
    case 'square': return /* ... */;
    default: assertNever(s); // Если добавим 'triangle' в Shape — ошибка компиляции
  }
}
```

Гарантирует, что все варианты union обработаны. Если добавить новый член — код не скомпилируется, пока его не обработают.

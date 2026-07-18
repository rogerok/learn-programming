---
tags: [typescript, narrowing, control-flow, type-system]
aliases: [Сужение типов]
---

# Сужение типов

**Цель:** по проверкам, выполненным в runtime, доказать компилятору, какой частью union является значение в текущей ветке.

**Предпосылки:** [[type-as-set|типы как множества]], [[assignability|присваиваемость]], [[structural-typing|структурная типизация]], [[unknown|unknown]].

## От широкого типа к узкому

Если переменная имеет тип `string | number`, до проверки доступны только операции, корректные для обоих вариантов. Условие исключает часть множества значений, а control-flow analysis запоминает результат:

```ts
function normalize(value: string | number): string {
  if (typeof value === "string") {
    return value.trim();
  }

  return value.toFixed(2);
}
```

В первой ветке `value` имеет тип `string`, после неё — `number`, потому что ветка завершается через `return`.

## Встроенные способы сужения

- `typeof` — для примитивов и `function`;
- `instanceof` — для экземпляров runtime-конструкторов;
- сравнение с литералом или `null`;
- поле-дискриминатор в union;
- `in` — проверяет наличие свойства в runtime, но требует осторожности с опциональными и лишними полями;
- предикат `value is T` и assert-функция — пользовательское доказательство, которому TypeScript доверяет.

## Discriminated union и исчерпывающая проверка

```ts
type LoadState =
  | { kind: "idle" }
  | { kind: "loaded"; data: string }
  | { kind: "failed"; error: Error };

function label(state: LoadState): string {
  switch (state.kind) {
    case "idle":
      return "ожидание";
    case "loaded":
      return state.data;
    case "failed":
      return state.error.message;
    default: {
      const unreachable: never = state;
      return unreachable;
    }
  }
}
```

После обработки всех вариантов оставшееся множество пусто, поэтому `state` имеет тип `never`. Если добавить новый вариант и не добавить `case`, присваивание `never` перестанет компилироваться.

## Пользовательские проверки — граница доверия

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

Type predicate связывает boolean-результат с типом параметра, но компилятор не проверяет корректность тела. Ошибочный predicate создаёт ложное доказательство и может привести к runtime-ошибке. Для внешних данных проверяйте каждое свойство или используйте runtime-схему; `as` проверку не заменяет.

## Наблюдаемая проверка

1. Скомпилируйте пример с `LoadState` через `tsc --strict --noEmit` — ошибок быть не должно.
2. Добавьте вариант `{ kind: "cancelled" }`, не меняя `switch` — ошибка должна появиться на присваивании `state` типу `never`.
3. Добавьте соответствующий `case` — ошибка должна исчезнуть.

## Дальше

- [[generics|Дженерики]] — сохранение связей между типами без ручных assertions.
- [[assert|Assert-функции]] — сужение после runtime-проверки.
- [[../../unsound/unsound|Небезопасность TypeScript]] — случаи, где статическое доказательство расходится с runtime.
- [[../../MOC|К маршруту TypeScript]].

## Источники

- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

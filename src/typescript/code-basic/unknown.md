# unknown

`unknown` — top type в TypeScript (наряду с `any`). Любое значение присваивается `unknown`, но `unknown` не присваивается ничему, кроме `unknown` и `any`.

## Отличие от `any`

| | `any` | `unknown` |
|---|---|---|
| Присвоить **в** него | Любое значение | Любое значение |
| Присвоить **из** него | Куда угодно | Только в `unknown` / `any` |
| Операции | Любые (проверка отключена) | Запрещены до сужения типа |

```ts
let value: unknown = 'code-basics';

value.toUpperCase(); // Error — нельзя вызвать метод
value + 1;           // Error — нельзя выполнить операцию

// Сужение через type guard
if (typeof value === 'string') {
  value.toUpperCase(); // OK — тип сужен до string
}
```

## Когда использовать

- **Вместо `any`** для входных данных из внешних источников (API, JSON.parse, пользовательский ввод) — заставляет явно проверить тип перед использованием.
- **В generic constraints** — `T extends unknown` фактически означает «любой тип» без потери типобезопасности.
- **Catch-блоки** — в TypeScript 4.4+ параметр `catch` можно типизировать как `unknown` вместо `any`.

```ts
try {
  // ...
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log(err.message); // OK — тип сужен
  }
}
```

## unknown в условных типах

`unknown` поглощает другие типы в union: `T | unknown` → `unknown`. Это следствие того, что `unknown` — универсальное множество.

## Пересечение с unknown

`T & unknown` → `T` — пересечение с универсальным множеством не меняет тип.

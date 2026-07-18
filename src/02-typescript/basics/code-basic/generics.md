---
tags: [typescript, generics, constraints, type-system]
aliases: [Дженерики TypeScript]
---

# Дженерики

**Цель:** выразить связь между входными и выходными типами, не заменяя конкретную информацию на union, `any` или assertions.

**Предпосылки:** [[assignability|присваиваемость]], [[function-as-param|сигнатуры функций]], [[narrowing|сужение типов]].

## Параметр типа сохраняет связь

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

const name = first(["Ada", "Grace"]); // string | undefined
const code = first([200, 404]);        // number | undefined
```

`T` — переменная для типа. Один вызов связывает все позиции с одним конкретным `T`; поэтому результат не теряет информацию об элементе массива.

Union описывает набор допустимых значений, но не всегда сохраняет соответствие входа и выхода:

```ts
function echo(value: string | number): string | number {
  return value;
}
```

После `echo("ok")` тип результата всё ещё `string | number`. В generic-сигнатуре `<T>(value: T) => T` результат связан с конкретным аргументом.

## Constraints описывают доступные операции

```ts
function readId<T extends { id: string }>(value: T): string {
  return value.id;
}
```

`extends` здесь не выбирает ветку. Constraint требует, чтобы `T` был присваиваем `{ id: string }`, и разрешает читать `id` внутри функции. Дополнительные поля сохраняются в `T`.

## Связь объекта и ключа

```ts
function get<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const user = { id: 1, name: "Ada" };
const id = get(user, "id");     // number
const name = get(user, "name"); // string
```

`K extends keyof T` запрещает неизвестный ключ, а indexed access `T[K]` вычисляет тип результата для выбранного ключа.

## Вывод типов и явные аргументы

Обычно TypeScript выводит параметры типа из аргументов вызова. Явный `fn<Type>(value)` нужен, когда выводу не хватает информации или требуется намеренно более широкий тип. Не используйте явный аргумент только ради подавления полезной ошибки присваиваемости.

## Когда generic не нужен

Параметр типа должен связывать хотя бы две позиции или переносить информацию в результат. Если `T` встречается один раз и не влияет на контракт, обычный конкретный тип часто яснее:

```ts
function logValue<T>(value: T): void {
  console.log(value);
}
```

Здесь `unknown` выражает намерение не хуже: значение только принимается, связь с другим типом отсутствует.

## Связь с вариантностью

В `Producer<T>` параметр, появляющийся только в возвращаемых значениях, обычно ковариантен. В `Consumer<T>` параметр входа при `strictFunctionTypes` контравариантен. Если `T` и принимается, и возвращается, безопасная подстановка часто требует инвариантности. Продолжение: [[variability|вариантность]].

## Наблюдаемая проверка

1. Вызовите `get(user, "id")` и присвойте результат переменной типа `number` — `tsc --strict --noEmit` должен завершиться без ошибки.
2. Вызовите `get(user, "missing")` — компилятор должен отклонить ключ.
3. Замените `T[K]` на `T[keyof T]` — результат для `"id"` станет шире; присваивание `number` покажет потерю связи.

## Дальше

- [[variability|Вариантность]] — направление совместимости generic-контейнеров и функций.
- [[mapping-modifiers|Mapped types]] — преобразование свойств параметризованного типа.
- [[../../advanced/infer|infer]] — извлечение частей типа в conditional types.
- [[../../MOC|К маршруту TypeScript]].

## Источники

- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

# Mapping Modifiers

При сопоставлении (mapped types) можно изменять модификаторы свойств: `readonly` и `?`.

Префиксы `+` (добавить, по умолчанию) и `-` (удалить):

```ts
// Все свойства необязательные
type Partial<T> = { [P in keyof T]?: T[P] };

// Все свойства обязательные (удаляем ?)
type Required<T> = { [P in keyof T]-?: T[P] };

// Все свойства readonly
type Readonly<T> = { readonly [P in keyof T]: T[P] };

// Убрать readonly (Mutable)
type Mutable<T> = { -readonly [P in keyof T]: T[P] };
```

## Комбинирование модификаторов

```ts
// Убрать readonly + сделать опциональными
type MutablePartial<T> = { -readonly [P in keyof T]?: T[P] };
```

## Key Remapping (TS 4.1+)

Через `as` в mapped type можно переименовывать или фильтровать ключи:

```ts
// Префикс get для всех свойств
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Фильтрация: оставить только строковые свойства
type StringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};
```

## Гомоморфные mapped types

Если mapped type итерирует по `keyof T`, он сохраняет модификаторы оригинального типа:

```ts
type T = { readonly a: string; b?: number };
type Mapped = { [K in keyof T]: boolean };
// { readonly a: boolean; b?: boolean } — модификаторы сохранены
```

Чтобы сбросить — явно используйте `-readonly` и `-?`.

# Literal Types

TypeScript поддерживает литеральные типы.
Они доступны для `boolean`, `number`, `string`, `BigInt`

```ts
type Hexlet = 'hexlet';
type One = 1;
type False = false;
type BigN = 100n;
```

С точки зрения теории множеств, такой тип представляет собой множество, которое состоит из одного элемента.

## String enums

```ts
enum OrderStatus {
  Created = 'Created',
  Paid = 'Paid',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
}
```
В случае с Enum — это не так. Перечисления — это конструкция языка, которая остается существовать в коде после трансляции кода в JavaScript.
По этой причине некоторые разработчики используют вместо них Union Types, которые позволяют сделать практически то же самое с помощью строковых литералов.


## Приведение к литеральному типу
Приведение к типу к литеральному типа производится через Type Assertion `as const`


```ts
const ormConfig = {
    type: 'mysql',
    host: 'localhost',
    port: 5432,
} as const
```

На выходе мы получаем тип с неизменяемыми `readonly` полями и литеральными типами в значении.
Такая техника применима к массивам - она превращает их в кортежи.
Также применима к простым типам, например `string`
```ts
const str = 'test' as const;

type Str = typeof str; // 'test'
```


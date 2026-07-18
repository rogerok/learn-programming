---
tags: [typescript, functional-programming, types, isomorphism, homomorphism]
aliases: [Изоморфизмы, Изоморфизм типов]
---

# Изоморфизмы и гомоморфизмы в TypeScript

## Биекция и изоморфизм типов

**Биекция** задаёт взаимно однозначное соответствие: каждому элементу типа `T` соответствует ровно один элемент типа `U` и наоборот. Для типов, рассматриваемых как множества значений, такое соответствие является изоморфизмом.

Его можно представить парой тотальных функций:

```ts
type Isomorphism<T, U> = Readonly<{
  to: (value: T) => U;
  from: (value: U) => T;
}>;

type Toggle = 'on' | 'off';

const toggleBoolean: Isomorphism<Toggle, boolean> = {
  to: (value) => value === 'on',
  from: (value) => (value ? 'on' : 'off'),
};
```

Одних сигнатур недостаточно. Для **всех** значений должны выполняться два закона обратного прохода:

```text
from(to(t)) = t  для каждого t: T
to(from(u)) = u  для каждого u: U
```

```ts
console.assert(toggleBoolean.from(toggleBoolean.to('on')) === 'on');
console.assert(toggleBoolean.to(toggleBoolean.from(false)) === false);
```

Первый закон запрещает `to` терять различия между значениями `T`. Второй запрещает оставлять в `U` значения, к которым нельзя прийти из `T`.

## Не-пример: нормализация

```ts
const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

normalizeEmail('USER@mail.com');
normalizeEmail(' user@mail.com ');
```

Обе разные строки дают `'user@mail.com'`. Регистр и пробелы потеряны, поэтому обратная функция не сможет восстановить любой исходный ввод. Это не изоморфизм.

## Кратко о гомоморфизме

**Гомоморфизм** сохраняет выбранную операцию, но не обязан быть обратимым. Например, `length` переводит конкатенацию строк в сложение чисел:

```ts
const append = (left: string, right: string): string => left + right;
const add = (left: number, right: number): number => left + right;
const length = (value: string): number => value.length;

console.assert(
  length(append('fp', '-ts')) === add(length('fp'), length('-ts')),
);
```

`length` сохраняет операцию, но строки `'ab'` и `'cd'` переходят в одно значение `2`: это гомоморфизм для указанных операций, но не изоморфизм. Обычную функцию нельзя назвать гомоморфизмом, пока не указана структура, которую она должна сохранять.

Итак, изоморфизм — обратимое соответствие, а гомоморфизм — сохранение выбранной структуры с возможной потерей информации.

## Связанные темы

- [[../fp-course/02-types-adt-option/types-adt-option|Типы как множества и ADT]]
- [[../functiona-programming-in-ts/18.magma,semigroup,monoid|Magma, Semigroup и Monoid]]

## Sources

- [Wolfram MathWorld — Isomorphism](https://mathworld.wolfram.com/Isomorphism.html)
- [Wolfram MathWorld — Homomorphism](https://mathworld.wolfram.com/Homomorphism.html)
- [Category Theory for Programmers](https://github.com/hmemcpy/milewski-ctfp-pdf)

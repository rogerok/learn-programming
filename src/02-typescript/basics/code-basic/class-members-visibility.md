---
tags: [typescript, classes, visibility, private, protected, public]
aliases: [Видимость членов класса]
---

# Модификаторы доступа членов класса

| Модификатор | Доступ |
|---|---|
| `public` (по умолчанию) | Отовсюду |
| `private` | Только внутри класса |
| `protected` | Внутри класса + наследники |

## TS `private` vs ES `#private`

| | TS `private` | ES `#field` |
|---|---|---|
| Проверка | Compile-time only | Runtime enforcement |
| После компиляции | Стирается — доступно в JS | Недоступно даже через `as any` |
| Влияние на структурную типизацию | Включает номинальную проверку | Включает номинальную проверку |

## protected и наследование

```ts
class Base {
  protected value = 42;
}

class Child extends Base {
  getValue() { return this.value; } // OK
}

new Child().value; // Error — protected
```

## Параметры конструктора с модификаторами (Parameter Properties)

Сокращённый синтаксис — модификатор в параметре конструктора автоматически создаёт и инициализирует свойство:

```ts
class User {
  constructor(
    public name: string,
    private age: number,
    protected role: string
  ) {}
  // Эквивалентно объявлению трёх полей + присваиванию в конструкторе
}
```

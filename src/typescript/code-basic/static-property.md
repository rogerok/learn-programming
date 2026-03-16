# Статические методы и свойства

Статические члены принадлежат **классу**, а не экземпляру. Обращение через имя класса, а не `this`:

```ts
class Counter {
  static count = 0;

  constructor() {
    Counter.count++;
  }

  static getCount(): number {
    return Counter.count;
  }
}
```

- Поддерживают модификаторы доступа: `public`, `private`, `protected`.
- `static` блоки (ES2022) позволяют инициализировать статические поля с логикой:

```ts
class Config {
  static value: string;
  static {
    Config.value = loadFromEnv();
  }
}
```

- Статические свойства **не доступны** через `this` в обычных методах (и наоборот — instance-свойства не доступны в `static`-методах).
- Наследуются подклассами: `class Sub extends Counter {}` → `Sub.count` работает.

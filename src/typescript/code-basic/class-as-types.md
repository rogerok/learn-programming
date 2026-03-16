# Классы как типы

TypeScript — структурно типизированный язык, но **классы с `private`/`protected` полями проверяются номинально** (по происхождению, а не по форме).

```ts
class Point {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  isEqual(p2: Point): boolean {
    return this.x === p2.x && this.y === p2.y;
  }
}

point.isEqual(new Point(10, 1)); // OK
point.isEqual({ x: 1, y: 2 });  // Error — требуется экземпляр Point
```

## Почему так работает

- `private` — инвариант класса. Только экземпляры того же класса гарантируют одинаковую внутреннюю структуру и логику.
- Если бы произвольный объект `{ x, y }` проходил проверку, можно было бы нарушить инкапсуляцию — метод `isEqual` обращается к `p2.x` через приватный доступ, а у литерального объекта такого доступа нет.

## ECMAScript private fields (`#`)

С ES2022 `#`-поля дают **настоящую** приватность на уровне рантайма (в отличие от TS `private`, который стирается при компиляции):

```ts
class Secret {
  #value: number;
  constructor(v: number) { this.#value = v; }
}
```

- `#`-поля недоступны даже через `(obj as any).#value`.
- Классы с `#`-полями тоже проверяются номинально.

## Без приватных полей — чисто структурная совместимость

```ts
class Cat { name = 'cat'; }
class Dog { name = 'dog'; }

const c: Cat = new Dog(); // OK — одинаковая структура
```

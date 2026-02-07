# Классы как типы

TypeScript будет явно требовать экземпляр класса, если у него есть приватные поля:

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

const point = new Point(1, 2);
point.isEqual(new Point(10, 1)); // OK
point.isEqual({ x: 1, y: 2}); // Error: Argument of type '{ x: number; y: number; }' is not assignable to parameter of type 'Point'.
```

TypeScript в целом структурно типизирован, но если у класса есть `private` или `protected` поля, то совместимость проверяется по происхождению, а не по форме.

Если бы этого правила не было, возникала бы логическая дыра:

* `private` - это инвариант класса.
* только экземпляры того же класса гарантируют одинаковую внутреннюю структуру, одинаковые предположения логики

Если убрать private, то класс становится чисто структурным типом


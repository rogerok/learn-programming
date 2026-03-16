---
tags: [solid, lsp, liskov-substitution, typescript, inheritance]
aliases: [LSP, Принцип подстановки Лисков]
---

# Liskov Substitution Principle (LSP)

The **Liskov Substitution Principle** states:

> "Objects of a superclass should be replaceable with objects of its subclasses without affecting the functionality of the program."

This principle emphasizes that **subtypes must be substitutable for their base types**. In simpler terms, if a program works with an object of a certain type, it should also work when that object is replaced with another object derived from the same base type, without introducing errors or unexpected behavior.


### Core Concepts of LSP

1. **Behavioral Consistency**
   A subclass must follow the behavior contract defined by its superclass. It should not override methods in a way that changes the expected behavior.
2. **No Strengthening of Preconditions**
   A subclass must not impose stricter requirements than its parent class. For example, if the parent class accepts all integers, the subclass should not reject negative integers.
3. **No Weakening of Postconditions**
   A subclass must meet all the guarantees (postconditions) made by the parent class. If the parent promises to return a non-negative value, the subclass cannot return a negative value.
4. **Avoiding Exceptions**
   Subclasses should not introduce new exceptions that are not handled by the parent type.


### Why LSP is Important

Violating LSP can lead to subtle bugs and reduced reusability of code. If a subclass cannot replace its parent without introducing issues, the abstraction breaks, defeating the purpose of inheritance.

---

## Практические примеры из кода

### Соответствие LSP: Rectangle и Square

```typescript
class Rectangle {
    constructor(protected width: number, protected height: number) {}

    setWidth(width: number) { this.width = width; }
    setHeight(height: number) { this.height = height; }

    getArea(): number { return this.width * this.height; }
}

class Square extends Rectangle {
    setWidth(width: number) {
        this.width = width;
        this.height = width; // квадрат сохраняет инвариант: стороны равны
    }

    setHeight(height: number) {
        this.width = height;
        this.height = height;
    }
}

function calculateArea(rectangle: Rectangle) {
    rectangle.setWidth(5);
    rectangle.setHeight(10);
    console.log(`Area: ${rectangle.getArea()}`);
}

calculateArea(new Rectangle(0, 0)); // Area: 50
calculateArea(new Square(0, 0));    // Area: 100 — поведение отличается, но не ломает программу
```

### Нарушение LSP: Bird и Penguin

```typescript
class Bird {
    fly(): string { return "I can fly!"; }
}

class Penguin extends Bird {
    // Пингвин не летает — бросает ошибку вместо полёта
    fly(): string {
        throw new Error("I can't fly!");
    }
}

function letBirdFly(bird: Bird) {
    console.log(bird.fly());
}

letBirdFly(new Bird());    // I can fly!
letBirdFly(new Penguin()); // ОШИБКА — нарушение LSP!
// Penguin не заменяет Bird прозрачно
```

**Решение:** разделить иерархию. `Bird` — базовый тип, `FlyingBird` — подтип с `fly()`. Penguin наследует от Bird, но не от FlyingBird.

---

## Пример из solid-book: иерархия пользователей

```typescript
// Нарушение: Guest бросает ошибку в updateProfile
class Guest extends User {
    updateProfile(data: Profile): CommandStatus {
        throw new Error(`Guests don't have profiles`); // LSP нарушен!
    }
}

// Решение: разделяем ответственности через интерфейсы
interface User { getSessionID(): ID; }
interface UserWithAccess { hasAccess(action: Actions): boolean; }
interface UserWithProfile { updateProfile(data: Profile): CommandStatus; }

class RegularUser extends BaseUser implements UserWithAccess, UserWithProfile {
    hasAccess(action: Actions): boolean { return access; }
    updateProfile(data: Profile): CommandStatus { return status; }
}

class Guest extends BaseUser implements UserWithAccess {
    hasAccess(action: Actions): boolean { return access; }
    // updateProfile не реализован — потому что Guest не реализует UserWithProfile
}
```

---

## Ключевые моменты

- Подкласс должен быть **прозрачно заменяемым** на базовый класс
- Если в коде есть `instanceof` проверки — скорее всего нарушен LSP
- Не бросай в наследнике исключения, которых нет в базовом классе
- «Квадрат — прямоугольник» в геометрии ≠ «Квадрат extends Прямоугольник» в коде

## Связанные темы

- [[../OOP/inheritance]] — наследование как основа LSP
- [[../OOP/polymorphism]] — полиморфизм работает только при соблюдении LSP
- [[interfaceSegregation]] — ISP помогает соблюдать LSP
- [[../solid-book/lsp]] — углублённый разбор LSP из книги

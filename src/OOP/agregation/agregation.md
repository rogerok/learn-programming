---
tags: [oop, aggregation, typescript, composition]
aliases: [Агрегация]
---

# Агрегация

**Агрегация** — это отношение *«has-a»* между объектами, при котором один объект содержит другой как свою составную часть, но оба объекта могут существовать независимо друг от друга. Это более слабая связь по сравнению с композицией.


### Основные особенности агрегации

1. **Независимость объектов:**
   Объект-часть может существовать вне контекста объекта-целого. Например, *«Человек»* может содержать объект *«Машина»*, но машина может существовать без человека.
2. **Слабая зависимость:**
   В отличие от композиции, где объект-часть полностью зависит от объекта-целого, в агрегации жизненные циклы объектов не связаны.
3. **Использование через ссылки:**
   Один объект может содержать другой, как правило, через указатели или ссылки. Это позволяет объектам быть независимыми в памяти.
4. **Гибкость в проектировании:**
   Агрегация поддерживает повторное использование кода, так как объекты-части можно переиспользовать в разных контекстах.



### Разница между агрегацией и композицией


| **Агрегация**                                                                                                                    | **Композиция**                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Слабая связь между объектами.                                                                                    | Сильная связь между объектами.                                                                                         |
| Объект-часть может существовать сам по себе.                                                         | Объект-часть зависит от объекта-целого.                                                                         |
| Объект-часть передаётся в конструктор или устанавливается после создания. | Объект-часть создаётся внутри объекта-целого.                                                             |
| Используется, когда объекты логически связаны, но независимы.                         | Используется, когда объект-часть является неотъемлемой частью объекта-целого. |

---

## Практические примеры из кода

### Пример 1: Машина и освежитель (агрегация vs композиция)

Двигатель и колёса — **композиция** (создаются внутри Car).
Освежитель — **агрегация** (передаётся снаружи, может существовать отдельно):

```typescript
class Engine {
    drive() { console.log('Двигатель работает') }
}

class Wheel {
    drive() { console.log('Колёса крутятся') }
}

class Freshener {
    smell() { console.log('Освежитель пахнет') }
}

class Car {
    engine: Engine;
    wheels: Wheel[] = [];
    freshener: Freshener; // агрегация — передаётся извне

    constructor(freshener: Freshener, wheels: number = 4) {
        this.freshener = freshener;
        for (let i = 0; i < wheels; i++) {
            this.wheels.push(new Wheel());
        }
    }

    drive() {
        this.engine = new Engine(); // создаётся внутри — композиция
        this.wheels.forEach(wheel => wheel.drive())
    }
}

const freshener = new Freshener();
const car = new Car(freshener); // freshener живёт независимо от car

car.drive();
car.freshener.smell();

// Тот же freshener можно использовать в квартире
const flat = new Flat(freshener);
flat.freshener.smell();
```

### Пример 2: Компания и сотрудники

Сотрудники существуют независимо от компании — классическая агрегация:

```typescript
class Employee {
    private _name: string;
    private _position: string;

    constructor(name: string, position: string) {
        this._name = name;
        this._position = position;
    }

    public get name(): string { return this._name; }
    public get position(): string { return this._position; }

    public describe(): string {
        return `${this._name} работает на позиции ${this._position}`;
    }
}

class Company {
    private _name: string;
    private _employees: Employee[];

    constructor(name: string) {
        this._name = name;
        this._employees = [];
    }

    // Принимает уже существующий объект Employee
    public addEmployee(employee: Employee): void {
        this._employees.push(employee);
    }

    public listEmployees(): void {
        console.log(`Сотрудники компании ${this._name}:`);
        this._employees.forEach((employee) => {
            console.log(`- ${employee.describe()}`);
        });
    }
}

// Сотрудники создаются независимо
const employee1 = new Employee('Иван', 'Разработчик');
const employee2 = new Employee('Мария', 'Дизайнер');

const company = new Company('TechCorp');
company.addEmployee(employee1);
company.addEmployee(employee2);

// employee1 существует и без company
console.log(employee1.describe());
```

---

## Ключевые моменты

- Агрегация = объект-часть **передаётся в конструктор** или устанавливается позже
- Объект-часть **может жить без** объекта-целого
- При удалении Company — Employee не исчезают
- Отличие от [[composition|композиции]]: там объект-часть создаётся внутри и не существует без целого

## Связанные темы

- [[composition]] — сравни с сильной связью
- [[dependencyInjection]] — агрегация часто реализуется через DI
- [[inheritance]] — альтернативный механизм повторного использования

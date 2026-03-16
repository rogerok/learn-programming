---
tags: [oop, inheritance, typescript, extends]
aliases: [Наследование]
---

# Наследование

Наследование — это механизм, который позволяет дочернему классу наследовать свойства и методы родительского класса.


### Основные концепции наследования:

1. **Переиспользование кода:**
   Родительский класс содержит общую функциональность, которая автоматически доступна потомкам, что сокращает дублирование кода.
2. **Расширение функциональности:**
   Потомки могут добавлять новые методы или свойства, которые специфичны для них, дополняя возможности родительского класса.
3. **Переопределение методов (Override):**
   Потомки могут изменять поведение методов, унаследованных от родителя, предоставляя свою реализацию.
4. **Иерархия классов:**
   Позволяет организовать структуру приложения в виде дерева классов, где общие свойства и методы находятся на верхних уровнях, а специфичные — на нижних.

---

## Практические примеры из кода

### Цепочка наследования: Person → Employee → Developer

```typescript
class Person {
    private _firstName: string;
    private _lastName: string;
    private _age: number;

    constructor(firstName: string, lastName: string, age: number) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._age = age;
    }

    public get fullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }

    get firstName(): string { return this._firstName; }
    set firstName(value: string) { this._firstName = value; }

    get age(): number { return this._age; }
    set age(value: number) { this._age = !value ? 0 : value; }
}

// Простое наследование без добавления новых данных
class Employee extends Person {
}

const employee1 = new Employee('firstname', 'lastname', 18);
// Employee наследует все методы и свойства Person
console.log(employee1.fullName);

// Расширение: добавляем новые поля
class Employee2 extends Person {
    private inn: string;
    private number: string;
    private snils: string;

    constructor(firstname: string, lastname: string, age: number,
                inn: string, number: string, snils: string) {
        super(firstname, lastname, age); // обязательный вызов конструктора родителя
        this.inn = inn;
        this.number = number;
        this.snils = snils;
    }
}

// Ещё один уровень наследования
class Developer extends Employee2 {
    private level: string;

    constructor(firstname: string, lastname: string, age: number,
                inn: string, number: string, snils: string, level: string) {
        super(firstname, lastname, age, inn, number, snils);
        this.level = level;
    }
}

const developer = new Developer('John', 'Doe', 25, 'inn', 'phone', 'snils', 'senior');
console.log(developer.fullName); // унаследован от Person
```

### Переопределение методов (Override)

```typescript
class Employee2 extends Person {
    greeting() {
        console.log(`Hi, I'm employee ${this.fullName}`);
    }
}

class Developer extends Employee2 {
    greeting() {
        // переопределяем метод родителя
        console.log(`Hi, I'm developer ${this.fullName}`);
    }
}

const person = new Person('Alice', 'Smith', 30);
const developer = new Developer('Bob', 'Jones', 25, ...);

// Полиморфизм: один интерфейс, разное поведение
const personList: Person[] = [person, developer];
personList.forEach(p => p.greeting());
// person: "Hello, my name is Alice"
// developer: "Hi, I'm developer Bob Jones"
```

---

## Ключевые моменты

- `extends` — ключевое слово наследования в TypeScript
- `super()` — обязателен в конструкторе дочернего класса если он есть
- `super.method()` — вызов метода родительского класса
- Дочерний класс **наследует** все `public` и `protected` члены родителя
- `private` члены родителя **недоступны** в дочернем классе (только `protected`)
- Один класс может быть наследником только **одного** другого класса (нет множественного наследования)

## Связанные темы

- [[polymorphism]] — переопределение методов = полиморфизм
- [[encapsulation]] — `protected` и `private` в контексте наследования
- [[abstractClasses]] — абстрактные классы как шаблоны для наследования
- [[interfaces]] — альтернатива наследованию для описания контракта
- [[composition]] — «предпочитай композицию наследованию»

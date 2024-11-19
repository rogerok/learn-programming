/**
 * Класс Person
 * Базовый класс, содержащий общие свойства и методы для всех типов людей.
 * - Инкапсулирует имя, фамилию и возраст.
 * - Определяет метод `greeting`, который может быть переопределён в дочерних классах.
 */
class Person {
    private _firstName: string;
    private _lastName: string;
    private _age: number;

    constructor(firstName: string, lastName: string, age: number) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._age = age;
    }

    /**
     * Геттер для получения полного имени.
     */
    public get fullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }

    /**
     * Метод приветствия, доступный для переопределения в дочерних классах.
     */
    public greeting() {
        console.log(`Hello, my name is ${this._firstName}`);
    }
}

// Создание базового объекта класса Person
const person = new Person('firstname', 'lastname', 18);

/**
 * Класс Employee
 * Простой наследник класса Person.
 * - Наследует все свойства и методы без добавления новых.
 */
class Employee extends Person {
}

const employee1 = new Employee('employee1', 'employee1', 18); // Наследует логику Person
console.log(employee1);

/**
 * Класс Employee2
 * Расширяет функциональность Employee, добавляя специфические свойства (ИНН, номер, СНИЛС).
 * - Переопределяет метод `greeting`, добавляя контекст сотрудника.
 */
class Employee2 extends Person {
    private inn: string;
    private number: string;
    private snils: string;

    constructor(firstname: string, lastname: string, age: number, inn: string, number: string, snils: string) {
        super(firstname, lastname, age); // Вызов конструктора базового класса Person
        this.inn = inn;
        this.number = number;
        this.snils = snils;
    }

    /**
     * Переопределённый метод приветствия.
     */
    greeting() {
        console.log(`Hi, I'm employee ${this.fullName}`);
    }
}

const employee2 = new Employee2('Employee2', 'Employee2', 18, 'inn', 'number', 'snils'); // Расширяет Employee
console.log(employee2);

/**
 * Класс Developer
 * Наследует Employee2 и добавляет новое свойство (уровень разработчика).
 * - Переопределяет метод `greeting`, добавляя контекст разработчика.
 */
class Developer extends Employee2 {
    private level: string;

    constructor(fisrtname: string, lastname: string, age: number, inn: string, number: string, snils: string, level: string) {
        super(fisrtname, lastname, age, inn, number, snils); // Вызов конструктора Employee2
        this.level = level;
    }

    /**
     * Переопределённый метод приветствия с упоминанием уровня разработчика.
     */
    greeting() {
        console.log(`Hi, I'm developer ${this.fullName}`);
    }
}

const developer = new Developer('developer', 'developer', 18, 'inn', 'number', 'snils', 'junior developer'); // Добавляет новое свойство
console.log(developer);
console.log(developer.fullName); // Использует геттер из базового класса

/**
 * Полиморфизм:
 * - Мы можем хранить разные типы объектов (Person, Employee, Developer) в одном массиве.
 * - Метод `greeting` вызывается для каждого объекта, используя соответствующую реализацию.
 */
const personList: Person[] = [developer, employee1, employee2, person];

/**
 * Универсальная функция для вызова метода `greeting`.
 * Благодаря полиморфизму объекты вызывают собственные реализации метода.
 */
const massGreeting = (personList: Person[]) => {
    personList.forEach((person: Person) => person.greeting());
};

massGreeting(personList);

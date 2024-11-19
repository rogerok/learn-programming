/**
 * Класс Person
 * Родительский класс, инкапсулирующий общие свойства и методы для работы с людьми.
 * Реализует доступ к полям через геттеры и сеттеры, а также предоставляет метод `fullName`.
 */
class Person {
    private _firstName: string; // Приватное свойство: имя
    private _lastName: string;  // Приватное свойство: фамилия
    private _age: number;       // Приватное свойство: возраст

    constructor(firstName: string, lastName: string, age: number) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._age = age;
    }

    /**
     * Геттер для полного имени. Упрощает доступ к объединённым данным.
     * @returns строка: "Имя Фамилия"
     */
    public get fullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }

    // Геттеры и сеттеры для имени
    get firstName(): string {
        return this._firstName;
    }

    set firstName(value: string) {
        this._firstName = value;
    }

    // Геттеры и сеттеры для фамилии
    get lastName(): string {
        return this._lastName;
    }

    set lastName(value: string) {
        this._lastName = value;
    }

    // Геттеры и сеттеры для возраста
    get age(): number {
        return this._age;
    }

    set age(value: number) {
        this._age = !value ? 0 : value; // Проверка корректности данных
    }
}

/**
 * Класс Employee
 * Наследует свойства и методы от Person.
 * Демонстрирует базовое наследование без добавления новых данных.
 */
class Employee extends Person {
}

const employee1 = new Employee('firstname', 'lastname', 18);
// Employee наследует все методы и свойства Person
console.log(employee1);


/**
 * Класс Employee2.
 * Наследует Person, добавляет новые свойства (INN, номер, СНИЛС).
 * Переопределяет конструктор для инициализации дополнительных данных.
 */
class Employee2 extends Person {
    private inn: string;   // ИНН
    private number: string; // Номер телефона
    private snils: string;  // СНИЛС

    constructor(firstname: string, lastname: string, age: number, inn: string, number: string, snils: string) {
        super(firstname, lastname, age); // Вызов конструктора Person
        this.inn = inn;
        this.number = number;
        this.snils = snils;
    }
}

const employee2 = new Employee2('firstname', 'lastname', 18, 'inn', 'number', 'snils');
// Employee2 расширяет функциональность Employee, добавляя новые поля
console.log(employee2);


/**
 * Класс Developer
 * Наследует Employee2, добавляет свойство уровня разработчика.
 * Переопределяет конструктор для добавления уровня.
 */
class Developer extends Employee2 {
    private level: string; // Уровень разработчика (junior, middle, senior и т.д.)

    constructor(firstname: string, lastname: string, age: number, inn: string, number: string, snils: string, level: string) {
        super(firstname, lastname, age, inn, number, snils); // Вызов конструктора Employee2
        this.level = level;
    }
}

const developer = new Developer('firstname', 'lastname', 18, 'inn', 'number', 'snils', 'junior developer');
// Developer добавляет новое свойство, но сохраняет доступ к унаследованным методам и свойствам
console.log(developer);
console.log(developer.fullName); // Использует метод, унаследованный от Person

class Engine {
    drive() {
        console.log('Двигатель работает')
    }
}

class Wheel {
    drive() {
        console.log('Колёса крутятся')
    }
}

class Freshener {
    smell() {
        console.log('Освежитель пахнет')
    }
}


class Car {
    engine: Engine;
    wheels: Wheel[] = [];
    freshener: Freshener;

    constructor(freshener: Freshener, wheels: number = 4) {
        this.freshener = freshener;
        for (let i = 0; i < wheels; i++) {
            this.wheels.push(new Wheel());
        }
    }

    drive() {
        this.engine = new Engine();
        this.wheels.forEach(wheel => wheel.drive())
    }
}

const car = new Car(new Freshener())

car.drive();
car.freshener.smell()


class Flat {
    freshener: Freshener;

    constructor(freshener: Freshener) {
        this.freshener = freshener;
    }
}

const flat = new Flat(new Freshener());
flat.freshener.smell()


/**
 * Класс Employee
 * Представляет сотрудника, который может существовать независимо от компании.
 */
class Employee {
    private _name: string;
    private _position: string;

    constructor(name: string, position: string) {
        this._name = name;
        this._position = position;
    }

    public get name(): string {
        return this._name;
    }

    public get position(): string {
        return this._position;
    }

    public describe(): string {
        return `${this._name} работает на позиции ${this._position}`;
    }
}

/**
 * Класс Company
 * Представляет компанию, которая "агрегирует" сотрудников.
 */
class Company {
    private _name: string;
    private _employees: Employee[];

    constructor(name: string) {
        this._name = name;
        this._employees = []; // Компания может быть создана без сотрудников.
    }

    /**
     * Метод для добавления сотрудника.
     * Принимает объект Employee, существующий независимо от компании.
     */
    public addEmployee(employee: Employee): void {
        this._employees.push(employee);
    }

    /**
     * Метод для вывода информации о сотрудниках компании.
     */
    public listEmployees(): void {
        console.log(`Сотрудники компании ${this._name}:`);
        this._employees.forEach((employee) => {
            console.log(`- ${employee.describe()}`);
        });
    }
}

// Создаём сотрудников
const employee1 = new Employee('Иван', 'Разработчик');
const employee2 = new Employee('Мария', 'Дизайнер');
const employee3 = new Employee('Анна', 'Менеджер');

// Создаём компанию
const company = new Company('TechCorp');

// Агрегируем сотрудников в компанию
company.addEmployee(employee1);
company.addEmployee(employee2);
company.addEmployee(employee3);

// Компания может работать со своими сотрудниками
company.listEmployees();

// Сотрудники существуют независимо от компании
console.log(employee1.describe());

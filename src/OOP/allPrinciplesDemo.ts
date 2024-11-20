/**
 * Демонстрация всех принципов ООП на практике.
 * Используем: Абстракцию, Инкапсуляцию, Наследование, Полиморфизм, Интерфейсы, Композицию, Агрегацию, Внедрение Зависимостей, Синглтон.
 */

/**
 * Интерфейс Repository
 * Определяет общий контракт для работы с базой данных.
 */

interface Repository<T> {
    save(entity: T): void;

    findById(id: number): T | null;
}

/**
 * Абстрактный класс BaseEntity
 * Реализует общие свойства и методы для всех сущностей.
 */
abstract class BaseEntity {
    public readonly id: number = 0;

    protected constructor() {
        this.id = this.id + 1
    }

    abstract validate(): boolean;
}

/**
 * Сущность User
 * Инкапсулирует свойства пользователя и методы для работы с ними.
 */
class User extends BaseEntity {
    private _name: string;

    constructor(name: string) {
        super()
        this._name = name;
    }

    validate(): boolean {
        return !!this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get name(): string {
        return this._name;
    }

}

/**
 * Реализация Repository для User
 * Демонстрация Полиморфизма: разные сущности могут работать через общий интерфейс Repository.
 */
class UserRepository implements Repository<User> {
    private storage: Map<number, User> = new Map()

    save(data: User) {
        this.storage.set(this.storage.size + 1, data)
    }

    findById(id: number) {
        return this.storage.get(id) ?? null
    }
}

/**
 * Синглтон DatabaseConnection
 * Обеспечивает единственную точку подключения к базе данных.
 */
class DatabaseConnection {
    static instance: DatabaseConnection;

    private constructor() {
        console.log("Подключение к базе данных создано");
    }

    static get dbInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            return DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance
    }

    query(sql: string): void {
        console.log(`Выполнение запроса ${sql}`)
    }

}

/**
 * Сервис UserService
 * Использует внедрение зависимостей: принимает UserRepository через конструктор.
 */
class UserService {
    private repository: Repository<User>

    constructor(repository: Repository<User>) {
        this.repository = repository;
    }

    addUser(name: string): User {
        const user = new User(name);
        if (!user.validate()) {
            throw new Error('Invalid user credentials');
        }
        this.repository.save(user);
        return user;
    }

    getUser(id: number): User | null {
        return this.repository.findById(id)
    }
}

/**
 * Композиция: UserManager использует UserService и DatabaseConnection.
 */
class UserManager {
    private userService: UserService;
    private dbConnection: DatabaseConnection;

    constructor(userService: UserService) {
        this.userService = userService;
        this.dbConnection = DatabaseConnection.dbInstance
    }

    registerUser(name: string): void {
        const user = this.userService.addUser(name);
        this.dbConnection.query(`INSERT INTO users (id, name)
                                 VALUES ('${user.id}', '${user.name}')`);
    }

}

class UserGroup {
    private _users: User[] = [];

    constructor() {
        this._users = []
    }

    addUser(user: User): void {
        this._users.push(user);
    }

    listUsers(): void {
        this._users.forEach((user) => console.log(user.name));
    }
}

// Пример использования всех принципов
const repository = new UserRepository(); // Интерфейс Repository
const userService = new UserService(repository); // Внедрение зависимостей
const userManager = new UserManager(userService); // Композиция + Синглтон

userManager.registerUser("Alice"); // Абстракция, Инкапсуляция, Синглтон
userManager.registerUser("Bob");

// Работа с UserGroup (Агрегация)
const userGroup = new UserGroup();
const alice = repository.findById(1);
const bob = repository.findById(2);


if (alice && bob) {
    userGroup.addUser(alice);
    userGroup.addUser(bob);
    userGroup.listUsers();
}


---
tags: [oop, typescript, demo, patterns]
aliases: [Все принципы ООП, OOP Demo]
---

# Демонстрация всех принципов ООП

Этот пример объединяет все ключевые принципы ООП в одном коде:
**Абстракция, Инкапсуляция, Наследование, Полиморфизм, Интерфейсы, Композиция, Агрегация, Внедрение Зависимостей, Синглтон**.

---

## Архитектура примера

```
Repository<T> (интерфейс)
    └── UserRepository (реализация)

BaseEntity (абстрактный класс)
    └── User (инкапсулирует _name)

DatabaseConnection (синглтон)

UserService (DI: принимает Repository через конструктор)

UserManager (композиция: содержит UserService + DatabaseConnection)

UserGroup (агрегация: хранит User[], которые живут независимо)
```

---

## Полный код

```typescript
// Интерфейс — контракт для работы с базой данных
interface Repository<T> {
    save(entity: T): void;
    findById(id: number): T | null;
}

// Абстрактный класс — общие свойства и контракт для всех сущностей
abstract class BaseEntity {
    public readonly id: number = 0;

    protected constructor() {
        this.id = this.id + 1;
    }

    abstract validate(): boolean; // каждая сущность сама знает, валидна ли она
}

// User — инкапсулирует _name, наследует BaseEntity
class User extends BaseEntity {
    private _name: string;

    constructor(name: string) {
        super();
        this._name = name;
    }

    validate(): boolean {
        return !!this._name;
    }

    public set name(name: string) { this._name = name; }
    public get name(): string { return this._name; }
}

// UserRepository — реализует интерфейс Repository для User
class UserRepository implements Repository<User> {
    private storage: Map<number, User> = new Map();

    save(data: User) {
        this.storage.set(this.storage.size + 1, data);
    }

    findById(id: number) {
        return this.storage.get(id) ?? null;
    }
}

// Синглтон — единственное подключение к БД
class DatabaseConnection {
    static instance: DatabaseConnection;

    private constructor() {
        console.log("Подключение к базе данных создано");
    }

    static get dbInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            return DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    query(sql: string): void {
        console.log(`Выполнение запроса ${sql}`);
    }
}

// UserService — DI: получает репозиторий извне (не создаёт сам)
class UserService {
    private repository: Repository<User>;

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
        return this.repository.findById(id);
    }
}

// UserManager — композиция: содержит UserService и DatabaseConnection
class UserManager {
    private userService: UserService;
    private dbConnection: DatabaseConnection;

    constructor(userService: UserService) {
        this.userService = userService;
        this.dbConnection = DatabaseConnection.dbInstance; // синглтон
    }

    registerUser(name: string): void {
        const user = this.userService.addUser(name);
        this.dbConnection.query(
            `INSERT INTO users (id, name) VALUES ('${user.id}', '${user.name}')`
        );
    }
}

// UserGroup — агрегация: хранит User[], которые существуют независимо
class UserGroup {
    private _users: User[] = [];

    addUser(user: User): void {
        this._users.push(user);
    }

    listUsers(): void {
        this._users.forEach((user) => console.log(user.name));
    }
}

// --- Использование ---
const repository = new UserRepository();           // интерфейс Repository
const userService = new UserService(repository);   // DI
const userManager = new UserManager(userService);  // композиция + синглтон

userManager.registerUser("Alice");
userManager.registerUser("Bob");

// Агрегация — User'ы живут вне UserGroup
const userGroup = new UserGroup();
const alice = repository.findById(1);
const bob = repository.findById(2);

if (alice && bob) {
    userGroup.addUser(alice);
    userGroup.addUser(bob);
    userGroup.listUsers();
}
```

---

## Какой принцип где применён

| Принцип | Где |
|---|---|
| [[interfaces\|Интерфейс]] | `Repository<T>` |
| [[abstractClasses\|Абстрактный класс]] | `BaseEntity` |
| [[encapsulation\|Инкапсуляция]] | `User._name` (private + getter/setter) |
| [[inheritance\|Наследование]] | `User extends BaseEntity` |
| [[polymorphism\|Полиморфизм]] | `validate()` — каждый наследник реализует по-своему |
| [[singleton\|Синглтон]] | `DatabaseConnection` |
| [[dependencyInjection\|DI]] | `UserService(repository: Repository<User>)` |
| [[composition\|Композиция]] | `UserManager` содержит `UserService` и `DatabaseConnection` |
| [[agregation\|Агрегация]] | `UserGroup` хранит `User[]`, живущих независимо |

## Связанные темы

- [[interfaces]] — контракты
- [[abstractClasses]] — абстракции
- [[encapsulation]] — сокрытие данных
- [[inheritance]] — наследование
- [[polymorphism]] — разное поведение через один интерфейс
- [[singleton]] — одиночный экземпляр
- [[dependencyInjection]] — внедрение зависимостей
- [[composition]] — объект содержит другие объекты
- [[agregation]] — слабая связь между объектами

---
tags: [oop, encapsulation, typescript, getters, setters]
aliases: [Инкапсуляция]
---

# Инкапсуляция

Инкапсуляция — это сокрытие внутренней имплементации объекта и предоставление интерфейса для взаимодействия с ним.

### Аспекты

* **Сокрытие данных** — внутренние детали объекта (его поля, данные) скрыты от прямого доступа из внешнего мира. Доступ к ним можно получить только через геттеры и сеттеры.
* **Модификаторы доступа** — поля `private`, `public`. Позволяет определять какие методы класса доступны извне, а какие только внутри класса.
* **Чётко определённый интерфейс** — класс предоставляет методы (иногда называемые API), через которые взаимодействуют с его внутренними данными. Это позволяет разработчику изменять реализацию класса без необходимости изменять код, который использует этот класс.

---

## Практические примеры из кода

### Пример 1: Rectangle с валидацией через сеттер

```typescript
class Rectangle {
    private _width: number;
    private _height: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    get width() {
        return this._width;
    }

    set width(width: number) {
        this._width = width > 0 ? width : 1; // валидация в сеттере
    }

    get perimeter() {
        return 2 * (this._width + this._height); // только геттер — вычисляемое значение
    }
}

const rect = new Rectangle(10, 10);
rect.width = -5; // сеттер не даст установить отрицательное значение
console.log(rect.perimeter);
```

### Пример 2: User с защищёнными данными

```typescript
class User {
    private _username: string;
    private _password: string;
    private _id: number;

    constructor(username: string, password: string) {
        this._username = username;
        this._password = password;
        this._id = Math.floor(Math.random() * 10); // ID генерируется внутри
    }

    get username() { return this._username; }
    set username(value: string) { this._username = value; }

    get password() { return this._password; }
    set password(value: string) { this._password = value; }

    get id() { return this._id; } // только геттер — ID нельзя изменить извне
}

const user = new User('name', 'password');
console.log(user.id); // читать можно
// user._id = 999; // ошибка TypeScript — private!
```

### Пример 3: Database — управление состоянием через методы

```typescript
class Database {
    private _url: string;
    private _port: string;
    private _username: string;
    private _password: string;
    private _tables: [][];

    constructor(username: string, password: string, port: string, url: string) {
        this._username = username;
        this._password = password;
        this._port = port;
        this._url = url;
        this._tables = [];
    }

    // Управление таблицами только через публичные методы
    public createNewTable(table: []) {
        this._tables.push(table);
    }

    public clearTables() {
        this._tables = [];
    }

    get url() { return this._url; }
    get port() { return this._port; }
    get username() { return this._username; }
    get password() { return this._password; }
    get tables() { return this._tables; }
}

const db = new Database("username", "password", "port", "url");
db.createNewTable([]);
db.clearTables();
```

---

## Ключевые моменты

- `private` поля недоступны снаружи класса
- Геттеры/сеттеры — официальный интерфейс для доступа к данным
- Сеттеры позволяют добавлять **валидацию** при записи
- Геттер без сеттера = **только чтение** (readonly через API)
- Изменяй реализацию внутри класса — внешний код не сломается

## Связанные темы

- [[inheritance]] — наследование сохраняет инкапсуляцию через `protected`
- [[abstractClasses]] — абстрактные классы как форма контракта
- [[interfaces]] — интерфейсы как публичный контракт класса

/**
 * Класс Rectangle
 * Реализует инкапсуляцию через приватные свойства `_width` и `_height`.
 * Геттеры и сеттеры обеспечивают контроль доступа к данным, включая валидацию.
 */
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
        this._width = width > 0 ? width : 1; // Валидация данных
    }

    get perimeter() {
        return 2 * (this._width + this._height); // Только геттер, доступ к вычисленному значению
    }
}

// Пример использования
const rect = new Rectangle(10, 10);
rect.width = 1; // Используем сеттер
console.log(rect.perimeter); // Доступ через геттер


/**
 * Класс User
 * Инкапсулирует пользовательские данные (`_username`, `_password`, `_id`).
 * Геттеры и сеттеры управляют доступом, ID неизменяемый.
 */
class User {
    private _username: string;
    private _password: string;
    private _id: number;

    constructor(username: string, password: string) {
        this._username = username;
        this._password = password;
        this._id = Math.floor(Math.random() * 10); // Генерация ID
    }

    get username() {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get password() {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get id() {
        return this._id; // Только геттер, значение защищено от изменений
    }
}

const user = new User('name', 'password');
console.log(user.id)

/**
 * Класс Database
 * Инкапсулирует подключение и управление данными базы данных.
 * Приватные свойства `_url`, `_port`, `_username`, `_password`, `_tables`.
 * Публичные методы управляют таблицами.
 */
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

    public createNewTable(table: []) {
        this._tables.push(table); // Управление доступом через публичный метод
    }

    public clearTables() {
        this._tables = []; // Управление состоянием
    }

    get url() {
        return this._url;
    }

    get port() {
        return this._port;
    }

    get username() {
        return this._username;
    }

    get password() {
        return this._password;
    }

    get tables() {
        return this._tables; // Только геттер, таблицы защищены от прямого изменения
    }
}

// Пример использования
const db = new Database("username", "password", "port", "url");
db.createNewTable([]); // Добавление таблицы через публичный метод
db.clearTables();      // Очистка таблиц

/**
 * Интерфейс Reader
 * Описывает поведение объектов, которые могут читать данные из источника (например, файл или URL).
 */
interface Reader {
    read(url: string): void;
}

/**
 * Интерфейс Writer
 * Описывает поведение объектов, которые могут записывать данные в источник.
 */
interface Writer {
    write(data: []): void;
}

/**
 * Класс FileClient
 * Реализует интерфейсы Reader и Writer для работы с файлами.
 * Позволяет читать и записывать данные.
 */
class FileClient implements Writer, Reader {
    read(url: string): void {
        console.log(`File client is reading url: ${url}`);
    }

    write(data: []): void {
        console.log(`File client is writing data: ${data}`);
    }
}

/**
 * Класс HttpClient
 * Реализует интерфейсы Reader и Writer для работы с HTTP-запросами.
 * Позволяет читать и записывать данные через HTTP.
 */
class HttpClient implements Writer, Reader {
    read(url: string): void {
        console.log(`Http client is reading url: ${url}`);
    }

    write(data: []): void {
        console.log(`Http client is writing data: ${data}`);
    }
}

/**
 * Класс User
 * Представляет данные пользователя. Используется в репозиториях для операций с пользователями.
 */
class User {
    username: string;
    age: number;
}

/**
 * Интерфейс Repository
 * Определяет базовые операции для работы с сущностями типа User: создание, получение, удаление и обновление.
 */
interface Repository {
    create(user: User): void;

    get(user: User): void;

    delete(user: User): void;

    update(user: User): void;
}

/**
 * Класс UserRepo
 * Реализует интерфейс Repository для работы с данными пользователей.
 * Операции выполняются с использованием данных типа User.
 */
class UserRepo implements Repository {
    create(user: User): void {
        console.log(`User created: ${JSON.stringify(user)}`);
    }

    delete(user: User): void {
        console.log(`User deleted: ${JSON.stringify(user)}`);
    }

    get(user: User): void {
        console.log(`User fetched: ${JSON.stringify(user)}`);
    }

    update(user: User): void {
        console.log(`User updated: ${JSON.stringify(user)}`);
    }
}

/**
 * Интерфейс GenericRepository
 * Обобщённый интерфейс для выполнения операций с любым типом данных.
 * Позволяет работать с различными сущностями, заменяя T на нужный тип данных.
 */
interface GenericRepository<T> {
    create(data: T): void;

    get(data: T): void;

    delete(data: T): void;

    update(data: T): void;
}

/**
 * Класс UserRepo2
 * Реализует обобщённый интерфейс GenericRepository с типом данных User.
 * Операции выполняются с данными пользователей.
 */
class UserRepo2 implements GenericRepository<User> {
    create(user: User): void {
        console.log(`User created: ${JSON.stringify(user)}`);
    }

    delete(user: User): void {
        console.log(`User deleted: ${JSON.stringify(user)}`);
    }

    get(user: User): void {
        console.log(`User fetched: ${JSON.stringify(user)}`);
    }

    update(user: User): void {
        console.log(`User updated: ${JSON.stringify(user)}`);
    }
}

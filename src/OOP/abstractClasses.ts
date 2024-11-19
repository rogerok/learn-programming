/**
 * Абстрактный класс Reader
 * Описывает общие методы для объектов, которые могут читать данные.
 * Классы, наследующие от Reader, должны реализовать метод read.
 */
interface Reader {
    read(url: string): void;
}

/**
 * Абстрактный класс Writer
 * Описывает общие методы для объектов, которые могут записывать данные.
 * Классы, наследующие от Writer, должны реализовать метод write.
 */
abstract class Writer {
    abstract write(data: []): void;
}

/**
 * Абстрактный класс Repository
 * Описывает общие операции CRUD (создание, получение, удаление, обновление)
 * для работы с сущностями типа User.
 * Классы, наследующие от Repository, должны реализовать все CRUD-методы.
 */
abstract class Repository<T> {
    abstract create(data: T): void;

    abstract get(data: T): void;

    abstract delete(data: T): void;

    abstract update(data: T): void;
}

/**
 * Класс FileClient
 * Реализует абстрактные классы Reader и Writer.
 * Предназначен для работы с файлами, предоставляет реализацию методов read и write.
 */
class FileClient extends Writer implements Reader {
    // Реализация абстрактного метода для чтения данных
    read(url: string): void {
        console.log(`File client is reading url: ${url}`);
    }

    // Реализация абстрактного метода для записи данных
    write(data: []): void {
        console.log(`File client is writing data: ${data}`);
    }
}

/**
 * Класс HttpClient
 * Реализует абстрактные классы Reader и Writer.
 * Предназначен для работы с HTTP-запросами, предоставляет реализацию методов read и write.
 */
class HttpClient extends Writer implements Reader {
    // Реализация абстрактного метода для чтения данных
    read(url: string): void {
        console.log(`Http client is reading url: ${url}`);
    }

    // Реализация абстрактного метода для записи данных
    write(data: []): void {
        console.log(`Http client is writing data: ${data}`);
    }
}

/**
 * Класс User
 * Представляет данные пользователя, используется в репозиториях.
 */
class User {
    username: string;
    age: number;
}

/**
 * Класс UserRepo
 * Реализует абстрактный класс Repository для работы с сущностями типа User.
 * Предоставляет конкретную реализацию CRUD-операций.
 */
class UserRepo extends Repository<User> {
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


// Пример с частичной реализацией в абстрактных классах

/**
 * Абстрактный класс Reader
 * Описывает общие методы для объектов, которые могут читать данные.
 * Классы, наследующие от Reader, могут использовать частичную реализацию.
 */
abstract class Reader2 {
    /**
     * Метод для чтения данных с указанного URL.
     * Это абстрактный метод, который должен быть реализован в наследниках.
     */
    abstract read(url: string): void;

    /**
     * Метод для проверки доступности URL для чтения.
     * Частичная реализация, которая может быть использована в наследниках.
     */
    checkAvailability(url: string): boolean {
        console.log(`Check availability: ${url}`);
        return true;
    }

    /**
     * Метод для обработки ошибок при чтении.
     * Частичная реализация, которая может быть использована в наследниках.
     */
    handleError(error: Error): void {
        console.log(`Error reading data: ${error.message}`);
    }
}

/**
 * Абстрактный класс Writer
 * Описывает общие методы для объектов, которые могут записывать данные.
 * Классы, наследующие от Writer, могут использовать частичную реализацию.
 */
abstract class Writer2 {
    /**
     * Метод для записи данных.
     * Это абстрактный метод, который должен быть реализован в наследниках.
     */
    abstract write(data: []): void;

    /**
     * Метод для проверки состояния перед записью.
     * Частичная реализация, которая может быть использована в наследниках.
     */
    checkWritePermission(): boolean {
        console.log('Checking write permission...');
        return true;
    }

    /**
     * Метод для обработки ошибок при записи данных.
     * Частичная реализация, которая может быть использована в наследниках.
     */
    handleWriteError(error: Error): void {
        console.log(`Error reading data: ${error.message}`);
    }
}


/**
 * Класс HttpClient
 * Реализует оба абстрактных класса: Reader и Writer.
 * Позволяет как читать данные (метод read), так и записывать данные (метод write).
 */


class HttpClient2 extends Writer2 implements Reader2 {

    // Реализация метода из абстрактного класса Writer
    write(data: []): void {
        try {
            if (this.checkWritePermission()) {
                console.log(`HttpClient is writing data: ${data}`);
            }
        } catch (error) {
            this.handleWriteError(error as Error)
        }
    }

    // Реализация метода из абстрактного класса Reader

    read(url: string): void {
        try {
            if (this.checkAvailability(url)) {
                console.log(`HttpClient is reading from url: ${url}`);
            } else {
                console.log('URL not available');
            }
        } catch (error) {
            this.handleReadError(error as Error);
        }
    }

    // Реализация метода checkAvailability из Reader2
    checkAvailability(url: string): boolean {
        console.log(`Checking availability for URL: ${url}`);
        // Логика для проверки доступности URL
        return true;
    }

    // Реализация метода handleError из Reader2
    handleReadError(error: Error): void {
        console.log(`Error reading data: ${error.message}`);
    }
}
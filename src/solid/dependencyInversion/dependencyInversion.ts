// -------------------------------------------------------- Example №1 --------------------------------------------------------

/**
 * DIP in use
 */


// Abstraction for music api
interface MusicApi {
    getTrack(): void;
}

class YandexApi implements MusicApi {
    getTrack() {
        return 'Yandex music track';
    }
}

class SpotifyApi implements MusicApi {
    getTrack() {
        return 'Spotify track';
    }
}

class VkMusicApi implements MusicApi {
    getTrack() {
        return 'Vk music track track';
    }
}

class MusicController implements MusicApi {
    musicApi: MusicApi;

    constructor(musicApi: MusicApi) {
        this.musicApi = musicApi;
    }

    getTrack() {
        this.musicApi.getTrack();
    }
}


const App = (): void => {
    const musicApi = new MusicController(new VkMusicApi());

    musicApi.getTrack();
}

// -------------------------------------------------------- Example №2 --------------------------------------------------------


/**
 * Without DIP
 * In this example, consider an errorDecorator The above scenario works fine as long as you don't need to switch to a different logger in the near future.
 * But let's say you do — for better compatibility, pricing, etc.
 * */


class RedisLog {
    sendLog(logMessage: string): void {
        console.log(logMessage);
    }
}

class GrayLog {
    sendLog(logMessage: string): void {
        console.log(logMessage);
    }
}

const errorDecorator = (error: Error): void => {
    const log = new RedisLog();

    log.sendLog(JSON.stringify(error));
}

const main = (): void => {
    errorDecorator(new Error('Error message'));
}

/**
 * With DIP
 * Going a little deeper, we see that the issue arises because our errorDecorator function (which can be a class too) depends on the low-level implementation details of Loggers available.
 * We now know that the Dependency Inversion principle recommends relying on high-level abstractions instead of low-level implementation details.
 */


// So, let’s create an abstract module instead which should be the dependency of our errorDecorator function:
interface LoggerService {
    createLog: (logObject: object) => void;
}

class GrayLoggerService implements LoggerService {
    createLog(logObject: object) {
        const logMessage = JSON.stringify(logObject);
        const grayLog = new GrayLog();
        grayLog.sendLog(logMessage);
    }
}

class RedisLoggerService implements LoggerService {
    createLog(logObject: object) {
        const logMessage = JSON.stringify(logObject);
        const redisLog = new RedisLog();
        redisLog.sendLog(logMessage);
    }
}

// Instead of changing multiple implementation details, we have our separate LoggerServices which can be injected into the errorDecorator function

const errorDecorator2 = (error: Error, loggerService: LoggerService) => {
    loggerService.createLog(error);
};

const main2 = () => {
    errorDecorator2(new Error("Error Message"), new RedisLoggerService());
};

// -------------------------------------------------------- Example №3 --------------------------------------------------------


/**
 * Violating DIP
 */

class MySQLDatabase {
    query(sql: string) {
        console.log(`Executing query: ${sql}`);
    }
}

// Here, the UserService is tightly coupled to MySQLDatabase. Replacing MySQLDatabase with another database would require modifying the UserService class, violating DIP.
class UserService {
    private database: MySQLDatabase;

    constructor() {
        this.database = new MySQLDatabase();
    }

    getUser(id: string) {
        return this.database.query(id)
    }
}

/**
 * With DIP
 */

// Abstraction
interface Database {
    query(query: string): any;
}

// High-level module depends on abstraction
class UserService2 {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    getUser(id: string) {
        return this.database.query(id)
    }

}

// Low-level module implementing abstraction
class MySQLDatabase2 implements Database {
    query(sql: string) {
        console.log(`Executing query: ${sql}`);
        return {}; // Mocked result
    }
}

// Using Dependency Injection
const database = new MySQLDatabase();
const userService = new UserService2(database);

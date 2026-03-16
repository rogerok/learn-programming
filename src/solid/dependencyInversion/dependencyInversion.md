---
tags: [solid, dip, dependency-inversion, typescript, dependency-injection]
aliases: [DIP, Принцип инверсии зависимостей]
---

# Dependency Inversion Principle (DIP)

Dependency Inversion Principle states that high-level modules should not depend on low-level modules, but rather on abstractions. Secondly, abstraction should not depend on details.


### Key Concepts of DIP

1. **Inversion of Control:**
   High-level modules should control the behavior of low-level modules through abstractions, rather than directly depending on their implementations.
2. **Decoupling:**
   By introducing abstractions, you can replace or modify low-level implementations without affecting high-level modules. This improves flexibility and testability.
3. **Dependency Injection (DI):**
   DI is a common pattern to achieve DIP. Dependencies are injected into a class, rather than the class creating or managing its dependencies.

### Key Statements of DIP


| High-Level Module                                       | Low-Level Module                                                        | Abstraction                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------- |
| **Should not depend** on                                | **Should not depend** on                                                | **Both should depend on**       |
| The **business logic** or core part of your application. | Implementation details like specific classes, libraries, or frameworks. | Interfaces or abstract classes. |

---

### DIP in Action: Diagram

```text
Without DIP:
High-Level Module --> Low-Level Module (directly depends)

With DIP:
High-Level Module --> Abstraction <-- Low-Level Module
```



### Why DIP Matters

1. **Flexibility:** You can swap implementations without altering high-level logic.
2. **Testability:** Abstracted dependencies can be easily mocked or replaced during testing.
3. **Scalability:** Systems designed with DIP are easier to extend and refactor.


### Common Patterns to Implement DIP

1. **Dependency Injection (DI):** Pass dependencies as arguments to constructors, functions, or components.
2. **Service Locator:** Use a central registry to resolve dependencies.
3. **Inversion of Control (IoC):** Use frameworks or DI libraries to manage dependencies automatically.

---

## Практический пример из кода

### Пример 1: Music API

```typescript
// Абстракция
interface MusicApi {
    getTrack(): void;
}

// Реализации
class YandexApi implements MusicApi { getTrack() { return 'Yandex music track'; } }
class SpotifyApi implements MusicApi { getTrack() { return 'Spotify track'; } }
class VkMusicApi implements MusicApi { getTrack() { return 'Vk music track track'; } }

// MusicController зависит от абстракции, не от конкретного класса
class MusicController implements MusicApi {
    musicApi: MusicApi;

    constructor(musicApi: MusicApi) {
        this.musicApi = musicApi;
    }

    getTrack() {
        this.musicApi.getTrack();
    }
}

const app = () => {
    const musicApi = new MusicController(new VkMusicApi());
    musicApi.getTrack();
    // Сменить на Spotify: new MusicController(new SpotifyApi())
}
```

### Пример 2: Logger — без DIP и с DIP

```typescript
// БЕЗ DIP: errorDecorator жёстко привязан к RedisLog
class RedisLog {
    sendLog(logMessage: string): void { console.log(logMessage); }
}

const errorDecorator = (error: Error): void => {
    const log = new RedisLog(); // жёсткая зависимость — нельзя поменять без правки функции
    log.sendLog(JSON.stringify(error));
}

// С DIP: зависим от абстракции LoggerService
interface LoggerService {
    createLog: (logObject: object) => void;
}

class GrayLoggerService implements LoggerService {
    createLog(logObject: object) {
        const grayLog = new GrayLog();
        grayLog.sendLog(JSON.stringify(logObject));
    }
}

class RedisLoggerService implements LoggerService {
    createLog(logObject: object) {
        const redisLog = new RedisLog();
        redisLog.sendLog(JSON.stringify(logObject));
    }
}

// errorDecorator2 не знает, какой логгер используется
const errorDecorator2 = (error: Error, loggerService: LoggerService) => {
    loggerService.createLog(error);
};

// Легко переключиться на другой логгер
errorDecorator2(new Error("Error"), new RedisLoggerService());
errorDecorator2(new Error("Error"), new GrayLoggerService());
```

### Пример 3: Database — нарушение и соответствие DIP

```typescript
// НАРУШЕНИЕ: UserService жёстко зависит от MySQLDatabase
class UserService {
    private database: MySQLDatabase;

    constructor() {
        this.database = new MySQLDatabase(); // тесная связь — нарушение DIP
    }

    getUser(id: string) {
        return this.database.query(id);
    }
}

// СООТВЕТСТВИЕ DIP: зависим от абстракции Database
interface Database {
    query(query: string): any;
}

class UserService2 {
    private database: Database; // зависим от интерфейса

    constructor(database: Database) {
        this.database = database; // внедрение зависимости
    }

    getUser(id: string) {
        return this.database.query(id);
    }
}

class MySQLDatabase2 implements Database {
    query(sql: string) {
        console.log(`Executing query: ${sql}`);
        return {};
    }
}

// Легко тестировать с mock-базой:
// new UserService2(new MockDatabase())
const userService = new UserService2(new MySQLDatabase2());
```

### Пример 4: React-компонент с DIP

```tsx
// НАРУШЕНИЕ: прямая зависимость от реализации
const LoggerComp = () => {
    console.log("Component rendered!");
    return <div>Check the console!</div>;
};

const App = () => (
    <div><LoggerComp/></div>
);

// СООТВЕТСТВИЕ DIP: зависим от абстракции Logger
interface Logger {
    log(message: string): void;
}

const LoggerComponent = ({logger, msg}: { logger: Logger, msg: string }) => {
    logger.log(msg);
    return <div>Check the console!</div>;
};

class ConsoleLogger implements Logger {
    log(message: string) { console.log(message); }
}

const App2 = () => {
    const logger = new ConsoleLogger();
    return <LoggerComponent msg={'msg log'} logger={logger}/>;
};
```

---

## Ключевые моменты

- Высокоуровневый модуль не должен `new` создавать низкоуровневые зависимости
- Оба модуля зависят от интерфейса, а не друг от друга
- DIP реализуется через [[../OOP/dependencyInjection|Dependency Injection]]
- Делает код тестируемым — можно подменить реализацию на mock

## Связанные темы

- [[../OOP/dependencyInjection]] — паттерн DI как реализация DIP
- [[../OOP/interfaces]] — интерфейсы как абстракции для DIP
- [[openClosed]] — OCP и DIP часто используются вместе
- [[../solid-book/srp]] — SRP помогает определить что выносить в абстракцию

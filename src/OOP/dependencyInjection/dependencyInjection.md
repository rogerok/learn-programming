---
tags: [oop, dependency-injection, typescript, design-patterns]
aliases: [Инъекция зависимостей, DI]
---

# Инъекция зависимостей

Инъекция зависимостей — паттерн, который позволяет нам отделять компоненты, внедряя в их зависимости из внешних источников, а не создавая их внутри.

Этот подход способствует слабой связи, переиспользованию и тестированию в нашей кодовой базе.

### Constructor Injection

```typescript
class UserService {
  constructor(private userRepository: UserRepository) {}

  getUser(id: string) {
    return this.userRepository.getUserById(id);
  }
}

class UserRepository {
  getUserById(id: string) {
    // Retrieve user from the database
  }
}

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
```

В данном примере инъекция происходит с помощью конструктора класса. Класс ```UserService``` зависит от класса ```UserRepository```. Передавая экземпляр класса ```UserRepository``` в конструктор экземпляра класса ```userService```, мы устанавливаем зависимость между двумя классами. Это позволяет легко заменять логику работы с репозиторием, делая код более гибким и реюзабельным.

### Property injection

```typescript
class AuthService {
  private _userRepository!: UserRepository;

  set userRepository(userRepository: UserRepository) {
    this._userRepository = userRepository;
  }

  login(username: string, password: string) {
    // Perform authentication using the injected UserRepository
  }
}

const authService = new AuthService();
authService.userRepository = new UserRepository();
```

В этом способе зависимости внедряются с помощью публичных свойств класса. ```AuthService``` класс объявляет публичное свойство ```userRepository```, которое может быть экземпляром класса ```UserRepository```.

---

## Практический пример из кода

Внедрение репозитория через конструктор — сервис не зависит от конкретной реализации БД:

```typescript
interface User {
    name: string;
    age: number
}

interface UserRepo {
    getUsers(): User[];
}

class MongoUserRepo implements UserRepo {
    getUsers() {
        console.log('getting and returning data from mongo db')
        return [{name: 'Mongo DB', age: 15}];
    }
}

class SqlUserRepo implements UserRepo {
    getUsers() {
        console.log('getting and returning data from mysql db')
        return [{name: 'SQL DB', age: 18}];
    }
}

class UserService {
    userRepo: UserRepo;

    constructor(userRepo: UserRepo) {
        this.userRepo = userRepo; // зависимость приходит снаружи
    }

    filterUsersByAge(age: number): User[] {
        const users = this.userRepo.getUsers();
        return users.filter((val) => val.age === age)
    }
}

// Легко менять реализацию без изменения UserService
const sqlService = new UserService(new SqlUserRepo());
const mongoService = new UserService(new MongoUserRepo());
```

---

## Зачем это нужно

- **Тестируемость**: легко подставить mock-объект вместо реальной БД
- **Гибкость**: можно менять реализацию (SQL → Mongo) без правки сервиса
- **SOLID**: соответствует принципу [[../solid/dependencyInversionPrinciple|Dependency Inversion]] — зависить от абстракций, а не от конкретных классов

## Связанные темы

- [[interfaces]] — интерфейсы как контракт для DI
- [[agregation]] — агрегация как форма DI
- [[abstractClasses]] — абстрактные классы тоже используются как абстракции для DI

Источники:
* https://bespoyasov.ru/blog/di-ts-in-practice/

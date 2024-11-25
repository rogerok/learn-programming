## Инъекция зависимостей

Инъекция зависимостей - паттерн, который позволяет нам отделять компоненты, внедряя в их зависимости из внешних источников, а не создавая их внутри.

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

В этом способое зависимости внедряются с помощью публичных свойств класса. ```AuthService``` класс объявляет публичное свойство ```userRepository``` , которое может быть экземпляром класса ```UserRepository```


Источники:

* https://bespoyasov.ru/blog/di-ts-in-practice/

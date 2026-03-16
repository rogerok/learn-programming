---
tags: [oop, interfaces, typescript, contracts]
aliases: [Интерфейсы]
---

# Интерфейсы

Интерфейс — это способ описания формы (структуры) объекта. Интерфейсы определяют, какие свойства и методы должен иметь объект, но не описывают, как эти методы реализованы. Интерфейс, по сути, служит контрактом, который гарантирует, что объект будет содержать определённый набор свойств и методов.


### Пример интерфейса

Предположим, мы создаём систему для работы с различными видами пользователей. Нам нужно описать интерфейс для обычного пользователя.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  login(): void;  // метод, который будет реализовываться в классах
}

```



### Реализация интерфейса в классе

```ts
class AdminUser implements User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
  ) {}

  login(): void {
    console.log(`${this.name} logged in as admin`);
  }
}

```


Здесь класс `AdminUser` реализует интерфейс `User`, что означает, что он должен иметь все обязательные свойства и методы, указанные в интерфейсе. Важно заметить, что мы не пишем логику самого метода `login` в интерфейсе — интерфейс лишь указывает на то, что метод должен быть в классе.

### Преимущества интерфейсов в ООП


* **Абстракция**. Интерфейсы помогают отделить абстракцию от конкретной реализации. Это позволяет работать с объектами через их интерфейс, не зная их внутренней структуры.
* **Гибкость**. Интерфейсы позволяют создавать разные реализации для одного и того же контракта, что даёт возможность менять реализацию без изменения клиентского кода.
* **Полиморфизм**. Интерфейсы играют важную роль в поддержке полиморфизма. Мы можем работать с объектами разных типов, если они реализуют один и тот же интерфейс.
* **Типизация и безопасность**. TypeScript использует интерфейсы для проверки типов, обеспечивая высокую степень безопасности на этапе компиляции.



### Расширение интерфейсов

Интерфейсы могут быть расширены другими интерфейсами, что позволяет создавать более специализированные типы. Это важно, когда нужно добавлять дополнительные свойства без изменения существующих интерфейсов.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  login(): void;
}

interface AdminUser extends User {
  permissions: string[];
  manageUsers(): void;
}

class SuperAdmin implements AdminUser {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public permissions: string[],
  ) {}

  login(): void {
    console.log(`${this.name} logged in as super admin`);
  }

  manageUsers(): void {
    console.log(`${this.name} is managing users`);
  }
}

```

---

## Практический пример: Reader/Writer

Один класс может реализовывать несколько интерфейсов одновременно:

```typescript
interface Reader {
    read(url: string): void;
}

interface Writer {
    write(data: []): void;
}

// implements Writer, Reader — реализует оба контракта
class FileClient implements Writer, Reader {
    read(url: string): void {
        console.log(`File client is reading url: ${url}`);
    }

    write(data: []): void {
        console.log(`File client is writing data: ${data}`);
    }
}

class HttpClient implements Writer, Reader {
    read(url: string): void {
        console.log(`Http client is reading url: ${url}`);
    }

    write(data: []): void {
        console.log(`Http client is writing data: ${data}`);
    }
}
```

## Обобщённый интерфейс (Generics)

```typescript
interface GenericRepository<T> {
    create(data: T): void;
    get(data: T): void;
    delete(data: T): void;
    update(data: T): void;
}

class UserRepo2 implements GenericRepository<User> {
    create(user: User): void { console.log(`User created`); }
    delete(user: User): void { console.log(`User deleted`); }
    get(user: User): void { console.log(`User fetched`); }
    update(user: User): void { console.log(`User updated`); }
}
```

---

## Ключевые моменты

- `interface` — только контракт, без реализации
- `implements` — класс обязуется реализовать все методы интерфейса
- Один класс может `implements` несколько интерфейсов
- Интерфейс может `extends` другой интерфейс
- В отличие от [[abstractClasses|абстрактных классов]] — нет состояния и реализации методов

## Связанные темы

- [[abstractClasses]] — абстрактные классы vs интерфейсы
- [[polymorphism]] — интерфейсы как основа полиморфизма
- [[dependencyInjection]] — зависимость от интерфейса, а не от класса

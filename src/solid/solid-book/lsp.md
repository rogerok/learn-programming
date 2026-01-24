# [Принцип подстановки Барбары Лисков](https://solidbook.vercel.app/lsp)

Принцип вводит ограничение на иерархии объектов.
**Функции, которые используют базовый тип, должны иметь возможность использовать подтипы базового типа, не зная об этом**

Т.е. классы-наследники, не должны противоречить. Они не могут предоставлять интерфейс ýже базового.

Немного удобнее думать об LSP в терминах «абстракция — реализация». Абстрактный класс или интерфейс играют роль базового типа, но вместе с этим — роль контракта на поведение.
Они гарантируют, что экземпляр любого конкретного класса будет содержать указанные поля и методы.

Это значит, что модуль, использующий этот абстрактный класс или интерфейс сможет работать с любой его реализацией. Например, функции cleanup будет неважно, экземпляр какого конкретного класса мы передадим:

```ts
function cleanup(disposable: Disposable): void {
  disposable.dispose();
}

const interval = new Interval(() => console.log("Hey!"), 1000);
const timer = new Timer(() => alert("Hey!"), 1000);

cleanup(interval);
cleanup(timer);
```

Принцип подстановки Лисков требует использовать общий интерфейс для обоих классов и не наследовать `Square` от `Rectangle`.

## В реальной жизни

Наследование предполагает иерархическую структуру сущностей, но с такими структурами есть проблемы - например когда одна из сущностей не вписывается в иерархию
Индикатор такой проблемы — проверки на принадлежность типу или классу перед выполнением какой-то операции или перед возвращением результата.

### Иерархия пользователей

Есть класс `User`, описывающий сущность пользователя приложения, он содержит методы для работы с сессией, определением прав этого пользователя, и обновлением профиля.

```ts
class User {
  constructor() {
    // ...
  }

  getSessionID(): ID {
    return this.sessID;
  }

  hasAccess(action: Actions): boolean {
    // ...
    return access;
  }

  updateProfile(data: Profile): CommandStatus {
    // ...
    return status;
  }
}
```

В какой-то момент в приложении появляется "гостевой режим". У гостей ограниченные права и нет профиля. Из-за отсутствия профиля в классе `Guest` метод `updateProfile` усиливал своё предусловие

```ts
class Guest extends User {
  constructor() {
    super();
  }

  hasAccess(action: Actions): boolean {
    return access;
  }

  updateProfile(data: Profile): CommandStatus {
    // А вот тут проблема: у гостей профиля нет,
    // из-за чего приходится выбрасывать исключение.
    // Гостевой режим как бы заставляет нас учитывать большее количество
    // обстоятельств, прежде чем выполнить обновление профиля:

    throw new Error(`Guests don't have profiles`);
  }
}
```

### Применяем LSP

Согласно LSP, `Guest` должен быть заменяем на класс, от которого наследуется, а приложение не должно падать.

Введем общий интерфейс `User`

```ts
interface User {
  getSessionID(): ID;
}
```

Для описания доступов и работы с данными профиля создадим отдельные интерфейсы `UserWithAccess` и `UserWithProfile`

```ts
interface UserWithAccess {
  hasAccess(action: Actions): boolean;
}

interface UserWithProfile {
  updateProfile(data: Profile): CommandStatus;
}
```

Опишем базовый класс, от которого будут наследоваться остальные классы гостей и пользователей

```ts
class BaseUser implements User {
  constructor() {}

  getSessionID(): ID {
    return this.sessID;
  }
}

// У обычных пользователей добавляем методы
// для работы с профилем и для работы с доступами:

class RegularUser extends BaseUser implements UserWithAccess, UserWithProfile {
  constructor() {
    super();
  }

  hasAccess(action: Actions): boolean {
    return access;
  }

  updateProfile(data: Profile): CommandStatus {
    return status;
  }
}

// Для гостей достаточно описать только доступы:

class Guest extends BaseUser implements UserWithAccess {
  constructor() {
    super();
  }

  hasAccess(action: Actions): boolean {
    return access;
  }
}
```

## Шаблоны проектирования и приёмы рефакторинга

### Контрактное программирование

Контрактное программирование - метод проектирования, при котором проектировщики четко определяют и формализуют спецификации отношений между объектами

Спецификации могут описывать интерфейсы методов, пред и постусловия, описание проверок и критерии соответствия.
Такие спецификации называются контрактом.

В примере ниже интерфейс `Contract` описывает методы для проверки предусловия `require` и постусловия `ensure`. Класс `ContractAssert` реализует этот интерфейс, определяя какие исключения следует сгенерировать при нарушении условий.
Класс `ContractAssert` реализует интерфейс, определяя какие исключения следует сгенерировать при нарушении условий.

```ts
interface Contract {
  require(expression: boolean, msg?: string): void;
  ensure(expression: boolean, msg?: string): void;
}

class ContractAssert implements Contract {
  require(expression: boolean, msg?: string): void {
    if (!expression) {
      throw new PreconditionException(msg);
    }
  }

  ensure(expression: boolean, msg?: string): void {
    if (!expression) {
      throw new PostconditionException(msg);
    }
  }
}
```

Опишем исключения, наследуясь от стандартного `Error`. Класс `PreconditionException` отвечает за исключение при нарушении предусловия, `PostconditionException` - за нарушение постусловия.

```ts
class ContractException extends Error {
  constructor(msg?: string) {
    super(`contract error: ${msg}`);
  }
}

class PreconditionException extends ContractException {
  constructor(msg?: string) {
    super(`precondition failed, ${msg}`);
  }
}

class PostconditionException extends ContractException {
  constructor(msg?: string) {
    super();
  }
}
```

Теперь если нам потребуется написать сумматор, который работает только с чётными числами, то мы можем проверять пред- и постусловия через контракт:

```ts
class EvenNumbersSumator {
  contract: Contract;

  constructor(contract: Contract = new ContractAssert()) {
    this.contract = contract;
  }

  add(a: number, b: number): number {
    // Перед работой проверяем все предусловия:

    this.contract.require(a % 2 === 0, "first arg is not even");
    this.contract.require(b % 2 === 0, "second arg is not even");

    const result = a + b;

    //   Перед тем, как вернуть результат проверяем постусловия

    this.contract.ensure(result % 2 === 0, "result is not event");
    this.contract.ensure(result === a + b, "result is not equal to expected");

    return result;
  }
}
```

Теперь метод не начнёт свою работу, если какое-то из предусловий будет нарушено, как и не вернёт результат, если будет нарушено постусловие.

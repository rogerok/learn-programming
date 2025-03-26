## Type VS Interface

### Интерфейсы

Интерфейсы в TypeScript используются для описания структуры объектов. Они определяют, какие свойства и методы должны
быть у объекта
Интерфейсы могут быть расширены для добавления новых свойств:

```typescript
interface Admin extends User {
    role: string;
}

const admin: Admin = {
    id: 1,
    name: "Alice",
    role: "superadmin",
};
```

Интерфейсы также позволяют типизировать функции, задавая их сигнатуру.

```typescript
interface CalculateArea {
    (width: number, height: number): number;
}

const calculateArea: CalculateArea = (width, height) => {
    return width * height;
};

const area = calculateArea(5, 10); // 50
console.log(`The area is ${area}`);
```

---

### Типы

Типы (или алиасы типов) предоставляют более универсальный инструмент для работы с типизацией. TypeScript предоставляет
широкие возможности для работы с типами, включая литералы, примитивы, кортежи, объединения, отображаемые типы и многое
другое.

#### Литеральные типы (Literal Types)

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type StatusCode = 200 | 400 | 404 | 500;
type MagicWord = "Abracadabra";

const method: HttpMethod = "POST"; // допустимо
const status: StatusCode = 200; // допустимо
const magic: MagicWord = "Abracadabra"; // допустимо
```

#### Примитивные типы (Primitive Types)

```typescript
type UserName = string;
type IsLoggedIn = boolean;
type UserId = number;

const userName: UserName = "Alice";
const isLoggedIn: IsLoggedIn = true;
const userId: UserId = 123;
```

#### Кортежи (Tuples)

```typescript
type Coordinates = [x: number, y: number];
type ApiResponse = [status: StatusCode, message: string];

const point: Coordinates = [10, 20];
const response: ApiResponse = [200, "Success"];
```

#### Объединения (Union Types)

```typescript
type Some = 1 | 'string'
```

#### Пересечения (Intersection)

Подобно интерфейсам типы позволяют определять новый тип, расширяющий существующий с помощью пересечения:

```typescript
type Admin = User & {
    role: string;
};

const admin: Admin = {
    id: 3,
    name: "Charlie",
    role: "moderator",
};
```

#### Отображаемые типы (Mapped Types)

Отображаемые типы позволяют создавать новые типы на основе существующих, модифицируя их свойства.

```typescript
type ReadOnly<T> = { readonly [P in keyof T]: T[P] };

type User = {
    id: number;
    name: string;
    email: string;
};

type ReadOnlyUser = ReadOnly<User>;

const user: ReadOnlyUser = {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
};

// user.id = 2; // Ошибка: Свойство только для чтения
```

#### Функции (Functions)

```typescript
type PerformAction = (action: "Run" | "Jump" | "Attack", target: string) => void;

const performAction: PerformAction = (action, target) => {
    console.log(`${action} performed on ${target}`);
};

performAction("Run", "enemy");
```

_Фактически выбор между интерфейсами и типами встает только в случае типизации объектов или функций, т.к. для всего
остального типы - это оптимальный выбор._

---

### Производительность

В документации сказано, что использование расширений интерфейсов дает большую производительность, чем пересечение типов.
Важно понимать, что мы не говорим о производительности веб-приложения или сайта. Это касается только процесса
разработки (так называемый developer experience - DX) и разговор только о скорости компиляции тайпскрипт кода.

---

### Declaration Merging

Характерно *только для интерфейсов*.
В базовом примере это работает следующим образом: если вы объявляете интерфейсы с одинаковыми именами несколько раз,
TypeScript автоматически объединит их в _один_ интерфейс.

```typescript
interface Vehicle {
    make: string;
    model: string;
}

interface Vehicle {
    wheels: number;
    isElectric: boolean;
}

const bike: Vehicle = {
    make: "Yamaha",
    model: "MT-07",
    wheels: 2,
    isElectric: false,
};

const tesla: Vehicle = {
    make: "Tesla",
    model: "Model 3",
    wheels: 4,
    isElectric: true,
};
```

---

### Обработка ошибок

```typescript
interface Person {
    name: string;
    age: string;
}

interface IPerson extends Person {
    age: number;
}
```

В примере выше мы пытаемся переопределить тип переменной age и такое действие вызовет ошибку совместимости типов.

При похожем случае, но с использованием *типов* мы не получим ошибку, а тип переменной age станет never, что является
абсолютно бесполезным.

```typescript
type TPerson = Person & { age: number; };  // нет ошибки, для age тип never
```

---

### Index Signature

Отличие заключается в том, что псевдонимы типов имеют неявную сигнатуру индекса, а интерфейсы —
нет.

```typescript
interface Animal {
    name: 'some animal'
}

declare const animal: Animal;

const handleRecord = (obj: Record<string, string>) => {
}

const result = handleRecord(animal)
```

В этом примере handleRecord(animal) выдаст нам сообщение об ошибке.

_Ошибка возникает из-за того, что интерфейсы могут быть расширены путём объединения объявлений, и нет гарантии, что
новые
свойства `Animal` будут соответствовать `Record<string,string>`._

Чтобы исправить это, нам нужно либо явно добавить сигнатуру индекса в `Animal` или использовать *тип* вместо интерфейса:

```typescript
interface Animal {
    name: 'some animal'

    [key: string]: string
}

type Animal = {
    name: 'some animal'
}
```
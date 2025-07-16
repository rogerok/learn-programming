# [Type-level программирование в TypeScript: практические кейсы и обзор возможностей](https://habr.com/ru/articles/871336/)

**Распределительные условные типы (Distributive Conditional Types)**

Когда `T` это union-тип (`string | number`), условный тип применяется к каждому элементу

```typescript
type WrapInArray<T> = T extends any ? T[] : never;
type MyType = WrapInArray<string | number>;
// MyType: string[] | number[] 

type WrapInArrayIfString<T> = T extends string ? T[] : never;
type MyStringType = WrapInArrayIfString<string>;
// MyStringType: string[]

type ShouldBeNever = WrapInArrayIfString<{}>;
// ShouldBeNever: never
```

**Шаблонные литералы типов (Template Literal Types)**
Разрешают склеивать строковые литералы на уровне типов

```typescript
type IdType<T extends string> = `ID_${T}`
type UserIdType = IdType<'user'>
// UserIdType: "ID_user"
```

**Пример 1: Проверка совместимости типов**
Допустим у нас есть два интерфейса, и мы хотим убедиться что они совместимы на уровне типа.

```typescript
type EnsureCompability<A, B> = A extends B ? true : false;

interface IUser {
    id: number;
    name: string;
}

interface IPerson {
    name: string;
}

type Result = EnsureCompatibility<IUser, IPerson>;
// Result: true
// IUser содержит все поля IPerson

type Result2 = EnsureCompability<IPerson, IUser>;
// Resukt: false
// IPerson не содержит все поля IUser
```

Компилятор не выдаёт в данном случае ошибки, но эти конструкции можно использовать для генерации новых типов или
использовать never, что приведёт к ошибке компилятора.

**Пример 2: Генерация API методов на основе конфигурации (type-safe роутинг)**

```typescript
// Каждая запись описывает метод (GET, POST и тд) и путь
// Для простоты пусть путь содержит ID-часть

interface RouteConfig {
    path: string;
    method: "GET" | "POST";
    hasIdParam: boolean;
}

type Routes = {
    getUsers: RouteConfig;
    getUserById: RouteConfig;
    createUser: RouteConfig;
}

const routes = {
    getUsers: {
        path: "/users",
        method: "GET",
        hasIdParam: false,
    },
    getUserById: {
        path: "/users",
        method: "GET",
        hasIdParam: true,
    },
    createUser: {
        path: "/users",
        method: "POST",
        hasIdParam: false,
    }
} as const satisfies Routes;
```

Комбинация `as const satisfies Routes`:

1) Даёт проверку, что объект `routes` корректно реализует структуру `Routes`.
2) `as const` фиксирует все значения в объекте как литералы. То есть `hasIdParam` становится типом `true` или `false` (
   не просто boolean)

**Генерация функции на уровне типов**

```typescript
type ClientFunction<T extends RouteConfig> = T['hasParamId'] extends true ? (id: string) => Promise<string> : () => Promise<string>

type Client<T extends Record<string, RouteConfig>> = {
    [K in keyof T]: ClientFunction<T[K]>
}

const createClient = <T extends Record<string, RouteConfig>>(config: T): Client<T> => {
    const entries = Object.entries(config).map(([key, route]) => {
        const fn = route.hasIdParam ? (id: number) => Promise.resolve(`${route.method} ${route.path}/${id} was called`) : () => Promise.resolve(`${route.method} ${route.path} was called`)

        return [key, fn]
    })

    return Object.fromEntries(entries);

}

const apiClient = createClient(routes);

apiClient.getUsers().then(console.log);
// "GET /users was called!"

apiClient.getUserById(123).then(console.log);
// "GET /users/123 was called!"

apiClient.createUser().then(console.log);
// "POST /users was called!"
```

**Пример 3: Генерация сообщений об ошибках**

```typescript
type ValidateRequired<T, K extends keyof T & string> = undefined extends T[K] ? `Error: field ${K} is optional, but required` : true;

interface FormData {
    name: string;
    age?: number;
}

type ValidateName = ValidateRequired<FormData, "name">;
type ValidateAge = ValidateRequired<FormData, "age">;
// "Error: Field \"age\" is optional, but is required."
```

**Пример 4: Программирование на типах со сложными условиями**
Можем реализовать тип `Flatten<T>`, который рекурсивно разворачивает массив

```typescript
type Flatten<T> = T extends (infer U)[] ? U extends any[] ? Flatten<U> : U : T;
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

// T является массивом ? тогда дёргаем его тип U и проверяем является ли он массивом? Дальше рекурсивно разворачиваем его
```

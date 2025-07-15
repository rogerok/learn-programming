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

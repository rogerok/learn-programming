---
tags: [oop, singleton, design-patterns, typescript]
aliases: [Синглтон, Singleton]
---

# Синглтон

Синглтон — паттерн проектирования, который обеспечивает то, что только один объект определённого типа существует и обеспечивает единую точку доступа к нему из любой части кода.

Конструктор синглтона должен всегда быть объявлен приватным, для избежания создания нового экземпляра класса.

```typescript
class Singleton {
 static #instance: Singleton;
 private constructor(){}

}
```

---

## Практические примеры из кода

### Проблема без синглтона

```typescript
class Database {
    url: number;
    constructor() {
        this.url = Math.random()
    }
}

// Каждый new создаёт разные объекты — разные url
const db1 = new Database();
const db2 = new Database();
console.log(db1.url, db2.url); // разные значения
```

### Синглтон через статическое свойство

```typescript
class DatabaseSingleton {
    url: number;
    private static instance: DatabaseSingleton;

    constructor() {
        if (DatabaseSingleton.instance) {
            return DatabaseSingleton.instance; // вернём существующий
        }
        this.url = Math.random();
        DatabaseSingleton.instance = this;
    }
}

const dbSingleton1 = new DatabaseSingleton();
const dbSingleton2 = new DatabaseSingleton();
// Значения будут равны — один и тот же экземпляр
console.log(dbSingleton1.url, dbSingleton2.url);
```

### Синглтон с приватным конструктором (рекомендуемый способ)

```typescript
class DatabaseSingletonPrivate {
    private static instance: DatabaseSingletonPrivate;
    url: number;

    // Приватный конструктор — нельзя создать через new извне
    private constructor() {
        this.url = Math.random();
    }

    // Единственный способ получить экземпляр
    public static get getInstance(): DatabaseSingletonPrivate {
        if (!DatabaseSingletonPrivate.instance) {
            DatabaseSingletonPrivate.instance = new DatabaseSingletonPrivate();
        }
        return DatabaseSingletonPrivate.instance;
    }

    public someBusinessLogic() {
        console.log('some logic');
    }
}

const s1 = DatabaseSingletonPrivate.getInstance;
const s2 = DatabaseSingletonPrivate.getInstance;
s1.someBusinessLogic();
console.log(s1 === s2); // true — один объект
```

---

## Когда использовать синглтон

- Подключение к базе данных (один connection pool)
- Logger (один логгер на приложение)
- Конфигурация приложения
- Cache-объект

## Ключевые моменты

- `private constructor` — главный признак синглтона
- `static instance` — хранит единственный экземпляр
- Доступ только через `static` метод или геттер
- Антипаттерн в тестах — усложняет mock'инг

## Связанные темы

- [[encapsulation]] — private конструктор как инкапсуляция
- [[../solid/singleResponsibilityPrinciple|Single Responsibility]] — синглтон должен отвечать за одно
- [[allPrinciplesDemo]] — пример синглтона в комплексном коде

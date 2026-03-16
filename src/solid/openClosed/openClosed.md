---
tags: [solid, ocp, open-closed, typescript, polymorphism]
aliases: [OCP, Принцип открытости-закрытости]
---

# Open-Closed Principle (OCP)

The open-closed principle states that software entities (classes, modules, functions, and so on) should be **open for extension, but closed for modification**.

Модули надо проектировать так, чтобы их требовалось менять как можно реже, а расширять функциональность можно было с помощью создания новых сущностей и композиции их со старыми.

### About

* **Open for extension:** Design your code so it's easy to extend. Avoid tightly coupling components — use interfaces or abstract classes to define behavior.
* **Closed for modification:** Avoid modifying existing code whenever possible. Encapsulate components and keep their implementation details hidden.

### How to implement

* **Inheritance and polymorphism:** Define abstract classes or interfaces, create subclasses that implement different behaviors — new functionality via new classes, not changes to existing ones.
* **Dependency injection:** Depend on abstractions rather than concrete implementations.

**Индикатор нарушения OCP** — появление `instanceof` внутри кода модуля.

---

## Практический пример: оружие

### Нарушение OCP

```typescript
class Weapon {
    type: string;
    damage: number;
    range: number;

    attack() {
        // Каждый новый тип оружия требует изменения этого метода
        if (this.type === 'sword') {
            console.log(`Attack with sword ${this.damage}`);
        } else if (this.type === 'crossbow') {
            console.log(`Attack with crossbow ${this.damage}`);
        }
        // Добавить 'axe'? Придётся менять этот класс — нарушение OCP
    }
}
```

### Соответствие OCP

```typescript
interface Attacker {
    attack: () => void;
}

class Weapon2 implements Attacker {
    constructor(public type: string, public damage: number, public range: number) {}
    attack() {} // базовый класс
}

// Новые типы оружия — новые классы, не изменение Weapon2
class Sword extends Weapon2 {
    attack() {
        console.log(`Melee attack with damage ${this.damage} by ${this.type}`);
    }
}

class Crossbow extends Weapon2 {
    attack() {
        console.log(`Range attack with damage ${this.damage} by ${this.type}`);
    }
}

// Character не меняется при добавлении новых видов оружия
class Character {
    constructor(private name: string, private weapon: Weapon2) {}

    changeWeapon(newWeapon: Weapon2) { this.weapon = newWeapon; }
    attack() { this.weapon.attack(); }
}

const warrior = new Character('warrior', new Sword('sword', 15, 2));
warrior.attack();
warrior.changeWeapon(new Crossbow('crossbow', 10, 15));
warrior.attack();
```

---

## React-пример: уведомления (NotificationComponent)

### Нарушение OCP

```tsx
// Добавить 'warning' — нужно менять компонент
const Notification = ({type, message}: NotificationProps) => {
    if (type === "success") {
        return <div style={{color: "green"}}>{message}</div>;
    } else if (type === "error") {
        return <div style={{color: "red"}}>{message}</div>;
    } else {
        throw new Error("Unknown notification type");
    }
};
```

### Соответствие OCP — расширение через объект

```tsx
const notificationStyles: Record<string, CSSProperties> = {
    success: {color: "green"},
    error: {color: "red"},
    warning: {color: "orange"}, // добавили без изменения компонента
};

const Notification2 = ({type, message}: NotificationProps2) => {
    const style = notificationStyles[type];
    return <div style={style}>{message}</div>;
};
```

### Соответствие OCP — расширение через компоненты

```tsx
const NotificationMap: Record<string, FC<NotificationProps3>> = {
    success: SuccessNotification,
    error: ErrorNotification,
    warning: WarningNotification, // новый тип = добавить в map
};

const NotificationWrapper = ({type, message}: NotificationWrapperProps) => {
    const Component = NotificationMap[type];
    return <Component message={message}/>;
};
```

## OCP через полиморфизм в store

```typescript
// Нарушение: тип фиксирован
type NotificationType = { type: "success" | "error"; message: string; };

// Решение: работаем с абстракцией
interface Notification {
    render(): string;
}

class SuccessNotification implements Notification {
    constructor(private message: string) {}
    render() { return `Success: ${this.message}`; }
}

class NotificationStore2 {
    notifications: Notification[] = [];

    // Метод не меняется при добавлении новых типов
    addNotification(notification: Notification) {
        this.notifications.push(notification);
    }
}

// Новый тип = новый класс
class WarningNotification implements Notification {
    constructor(private message: string) {}
    render() { return `Warning: ${this.message}`; }
}
```

---

## OCP-пример: фильтрация списков

Пример из `listExample/` — компонент ItemList с OCP-подходом:

```typescript
// ItemFilterModel.ts — интерфейс-контракт
interface ItemFilter {
    apply(items: string[]): string[];
}

// StartsWithFilter — новый фильтр без изменения компонента
class StartsWithFilter implements ItemFilter {
    constructor(private letter: string) {}
    apply(items: string[]): string[] {
        return items.filter((item) => item.startsWith(this.letter));
    }
}

// LengthFilter — ещё один новый фильтр
class LengthFilter implements ItemFilter {
    constructor(private minLength: number) {}
    apply(items: string[]): string[] {
        return items.filter((item) => item.length >= this.minLength);
    }
}

// Компонент ItemList2 не меняется при добавлении новых фильтров
const ItemList2 = ({items, filter}: { items: string[]; filter: ItemFilter }) => {
    const filteredItems = filter.apply(items);
    return <ul>{filteredItems.map((item, i) => <li key={i}>{item}</li>)}</ul>;
};
```

---

## Ключевые моменты

- `instanceof` внутри метода = сигнал нарушения OCP
- Новое поведение = новые классы, не изменение старых
- Абстракции (интерфейсы/абстрактные классы) — инструмент OCP
- Паттерны: Стратегия, Декоратор, Фабрика — все помогают OCP

## Связанные темы

- [[../OOP/polymorphism]] — полиморфизм как основа OCP
- [[../OOP/interfaces]] — абстракции для точки расширения
- [[dependencyInversion]] — DIP дополняет OCP
- [[../solid-book/ocp]] — углублённый разбор OCP из книги

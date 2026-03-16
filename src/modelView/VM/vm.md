---
tags: [vm, viewmodel, architecture, design-patterns, typescript, mobx]
aliases: [ViewModel, VM паттерн]
---

# ViewModel (VM)

**ViewModel** — паттерн, при котором логика представления выносится в отдельный класс. VM знает о Model, но не знает о конкретном View. View привязывается к VM.

## Зачем нужен ViewModel

Без VM логика представления попадает в компоненты:
- форматирование данных (`user.name.toUpperCase()`) — в JSX
- фильтрация (`tasks.filter(t => !t.completed)`) — в компоненте
- валидация формы — там же

С VM это всё переезжает в отдельный тестируемый класс.

---

## Структура ViewModel

```typescript
// Model — чистые данные
interface User {
    id: string;
    firstName: string;
    lastName: string;
    birthYear: number;
    role: 'admin' | 'user';
}

// ViewModel — логика представления
class UserViewModel {
    private user: User;

    constructor(user: User) {
        this.user = user;
        makeObservable(this);
    }

    // Форматирование для UI
    get fullName(): string {
        return `${this.user.firstName} ${this.user.lastName}`;
    }

    get age(): number {
        return new Date().getFullYear() - this.user.birthYear;
    }

    get isAdmin(): boolean {
        return this.user.role === 'admin';
    }

    // Состояние формы редактирования
    isEditing = false;

    startEditing(): void {
        this.isEditing = true;
    }

    save(firstName: string, lastName: string): void {
        this.user.firstName = firstName;
        this.user.lastName = lastName;
        this.isEditing = false;
    }
}
```

## Использование в React

```tsx
const UserCard = observer(({vm}: {vm: UserViewModel}) => (
    <div>
        <h2>{vm.fullName}</h2>
        <p>Возраст: {vm.age}</p>
        {vm.isAdmin && <span>Администратор</span>}
        {vm.isEditing
            ? <EditForm vm={vm} />
            : <button onClick={() => vm.startEditing()}>Редактировать</button>
        }
    </div>
));
```

---

## ViewModel в MobX Store

MobX Store — это ViewModel на уровне приложения:

```typescript
class TaskListViewModel {
    tasks: TaskModel[] = [];
    filter: 'all' | 'active' | 'done' = 'all';
    searchQuery = '';

    constructor() {
        makeObservable(this);
    }

    // Вычисляемое отображение задач (без логики в компоненте)
    get filteredTasks(): TaskModel[] {
        return this.tasks
            .filter(task => {
                if (this.filter === 'active') return !task.completed;
                if (this.filter === 'done') return task.completed;
                return true;
            })
            .filter(task =>
                task.title.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
    }

    get summary(): string {
        return `${this.filteredTasks.length} задач из ${this.tasks.length}`;
    }

    setFilter(filter: 'all' | 'active' | 'done'): void {
        this.filter = filter;
    }

    setSearchQuery(query: string): void {
        this.searchQuery = query;
    }
}
```

---

## ViewModel vs Controller

| | Controller (MVC) | ViewModel (MVVM) |
|---|---|---|
| Знает о View? | Да, обычно | Нет |
| Двусторонняя привязка | Нет | Да |
| Тестируется без UI | Сложно | Легко |
| Состояние UI | Обычно не хранит | Хранит (isEditing, filter...) |

---

## Ключевые моменты

- VM — это не Model и не Controller: это слой **логики представления**
- VM хранит **состояние UI** (открыт ли модал, какой фильтр выбран)
- VM легко тестируется — нет зависимости от DOM или React
- В MobX: `makeObservable` + `@computed` + `@action`

## Связанные темы

- [[../MVVM/MVVM]] — MVVM паттерн
- [[../MVC/mvc]] — MVC как предшественник
- [[../MVC/taskExample/frontend/taskExample-frontend]] — VM на практике (TaskStore)

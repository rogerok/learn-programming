---
tags: [mvc, mvvm, tasks, mobx, react, typescript]
aliases: [Task MVC Frontend, Task MobX React]
---

# Task Manager — MVC/MVVM с MobX + React

Frontend-версия Task Manager. Использует MobX для реактивности — модель ближе к MVVM: Store выступает как ViewModel.

## Схема

```
TaskListView (React observer)
    ↕ реактивно
TaskStore (MobX observable) — Model + ViewModel
    ↑
TaskModel (данные одной задачи)
```

---

## TaskModel (модель одной задачи)

```typescript
import {makeObservable} from "mobx";

export class TaskModel {
    id: string;
    title: string;
    completed: boolean;

    constructor(id: string, title: string, completed: boolean = false) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        makeObservable(this); // регистрируем в MobX
    }

    toggleCompletion = (): void => {
        this.completed = !this.completed; // MobX отслеживает это изменение
    }
}
```

## TaskStore (Model + ViewModel)

```typescript
import {TaskModel} from "./TaskModel.ts";
import {makeObservable} from "mobx";

export class TaskStore {
    tasks: TaskModel[] = [];

    constructor() {
        makeObservable(this);
    }

    addTask(title: string) {
        const newTask = new TaskModel(Date.now().toString(), title);
        this.tasks.push(newTask);
    }

    removeTask(id: string) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    // Вычисляемые значения (как computed в MobX)
    get completedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    get pendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }
}

export const taskStore = new TaskStore(); // синглтон-стор
```

## TaskListView (React компонент)

```tsx
import React from "react";
import {observer} from "mobx-react-lite";
import {taskStore} from "./TaskStore";

// observer() — компонент перерисовывается при изменениях в store
const TaskListView = observer(() => {
    const {tasks, addTask, removeTask} = taskStore;

    const handleAddTask = () => {
        const title = prompt("Enter task title:");
        if (title) {
            addTask(title);
        }
    };

    return (
        <div>
            <h1>Task List</h1>
            <button onClick={handleAddTask}>Add Task</button>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <span
                            style={{textDecoration: task.completed ? "line-through" : "none"}}
                            onClick={() => task.toggleCompletion()} // прямой вызов метода модели
                        >
                            {task.title}
                        </span>
                        <button onClick={() => removeTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
});
```

---

## Сравнение с классическим MVC

| | Классический (Observer) | MobX + React |
|---|---|---|
| Паттерн | MVC + ручной Observer | MVVM (MobX автоматизирует Observer) |
| Реактивность | Ручная: `notifyObservers()` | Автоматическая: MobX отслеживает чтения |
| View | Ручной `render()` | React + `observer()` |
| Связь View-Store | Явный `addObserver` | Неявный через `observer()` |

---

## Ключевые моменты

- `makeObservable(this)` — регистрирует класс в MobX
- `observer()` — HOC, делающий React-компонент реактивным
- Store = синглтон (`export const taskStore = new TaskStore()`)
- `get completedTasks` — computed-значение, пересчитывается автоматически

## Связанные темы

- [[classicWay/taskExample-classic]] — тот же пример без MobX
- [[../../MVVM/MVVM]] — MVVM паттерн
- [[../mvc]] — теория MVC

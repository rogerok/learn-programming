---
tags: [mvc, tasks, observer, pattern, typescript, node]
aliases: [Task MVC классический, MVC Observer]
---

# Task Manager — классический MVC с Observer

Пример MVC для Node.js/консольного приложения. Используется паттерн **Observer**: Model уведомляет подписчиков об изменениях, не зная о View напрямую.

## Схема

```
entryPoint.ts
    ↓
TaskController → TaskModel → уведомляет Observer → TaskView.render()
                                  ↑
                            (Model не знает о View, только вызывает колбэки)
```

---

## Task и TaskModel (с Observer)

```typescript
type Observer = (model: TaskModel) => void;

class Task {
    constructor(
        public id: number,
        public title: string,
        public completed: boolean = false
    ) {}
}

export class TaskModel {
    private tasks: Task[] = [];
    private observers: Observer[] = [];

    private notifyObservers(): void {
        this.observers.forEach(observer => observer(this));
    }

    // Подписка — Controller добавляет View как Observer
    addObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    addTask(title: string): void {
        const task = new Task(this.tasks.length + 1, title);
        this.tasks.push(task);
        this.notifyObservers(); // автоматически уведомляем всех
    }

    toggleTask(id: number): void {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.notifyObservers();
        }
    }

    getTasks(): Task[] {
        return this.tasks;
    }
}
```

## TaskView

Пассивный — только рендерит, ничего не инициирует:

```typescript
export class TaskView {
    render(model: TaskModel): void {
        console.log("\n=== Task List ===");
        model.getTasks().forEach(task => {
            const status = task.completed ? "✔" : "✖";
            console.log(`${task.id}: ${task.title} [${status}]`);
        });
        console.log("=================\n");
    }
}
```

## TaskController

Связывает Model и View через Observer:

```typescript
export class TaskController {
    constructor(private model: TaskModel, private view: TaskView) {
        // Подписываем View на изменения Model
        this.model.addObserver((model) => this.view.render(model));
    }

    addTask(title: string): void {
        this.model.addTask(title); // → Model → notifyObservers → View.render()
    }

    toggleTask(id: number): void {
        this.model.toggleTask(id);
    }

    showMenu(): void {
        // Интерактивное консольное меню через readline
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const showOptions = () => {
            console.log("1. Add Task");
            console.log("2. Toggle Task");
            console.log("3. Exit");
            rl.question("Choose an option: ", (choice) => {
                switch (choice) {
                    case "1":
                        rl.question("Enter task title: ", (title) => {
                            this.addTask(title);
                            showOptions();
                        });
                        break;
                    case "2":
                        rl.question("Enter task ID: ", (id) => {
                            this.toggleTask(parseInt(id, 10));
                            showOptions();
                        });
                        break;
                    case "3":
                        rl.close();
                        break;
                }
            });
        };
    }
}
```

## Точка входа

```typescript
const model = new TaskModel();
const view = new TaskView();
const controller = new TaskController(model, view);

controller.addTask('added task');
controller.toggleTask(1);
controller.showMenu();
```

---

## Ключевые моменты

- Model не знает о View — только вызывает Observer-колбэки
- Controller подписывает View как Observer: `model.addObserver((m) => view.render(m))`
- Автоматический ре-рендер после каждого изменения
- Observer — основа реактивности (MobX делает то же самое, но автоматически)

## Связанные темы

- [[../mvc]] — теория MVC
- [[frontend/taskExample-frontend]] — тот же Task, но с MobX + React
- [[../../MVVM/MVVM]] — следующий шаг: MVVM

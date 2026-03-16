---
tags: [mvc, counter, typescript, dom]
aliases: [Counter MVC]
---

# Counter — пример MVC (базовый)

Простейший счётчик на чистом TypeScript + DOM, демонстрирующий паттерн MVC.

**Особенность:** Model знает о View (вызывает `view.updateTitle()` напрямую) — это упрощённый MVC без Observer.

## Схема взаимодействия

```
View → Controller → Model → View (прямой вызов)
```

---

## CounterModel

Хранит состояние и уведомляет View напрямую:

```typescript
import {CounterView} from "./CounterView.ts";

export class CounterModel {
    view: CounterView;
    value: number;

    constructor(view: CounterView) {
        this.value = 0;
        this.view = view;
    }

    increment() {
        this.value += 1;
        this.view.updateTitle(); // Model сам вызывает View
    }

    decrement() {
        this.value -= 1;
        this.view.updateTitle();
    }

    multipleAndDivide() {
        this.value *= 5;
        this.value /= 3;
        this.value = Math.ceil(this.value);
        this.view.updateTitle();
    }
}
```

## CounterController

Принимает события из View и вызывает методы Model:

```typescript
import {CounterModel} from "./CounterModel.ts";

export class CounterController {
    model: CounterModel;

    constructor(model: CounterModel) {
        this.model = model;
    }

    handleIncrement() {
        this.model.increment();
    }

    handleDecrement() {
        this.model.decrement();
    }

    handleMultiply() {
        this.model.multipleAndDivide();
    }
}
```

## CounterView

Создаёт DOM-элементы, привязывает события к Controller, рендерит UI:

```typescript
import {CounterController} from "./CounterController.ts";
import {CounterModel} from "./CounterModel.ts";

export class CounterView {
    controller: CounterController;
    model: CounterModel;
    root: HTMLElement;

    private title: HTMLElement;
    private incrementButton: HTMLElement;
    private decrementButton: HTMLElement;
    private multipleButton: HTMLElement;

    constructor(root: HTMLElement) {
        this.root = root;
        this.model = new CounterModel(this);           // View создаёт Model
        this.controller = new CounterController(this.model); // и Controller

        this.title = document.createElement('h1');
        this.title.innerText = 'Value = 0';

        this.incrementButton = document.createElement('button');
        this.incrementButton.innerText = 'increment';
        this.decrementButton = document.createElement('button');
        this.decrementButton.innerText = 'decrement';
        this.multipleButton = document.createElement('button');
        this.multipleButton.innerText = 'multiply';

        this.bindListeners();
    }

    private bindListeners() {
        this.incrementButton.addEventListener('click', this.controller.handleIncrement.bind(this));
        this.decrementButton.addEventListener('click', this.controller.handleDecrement.bind(this));
        this.multipleButton.addEventListener('click', this.controller.handleMultiply.bind(this));
    }

    public updateTitle() {
        this.title.innerText = `Value = ${this.model.value}`;
    }

    public render() {
        this.root.appendChild(this.title);
        this.root.appendChild(this.incrementButton);
        this.root.appendChild(this.decrementButton);
        this.root.appendChild(this.multipleButton);
    }
}
```

---

## Ключевые моменты

- View инициализирует все три слоя (антипаттерн — тесная связь)
- Model знает о View напрямую — нет разделения (vs [[counterTwo/counterTwo|CounterTwo]] где Model не знает View)
- Для сравнения см. [[counterTwo/counterTwo]] — улучшенный вариант с интерфейсами

## Связанные темы

- [[../mvc]] — теория MVC
- [[counterTwo/counterTwo]] — MVC с интерфейсами и Observer
- [[../users/users]] — MVC с реальным CRUD

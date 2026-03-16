---
tags: [mvc, counter, typescript, interfaces, dom]
aliases: [CounterTwo MVC, Counter улучшенный]
---

# CounterTwo — улучшенный MVC с интерфейсами

Улучшенная версия счётчика: Model **не знает** о View, Controller возвращает значения, View обновляет себя сам.

## Отличие от [[counter/counter|Counter (базовый)]]

| | Counter (базовый) | CounterTwo (улучшенный) |
|---|---|---|
| Model знает View? | Да — `this.view.updateTitle()` | Нет — возвращает значение |
| Интерфейсы | Нет | `Model`, `Controller`, `View` |
| Связь | Сильная | Слабее, через интерфейсы |

---

## CounterTwoModel

Model изолирована — не знает ничего о View:

```typescript
import {Model} from "./CounterTwoController.ts";

export class CounterTwoModel implements Model {
    value: number;

    constructor() {
        this.value = 0;
    }

    increment() {
        this.value += 1;
        return this.value; // возвращает значение, не вызывает View
    }

    decrement() {
        this.value -= 1;
        return this.value;
    }

    multipleAndDivide() {
        this.value *= 5;
        this.value /= 3;
        this.value = Math.ceil(this.value);
        return this.value;
    }
}
```

## CounterTwoController

Определяет интерфейсы `Model` и `Controller`:

```typescript
import {CounterTwoModel} from "./CounterTwoModel.ts";

export interface Model {}

export interface Controller {
    model: Model;
}

export class CounterTwoController implements Controller {
    model: CounterTwoModel;

    constructor() {
        this.model = new CounterTwoModel();
    }

    handleIncrement() {
        return this.model.increment(); // возвращает новое значение
    }

    handleDecrement() {
        return this.model.decrement();
    }

    handleMultiply() {
        return this.model.multipleAndDivide();
    }
}
```

## CounterTwoView

View сам решает что делать с возвращённым значением:

```typescript
import {Controller, CounterTwoController} from "./CounterTwoController.ts";

export interface View {
    mount: () => void;
    controller: Controller;
}

export class CounterTwoView implements View {
    controller: CounterTwoController;
    root: HTMLElement;

    private title: HTMLElement;
    private incrementButton: HTMLElement;
    private decrementButton: HTMLElement;
    private multipleButton: HTMLElement;

    constructor(root: HTMLElement) {
        this.root = root;
        this.controller = new CounterTwoController();
        // View создаёт DOM-элементы...
    }

    private onIncrementClick = () => {
        this.updateTitle(this.controller.handleIncrement()); // получает значение от Controller
    }

    private onDecrementClick = () => {
        this.updateTitle(this.controller.handleDecrement());
    }

    private onMultiplyClick = () => {
        this.updateTitle(this.controller.handleMultiply());
    }

    public updateTitle(value: number) {
        this.title.innerText = `Value = ${value}`; // View сам обновляется
    }

    public mount() {
        this.root.appendChild(this.title);
        this.root.appendChild(this.incrementButton);
        this.root.appendChild(this.decrementButton);
        this.root.appendChild(this.multipleButton);
    }
}
```

---

## Ключевые моменты

- Model изолирована — не импортирует View
- Controller возвращает значения, не дёргает View напрямую
- Интерфейсы `Model`, `Controller`, `View` — явный контракт
- Следует [[../../solid/dependencyInversion/dependencyInversion|DIP]]: зависеть от абстракций

## Связанные темы

- [[counter/counter]] — базовый MVC (сравни)
- [[../users/users]] — MVC с CRUD операциями
- [[../mvc]] — теория MVC

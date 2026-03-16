---
tags: [mvc, users, crud, typescript, dom, sorting]
aliases: [Users MVC, CRUD MVC]
---

# Users — MVC с CRUD операциями

Полноценный MVC-пример: создание пользователей, сортировка, рендеринг списка в DOM.

## Схема

```
UsersView ←→ UsersController ←→ UsersModel
   DOM            логика           данные + сортировка
```

---

## UsersModel

Хранит список пользователей, умеет создавать и сортировать:

```typescript
export interface User {
    id: string;
    username: string;
    age: number;
    createdAt: string;
}

export type SortOrder = 'asc' | 'desc';
export type SortField = 'age' | 'username';

export class UsersModel {
    users: User[];
    searchValue: string;
    sortOrder: SortOrder;
    sortField: SortField;

    constructor() {
        this.users = [];
        this.searchValue = '';
        this.sortOrder = 'asc';
        this.sortField = 'username';
    }

    async fetchUsers(): Promise<User[]> {
        try {
            return this.users;
        } catch (e) {
            this.users = [];
            return [];
        }
    }

    createUser(username: string, age: number) {
        // Проверка на дублирование
        if (this.users.find(user => user.username === username)) {
            throw Error('Пользователь уже существует');
        }

        const newUser: User = {
            id: String(Math.random()),
            username,
            age,
            createdAt: Date.now().toString(),
        };

        this.users.push(newUser);
        return newUser;
    }

    sortUsers(field: SortField, order: SortOrder) {
        const sortedUsers = [...this.users.sort((a, b) => {
            if (order === "asc") {
                return a[field] > b[field] ? 1 : -1;
            }
            return a[field] < b[field] ? 1 : -1;
        })];

        this.users = sortedUsers;
        return sortedUsers;
    }
}
```

## UsersController

Валидация + делегирование в Model:

```typescript
import {SortField, SortOrder, UsersModel} from "./UsersModel";

export class UsersController {
    model: UsersModel;

    constructor(model: UsersModel) {
        this.model = model;
    }

    public handleCreate(username: string, age: number) {
        if (!username || !age) {
            throw Error('Укажите username и age');
        }
        return this.model.createUser(username, age);
    }

    public handleSort(field: SortField, order: SortOrder) {
        if (!field) {
            throw Error('Укажите поле сортировки');
        }
        return this.model.sortUsers(field, order);
    }
}
```

## UsersView (ключевые части)

Строит форму создания, список пользователей и селекторы сортировки:

```typescript
export class UsersView {
    controller: UsersController;
    root: HTMLElement;

    private onCreateClick = () => {
        try {
            const newUser = this.controller.handleCreate(
                this.usernameInput.value,
                Number(this.ageInput.value)
            );
            this.renderNewUser(newUser); // добавляем только нового
        } catch (e) {
            this.showError((e as Error).message); // показываем ошибку
        }
    }

    private onSortClick = () => {
        const newUsers = this.controller.handleSort(
            this.fieldSelect.value as SortField,
            this.orderSelect.value as SortOrder
        );
        this.renderUsers(newUsers); // перерендериваем всех
    }

    private getUserElement(user: User) {
        return `
            <div class="user">
                <h3>Username = ${user.username}</h3>
                <h5>Age = ${user.age}</h5>
            </div>
        `;
    }

    private renderUsers(users: User[]) {
        const usersElements = users.map(user => this.getUserElement(user));
        this.users.innerHTML = usersElements.join('');
    }

    public mount() {
        this.root.innerHTML = `<h1>Пользователи</h1>`;
        this.root.appendChild(this.sortSelectors);
        this.root.appendChild(this.form);
        this.root.appendChild(this.users);
    }
}
```

---

## Ключевые моменты

- View обрабатывает ошибки через `try/catch` и `alert`
- Model бросает ошибку при дубликате — Controller прокидывает, View показывает
- Сортировка: View передаёт параметры → Controller валидирует → Model сортирует → View перерисовывает
- `renderNewUser` (добавить одного) vs `renderUsers` (перерисовать всех)

## Связанные темы

- [[../mvc]] — теория MVC
- [[../counter/counter]] — простой счётчик MVC
- [[../taskExample/classicWay/taskExample-classic]] — MVC с Observer

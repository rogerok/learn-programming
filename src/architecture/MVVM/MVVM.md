---
tags: [mvvm, architecture, design-patterns, typescript, mobx, react]
aliases: [MVVM, Model-View-ViewModel]
---

# MVVM — Model-View-ViewModel

**MVVM** (Model-View-ViewModel) — архитектурный паттерн, эволюция MVC. Вместо Controller появляется **ViewModel** — посредник, который связывает Model и View через **двустороннюю привязку данных**.

## Компоненты

| Компонент | Роль |
|---|---|
| **Model** | Данные и бизнес-логика. Не знает о UI. |
| **View** | Отображение UI. Привязана к ViewModel, но не к Model напрямую. |
| **ViewModel** | Посредник. Преобразует данные из Model для View. Реагирует на действия View. |

## Ключевая идея

```
Model ←→ ViewModel ←→ View
              ↑
     двусторонняя привязка (data binding)
```

View автоматически обновляется при изменении ViewModel.
ViewModel автоматически реагирует на действия пользователя.

---

## MVVM в современном Frontend

В React + MobX:
- **Model** — классы данных (`TaskModel`)
- **ViewModel** — MobX Store (`TaskStore`)
- **View** — React компонент обёрнутый в `observer()`

```typescript
// Model
class User {
    name: string;
    age: number;
}

// ViewModel — преобразует данные для View
class UserViewModel {
    private user: User;

    constructor(user: User) {
        this.user = user;
        makeObservable(this);
    }

    // Getter для View — форматированное имя
    get displayName(): string {
        return this.user.name.toUpperCase();
    }

    // Getter для View — возрастная группа
    get ageGroup(): string {
        return this.user.age >= 18 ? 'Взрослый' : 'Несовершеннолетний';
    }

    // Action от View
    updateName(name: string): void {
        this.user.name = name;
    }
}

// View (React)
const UserView = observer(({vm}: {vm: UserViewModel}) => (
    <div>
        <h1>{vm.displayName}</h1>
        <p>{vm.ageGroup}</p>
        <input onChange={(e) => vm.updateName(e.target.value)} />
    </div>
));
```

---

## MVVM vs MVC

| | MVC | MVVM |
|---|---|---|
| Посредник | Controller | ViewModel |
| Связь View-Mediator | Controller обрабатывает события | Двусторонняя привязка |
| Тестируемость | Controller тестируется отдельно | ViewModel тестируется без UI |
| Реактивность | Ручная | Автоматическая (MobX, Vue, Angular) |
| View знает о... | Controller | ViewModel |

---

## Ключевые моменты

- ViewModel — это не Controller: он **не обрабатывает** события, а **предоставляет** данные и команды
- Data Binding избавляет от ручного вызова `updateTitle()` и `render()`
- В React: MobX `observable` + `observer` = двусторонняя привязка
- ViewModel легко тестировать — не зависит от DOM

## Связанные темы

- [[../MVC/mvc]] — MVC как предшественник
- [[../MVC/taskExample/frontend/taskExample-frontend]] — MVVM с MobX на практике
- [[../VM/vm]] — паттерн ViewModel в чистом виде

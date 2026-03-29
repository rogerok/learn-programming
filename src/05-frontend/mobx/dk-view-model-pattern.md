---
tags: [mobx, view-model, vm, computed, reactivity, performance, lifecycle]
---

# Chapter: ViewModel (VM) Pattern

> [!info] Context
> ViewModel — это замена React-хукам для компонентной логики. Класс с observable-состоянием, lifecycle-методами и computed-геттерами. Чистый MobX-способ держать логику компонента вне JSX. Нужно знать: базовый MobX, трёхслойную архитектуру.

## Overview

Два подхода к хранению данных, связанных с конкретным компонентом:

**Rich Model** — стор сам содержит логику и вычисляемые свойства:
```
PageStore.user → class User { get fullName() {...} }
```

**ViewModel (рекомендуется)** — стор хранит только сырые данные (анемичная модель), а VM вычисляет и форматирует:
```
PageStore.user → { name, surname }  (просто данные)
VM.fullName    → `${name} ${surname}` (вычисление в VM)
```

## Deep Dive

### Rich Model vs ViewModel: наглядный пример

Задача: бэк отдаёт `name` и `surname`, нужно показать `fullName` в 10 местах на странице.

**Подход 1: Rich Model**

```typescript
class User {
  constructor(data) {
    this.name = data.name;
    this.surname = data.surname;
    makeAutoObservable(this);
  }

  get fullName() { return `${this.name} ${this.surname}` }
}

class PageStore {
  user: User;
}

// В компоненте:
function Comp() {
  const { pageStore } = useContext(PageContext);
  return <div>{pageStore.user.fullName}</div>
}
```

**Проблемы Rich Model:**
- При изменении `user` все 10 компонентов ре-рендерятся — нет гранулярности
- Если `User` понадобятся данные из другого стора — нужен DI в конструктор → паутина зависимостей → циклические импорты

**Подход 2: ViewModel**

```typescript
// Стор — просто данные (анемичная модель)
class PageStore {
  user: { name: string; surname: string };
}

// VM — логика и вычисления
class FullNameVM {
  constructor(private pageStore: PageStore) {
    makeAutoObservable(this);
  }

  get fullName() {
    return `${this.pageStore.user.name} ${this.pageStore.user.surname}`
  }
}

// Выносим в отдельный компонент — получаем точечные ре-рендеры
function FullName() {
  const { pageStore } = useContext(PageContext);
  const vm = useVM(FullNameVM, pageStore);

  return <div>{vm.fullName}</div>
}

// Родители не ре-рендерятся при изменении user.name — только <FullName />
```

> [!important] Главный плюс
> VM — единая точка схождения любых сторов. В конструктор передаём все нужные зависимости (globalStore, pageStore, props). Никакого IoC, никаких циклических зависимостей — просто аргументы конструктора.

### Жизненный цикл VM

VM заменяет useEffect/useState, предоставляя явный lifecycle:

```typescript
class ProductCardVM {
  // Локальное состояние
  isExpanded = false;

  constructor(
    private globalStore: GlobalStore,
    private pageStore: PageStore,
    private props: { productId: string }
  ) {
    makeAutoObservable(this);
  }

  // Вызывается после маунта компонента
  afterMount() {
    // Запускаем автообновление статуса
    this.interval = setInterval(async () => {
      if (this.pageStore.operation.status !== 'done') {
        this.pageStore.operation = await api.getOperation({ id: this.props.productId })
      } else {
        clearInterval(this.interval);
      }
    }, 1000)
  }

  // Вызывается перед размаунтом
  beforeUnmount() {
    clearInterval(this.interval);
  }

  // Computed-геттер
  get displayTitle() {
    return `${this.pageStore.product.name} — ${this.globalStore.user.currency}`
  }

  // Обработчик события
  handleExpand = () => {
    this.isExpanded = !this.isExpanded;
  }
}
```

### Несколько VM на одной странице через общий PageStore

Ключевой паттерн: VM на разных компонентах одной страницы общаются через PageStore.

```typescript
class PageStore {
  constructor() { makeAutoObservable(this) }

  entity;
  operation;
  isSynchronizing = false;
}

const pageStore = new PageStore();

// VM компонента A — загружает данные
class LoaderVM {
  constructor(private pageStore: PageStore) {}

  afterMount() {
    this.pageStore.isSynchronizing = true;

    this.pageStore.entity = await api.getEntity()
    this.pageStore.operation = await api.getOperation({ id: this.pageStore.entity.id })
  }

  beforeUnmount() { /* cleanup */ }
}

// VM компонента B — реагирует на изменения
class WatcherVM {
  constructor(private pageStore: PageStore) {
    autorun(async () => {
      if (this.pageStore.operation.status === 'done') {
        await api.getLotsOfData()
        runInAction(() => (this.pageStore.isSynchronizing = false))
      }
    })
  }
}
```

`WatcherVM` не знает про `LoaderVM` — они общаются только через `pageStore`. Это и есть «соседние компоненты не знают друг о друге».

### Функциональный Strategy как альтернатива

Не всегда нужен класс. Когда из API приходят разнотипные сущности, которые нужно единообразно обработать — удобен паттерн Strategy:

```typescript
type Strategy = {
  load: () => Promise<void>;
  finish: () => Promise<void>;
  name: string;
  total: number;
}

function getStrategy(task): Strategy {
  if (task.type === 1) return {
    load: api.loadTask1,
    finish: finishTask1,
    name: `${task.number} ${task.name}`,
    total: task.childrenTime * 10
  }
  if (task.type === 2) return {
    load: api.loadTask2,
    finish: finishTask2,
    name: `${task.number} priority`,
    total: task.childrenTime * 5
  }
}

function TaskPage(props) {
  const strategy = getStrategy(props.task);
  // Дальше работаем с единым интерфейсом Strategy
}
```

Это можно было сделать через абстрактный класс и `implements`, но функция проще, не требует DI и отлично тестируется.

### Отладка: счётчик autorun-подписок

VM можно оснастить трекингом подписок — полезно для поиска утечек:

```typescript
function appendAutorun(ctx: ViewModel, fn: () => void) {
  if (!ctx.autorunDisposers) {
    Object.defineProperty(ctx, 'autorunDisposers', { value: [] });
  }

  ctx.autorunDisposers.push(autorun(fn));
  ctx.context.store.ui.totalDisposers += 1;

  console.log(`[Autoruns] ADD ${fn.name}; Total: ${ctx.context.store.ui.totalDisposers}`);
}

// При размаунте — автоматически очищать и логировать
export const useStore = createUseStore(StoreContext, {
  beforeUnmount(ctx, vm) {
    ctx.store.ui.totalDisposers -= vm.autorunDisposers?.length ?? 0;
    console.log(`[Autoruns] CLEAR ${vm.systemFileName}; Total left: ${ctx.store.ui.totalDisposers}`);
  },
});
```

Если `totalDisposers` не уходит в 0 после размаунта всех компонентов — есть утечка подписок.

## Exercises

1. Переделай этот компонент на хуках в VM-стиль:
   ```tsx
   function UserCard({ userId }) {
     const [user, setUser] = useState(null);
     const [expanded, setExpanded] = useState(false);

     useEffect(() => {
       fetchUser(userId).then(setUser);
     }, [userId]);

     const fullName = user ? `${user.name} ${user.surname}` : '';

     return (
       <div onClick={() => setExpanded(!expanded)}>
         {fullName}
         {expanded && <UserDetails user={user} />}
       </div>
     );
   }
   ```

2. У тебя два компонента на одной странице: форма и блок предпросмотра. Данные формы нужны в предпросмотре. Как это реализовать через VM + PageStore?

3. Объясни своими словами: почему Rich Model сторы создают проблемы с циклическими зависимостями, а ViewModel — нет?

## Anki Cards

> [!tip] Flashcard
> Q: Чем ViewModel отличается от Rich Model стора?
> A: Rich Model — стор содержит и данные, и логику (computed, методы). Анемичный стор + VM — стор только хранит данные, VM содержит computed-геттеры, lifecycle, обработчики. VM принимает нужные сторы через конструктор.

> [!tip] Flashcard
> Q: Как VM решает проблему «показать computed-значение в 10 местах без дублирования»?
> A: Выносим VM и computed в отдельный маленький компонент (напр. `<FullName />`), используем его в 10 местах. При изменении данных ре-рендерятся только 10 маленьких компонентов, а не родители.

> [!tip] Flashcard
> Q: Как два компонента на одной странице общаются через VM?
> A: Через общий PageStore. VM компонента A мутирует `pageStore.someData`. VM компонента B подписывается на `pageStore.someData` через autorun или computed. Компоненты не знают друг о друге.

> [!tip] Flashcard
> Q: Что такое autorunDisposers и зачем их отслеживать?
> A: Массив функций-очистителей от autorun. При размаунте VM все disposers вызываются, подписки снимаются. Трекинг их количества помогает найти утечки памяти.

## Related Topics

- [[dk-layered-architecture]]
- [[dk-actions-and-api-layers]]
- [[in-depth-explanation-of-MobX]]

## Sources

- [mobx-use-store](https://github.com/dkazakov8/dk-framework/tree/master/packages/mobx-use-store)

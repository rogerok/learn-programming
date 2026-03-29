---
tags: [mobx, actions, api, testing, architecture, data-driven]
---

# Chapter: Actions и API как отдельные слои

> [!info] Context
> Почему нельзя вызывать `fetch` прямо в сторе, как организовать слой Actions, что такое `TypeAction` и `globalContext`, и как это всё тестируется за пару строк. Предполагается знание базового MobX и трёхслойной архитектуры.

## Overview

Центральная идея: **сторы — только для хранения данных, экшены — для их мутации, API — для сетевых вызовов**.

```
┌─────────────────────────────────────┐
│  UI (React компоненты)              │
│  читает store, вызывает actions     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Actions Layer                      │
│  вызывает api, мутирует store       │
└──────┬───────────────────┬──────────┘
       │                   │
┌──────▼──────┐   ┌────────▼────────┐
│  API Layer  │   │  Stores Layer   │
│  fetch/ws   │   │  только данные  │
└─────────────┘   └─────────────────┘
```

## Deep Dive

### Почему fetch нельзя в сторе

```typescript
class Store {
  data = undefined;

  // Так нельзя — прямой fetch в сторе
  getData() {
    fetch('/api/users').then(data => { this.data = data })
  }

  // Так можно — API вынесен в отдельный слой
  getData() {
    apiLayer.getUsers().then(data => { this.data = data })
  }

  // Так идеально — логика в экшене, стор не знает об API
  getData() {
    actions.getUsers() // экшен сам кладёт результат в стор
  }
}
```

**Почему «нельзя» плохо:**

1. **Дублирование.** 50 сторов и VM могут делать один и тот же запрос, описывая его независимо. Если изменится модель — придётся менять в 50 местах.
2. **Нет централизованной обработки ошибок.** Хедеры, retry, логирование — в каждом месте по-своему.
3. **Сложно тестировать.** Нельзя просто замокать `fetch` для одного стора, не затронув другие.
4. **Нет видимости выполнения.** Нельзя глобально узнать, какие запросы сейчас летят — а это нужно для SSR (дождаться всех) и для лоадеров.

### Структура globalContext

Всё вместе собирается в `globalContext` — объект, который передаётся через React Context:

```typescript
class User {
  name = '';
}

const api = {
  getUser() {
    return fetch('/api/user').then(response => response.json())
  }
}

const actions = {
  async getUser(context: GlobalContext, params?: unknown) {
    const response = await context.api.getUser();
    context.store.user.name = response.name;
  }
}

const globalContext = { store: { user: new User() }, api, actions };

// Биндим контекст, чтобы не передавать его каждый раз вручную
Object.entries(actions).forEach(([name, fn]) => {
  (actions as any)[name] = fn.bind(null, globalContext);
})
```

После биндинга вызов из компонента выглядит просто:

```typescript
// В компоненте:
context.actions.getUser()

// Или читаем данные:
context.store.user.name
```

### TypeAction — типизированный экшен

Вместо `any` для контекста удобно завести тип:

```typescript
import { runInAction } from 'mobx';
import { TypeAction } from 'models';

const getTodos: TypeAction<{ page: number }> = ({ store, api, actions }, params) => {
  return api.getTodos(params)
    .then(todos => runInAction(() => { store.todos.list = todos; }))
    .catch((error) => {
      actions.ui.notificationRaise({ message: 'Не удалось загрузить список задач' });

      // Можно перезапросить при сетевой ошибке
      if (error.name === 'Network Error') return actions.todo.getTodos(params);
    });
}
```

`TypeAction<Params>` — это тип вида `(context: GlobalContext, params: Params) => Promise<...>`. Описывается один раз в `models.ts`, используется везде.

> [!tip] Принцип простоты
> «Чем проще код, тем быстрее разработка, ниже риск багов, проще дебаг и обучение новых сотрудников.»

### Data-driven подход: UI = fn(state)

На практике это выглядит так — экшен получает `globals` (весь контекст) и только мутирует стор:

```typescript
// store
const store = { items: new ItemsStore() }
// ItemsStore содержит: list, isLoading и т.п.

// actions
const actions = {
  items: {
    async getList(globals) {
      const data = await globals.api.getItems();
      runInAction(() => { globals.store.items.list = data; });
    },

    async delete(globals, id: string) {
      await globals.api.deleteItem(id);
      runInAction(() => {
        globals.store.items.list = globals.store.items.list.filter(i => i.id !== id);
      });
    },

    async edit(globals, newData) {
      await globals.api.editItem(newData);
      // можно перезапросить список или обновить локально
    }
  }
}
```

Компонент просто вызывает `context.actions.items.getList()` и читает `context.store.items.list`. Он ничего не знает про API.

### Что даёт отдельный API-слой

| Возможность | Без слоя | С отдельным слоем |
|---|---|---|
| Централизованная обработка ошибок | ❌ | ✅ |
| Автоматические лоадеры | ❌ | ✅ (через mobx-stateful-fn) |
| Логгирование времени запросов | ❌ | ✅ |
| Отмена запросов при уходе со страницы | Сложно | ✅ |
| SSR (дождаться всех запросов) | Невозможно | ✅ |
| Тестирование через мок | Сложно | Легко |

> [!important]
> `mobx-stateful-fn` — библиотека, которая оборачивает функцию и делает её статус (`isLoading`, `error`, `result`) реактивным observable-объектом. Без ручного `store.isLoading = true/false`.

### Тестирование

Главное преимущество этой схемы — тесты пишутся в 5 строк:

```typescript
// Создаём чистый контекст — как в продакшене, но изолированный
const globalContext = createGlobalContext();

// Мокаем только нужный API-вызов
globalContext.api.getUser.state.mock = Promise.resolve({ name: 'John' });

// Вызываем экшен
await globalContext.actions.getUser();

// Проверяем стор
assert.equal(globalContext.store.user.name, 'John');
```

Нет моков через `jest.mock()`, нет подмены импортов. Просто подменяем одно поле в объекте.

Ту же схему используют для постраничных сторов и ViewModels — каждый VM принимает `globalContext` в конструктор и тестируется изолированно.

## Exercises

1. Перепиши этот код, вынеся API и логику в отдельные слои:
   ```typescript
   class UserStore {
     user = null;

     async loadUser() {
       const resp = await fetch('/api/user');
       this.user = await resp.json();
     }
   }
   ```

2. Напиши `TypeAction` для экшена `createPost(title, body)`. Экшен должен: вызвать `api.createPost`, добавить результат в `store.posts.list`, в случае ошибки вызвать `actions.ui.showError`.

3. Напиши тест для экшена из п.2, не используя `jest.mock`.

## Anki Cards

> [!tip] Flashcard
> Q: Почему нельзя вызывать `fetch` напрямую в сторе?
> A: Дублирование запросов, нет централизованной обработки ошибок, нет видимости выполняющихся запросов (нужно для SSR и лоадеров), сложно тестировать.

> [!tip] Flashcard
> Q: Что такое globalContext и из чего он состоит?
> A: Объект `{ store, api, actions }`, передаваемый через React Context. Стор хранит данные, API делает запросы, Actions мутируют стор на основе ответов API.

> [!tip] Flashcard
> Q: Как тестируется Action в схеме globalContext?
> A: `createGlobalContext()` даёт чистый изолированный контекст. Подменяешь один метод API через `.state.mock`, вызываешь экшен, проверяешь стор.

> [!tip] Flashcard
> Q: Что такое TypeAction?
> A: Тип функции-экшена: `(context: GlobalContext, params: P) => Promise<R>`. Типизирует все экшены единообразно, описывается один раз.

## Related Topics

- [[dk-layered-architecture]]
- [[dk-context-and-di]]
- [[dk-view-model-pattern]]

## Sources

- [dk-boilerplate](https://github.com/dkazakov8/dk-boilerplate/blob/master/src/client.tsx#L18)
- [mobx-stateful-fn](https://github.com/dkazakov8/dk-framework/tree/master/packages/mobx-stateful-fn)

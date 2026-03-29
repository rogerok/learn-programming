---
tags: [mobx, context, di, dependency-injection, circular-deps, rootstore]
---

# Chapter: Context, DI и циклические зависимости

> [!info] Context
> Как передавать зависимости между сторами без циклических импортов, зачем React Context вместо синглтонов и что такое `globalContext`. Предполагается знание трёхслойной архитектуры и базового MobX.

## Overview

Проблема: сторы нужно связывать между собой. Наивный способ — передать `this` из RootStore в конструктор дочернего стора — сразу создаёт циклические зависимости. Правильный способ — связывать сторы **снаружи**, через Actions-слой или React Context.

## Deep Dive

### Проблема: циклические зависимости в RootStore

Классическая ошибка при первом знакомстве с MobX:

```typescript
export class RootStore {
  authStore = new AuthStore()
  profileStore = new UserStore(this.authStore, this.otherStore) // ← otherStore ещё не создан!
  otherStore = new OtherStore(this.profileStore) // ← profileStore уже использует otherStore
}
```

Попытка передать весь RootStore через `new UserStore(this)` не решает проблему — это только скрывает её за отложенным обращением к полям. Computed-геттеры и autorun, завязанные на `this`, ломаются.

> [!warning]
> Передача `this` из RootStore в конструктор дочернего стора — источник циклических зависимостей. Автораны и computed на таких ссылках ломаются тихо.

### Решение 1: сторы хранят только данные

Убираем из сторов всю логику взаимодействия. Стор — просто объект с observable-полями:

```typescript
class AuthStore {
  token: string | null = null;
  isAuthenticated = false;
}

class ProductsStore {
  list: Product[] = [];
  userProducts: Product[] = [];
}
```

Никаких методов, никаких ссылок на другие сторы. Логику, которая читает несколько сторов, выносим в **Actions** или **globalGetters**:

```typescript
const globalGetters = makeObservable({
  get userPromo() {
    return rootStore.products.list.filter(product =>
      rootStore.user.hasRight('tobacco') && product.type === 'tobacco'
    )
  }
})

const globalActions = {
  async getData() {
    const user = await rootStore.user.getUser()
    const products = await rootStore.products.getProducts(user)
    rootStore.products.userProducts = products;
  }
}
```

Теперь зависимостей между сторами нет — только данные. Циклических ссылок не может быть по определению.

### Решение 2: React Context как DI-контейнер

Вместо синглтонов — передача `globalContext` через React Context на каждый рендер (а при SSR — на каждый HTTP-запрос):

```typescript
// Создаём контекст
const globals = createContextProps<TypeGlobals>({
  req,         // Node.js req/res для SSR
  res,
  api,         // API-слой
  request,
  transformers,
  staticStores,    // { user: new UserStore(), ui: new UIStore(), ... }
  apiValidators,
  globalActions,
  getLn: getLn.bind(null, lnData), // реактивная i18n
});

// Пробрасываем через контекст
<StoreContext.Provider value={globals}>
  <App />
</StoreContext.Provider>
```

**Зачем это лучше синглтонов:**

| | Синглтон | Context |
|---|---|---|
| SSR | ❌ данные смешаются | ✅ новый контекст на каждый запрос |
| Тесты | Нужно мокать импорт | Просто передать мок в конструктор |
| Циклические зависимости | Риск | Нет — всё через контекст |
| Накладные расходы | Нет | Минимальные |

### Структура globalContext

Полный состав типичного `globals`:

```typescript
type TypeGlobals = {
  req: Request;       // только SSR
  res: Response;      // только SSR
  api: ApiLayer;      // все API-функции
  staticStores: {     // "рутстор" — глобальные сторы
    user: UserStore;
    ui: UIStore;
    dicts: DictsStore;
  };
  globalActions: GlobalActions;  // все глобальные экшены
  getLn: (key: string) => string; // i18n функция
  // ... и прочее по необходимости
}
```

`staticStores` — это и есть «RootStore». Просто plain object с инстансами сторов, без методов и зависимостей между ними.

### Передача зависимостей без DI-фреймворков

Главный вывод: DI между классами не нужен, если правильно организована архитектура.

**Вариант A: Actions как функции**
```typescript
// Actions принимают globalContext явным аргументом
function setUserPromo(globals: TypeGlobals) {
  const promoProducts = globals.store.products.filter(...)
  globals.store.user.promoList = promoProducts;
}
```

**Вариант B: Container-компоненты**
```tsx
// Контейнер читает нужные сторы и передаёт в «тупой» компонент через props
function UserPromoContainer() {
  const globals = useContext(StoreContext);

  const userPromo = globals.store.products.filter(
    p => globals.store.user.hasRight('tobacco') && p.type === 'tobacco'
  );

  return <UserPromoList items={userPromo} />;
}
```

**Вариант C: ViewModel**
```typescript
class PromoVM {
  constructor(private globals: TypeGlobals) {
    makeAutoObservable(this);
  }

  get userPromo() {
    return this.globals.store.products.filter(
      p => this.globals.store.user.hasRight('tobacco') && p.type === 'tobacco'
    );
  }
}
```

Во всех трёх вариантах — нет DI-фреймворка, нет декораторов `@inject`, нет паутины зависимостей. Просто передача аргументов.

### Тестирование без боли

Весь смысл контекстного подхода раскрывается при тестировании:

```typescript
// Синглтон — нужно мокать импорт модуля
jest.mock('../stores/globalStore', () => ({
  user: { name: 'John' },
  // ... и все остальные 30 полей
}))

// Context — просто создаём чистый контекст
const ctx = createGlobalContext();
ctx.store.user.name = 'John';

const vm = new MyVM(ctx);
expect(vm.displayName).toBe('John');
```

## Exercises

1. Есть код:
   ```typescript
   class OrderStore {
     orders = [];
     async loadOrders() {
       const user = userStore.currentUser; // ← импорт синглтона
       this.orders = await fetch(`/orders?userId=${user.id}`);
     }
   }
   ```
   Переделай на схему с `globalContext` без синглтонов.

2. Напиши `globalGetters` объект, который содержит computed-геттер `activeOrders` — только те заказы из `store.orders.list`, у которых `status !== 'completed'`. Избегай циклических зависимостей.

3. Объясни своими словами: почему передача `this` в конструктор дочернего стора ломает computed-геттеры?

## Anki Cards

> [!tip] Flashcard
> Q: Почему передача `this` из RootStore в конструктор дочернего стора — плохая идея?
> A: Создаёт циклические зависимости. В момент создания второго стора первый ещё не инициализирован полностью. Computed-геттеры и autorun, опирающиеся на такие ссылки, ломаются тихо.

> [!tip] Flashcard
> Q: Как решить проблему «нужна логика, использующая два разных стора»?
> A: Вынести её в Actions или globalGetters — снаружи от обоих сторов. Сторы остаются независимыми (только данные), связь существует только в слое Actions.

> [!tip] Flashcard
> Q: Зачем React Context вместо синглтона для globalContext?
> A: При SSR нужен новый изолированный контекст на каждый HTTP-запрос — синглтон один на весь процесс, данные смешаются. Context создаётся заново каждый раз. Бонус: простое тестирование через создание чистого контекста.

> [!tip] Flashcard
> Q: Из чего состоит типичный globalContext?
> A: `{ staticStores, globalActions, api, req?, res?, getLn, ... }`. `staticStores` — RootStore как plain object, без методов и зависимостей между сторами.

## Related Topics

- [[dk-layered-architecture]]
- [[dk-actions-and-api-layers]]
- [[dk-ssr-and-ssg]]

## Sources

- [createContextProps](https://github.com/dkazakov8/dk-framework/blob/master/packages/react-mobx-globals/src/createContextProps.ts)
- [dk-boilerplate client.tsx](https://github.com/dkazakov8/dk-boilerplate/blob/master/src/client.tsx#L18)

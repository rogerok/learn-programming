---
tags: [mobx, ssr, ssg, hydration, server-rendering, node]
---

# Chapter: SSR и SSG с MobX

> [!info] Context
> Как сделать серверный рендеринг с MobX без Next.js: полный флоу от HTTP-запроса до HTML на клиенте, гидратация стора, паттерн client-only компонентов, SSG через nginx. Нужно знать: трёхслойную архитектуру, globalContext.

## Overview

SSR с MobX — это не магия Next.js. Это воспроизводимый семишаговый флоу, который работает с любым бандлером и любым Node.js-фреймворком. Проверено на проектах уровня банков и бирж.

```
HTTP Request
     ↓
1. Создать globalContext (сторы, api, actions) — чистый, для этого запроса
     ↓
2. Передать через Context в <App />
     ↓
3. Роутинг → определить страницу из req.originalUrl → положить в стор
     ↓
4. renderToString(<App />) — первый прогон
     ↓
5. Дождаться завершения всех async-операций (API-запросы, эффекты)
     ↓
6. renderToString(<App />) — второй прогон с уже заполненным стором
     ↓
7. Стор → JSON → вставить в HTML → отдать клиенту
```

## Deep Dive

### Шаги 1–4: Создание контекста и первый рендер

На каждый HTTP-запрос — новый изолированный контекст:

```typescript
// server.ts
app.get('*', async (req, res) => {
  // Шаг 1: создаём чистые сторы
  const globals = createContextProps({
    req,
    res,
    api,
    staticStores: {
      user: new UserStore(),
      ui: new UIStore(),
      router: new RouterStore(),
    },
    globalActions,
  });

  // Шаг 3: роутинг
  globals.store.router.currentPath = req.originalUrl;

  // Шаг 4: первый рендер (запускает компоненты, они вызывают API через useEffect/lifecycle)
  renderToString(
    <StoreContext.Provider value={globals}>
      <App />
    </StoreContext.Provider>
  );

  // ... продолжение ниже
})
```

### Шаг 5: Ожидание async-операций

Это самый важный шаг. Компоненты при рендере запускают API-запросы (через lifecycle VM, useSsrEffect и т.п.). Нужно дождаться их завершения до второго рендера.

Есть два подхода:

**Подход А: своя система трекинга** (использует автор)
`globalContext` знает обо всех запущенных async-операциях через API-слой. После первого `renderToString` ждём, пока все закончатся:

```typescript
await waitForAllActionsToComplete(globals);
```

**Подход Б: React Suspense**
Компоненты оборачиваются в Suspense, используется `renderToPipeableStream` или `renderToReadableStream`. Более стандартный способ, но требует другой архитектуры компонентов.

### Шаг 6: Второй renderToString

После того как сторы заполнены данными с бэка — делаем финальный рендер. Вся async-логика мокируется (она уже отработала), рендер синхронный:

```typescript
// Мокируем async, чтобы второй рендер был синхронным
globals.api = createMockedApi(globals);

const html = renderToString(
  <StoreContext.Provider value={globals}>
    <App />
  </StoreContext.Provider>
);
```

> [!tip]
> Если использовать Suspense — шаг 6 не нужен. `renderToPipeableStream` сам дождётся данных.

### Шаг 7: Сериализация стора и отправка клиенту

```typescript
const storeSnapshot = JSON.stringify({
  user: globals.store.user,
  ui: globals.store.ui,
  // ...
});

const fullHtml = `
  <!DOCTYPE html>
  <html>
    <body>
      <div id="root">${html}</div>
      <script>window.__STATE_FROM_SERVER__ = ${storeSnapshot}</script>
    </body>
  </html>
`;

res.send(fullHtml);
```

### Гидратация на клиенте

На клиенте — просто заполняем сторы из window:

```typescript
// client.ts
const globals = createContextProps({ ... });

// Восстанавливаем серверное состояние
Object.assign(globals.store.user, window.__STATE_FROM_SERVER__.user);
Object.assign(globals.store.ui, window.__STATE_FROM_SERVER__.ui);

hydrateRoot(
  document.getElementById('root'),
  <StoreContext.Provider value={globals}>
    <App />
  </StoreContext.Provider>
);
```

Или через паттерн `Hydratable` (из lookarious):

```typescript
interface Hydratable<T> {
  hydrate(data: T): Promise<void>;
  extract(): T;
}

// В сторе:
class ComponentStore implements Hydratable<ComponentHydrationData> {
  async hydrate(data) {
    this.setComponents(data.rawComponents);
    this.allComponentsLoaded = data.allComponentsLoaded;
  }

  extract(): ComponentHydrationData {
    return {
      rawComponents: this.rawComponents,
      allComponentsLoaded: this.allComponentsLoaded
    };
  }
}

// Сериализация на сервере:
const serializedData = serialize({
  component: componentStore.extract(),
  dashboard: dashboardStore.extract(),
});

// Восстановление на клиенте:
await componentStore.hydrate(deserializedData.component);
```

### Client-only компоненты

Если часть страницы не должна рендериться на сервере (например, тяжёлые виджеты, зависящие от window):

```typescript
function ClientOnlySection() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    setShouldRender(true)
  }, [])

  if (!shouldRender) return null;

  return <HeavyWidget />
}
```

Сервер рендерит `null`. Клиент после гидратации вызывает `useEffect` (который на сервере не вызывается) и запускает рендер. Конфликтов гидратации нет.

Или через хук:

```typescript
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  return isClient;
}

function Section() {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <HeavyWidget />;
}
```

### SSG: статическая генерация без Next.js

SSG можно прикрутить к обычному express/ultimate-express за несколько строк:

```typescript
app.get('*', async (req, res) => {
  const clearedUrl = req.path.replace(/\//g, '_');
  const filePath = `ssg/${clearedUrl}.html`;

  // Если HTML уже сгенерирован — отдаём сразу
  if (!fs.existsSync(filePath)) {
    const html = await renderPage(req);
    fs.writeFileSync(filePath, html, 'utf-8');
  }

  return res.send(fs.readFileSync(filePath));
})
```

nginx смотрит сначала в папку `ssg/` — если файл есть, Node.js вообще не трогается:

```nginx
location / {
  try_files /ssg$uri.html /ssg$uri/index.html @node;
}

location @node {
  proxy_pass http://localhost:3000;
}
```

HTML создаётся при первом запросе пользователя, не при билде. Минус — первый пользователь ждёт. Решение: «прогрев» через скрипт после деплоя.

> [!tip]
> Зачем тащить Next.js, если это делается в 10 строк? Next нужен, когда хочется экосистему, готовые решения для Image Optimization, ISR и т.п. Для кастомного SSR — своё решение проще и быстрее.

### Сервер: ultimate-express

Вместо `express` стоит использовать `ultimate-express` — синтаксис идентичен, но это самый быстрый Node.js HTTP-сервер:

```typescript
import { createServer } from 'ultimate-express';

const app = createServer();

app.get('*', async (req, res) => {
  // Тот же код, что и с express
});
```

## Exercises

1. Нарисуй схему SSR-флоу (7 шагов) своими словами. Где создаётся globalContext? Зачем два renderToString?

2. Что будет, если передавать один синглтон-стор для всех SSR-запросов? Придумай конкретный сценарий, где это сломается.

3. Напиши `useIsClient` хук и объясни: почему `useEffect` не вызывается на сервере?

4. Почему при SSG первый пользователь ждёт дольше, чем последующие? Как это решить?

## Anki Cards

> [!tip] Flashcard
> Q: Почему при SSR нужен новый globalContext на каждый HTTP-запрос?
> A: Если использовать один синглтон — данные разных пользователей и запросов перемешаются. Контекст изолирует состояние каждого запроса.

> [!tip] Flashcard
> Q: Зачем в SSR-флоу два вызова renderToString?
> A: Первый запускает компоненты, они инициируют API-запросы. Второй — после того как сторы заполнены, делает финальный синхронный рендер с реальными данными.

> [!tip] Flashcard
> Q: Как клиент восстанавливает состояние после SSR?
> A: Сервер кладёт сериализованный стор в HTML (`window.__STATE_FROM_SERVER__`). Клиент при инициализации читает его и делает `Object.assign` в сторы перед `hydrateRoot`.

> [!tip] Flashcard
> Q: Как сделать client-only компонент (не рендерится на сервере)?
> A: `useState(false)` + `useEffect(() => setShouldRender(true), [])` + `if (!shouldRender) return null`. `useEffect` не выполняется при SSR, поэтому сервер всегда рендерит null.

> [!tip] Flashcard
> Q: Чем SSG отличается от SSR в данном подходе?
> A: SSG кэширует результат renderToString в .html файл и при следующих запросах отдаёт файл напрямую (через nginx), не обращаясь к Node.js.

## Related Topics

- [[dk-layered-architecture]]
- [[dk-context-and-di]]
- [[mobx-ssr]]
- [[ssr-store-serealization-mobx]]

## Sources

- [dk-boilerplate server.tsx](https://github.com/dkazakov8/dk-boilerplate/blob/master/src/server.tsx#L84)
- [reactive-route SSR example](https://github.com/dkazakov8/reactive-route/blob/master/examples/react/src/server.tsx)
- [ultimate-express](https://github.com/nicolo-ribaudo/ultimate-express)

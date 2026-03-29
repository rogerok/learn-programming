---
tags: [mobx, architecture, stores, context, code-splitting, singleton]
---

# Chapter: Трёхслойная архитектура сторов в MobX

> [!info] Context
> Как организовать сторы в реальном приложении: где хранить данные, как передавать их вниз по дереву компонентов, почему синглтоны ломаются при масштабировании. Тема для тех, кто уже знает базовый MobX и чувствует, что «просто global store» недостаточно.

## Overview

Ключевой концепт: **«низшие знают о высших, но высшие не знают о низших и о соседних»**.

Из этого принципа вытекает трёхслойная модель:

```
Global Store     ← данные всего приложения (юзер, UI, справочники)
     ↑
Page Store       ← данные конкретной страницы (таблица, форма, фильтры)
     ↑
ViewModel (VM)   ← локальное состояние компонента, computed-геттеры
```

Направление стрелок — направление доступа. VM знает о Page Store и Global Store. Page Store знает о Global Store. Global Store не знает ни о ком.

## Deep Dive

### Зачем не один большой глобальный стор?

Синглтон (один глобальный стор с `import globalStore from './store'`) создаёт ряд проблем:

- **Нет SSR.** При серверном рендеринге каждый HTTP-запрос должен получить чистые сторы. Синглтон — один на весь процесс.
- **Нет code splitting.** Синглтон всегда попадает в главный чанк, даже если страница, для которой он нужен, загружается лазилевым импортом.
- **Ручная очистка.** Переходя между страницами, нужно вручную сбрасывать устаревшие данные.
- **Прерывание асинхронщины.** Незавершённые запросы с предыдущей страницы могут упасть с ошибкой в консоль.

### Слой 1: Global Store

Хранит данные, нужные глобально: текущий пользователь, локализация, словари с бэка (список городов и т.п.), состояние нотификаций и модалок.

Передаётся вниз через корневой React Context:

```tsx
<StoreContext.Provider value={{ store: { ui, user, dicts } }}>
  <App />
</StoreContext.Provider>
```

### Слой 2: Page Store (Modular Store)

Хранит данные, нужные конкретной странице или фиче: данные таблицы, конфиги форм, результаты фильтров. Создаётся при маунте страницы, уничтожается при размаунте.

```tsx
// Передаётся через контекст на уровне страницы
<PageContext.Provider value={{ pageStore }}>
  <PageContent />
</PageContext.Provider>
```

**Killer-фичи:**
- При уходе со страницы стор уничтожается → не нужно вручную очищать
- Можно прерывать все незавершённые запросы при размаунте
- Живёт в отдельном чанке (code splitting) → не раздувает главный бандл

### Слой 3: ViewModel (Local Store)

Замена React-хукам для компонентной логики. Содержит: локальный стейт, обработчики событий (onClick и т.п.), computed-геттеры для форматирования данных, жизненный цикл (afterMount/beforeUnmount).

В конструктор принимает Global Store и Page Store (через контекст или аргументы).

Подробнее — в [[dk-view-model-pattern]].

### Пример: однонаправленная зависимость

```typescript
class GlobalStore { gData = 1 }

class ModularStore {
  constructor(private global: GlobalStore) {}

  mData = 1;

  get data() { return this.global.gData + this.mData }
}

class LocalStoreVM {
  constructor(private global: GlobalStore, private modular: ModularStore) {}

  lData = 1;

  get data() { return this.global.gData + this.modular.mData + this.lData }
}
```

Если вдруг в Global Store понадобилось что-то из Modular — это сигнал: данные должны быть глобальными. Нарушение направления = подсказка по архитектуре.

### Вариант с глобальным контейнером (без отдельного контекста)

Неканонический, но рабочий подход — хранить модульные сторы в глобальном объекте:

```typescript
class StoreGlobal {
  pages = {}
}

export const storeGlobal = new StoreGlobal();
```

```tsx
function MyPage() {
  useEffect(() => {
    storeGlobal.pages.myPage = new StoreMyPage()

    return () => {
      storeGlobal.pages = {}
    }
  }, [])

  if (!storeGlobal.pages.myPage) return <Loader />
}
```

Не нужны отдельные контексты и дополнительные импорты. Если роутер поддерживает lifecycle-хуки — инициализацию можно перенести на уровень роутера, убрав весь boilerplate из компонентов.

> [!warning] Ограничение
> Этот вариант с синглтоном не поддерживает SSR. Если нужен SSR — передавай глобальный стор через контекст.

### Синглтон vs. Context: когда что?

| | Синглтон | Context |
|---|---|---|
| SSR | ❌ | ✅ |
| Code splitting | ❌ | ✅ |
| Тестирование (моки) | Сложно | Легко |
| Простота настройки | ✅ | Сложнее |
| Для простых SPA | Подойдёт | Избыточно |

> [!tip] Правило выбора
> Если приложение простое и без SSR — синглтон допустим. Если сложное, с SSR, или планируешь рост — сразу берй контекст. Перейти с синглтона на контекст несложно, но проще заложить с нуля.

### Структура проекта со слоями

```
stores/
  global/
    user.store.ts
    ui.store.ts
    dicts.store.ts
pages/
  product/
    product.store.ts   ← Page Store (в отдельном чанке)
    product.actions.ts
    ProductPage.tsx
    components/
      ProductCard/
        ProductCard.vm.ts  ← ViewModel
        ProductCard.tsx
```

## Exercises

1. Есть приложение с синглтоном `appStore`. Переведи его на трёхслойную схему: выдели Global, Page и VM-слой. Какие данные куда переедут?

2. Напиши `PageStore` для страницы списка товаров. Он должен: хранить массив товаров, флаг загрузки и строку поиска. Global Store пусть хранит данные авторизованного пользователя.

3. Создай `ModularStore`, который принимает `GlobalStore` в конструктор и имеет computed-геттер, зависящий от обоих. Проверь: если добавить зависимость от чего-то «вниз по дереву» — что пойдёт не так?

## Anki Cards

> [!tip] Flashcard
> Q: Какой принцип описывает направление зависимостей в трёхслойной архитектуре MobX?
> A: «Низшие знают о высших, но высшие не знают о низших и соседних». VM → Page Store → Global Store, но не наоборот.

> [!tip] Flashcard
> Q: Почему синглтон-стор не поддерживает SSR?
> A: При SSR каждый HTTP-запрос должен иметь чистые сторы. Синглтон один на весь процесс Node.js — данные разных запросов перемешаются.

> [!tip] Flashcard
> Q: Какие killer-фичи есть у модульного (постраничного) стора?
> A: 1) Уничтожается при размаунте — не нужна ручная очистка. 2) Можно прервать все незавершённые запросы страницы. 3) Живёт в отдельном чанке — не раздувает главный бандл.

> [!tip] Flashcard
> Q: Если в Global Store понадобились данные из Page Store — что это значит?
> A: Данные на самом деле глобальные. Их надо переместить в Global Store — это архитектурный сигнал.

## Related Topics

- [[dk-actions-and-api-layers]]
- [[dk-view-model-pattern]]
- [[dk-context-and-di]]
- [[dk-ssr-and-ssg]]
- [[in-depth-explanation-of-MobX]]

## Sources

- [dk-boilerplate: client.tsx](https://github.com/dkazakov8/dk-boilerplate/blob/master/src/client.tsx#L18)
- [mobx-use-store](https://github.com/dkazakov8/dk-framework/tree/master/packages/mobx-use-store)

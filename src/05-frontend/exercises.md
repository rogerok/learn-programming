---
tags: [frontend, react, mobx, practice]
aliases: [Практика React и MobX]
---

# Практика React и MobX: от render к реактивному графу

## Как выполнять

Задания идут по зависимостям: **predict → explain → modify → implement → diagnose → transfer**. Не переходите дальше, пока не выполнена наблюдаемая приёмка предыдущего задания.

React-фрагменты ниже — JSX-псевдокод: их можно перенести в любой уже имеющийся React playground с поддержкой hooks. Создавать новый проект или подключать неуказанный framework не требуется. Если playground недоступен, выполните ручную трассировку: одна строка таблицы на событие, изменение state, render, effect и cleanup. Во всех заданиях считайте, что `StrictMode` выключен.

## 1. Predict: граница повторного render

**Результат:** предсказать, какие компоненты выполнятся после локального изменения state, не путая render с изменением DOM.

**Пререквизиты:** [[react/advanced/1.rerenders|Re-renders: когда и почему]], базовые `useState` и обработчики событий.

```jsx
function SlowReport() {
  console.log("SlowReport render");
  return <p>report</p>;
}

function App() {
  const [open, setOpen] = useState(false);
  console.log("App render", open);

  return (
    <main>
      <button onClick={() => setOpen(value => !value)}>toggle</button>
      {open && <p>dialog</p>}
      <SlowReport />
    </main>
  );
}
```

**Задание:** до запуска запишите последовательность сообщений для первого mount и двух нажатий `toggle`. Отдельно отметьте, какие DOM-узлы, по вашему прогнозу, действительно изменятся.

**Наблюдаемая приёмка:** есть таблица `событие → владелец state → выполненные компоненты → изменившиеся DOM-узлы`; после запуска прогноз сопоставлен с фактическим console log без изменения кода компонента.

**Проверка:** очистите console, выполните mount → click → click и запишите расхождения. При ручной трассировке пройдите те же три шага сверху вниз по дереву вызовов.

<details>
<summary>Подсказка 1</summary>

Начните трассировку с компонента, которому принадлежит обновлённый state.
</details>

<details>
<summary>Подсказка 2</summary>

Вызов функции компонента и запись в DOM — разные события.
</details>

<details>
<summary>Подсказка 3</summary>

Проверьте всех потомков владельца state, даже если их props визуально не изменились.
</details>

**Рефлексия:** какое наблюдение доказывает, что «повторный render» не означает «полная перерисовка DOM»?

## 2. Explain: identity и сохранение state

**Результат:** объяснить сохранение или сброс state через тип, позицию и `key` элемента.

**Пререквизиты:** задание 1 и [[react/MOC#1. Render, identity и state|базовая модель identity]]. После композиции сверьте объяснение с [[react/advanced/6.Deep dive into diffing and reconciliation|разбором reconciliation]].

```jsx
function Counter({ label }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{label}: {count}</button>;
}

function Demo() {
  const [compact, setCompact] = useState(false);
  return (
    <section>
      <button onClick={() => setCompact(value => !value)}>mode</button>
      {compact ? <Counter label="compact" /> : <Counter label="full" />}
    </section>
  );
}
```

**Задание:** нажмите `Counter` дважды, переключите `mode`, затем снова нажмите `Counter`. Объясните наблюдение языком element identity. После этого предложите только одну минимальную модификацию дерева, которая намеренно изменит поведение state при смене режима.

**Наблюдаемая приёмка:** записано значение до и после `mode`; объяснение явно использует три критерия — тип, позицию и `key`; предложенная модификация проверена тем же сценарием.

**Проверка:** сценарий одинаков для исходного и изменённого дерева: `Counter ×2 → mode → Counter ×1`. При ручной проверке нарисуйте пары элементов предыдущего и следующего дерева.

<details>
<summary>Подсказка 1</summary>

Сравнивайте возвращаемые элементы, а не текст `label`.
</details>

<details>
<summary>Подсказка 2</summary>

React сопоставляет соседей на одном уровне дерева.
</details>

<details>
<summary>Подсказка 3</summary>

`key` участвует в identity вместе с типом и позицией; выберите значение, связанное с режимом.
</details>

**Рефлексия:** когда намеренный сброс state полезнее его сохранения?

## 3. Modify: effect с актуальным запросом и cleanup

**Результат:** изменить effect так, чтобы устаревший запрос не перезаписывал актуальный результат, а незавершённая работа завершалась при cleanup.

**Пререквизиты:** задания 1–2, [[react/6-react-use-effect-secrets|useEffect]], `Promise` и `AbortController`; для углубления — [[react/advanced/15.data_fetching_and_race_conditions|Data fetching и race conditions]].

```jsx
// Псевдокод окружения: A завершается за 400 ms, B — за 50 ms.
function fakeFetch(id, { signal }) {
  return delayedValue({ id }, id === "A" ? 400 : 50, signal);
}

function Profile({ id }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fakeFetch(id, { signal: undefined })
      .then(setProfile)
      .catch(error => console.log(error.name));
  }, [id]);

  return <output>{profile?.id ?? "loading"}</output>;
}
```

**Задание:** измените только effect. Интерфейс `fakeFetch` менять нельзя. Учтите смену `id`, unmount и ошибку отмены отдельно от настоящей ошибки.

**Наблюдаемая приёмка:** при `A → B` быстрее 50 ms финальный `<output>` всегда показывает `B`; после unmount нет обновления state; отмена не выводится как прикладная ошибка, а остальные ошибки остаются наблюдаемыми.

**Проверка:** выполните вручную или в playground три сценария: `A → B`, `A → unmount`, один отклонённый запрос не из-за отмены. Для каждого запишите запуск, cleanup и допустивший обновление запрос.

<details>
<summary>Подсказка 1</summary>

Каждый запуск effect должен владеть собственным ресурсом отмены.
</details>

<details>
<summary>Подсказка 2</summary>

Cleanup предыдущего запуска происходит до следующего effect и при unmount.
</details>

<details>
<summary>Подсказка 3</summary>

Передайте `signal` в уже объявленный интерфейс и различайте причину отклонения `Promise`.
</details>

**Рефлексия:** какую гарантию даёт отмена, которой не даёт одна лишь проверка «последней версии» ответа?

## 4. Implement: композиция и локализация state

**Результат:** собрать компонент из slots и поместить state на минимально необходимую границу render.

**Пререквизиты:** задания 1–3, [[react/advanced/2.elements,children as props, and re-renders|Elements и children как props]], [[react/advanced/3.Configuration concerns with elements as props|Конфигурация через elements]], [[react/advanced/4.Advanced configuration with render props|Render props]].

```jsx
function SlowReport() {
  console.log("SlowReport render");
  return <p>expensive report</p>;
}

// Реализуйте Panel и OpenPanel.
// Panel получает header, children и функцию renderActions({ close }).
// OpenPanel владеет open и передаёт close в renderActions.

function App() {
  return (
    <main>
      <OpenPanel
        header={<h2>Filters</h2>}
        renderActions={({ close }) => <button onClick={close}>close</button>}
      >
        <label>Query <input /></label>
      </OpenPanel>
      <SlowReport />
    </main>
  );
}
```

**Задание:** реализуйте `Panel` и `OpenPanel` без Context и без глобального state. Кнопки открытия и закрытия должны находиться внутри этой композиции; `App` не должен владеть `open`.

**Наблюдаемая приёмка:** пользователь может открыть и закрыть панель; заголовок и content передаются как элементы, действия получают `close`; после первоначального mount действия панели не добавляют новых `SlowReport render` в console.

**Проверка:** `mount → open → close → open`; зафиксируйте видимость панели и количество сообщений `SlowReport render` после каждого шага. При ручной проверке отметьте владельца `open` и границу его поддерева.

<details>
<summary>Подсказка 1</summary>

Сначала проведите границу компонента, внутри которой нужен `open`.
</details>

<details>
<summary>Подсказка 2</summary>

Готовый React element можно передать как данные композиции; он не обязан создаваться владельцем локального state.
</details>

<details>
<summary>Подсказка 3</summary>

Render prop нужен там, где вызывающему коду требуется доступ к `close`, но владение `open` переносить нельзя.
</details>

**Рефлексия:** почему перенос state часто устраняет лишнюю работу раньше и надёжнее, чем `React.memo`?

## 5. Diagnose: динамическая зависимость MobX

**Результат:** диагностировать изменение графа зависимостей как ожидаемое поведение или дефект модели, не добавляя подписки наугад.

**Пререквизиты:** задания 1–4, [[mobx/in-depth-explanation-of-MobX|observable, computed и reaction]].

```text
state = observable({
  useNickname: false,
  firstName: "Ada",
  lastName: "Lovelace",
  nickname: "Enchantress"
})

fullName = computed(() => state.firstName + " " + state.lastName)

dispose = autorun(() => {
  print(state.useNickname ? state.nickname : fullName())
})

action(() => state.firstName = "Augusta")
action(() => state.useNickname = true)
action(() => state.firstName = "Ada")
action(() => state.nickname = "Countess")
dispose()
action(() => state.nickname = "Byron")
```

**Задание:** до выполнения нарисуйте граф чтений `autorun` после каждого action и предскажите, на каких шагах вызовется `print`. Затем решите, является ли отсутствие одного из ожидаемых пользователем сообщений дефектом MobX или неверным ожиданием, и обоснуйте это фактическими чтениями.

**Наблюдаемая приёмка:** трасса содержит набор зависимостей после каждого запуска, моменты invalidation и состояние после `dispose`; диагноз не предлагает искусственно читать неиспользуемое поле.

**Проверка:** проиграйте псевдокод строка за строкой. Для каждого action задайте два вопроса: «поле сейчас отслеживается?» и «изменился ли результат наблюдаемой ветки?». Реальная библиотека не требуется.

<details>
<summary>Подсказка 1</summary>

MobX отслеживает свойства, фактически прочитанные во время последнего выполнения derivation.
</details>

<details>
<summary>Подсказка 2</summary>

Условная ветка может удалить старые рёбра и добавить новые.
</details>

<details>
<summary>Подсказка 3</summary>

После `dispose` сначала проверьте существование reaction, а уже затем изменение observable.
</details>

**Рефлексия:** чем динамический граф MobX отличается от статического списка зависимостей effect?

## 6. Transfer: React + MobX по границам жизненного цикла

**Результат:** перенести модели render identity, effects и derivations в архитектуру новой страницы без общего singleton.

**Пререквизиты:** задания 1–5, [[mobx/dk-layered-architecture|Global / Page / ViewModel]], [[mobx/dk-actions-and-api-layers|Actions и API]], [[mobx/dk-context-and-di|Context и DI]].

**Сценарий:** страница каталога должна показывать текущего пользователя, загружать товары, фильтровать их по строке поиска, хранить раскрытие карточки до её удаления и отменять запрос при уходе со страницы. Другие страницы используют того же пользователя, но не товары и не фильтр.

**Задание:** спроектируйте только границы и публичные контракты:

1. распределите данные между Global Store, Page Store, ViewModel и локальным React state;
2. обозначьте `observable`, чистые `computed`, `action` и единственную необходимую reaction, если она действительно нужна;
3. покажите направление зависимостей и место создания/уничтожения Page Store;
4. задайте стабильную identity карточек при фильтрации;
5. опишите cleanup незавершённого запроса без привязки к router framework.

**Наблюдаемая приёмка:** схема допускает две одновременные инстанции страницы без смешивания товаров; уход с одной страницы освобождает её reaction и запрос, не очищая пользователя; смена фильтра меняет derived-список без копии исходных товаров; состояние карточки следует за её стабильной identity.

**Проверка:** вручную проиграйте `mount page A → load → type filter → expand card → mount page B → unmount A`. На каждом шаге перечислите живые store/VM/reaction, наблюдаемые поля и видимый UI. Нарушение направления `VM → Page → Global` считается провалом проверки.

<details>
<summary>Подсказка 1</summary>

Срок жизни данных — первый критерий выбора слоя.
</details>

<details>
<summary>Подсказка 2</summary>

Если значение полностью выводится из observable state, сначала рассмотрите `computed`, а не вторую копию данных.
</details>

<details>
<summary>Подсказка 3</summary>

Создание и уничтожение Page Store должны совпадать с границей страницы, а не процесса приложения.
</details>

**Рефлексия:** какие две ошибки из React-части повторились бы в MobX-дизайне при неверном владельце state или неверном сроке жизни store?

## Связанные материалы

- [[react/MOC|Маршрут React]]
- [[mobx/MOC|Маршрут MobX]]
- [[../01-javascript/MOC|JavaScript]]
- [[../04-architecture/MOC|Architecture]]

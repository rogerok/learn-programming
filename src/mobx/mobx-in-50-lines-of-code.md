# MobX в 50 строчек кода

[оригинал](https://mobx-cookbook.github.io/mobx-inside)

## Шаг 1

Реализуем классический паттерн `Observer`.
Он состоит из двух частей:

- Наблюдаемого (observable)
- Наблюдатель (observer)

Наблюдатель подписывается на изменения наблюдаемого значения, а наблюдаемое значение предоставляет способ
подписаться на свои изменения.

```typescript
const observable = (value) => ({
    value: value,
    observers: new Set(),
    subscribe(observer) {
        this.observers.add(observer)
    },
    unsubscribe() {
        this.observers.delete(observer)
    },
    get() {
        return this.value
    },
    set(value) {
        this.value = value;
        this.observers.forEach((notify) => notify())
    }
})
```

Протестируем этот объект:

```typescript

const title = observable('Mobx article');
const views = observable(10);

const logTitle = () => console.log(title.get())
title.subscrive(logTitle);

title.set('Lets write mobx under 50 LOC');
views.set(11)
```

Результат
`Lets write Mobx under 50 LOC`

Мы создали два объекта `observable` - `title` и `views`, затем обновили их значения.
Подписка была только на изменения `title`, поэтому `console.log` отработал единожды.
Наиболее частая причина потеря реактивности - отсутствие подписки.

## Шаг 2

Создаём React компонент и подписываемся на изменения.

```typescript jsx
import {useState} from "react";

const useRerender = () => {
    const [, setValue] = useState();
    return () => setValue([])
}

const Article = () => {
    const rerender = useRerender();


    useEffect(() => {
        views.subscribe(rerender);
        title.subscribe(rerender);

        return () => {
            views.unsubscribe(rerender);
            title.unsubscribe(rerender);
        }
    }, []);

    return (
        <div>
            `Article title ${title.get()} `
            `Views: ${views.get()}`

            <button onClick={() => views.set(views.get() + 1)}>increase</button>
        </div>
    )
}
```

Для перерисовки компонента мы создали хук `useRerender`.
`useEffect` используется для ручной подписки на изменения.
В данной реализации все подписки явны и мы подписываемся на них вручную, это может повлечь за собой много ошибок и
проблем.
Поэтому MobX делает всё за нас.

## Шаг 3

Для понимания какие компоненты от каких observable зависят, MobX запоминает прочитанные observable значения во время
отрисовки компонента.
Попробуем воссоздать `autorun`.
Добавим запоминание прочитанных observable в глобальную переменную `readObservables`:

```typescript

const readObservable = new Set();

const observable = (value) => ({
    value: value,
    observers: new Set(),
    subscribe(observer) {
        this.observers.add(observer);
    },
    unsubscribe() {
        this.observers.remove(observer);
    },
    get() {
        readObservables.add(this);

        return this.value
    },
    set(value) {
        this.value = value;
        this.observers.forEach((notify) => notify());
    }
})
```

Т.е теперь геттер объекта `observable` _не только возвращает значение, но и запоминает то, что объект был прочитан_.
Ф-ция `autorun` в простейшем виде.

```typescript
const autorun = (fn) => {
    /*
    – Очищаем глобальный Set readObservables, чтобы начать "чистый трек"
    – Никаких старых зависимостей из прошлых запусков
     */
    readObservables.clear();
    /*
    get() {
      readObservables.add(this) // ← вот тут магия
      return this.value
    }
    */
    fn();

    /*
    Теперь Set уже не пустой — в нём title и views
    Мы подписываемся на них, чтобы в будущем fn вызывалась при изменении
     */
    readObservables.forEach((observable) => observable.subscribe(fn));

    return () => readObservables.forEach((observable) => observable.unsubscribe());
}
```

Ф-ция `autorun` выполняет ф-цию `fn`, затем проходится по всем прочитанным observable и создаёт подписку.
Возвращает ф-цию для отписки.

Протестируем:

```typescript
const title = observable('Mobx article');
const views = observable(10);

const dispose = autorun(() => {
    /*
        Во время вызова @param{fn()} вызываются геттеры и views, titles добавляются в readObservables
     */
    console.log(`Article: ${title.get()}. Views: ${views.get()}`)
})

views.set(11);
title.set('Lets write MobX under 50 LOC')

dispose();
views.set(12);
```

Вывод кода в консоли:

`
Article "Mobx article". Views 10
Article "Mobx article". Views 11
Article "Lets write Mobx under 50 LOC". Views 11
`
Таким образом `autorun` теперь знает что `fn` зависит от `title` и `views`, поэтому позже при вызове `set()` будет
вызвана `fn` заново.

Мы воссоздали механизм автоматических подписок. Обратите внимание, что после вызова `dispose` слушатель не вызвался,
потому что эта функция прекращает подписку.

## Шаг 4

Создадим ф-цию observer, которая будет автоматически подписываться на изменения в observable

```typescript
const useRerender = () => {
    const [, setValue] = useState([])
    return () => setValue([])
}

const observer = (component) => (...props) => {
    const rerender = useRerender();
    readObservables.clear();
    const result = component(...props);

    useEffect(() => {
        readObservables.forEach((observable) => observable.subscribe(rerender));

        return () => readObservables.forEach((observable) => unsubscribe(rerender));
    }, []);

    return result;
}

```

`observer` - HOC, который принимает компонент. Возвращает ф-цию, которая вызывает компонент, передает в него пропсы, и
делает его реактивным.

В `useEffect` подписываемся на все прочитанные observable;

При монтировании компонента:

- Подписываемся на все observable, которые были прочитаны, при вызове компонента.
- Если они изменятся, вызовется `rerender()` и компонент перерисуется.
  При размонтировании отписываемся от всех observable.

Пример

```typescript jsx
const Title = observer(() => {
    return <h1>{title.get()}</h1>
})
```

Что происходит:

1) Вызывается `observer`

```typescript jsx
const Title = observer(() => {...
})
```

- Компонент оборачивается ф-цией `observer`
- Он возвращает _новую обернутую ф-цию_, которая теперь:
    * делает `readObservable.clear()`
    * вызывает оригинальный компонент
    * собирает все зависимости
    * подписывается на них
    * возвращает результат рендера

2) React вызывает компонент `Title()`
   На первом рендере React вызывает ф-цию-компонент, обернутую в `observer`

```typescript jsx
const rerender = useRerender()               // создаём функцию для форс-перерисовки
readObservables.clear()                      // 1️⃣ очищаем зависимости
const result = component(...props)           // 2️⃣ вызываем компонент

```

3) Во время вызова `component(...props)`

```typescript jsx
<h1>{title.get()}</h1>
```

- `title.get()` запускает геттер observable

```typescript jsx
get()
{
    readObservables.add(this)
    return this.value
}
```

Т.е. `title` добавляется в `readObservable`, потому что его значение было прочитано

4) После вызова компонента - `useEffect`

```typescript jsx
useEffect(() => {
    readObservables.forEach((observable) => observable.subscribe(rerender))

    return () => readObservables.forEach((observable) => observable.unsubscribe(rerender))
}, [])

```

- Компонент уже отрисован
- В `readObservables` уже лежит `title`
- Мы подписываемся на `title`, передавая ему `rerender`

5) Что будет при `title.set()` ?
   ```title.set('Hi')```

- Внутри `set()` вызываются все подписанные функции. В нашем случае - rerender.
- `rerender()` вызывает `setState([])` - это заставляет React перерисовывать компонент.
- При новом рендере:
    * `readObservables.clear()`
    * компонент вызывается
    * `title.get()` снова вызывает `readObservables.add(this)`
    * снова подписка через `useEffect`, (но она уже есть, так как массив зависимостей пуст — [])

Но в чём подвох?
Если вдруг в будущем:
компонент перестаёт использовать title, но начинает использовать другой observable (views)

useEffect не перезапускается → подписка на старое значение (title) остаётся, а новая подписка на views не появится

Это и есть oversubscription — компонент подписан на данные, которые больше не нужны
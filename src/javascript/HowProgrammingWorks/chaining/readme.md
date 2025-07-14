# [Chaining with classes, ptototypes and functors](https://github.com/HowProgrammingWorks/Chaining/tree/master)

Chaining - это способ вызова методов, когда каждый вызов возвращает объект, который позволяет вызвать следующий метод.

Index:
src/javascript/HowProgrammingWorks/chaining/6.promise.js

## 📦 Async ArrayChain

Реализация цепочек `map`, `filter`, `reduce` с асинхронной поддержкой и Node-style callback API.

---

## Цель

Создать класс, который позволяет выполнять асинхронные операции над массивами в виде цепочки вызовов:

```ts
new ArrayChain([1, 2, 3])
    .map(async x => x * 10)
    .filter(async x => x > 10)
    .reduce(async (a, b) => a + b, 0)
    .then(console.log); // Выведет 50
```

---

## Идея

Каждый шаг преобразует массив асинхронно и возвращает `this`, чтобы продолжить цепочку.

> Основа — обёртка над `Promise`, плюс поддержка Node-style callback через `fetch`.

---

## Реализация

```ts
const api = {}; // внешний API с map/filter/reduce

class ArrayChain {
    constructor(array) {
        // Оборачиваем начальный массив в промис
        this._promise = Promise.resolve(array);
    }

    // Позволяет завершить цепочку
    then(fn) {
        return this._promise.then(fn);
    }

    catch(fn) {
        return this._promise.catch(fn);
    }

    // Поддержка Node-style колбэка
    fetch(fn) {
        return this.then((data) => fn(null, data)).catch((err) => fn(err));
    }

    /**
     * Общий метод для цепочек
     *
     * 1. Получаем массив из предыдущего шага
     * 2. Передаём его в performer (api.map и т.п.)
     * 3. Performer вызывает callback(err, result)
     * 4. Мы оборачиваем это в промис и сохраняем новый state
     */
    _chain(performer, fn, initial) {
        this._promise = this._promise.then((array) => {
            return new Promise((resolve, reject) =>
                performer(
                    array,      // массив из предыдущего шага
                    fn,         // пользовательская функция
                    (err, result) => (err ? reject(err) : resolve(result)), // cb
                    initial     // значение для reduce (если есть)
                )
            );
        });
        return this;
    }

    // Методы API
    map(fn) {
        return this._chain(api.map, fn);
    }

    filter(fn) {
        return this._chain(api.filter, fn);
    }

    reduce(fn, initial) {
        return this._chain(api.reduce, fn, initial);
    }
}
```

---

## Поток исполнения

```
ArrayChain._promise
     ↓
  .then(...)
     ↓
  performer(array, fn, callback, initial)
     ↓
  callback(err, result)
     ↓
  resolve(result) or reject(err)
     ↓
  сохраняется в this._promise
     ↓
  следующий map/filter/reduce
```

---

## Пример использования

```ts
new ArrayChain([1, 2, 3])
    .map(async x => x * 10)         // [10, 20, 30]
    .filter(async x => x > 10)      // [20, 30]
    .reduce(async (a, b) => a + b, 0) // 50
    .then(console.log);
```

---

## 💡 Пример API (внешняя реализация)

```ts
api.map = (array, fn, cb) => {
    Promise.all(array.map(fn))
        .then(result => cb(null, result))
        .catch(cb);
};

api.filter = (array, fn, cb) => {
    Promise.all(array.map(fn))
        .then(results => {
            const filtered = array.filter((_, i) => results[i]);
            cb(null, filtered);
        })
        .catch(cb);
};

api.reduce = (array, fn, cb, initial) => {
    (async () => {
        try {
            let acc = initial ?? array[0];
            const start = initial ? 0 : 1;

            for (let i = start; i < array.length; i++) {
                acc = await fn(acc, array[i]);
            }

            cb(null, acc);
        } catch (err) {
            cb(err);
        }
    })();
};
```

---

## Итого

| Особенность             | Польза                                               |
|-------------------------|------------------------------------------------------|
| Чейнинг (`this`)        | Плавный fluent API                                   |
| Async map/filter/reduce | Поддержка промисов и await                           |
| Node-style `fetch(cb)`  | Легко интегрировать с колбэк-API                     |
| Расширяемость           | Можно добавить `tap`, `sort`, `flatMap`, `log` и др. |



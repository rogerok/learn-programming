// just for example
const api = {};

class ArrayChain {
  constructor(array) {
    // Создаёт промис на массив. Даже если массив обычный, оборачивается в Promise, чтобы начать цепочку.
    this._promise = Promise.resolve(array);
  }

  then(fn) {
    return this._promise.then(fn);
  }

  catch(fn) {
    return this._promise.catch(fn);
  }

  fetch(fn) {
    return this.then((data) => fn(null, data)).catch((err) => fn(err));
  }

  /*
     1) Берём текущий массив из _promise
     2) Передаем его в performer (типа api.map)
     3) Результат снова оборачиваем в _promise, чтобы продолжать цепочку.
   */

  /*
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
  */
  _chain(performer, fn, initial) {
    this._promise = this._promise.then((array) => {
      return new Promise((resolve, reject) =>
        /* @param
          array - массив, полученный из предыдущего шага
          fn - ф-ция преобразователь переданная пользователем
          (err, result) - callback
          initial - необязательное значение для reduce
         */

        performer(
          array,
          fn,
          // performer вызывает cb(err, result)
          // cb либо resolve, либо reject - и цепочка продолжается
          //   Promise.all(array.map(fn))
          //     .then(result => cb(null, result))
          //     .catch(cb);
          (err, result) => (err ? reject(err) : resolve(result)),
          initial
        )
      );
    });
  }

  map(fn) {
    this._chain(api.map, fn);
    return this;
  }

  filter(fn) {
    this._chain(api.filter, fn);
    return this;
  }

  reduce(fn) {
    this._chain(api.reduce, fn);
    return this;
  }
}


// Usage
new ArrayChain([1, 2, 3])
  .map(async x => x * 10)
  .filter(async x => x > 10)
  .reduce(async (a, b) => a + b, 0)
  .then(console.log); // Выведет 50
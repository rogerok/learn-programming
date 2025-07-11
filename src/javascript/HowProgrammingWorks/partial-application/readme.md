# [Частичное применение и каррирование в JavaScript](https://github.com/HowProgrammingWorks/PartialApplication)

Index:
src/javascript/HowProgrammingWorks/partial-application/1.closure.ts
---

## Замыкание

```typescript
const log = (base: number, n: number) => Math.log(n) / Math.log(base);

const createLog = (base: number) => (n: number) => log(base, n);

// Usage

const lg = createLog(10);
const ln = createLog(Math.E);

console.log("lg(5) = " + lg(5));
console.log("lg(5) = " + ln(5));
```

Как это работает:

```typescript
const lg = createLog(10);
```

Число 10 попадает в аргумент base ф-ции `createLog`.
После передачи аргумента `base` , ф-ция  `createLog` возвращает ф-цию, которая уже замкнута на `base`.

```typescript
(n: number) => log(base, n)
```

Чтобы получить результат вычисления, нам нужно вызвать ф-цию два раза. Т.к. `createLog` - лямбда двойной вложенности.

## Лямбда

Index:
src/javascript/HowProgrammingWorks/partial-application/2.lambda.ts

То же самое можно выполнить таким образом

```typescript
const log = (base: number, n: number) => Math.log(n) / Math.log(base);

// Usage

const lg = (n: number) => log(10, n);
const ln = (n: number) => log(Math.E, n);

console.log("lg(5) = " + lg(5));
console.log("ln(5) = " + ln(5));
```

## Bind

Index:
src/javascript/HowProgrammingWorks/partial-application/3.bind.ts

```typescript
const log = (base: number, n: number) => Math.log(n) / Math.log(base);

// Usage

const lg = log.bind(null, 10);
const ln = log.bind(null, Math.E);

console.log("lg(5) = " + lg(5));
console.log("ln(5) = " + ln(5));

```

В данном случае `bind` отправит первый аргумент на место `base` в функции `log`.
У функции остался один аргумент - `n`, далее ф-ции `lg` и `ln` будут передаваться только аргумент `n`.

## Реализация ф-ции partial

Index:
src/javascript/HowProgrammingWorks/partial-application/4.partial.ts

```typescript
const partial = (fn, x) => (...args) => fn(x, ...args);
```

- `fn` - функция

- `x` - значение, которое мы хотим передать в качестве первого аргумента ф-ции `fn`

В результате получаем функцию, в которое может передаться большое кол-во аргументов.
После второго вызова ф-ции `partial`, будет вызвана ф-ция `fn` у которой первым аргументом будет `x`

```typescript
const sum4 = (a: number, b: number, c: number, d: number) => a + b + c + d;

const f11 = partial(sum4, 1);

```

В ф-ции `f11` аргумент `1` будет передан в качестве первого аргумента ф-ции `sum4`.

```typescript
const f12 = partial(f11, 2);
const f13 = partial(f12, 3);
```

В ф-ции `f12` аргумент `2` будет передан в качестве второго аргумента ф-ции `sum4`.
В ф-ции `f13` аргумент `3` будет передан в качестве третьего аргумента ф-ции `sum4`.

```typescript
const y1 = f13(4);
console.log(y1); // результат 10
```

В ф-ции `f13` аргумент `4` будет передан в качестве четвертого аргумента ф-ции `sum4`.

```typescript
const partial = (fn, x) => (...args) => fn(x, ...args);
const sum4 = (a, b, c, d) => a + b + c + d;

const f11 = partial(sum4, 1);
// теперь f11 = (...args) => sum4(1, ...args);
const f12 = partial(f11, 2);

/*
 f12 = (...args) => fn11(2, ...args);
 а вызов f11 возвращает нам ф-цию sum4(1,...args) где args это 2;
 и того f12 = (...args) => sum4(1,2, ...args);
*/

const f13 = partial(fn12, 3);
/*
 f13 = partial((...args) => fn12(2,...args), 3);
  вызов f12 возвращает (...args) => sum4(1,2...args);
  и того f13 = (...args) => sum(1,2,3, ...args); 
 */
const y1 = f13(4);
/*
 y1 = (...args)  => sum(1,2,3,...args);
 где ...args это 4. в итоге мы вызываем ф-цию f13() которая получает аргумент 4 и возвращает результат вызова sum(1,2,3,4)
 */
```

## Реализация ф-ции partialExtended

Index:
src/javascript/HowProgrammingWorks/partial-application/5.partial-extended.ts

```typescript
const partial =
    // @ts-ignore
    (fn, ...args) =>
        // @ts-ignore
        (...rest) =>
            fn(...args.concat(rest));

// Usage
const sum4 = (a: number, b: number, c: number, d: number) => a + b + c + d;

const f21 = partial(sum4, 1, 2);
// f21 = (...rest) => sum4(...[1,2].concat(...rest))
const f22 = partial(f21, 3);
// f22 = partial((...rest) => f21(...[1,2].concat(...rest)))
// f21 возвращает (...rest, => sum4(...[1,2].concat(3))
// f22 = (...rest) => sum4(...[1,2].concat(3));
const y2 = f22(4);
```

## Каррирование

Index:
src/javascript/HowProgrammingWorks/partial-application/6.curry.js
Метод `bind`  возвращает **новую** ф-цию с привязанными аргументами.

````javascript
const curry =
    (fn) =>
        (...args) => {
            if (fn.length > args.length) {
                const f = fn.bind(null, ...args);
                return curry(f);
            } else {
                return fn(...args);
            }
        };

const sum4 = (a, b, c, d) => a + b + c + d;

const f = curry(sum4); // результат f = (...args) => {if(arr.length > 4) {...} else { fn(..args); }}
const y5 = f(1)(2)(3)(4);
````

`f` - функция которая ожидает аргументы `a`, `b`, `c`, `d`

```javascript
const y5 = f(1)(2)(3)(4);
```

### `f(1)`

`f(1)` - где `1` это `(...args) => {if ....}`  функции  `curry`
Т.е. происходит вызов лямбда функции, которую нам вернула ф-ция `curry`
В результате `fn.length > args.length` будет со значением `true`.
В таком случае к `fn` будут привязаны аргументы, переданные в возвращаемую лямбда функцию

```javascript
sum4.bind(null, 1)
```

И возвращена, обернутая в `curry` - `curry(sum4.bind(null, 1))`.
В итоге получается

### `f(1)(2)`

С помощью `(2)` мы вызываем функцию `(...args) => curry(sum4.bind(null, 1))`,
Для наглядности можно изобразить так

```javascript
const temporary = curry(sum4.bind(null, 1))
const f2 = temporary(2);
```

Проверка `if (fn.length > args.length)` возвращает true, тогда
```const fn = sum4.bind(null, 1, 2)```
И т.д., пока не отработает блок `else`

## Каррирование 2

Index:
src/javascript/HowProgrammingWorks/partial-application/7.curry-extended.js

```javascript
const curry = (fn, ...params) => {
    const curried = (...args) => {
        return fn.length > args.length ? curry(fn.bind(null, ...args)) : fn(...args);
    }

    return params.length ? curried(...params) : curried;
}

const sum4 = (a, b, c, d) => a + b + c + d;

const f = curry(sum4);

const y2 = f(1)(2)(3)(4);
```

```javascript
const f = curry(sum4)
```

Первый вызов curry -
в функции происходит проверка:
`params.length ? curried(...params) : curried;` →
`params.length === 0` → возвращается curried`

----
Далее:

```javascript
const y2 = f(1)(2)(3)(4)
```

Раскладываем шаг за шагом:

1) `f1 = curry(sum4.bind(null, 1))`
   Следовательно можем `y2`описать как

    ```javascript
    const y2 = curry(sum4.bind(null, 1))(2)(3)(4);
    ```

   `f(1) → curry(sum4.bind(null, 1)` возвращает новую `curried` функцию `→ fn.length = 3`
2) `f1(2)`
   `params.length === 0`  следовательно мы получаем `curried` функцию

   В ней `fn.length > args.length` - вернет `true` так как `fn.length = 2;`
   следовательно из ф-ции `curried` мы получаем `curry(sum4.bind(null, 1, 2))`;

   `f1(2)
   → curry(sum4.bind(null, 1, 2)) → fn.length = 2`
3) f2(3)
   `params.length` === 0, следовательно, мы получаем `curried` функцию
   в `curried` функцию передаётся аргумент `3`, результат проверки возвращает
   `curry(sum4.bind(null, 1, 2, 3)`
   `fn.length = 1;`
4) f3(4)
   `params.length === 0`, следовательно мы получаем `curried` функцию
   в `curried` ф-цию передаётся аргумент 4, но т.к. `fn.length = 1` и `args.length = 1` происходит вызов `sum4(1,2,34)`,
   что возвращает нам 10

   f3(4)
   → `fn.length = 1, args.length = 1 → 1 === 1 → условие` `false`
   → вызывается: `sum4(1, 2, 3, 4)`
   → возвращается результат: 10

Напоминание:
`Function.prototype.bind` уменьшает `.length`

`.length` говорит сколько ещё параметров НЕ передано
Именно это позволяет делать "отложенное исполнение"

---

`const f = curry(sum4)`
Первый вызов curry:
→ `params.length === 0` → возвращается `curried`

Далее:
const `y2 = f(1)(2)(3)(4)`

Шаг 1:
f(1)
→ args = [1]
→ fn.length = 4 → 4 > 1
→ возвращается curry(sum4.bind(null, 1))

Шаг 2:
f1(2)
→ args = [2]
→ fn.length = 3 → 3 > 1
→ возвращается curry(sum4.bind(null, 1, 2))

Шаг 3:
f2(3)
→ args = [3]
→ fn.length = 2 → 2 > 1
→ возвращается curry(sum4.bind(null, 1, 2, 3))

Шаг 4:
f3(4)
→ args = [4]
→ fn.length = 1 → 1 === 1 ❌ условие ложно
→ выполняется fn(...args) → sum4(1, 2, 3, 4)
→ результат: 10
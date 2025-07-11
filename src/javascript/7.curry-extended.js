const curry = (fn, ...params) => {
    const curried = (...args) => {
        return fn.length > args.length ? curry(fn.bind(null, ...args)) : fn(...args);
    }

    return params.length ? curried(...params) : curried;
}


const sum4 = (a, b, c, d) => a + b + c + d;

const f = curry(sum4);

const y2 = f(1)(2)(3)(4);

/*
 const f = curry(sum4)
 Первый вызов curry -
 в функции происходит проверка:
 `params.length ? curried(...params) : curried;`
 → `params.length === 0` → возвращается `curried`

----
 Далее:
 const y2 = f(1)(2)(3)(4)

Раскладываем шаг за шагом:
1) f1 = curry(sum4.bind(null, 1))
Следовательно можем `y2`описать как
const y2 = curry(sum4.bind(null, 1))(2)(3)(4);

 f(1)
    → curry(sum4.bind(null, 1)) возвращает новую `curried` функцию
    → fn.length = 3

2) f1(2);
`params.length` === 0, следовательно мы получаем `curried` функцию
В ней fn.length > args.length - вернет true так как fn.length = 2;
следовательно из ф-ции curried мы получаем curry(sum4.bind(null, 1, 2));
 f1(2)
    → curry(sum4.bind(null, 1, 2)) → fn.length = 2

3) f2(3)
`params.length` === 0, следовательно мы получаем `curried` функцию
 в curried функцию передаётся аргумент `3`, результат проверки возвращает
 `curry(sum4.bind(null, 1, 2, 3)`
 fn.length = 1;

4) f3(4)
`params.length` === 0, следовательно мы получаем `curried` функцию
в curried ф-цию передаётся аргумент 4, но т.к. fn.length = 1 и args.length = 1 происходит вызов sum4(1,2,34), что возвращает нам 10

f3(4)
    → fn.length = 1, args.length = 1 → 1 === 1 → условие `false`
    → вызывается: sum4(1, 2, 3, 4)
    → возвращается результат: 10

 Напоминание:
Function.prototype.bind уменьшает .length

.length говорит сколько ещё параметров НЕ передано

Именно это позволяет делать "отложенное исполнение"
 */

/*
 const f = curry(sum4)
 Первый вызов curry:
 → `params.length === 0` → возвращается `curried`

---
 Далее:
 const y2 = f(1)(2)(3)(4)

 Шаг 1:
 f(1)
 → args = [1]
 → fn.length = 4 → 4 > 1 ✅
 → возвращается curry(sum4.bind(null, 1))

 Шаг 2:
 f1(2)
 → args = [2]
 → fn.length = 3 → 3 > 1 ✅
 → возвращается curry(sum4.bind(null, 1, 2))

 Шаг 3:
 f2(3)
 → args = [3]
 → fn.length = 2 → 2 > 1 ✅
 → возвращается curry(sum4.bind(null, 1, 2, 3))

 Шаг 4:
 f3(4)
 → args = [4]
 → fn.length = 1 → 1 === 1 ❌ условие ложно
 → выполняется fn(...args) → sum4(1, 2, 3, 4)
 → результат: 10
*/
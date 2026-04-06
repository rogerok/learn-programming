// ============================================
// Hindley-Milner: Практические упражнения
// ============================================
//
// Как работать с файлом:
//   1. Замени undefined (или /* YOUR CODE HERE */) своей реализацией
//   2. Запусти: node exercises.js
//   3. Добейся, чтобы все тесты прошли
//
// Тема: сигнатуры типов HM, параметричность, свободные теоремы, каррирование
// ============================================

// ------------------------------------------
// Вспомогательные функции
// (используй их в упражнениях, не меняй)
// ------------------------------------------

const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
};

// compose :: ((b -> c), (a -> b)) -> a -> c
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

// map :: (a -> b) -> [a] -> [b]
const map = curry((f, xs) => xs.map(f));

// filter :: (a -> Bool) -> [a] -> [a]
const filter = curry((pred, xs) => xs.filter(pred));

// head :: [a] -> a
const head = (xs) => xs[0];

// ============================================
// Упражнение 1: Реализуй по сигнатуре
// ============================================
//
// Дана HM-сигнатура и описание — напиши реализацию.
// Используй ТОЛЬКО то, что можно сделать с данными,
// зная только их тип из сигнатуры.
//
// Подсказка: если тип — [a], ты не знаешь, что за элементы.
// Работай со структурой (индексы, длина), а не с содержимым.

// last :: [a] -> a
// Вернуть последний элемент массива
const last = /* YOUR CODE HERE */ undefined;

// constant :: a -> b -> a
// Вернуть первый аргумент, второй проигнорировать
// Пример: constant(5)('anything') === 5
const constant = /* YOUR CODE HERE */ undefined;

// flip :: (a -> b -> c) -> b -> a -> c
// Принять каррированную функцию двух аргументов и поменять порядок аргументов
// Пример: flip(subtract)(1)(10) === subtract(10)(1)
const flip = /* YOUR CODE HERE */ undefined;

// take :: Number -> [a] -> [a]
// Вернуть первые n элементов массива
// Пример: take(2)([1, 2, 3, 4]) === [1, 2]
const take = /* YOUR CODE HERE */ undefined;

// ============================================
// Упражнение 2: Параметричность — сколько реализаций?
// ============================================
//
// Для каждой сигнатуры реализуй ВСЕ возможные "разумные" варианты.
// "Разумные" — значит не использующие typeof/instanceof (это нарушение параметричности).
//
// Сигнатура: (a, b) -> a
// Вопрос: функция принимает два значения разных типов и возвращает первый тип.
// Сколько реализаций существует? Реализуй их.

// fst :: (a, b) -> a
// Вариант 1 (единственный "честный"):
const fst = /* YOUR CODE HERE */ undefined;

// ---

// Сигнатура: a -> a -> a
// Вопрос: принимает два значения одного типа, возвращает одно.
// Сколько реализаций? Реализуй оба варианта.

// pickFirst :: a -> a -> a
const pickFirst = /* YOUR CODE HERE */ undefined;

// pickSecond :: a -> a -> a
const pickSecond = /* YOUR CODE HERE */ undefined;

// ---

// Сигнатура: [a] -> a
// Вопрос: принимает массив, возвращает один элемент.
// Реализуй три варианта: взять первый, последний, случайный элемент.
// Все три — корректные реализации одной и той же сигнатуры!

// getFirst :: [a] -> a
const getFirst = /* YOUR CODE HERE */ undefined;

// getLast :: [a] -> a
const getLast = /* YOUR CODE HERE */ undefined;

// getRandom :: [a] -> a
// Подсказка: Math.floor(Math.random() * xs.length)
const getRandom = /* YOUR CODE HERE */ undefined;

// ============================================
// Упражнение 3: Проверь свободную теорему
// ============================================
//
// Свободные теоремы — это равенства, которые ОБЯЗАНЫ выполняться
// для любых корректных реализаций head/map/filter.
//
// Твоя задача: написать функции checkTheoremA и checkTheoremB,
// которые проверяют теорему на переданных данных.
// Функция должна возвращать true, если теорема выполняется.
//
// Теорема A: compose(f, head) === compose(head, map(f))
// Для любой f и непустого массива arr оба пути дают одинаковый результат.
//
// checkTheoremA :: (a -> b) -> [a] -> Boolean
const checkTheoremA = /* YOUR CODE HERE */ undefined;
// Реализуй: вычисли оба пути и сравни результаты (===)

// ---
//
// Теорема B: compose(map(f), filter(compose(p, f))) === compose(filter(p), map(f))
// Левый путь: сначала фильтр (где p(f(x)) === true), потом map(f)
// Правый путь: сначала map(f), потом фильтр (где p(x) === true)
// Результаты должны совпадать (сравни через JSON.stringify).
//
// checkTheoremB :: (a -> b) -> (b -> Boolean) -> [a] -> Boolean
const checkTheoremB = /* YOUR CODE HERE */ undefined;
// Реализуй: вычисли оба пути и сравни через JSON.stringify

// ============================================
// Упражнение 4: Напиши сигнатуру для реализации
// ============================================
//
// Дана готовая функция. Изучи реализацию и запиши HM-сигнатуру
// как строку в переменную signature_N.
//
// Правила записи:
//   - Конкретные типы с заглавной буквы: String, Number, Boolean
//   - Типовые переменные строчными: a, b, c
//   - Массив: [a]
//   - Имя функции через :: : "functionName :: ..."
//   - Каррирование через ->
//
// Пример: "strLength :: String -> Number"

// Функция 1
const prop = curry((key, obj) => obj[key]);
// Подсказка: key — это String, obj — объект с любыми значениями.
// Возврат — значение произвольного типа.
// Запиши сигнатуру:
const signature_1 = /* "prop :: ..." */ undefined;

// Функция 2
const append = curry((x, xs) => [...xs, x]);
// Подсказка: добавляет элемент в конец массива.
// Что такое x? Что такое xs? Что возвращается?
const signature_2 = /* "append :: ..." */ undefined;

// Функция 3
const zipWith = curry((f, xs, ys) => xs.map((x, i) => f(x)(ys[i])));
// Подсказка: применяет каррированную f к парам элементов из xs и ys.
// xs и ys могут быть разных типов. Результат зависит от f.
const signature_3 = /* "zipWith :: ..." */ undefined;

// ============================================
// Упражнение 5: Curry + частичное применение
// ============================================
//
// Напиши каррированные функции, продемонстрируй "откусывание" типов.
//
// Правило: каждый шаг частичного применения убирает один тип слева в сигнатуре.
// replace :: Regex -> String -> String -> String
//   +  /[aeiou]/ig          =>  String -> String -> String
//   +  '*'                  =>  String -> String
//   +  'hello'              =>  String (результат)

// replace :: Regex -> String -> String -> String
// Реализуй каррированный replace через String.prototype.replace
const replace = /* YOUR CODE HERE */ undefined;

// Теперь создай специализированные функции через частичное применение:

// censorVowels :: String -> String
// Замени все гласные (a, e, i, o, u) на '*'
// Подсказка: replace(/[aeiou]/ig)('*')
const censorVowels = /* YOUR CODE HERE */ undefined;

// ---

// match :: Regex -> String -> [String] | null
// Реализуй каррированный match через String.prototype.match
const match = /* YOUR CODE HERE */ undefined;

// findNumbers :: String -> [String] | null
// Найди все числа в строке (используй частичное применение match)
// Подсказка: /\d+/g
const findNumbers = /* YOUR CODE HERE */ undefined;

// ============================================
// Тесты
// ============================================

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.log(`  [FAIL] ${name}`);
    console.log(`         ${e.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(msg || `Ожидалось ${b}, получено ${a}`);
  }
}

function assertTrue(value, msg) {
  if (value !== true) {
    throw new Error(msg || `Ожидалось true, получено ${value}`);
  }
}

function assertType(value, msg) {
  if (typeof value === 'undefined') {
    throw new Error(msg || 'Функция ещё не реализована (вернула undefined)');
  }
}

// ------------------------------------------
// Тесты упражнения 1
// ------------------------------------------
console.log('\nУпражнение 1: Реализуй по сигнатуре');

test('last :: [a] -> a — последний элемент числового массива', () => {
  assertEqual(last([1, 2, 3]), 3);
});
test('last :: [a] -> a — последний элемент строкового массива', () => {
  assertEqual(last(['a', 'b', 'c']), 'c');
});
test('last :: [a] -> a — массив из одного элемента', () => {
  assertEqual(last([42]), 42);
});

test('constant :: a -> b -> a — возвращает первый аргумент', () => {
  assertEqual(constant(5)('ignored'), 5);
});
test('constant :: a -> b -> a — второй аргумент любого типа', () => {
  assertEqual(constant('hello')(42), 'hello');
});
test('constant :: a -> b -> a — работает с объектами', () => {
  const obj = { x: 1 };
  assertEqual(constant(obj)(null), obj);
});

test('flip :: (a -> b -> c) -> b -> a -> c — меняет порядок аргументов', () => {
  const subtract = curry((a, b) => a - b);
  // subtract(10)(1) === 9, flip(subtract)(1)(10) должен дать то же
  assertEqual(flip(subtract)(1)(10), subtract(10)(1));
});
test('flip :: (a -> b -> c) -> b -> a -> c — строковая конкатенация', () => {
  const prepend = curry((prefix, str) => prefix + str);
  // prepend('Hello, ')('World') === 'Hello, World'
  // flip(prepend)('World')('Hello, ') должен дать то же
  assertEqual(flip(prepend)('World')('Hello, '), prepend('Hello, ')('World'));
});

test('take :: Number -> [a] -> [a] — берёт первые n элементов', () => {
  assertEqual(take(2)([1, 2, 3, 4]), [1, 2]);
});
test('take :: Number -> [a] -> [a] — n === 0 даёт пустой массив', () => {
  assertEqual(take(0)([1, 2, 3]), []);
});
test('take :: Number -> [a] -> [a] — n больше длины массива', () => {
  assertEqual(take(10)([1, 2]), [1, 2]);
});
test('take :: Number -> [a] -> [a] — работает со строками', () => {
  assertEqual(take(2)(['a', 'b', 'c']), ['a', 'b']);
});

// ------------------------------------------
// Тесты упражнения 2
// ------------------------------------------
console.log('\nУпражнение 2: Параметричность — все реализации');

test('fst :: (a, b) -> a — возвращает первый аргумент', () => {
  assertEqual(fst(1, 2), 1);
});
test('fst :: (a, b) -> a — работает с разными типами', () => {
  assertEqual(fst('hello', 42), 'hello');
});

test('pickFirst :: a -> a -> a — возвращает первый', () => {
  assertEqual(pickFirst(1)(2), 1);
});
test('pickSecond :: a -> a -> a — возвращает второй', () => {
  assertEqual(pickSecond(1)(2), 2);
});
test('pickFirst и pickSecond дают разные результаты', () => {
  const a = 'foo';
  const b = 'bar';
  if (pickFirst(a)(b) === pickSecond(a)(b)) {
    throw new Error('pickFirst и pickSecond должны давать разные результаты');
  }
});

test('getFirst :: [a] -> a — первый элемент', () => {
  assertEqual(getFirst([10, 20, 30]), 10);
});
test('getLast :: [a] -> a — последний элемент', () => {
  assertEqual(getLast([10, 20, 30]), 30);
});
test('getRandom :: [a] -> a — элемент из массива', () => {
  const arr = [1, 2, 3, 4, 5];
  const result = getRandom(arr);
  assertType(result);
  if (!arr.includes(result)) {
    throw new Error(`${result} не входит в массив [${arr}]`);
  }
});
test('getFirst/getLast/getRandom имеют разные реализации', () => {
  // Все три — разные функции
  if (getFirst === getLast || getFirst === getRandom || getLast === getRandom) {
    throw new Error('getFirst, getLast и getRandom должны быть разными функциями');
  }
});

// ------------------------------------------
// Тесты упражнения 3
// ------------------------------------------
console.log('\nУпражнение 3: Свободные теоремы');

test('checkTheoremA — возвращает true для числового массива', () => {
  const double = x => x * 2;
  const arr = [1, 2, 3, 4, 5];
  assertTrue(checkTheoremA(double)(arr));
});
test('checkTheoremA — возвращает true для строкового массива', () => {
  const exclaim = s => s + '!';
  const arr = ['hello', 'world', 'foo'];
  assertTrue(checkTheoremA(exclaim)(arr));
});
test('checkTheoremA — теорема: compose(f,head) === compose(head,map(f))', () => {
  // Проверяем саму логику: оба пути должны давать одинаковый результат
  const f = x => x * 3;
  const arr = [10, 20, 30];
  const left  = compose(f, head)(arr);
  const right = compose(head, map(f))(arr);
  assertEqual(left, right, `Теорема нарушена: left=${left}, right=${right}`);
});

test('checkTheoremB — возвращает true для чисел', () => {
  const double = x => x * 2;
  const greaterThan4 = x => x > 4;
  const arr = [1, 2, 3, 4, 5];
  assertTrue(checkTheoremB(double)(greaterThan4)(arr));
});
test('checkTheoremB — теорема: два пути filter+map равны', () => {
  const f = x => x * 2;
  const p = x => x > 4;
  const arr = [1, 2, 3, 4, 5];
  const left  = compose(map(f), filter(compose(p, f)))(arr);
  const right = compose(filter(p), map(f))(arr);
  assertEqual(left, right);
  // left === right === [6, 8, 10]
  assertEqual(left, [6, 8, 10]);
});
test('checkTheoremB — возвращает true для строк', () => {
  const addBang = s => s + '!';
  const isLong  = s => s.length > 6;
  const arr = ['hi', 'hello', 'world', 'hey'];
  assertTrue(checkTheoremB(addBang)(isLong)(arr));
});

// ------------------------------------------
// Тесты упражнения 4
// ------------------------------------------
console.log('\nУпражнение 4: Напиши сигнатуру');

// Сигнатуры проверяются гибко: допустимы разные имена переменных (a/b/c или x/y),
// но структура должна совпадать.

test('signature_1 — сигнатура для prop определена', () => {
  assertType(signature_1, 'Сигнатура для prop не задана');
});
test('signature_1 — содержит имя функции "prop"', () => {
  if (!signature_1.startsWith('prop ::')) {
    throw new Error(`Должна начинаться с "prop ::". Получено: "${signature_1}"`);
  }
});
test('signature_1 — содержит String (ключ объекта)', () => {
  if (!signature_1.includes('String')) {
    throw new Error(`Должна содержать "String" (тип ключа). Получено: "${signature_1}"`);
  }
});
test('signature_1 — содержит типовую переменную (строчная буква)', () => {
  // Ищем строчную переменную — она обозначает тип значения
  if (!/\b[a-z]\b/.test(signature_1.replace('prop ::', ''))) {
    throw new Error(`Должна содержать типовую переменную (a, b и т.д.). Получено: "${signature_1}"`);
  }
});

test('signature_2 — сигнатура для append определена', () => {
  assertType(signature_2, 'Сигнатура для append не задана');
});
test('signature_2 — содержит имя функции "append"', () => {
  if (!signature_2.startsWith('append ::')) {
    throw new Error(`Должна начинаться с "append ::". Получено: "${signature_2}"`);
  }
});
test('signature_2 — содержит массивы ([...])', () => {
  const arrayCount = (signature_2.match(/\[/g) || []).length;
  if (arrayCount < 2) {
    throw new Error(`Должна содержать минимум 2 массива (вход [a] и выход [a]). Получено: "${signature_2}"`);
  }
});
test('signature_2 — один и тот же тип элемента в аргументе и результате', () => {
  // Упрощённая проверка: типовые переменные должны совпадать
  const vars = (signature_2.match(/\b[a-z]\b/g) || []);
  if (vars.length < 2) {
    throw new Error(`Должна иметь одинаковый тип элемента массива. Получено: "${signature_2}"`);
  }
  if (new Set(vars).size !== 1) {
    throw new Error(`Тип элемента (a) должен быть одним и тем же везде. Получено переменные: [${vars}] в "${signature_2}"`);
  }
});

test('signature_3 — сигнатура для zipWith определена', () => {
  assertType(signature_3, 'Сигнатура для zipWith не задана');
});
test('signature_3 — содержит имя функции "zipWith"', () => {
  if (!signature_3.startsWith('zipWith ::')) {
    throw new Error(`Должна начинаться с "zipWith ::". Получено: "${signature_3}"`);
  }
});
test('signature_3 — содержит функцию как аргумент (стрелка внутри)', () => {
  // Сигнатура должна содержать что-то вроде (a -> b -> c) или схожее
  const arrowCount = (signature_3.match(/->/g) || []).length;
  if (arrowCount < 3) {
    throw new Error(`Ожидается минимум 3 стрелки (функция + 2 массива + результат). Получено ${arrowCount} в "${signature_3}"`);
  }
});

// ------------------------------------------
// Тесты упражнения 5
// ------------------------------------------
console.log('\nУпражнение 5: Curry + частичное применение');

test('replace — базовая замена', () => {
  assertEqual(replace(/a/g)('b')('banana'), 'bbnbnb');
});
test('replace :: Regex -> String -> String -> String — каррированная', () => {
  // Проверяем, что это действительно каррированная функция
  const step1 = replace(/o/g);
  if (typeof step1 !== 'function') {
    throw new Error('replace(regex) должна возвращать функцию');
  }
  const step2 = step1('0');
  if (typeof step2 !== 'function') {
    throw new Error('replace(regex)(str) должна возвращать функцию');
  }
});
test('replace — замена с разными значениями', () => {
  assertEqual(replace(/\s+/g)('-')('hello world'), 'hello-world');
});

test('censorVowels — заменяет гласные на *', () => {
  assertEqual(censorVowels('hello world'), 'h*ll* w*rld');
});
test('censorVowels — работает с заглавными гласными', () => {
  assertEqual(censorVowels('HELLO'), 'H*LL*');
});
test('censorVowels — строка без гласных не меняется', () => {
  assertEqual(censorVowels('dry'), 'dry');
});

test('match — базовый поиск', () => {
  assertEqual(match(/\d+/g)('abc123def456'), ['123', '456']);
});
test('match :: Regex -> String -> [String] | null — каррированная', () => {
  const step1 = match(/test/g);
  if (typeof step1 !== 'function') {
    throw new Error('match(regex) должна возвращать функцию');
  }
});
test('match — null при отсутствии совпадений', () => {
  assertEqual(match(/\d+/)('no numbers here'), null);
});

test('findNumbers — находит числа в строке', () => {
  assertEqual(findNumbers('цена 100 рублей и 50 копеек'), ['100', '50']);
});
test('findNumbers — null если чисел нет', () => {
  assertEqual(findNumbers('нет чисел'), null);
});
test('findNumbers создана через частичное применение match', () => {
  // Проверяем, что findNumbers — функция (не undefined)
  assertType(findNumbers, 'findNumbers не реализована');
  if (typeof findNumbers !== 'function') {
    throw new Error('findNumbers должна быть функцией');
  }
});

// ------------------------------------------
// Итог
// ------------------------------------------
console.log(`\n${'='.repeat(44)}`);
console.log(`Результат: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('Все тесты прошли. Отличная работа!');
} else {
  console.log(`Осталось исправить: ${failed} тест(а/ов).`);
}

---
tags: [typescript, functional-programming, fp-ts, currying, partial-application, data-last]
aliases: [Mostly Adequate ch04 rewrite, Currying for fp-ts]
---

# Chapter: Currying для кода на fp-ts

> [!info] Context
> Currying меняет форму функции: вместо вызова со всеми аргументами сразу ты получаешь цепочку функций по одному аргументу. В `fp-ts` это особенно полезно, потому что такая форма хорошо сочетается с `pipe`, `flow` и `data-last` API.
>
> **Пререквизиты:** [[ch03-pure-functions|Pure Functions через призму fp-ts]], [[partial-application/readme|Частичное применение и каррирование в JavaScript]], [[function-composition/function-composition|Каррирование и композиция функций]].

## Overview

В оригинальной главе `Mostly Adequate` currying вводится как техника, которая позволяет передать функции не все аргументы сразу. Мы сохраним эту логику, но будем держать в голове более практический вопрос: почему код в `fp-ts` так часто выглядит как “сначала настройка, потом данные”.

Тут и появляется currying. Он позволяет заранее зафиксировать часть поведения и получить новую функцию с более узкой задачей. Из таких функций удобно собирать pipeline.

```mermaid
graph LR
    A[Currying] --> B[Partial application]
    B --> C[Specialized helpers]
    C --> D[data-last]
    D --> E[pipe / flow]
```

По ходу главы разберём:

1. как работает currying на самом простом примере;
2. где начинается partial application;
3. почему `data-last` так хорошо ложится на `fp-ts`;
4. как из этого вырастают короткие и переиспользуемые helper-функции.

Краткий итог раздела: currying здесь важен как форма API, из которой потом вырастают partial application и pipeline.

## Deep Dive

### 1. Базовая идея

Начнём с примера, который почти дословно передаёт суть оригинальной главы:

```typescript
const add =
  (x: number) =>
  (y: number): number =>
    x + y

const increment = add(1)
const addTen = add(10)

increment(2) // 3
addTen(2) // 12
```

`add` принимает один аргумент и возвращает новую функцию. Новая функция помнит `x` через замыкание и ждёт `y`.

Если записать то же вычисление в обычной форме, получится так:

```typescript
const addPlain = (x: number, y: number): number => x + y

addPlain(1, 2) // 3
```

Результат одинаковый. Разница в том, как функция участвует в дальнейшем коде. `addPlain` живёт как операция двух аргументов. `add` можно на полпути превратить в `increment`, `addTen` или любой другой специализированный helper.

В JavaScript и TypeScript каррированные функции нередко разрешают передавать несколько аргументов за один вызов. Для понимания темы полезнее держать в голове строгую модель: один аргумент, одна новая функция, следующий аргумент.

Краткий итог раздела: currying задаёт функции такую форму вызова, с которой потом удобно работать дальше.

### 2. Частичное применение начинается сразу

Currying ценен тем, что из него естественно получается partial application. Как только ты зафиксировал часть аргументов, у тебя на руках новая функция с более узким назначением.

Возьмём примеры в духе оригинала:

```typescript
const match =
  (pattern: RegExp) =>
  (value: string): RegExpMatchArray | null =>
    value.match(pattern)

const replace =
  (pattern: RegExp) =>
  (replacement: string) =>
  (value: string): string =>
    value.replace(pattern, replacement)

const hasLetterR = (value: string): boolean => match(/r/gi)(value) !== null
const censorVowels = replace(/[aeiou]/gi)('*')

hasLetterR('hello world') // true
hasLetterR('smooth jazz') // false
censorVowels('Chocolate Rain') // 'Ch*c*l*t* R**n'
```

Важный момент здесь очень простой:

- `match` и `replace` описывают общее правило;
- `hasLetterR` и `censorVowels` описывают уже конкретную задачу.

Currying даёт форму. Partial application делает из этой формы рабочий инструмент.

Если тебе хочется думать об этом совсем прагматично, можно сформулировать так: сначала фиксируешь конфигурацию, потом применяешь её к данным.

Краткий итог раздела: partial application появляется как прямое продолжение currying и быстро превращается в рабочий инструмент.

### 3. Почему `data-last` так удобен в `fp-ts`

Теперь можно перейти к тому месту, где currying начинает напрямую влиять на стиль кода.

В `fp-ts` многие функции устроены так, что данные идут последним аргументом. Это делает функцию удобной для частичного применения и для `pipe`.

```typescript
import * as RA from 'fp-ts/ReadonlyArray'
import { pipe } from 'fp-ts/function'

const songs = ['rock and roll', 'smooth jazz', 'drum circle']

pipe(
  songs,
  RA.filter(hasLetterR),
  RA.map(censorVowels)
)
// ['r*ck *nd r*ll', 'dr*m c*rcl*']
```

Что здесь произошло:

1. `RA.filter(hasLetterR)` вернул функцию, которая ждёт массив;
2. `RA.map(censorVowels)` вернул ещё одну функцию того же рода;
3. `pipe` просто передал данные через уже настроенные шаги.

Эта форма кода читается слева направо и не требует лишних обёрток. Когда API держится за схему `config -> data`, композиция получается почти сама.

Именно поэтому в главе про currying полезно сразу смотреть на `fp-ts`: библиотека постоянно опирается на ту форму функций, о которой здесь идёт речь.

Краткий итог раздела: `data-last` делает частично применённые функции удобными для pipeline, а не только для разовых вызовов.

### 4. Как маленькая функция превращается в функцию над коллекцией

В оригинале есть важное наблюдение: если у тебя есть функция для одного элемента, её часто можно без шума поднять на уровень массива через `map`.

В `fp-ts` это выглядит особенно естественно:

```typescript
import { flow } from 'fp-ts/function'

const trim = (value: string): string => value.trim()
const toLower = (value: string): string => value.toLowerCase()

const normalizeTag = flow(trim, toLower)
const normalizeTags = RA.map(normalizeTag)

normalizeTags([' FP-TS ', ' Reader ', ' TaskEither '])
// ['fp-ts', 'reader', 'taskeither']
```

`normalizeTag` работает с одной строкой. `normalizeTags` появляется без отдельной функции `tags => tags.map(...)`. Мы просто частично применяем `RA.map`.

Такой код хорошо масштабируется:

- одноэлементные функции остаются маленькими;
- функции над коллекциями собираются из них без стереотипного кода;
- композиция держится на форме `A -> B`, поэтому вложенных колбэков становится меньше.

Краткий итог раздела: currying избавляет от ручных переходников между “функцией для одного значения” и “функцией для списка значений”.

### 5. `flow` любит функции одного аргумента

Почти вся композиция в `fp-ts` опирается на одну простую вещь: после настройки функция должна быть похожа на `A -> B`.

Currying как раз и приводит функцию к такой форме.

```typescript
const split =
  (separator: string) =>
  (value: string): ReadonlyArray<string> =>
    value.split(separator)

const words = split(' ')

const loudWords = flow(
  words,
  RA.map((word: string) => word.toUpperCase())
)

loudWords('currying makes composition cheaper')
// ['CURRYING', 'MAKES', 'COMPOSITION', 'CHEAPER']
```

`flow` не умеет магически компоновать произвольные сигнатуры. Ему нужны функции, которые можно выстроить в цепочку. Currying и partial application как раз помогают довести функцию до нужной формы.

Отсюда и практическая привычка в `fp-ts`: сначала зафиксировать параметры, потом передавать получившуюся функцию дальше.

Краткий итог раздела: чем больше в коде функций формы `A -> B`, тем проще композиция, и currying помогает получать такие функции без лишнего шума.

### 6. Почему стоит избегать ad-hoc формы API

Для композиционного кода важна стабильность сигнатуры. Если функция иногда принимает два аргумента, иногда три, а иногда возвращает значение и иногда новую функцию, работать с ней становится тяжело.

Условный API такого вида:

```typescript
const replaceBad = (
  pattern: RegExp,
  replacement = '*',
  value?: string
): string | ((input: string) => string) => {
  if (value === undefined) {
    return (input: string) => input.replace(pattern, replacement)
  }

  return value.replace(pattern, replacement)
}
```

может выглядеть “гибким”, но его неудобно передавать дальше и сложнее читать без подсматривания в реализацию.

Стабильная каррированная форма заметно проще:

```typescript
const replaceGood =
  (pattern: RegExp) =>
  (replacement: string) =>
  (value: string): string =>
    value.replace(pattern, replacement)
```

Такую функцию легче частично применять, тестировать, называть и использовать в `pipe` или `flow`.

Краткий итог раздела: каррированная сигнатура полезна ещё и тем, что делает API предсказуемым.

### 7. Итог

Currying редко оказывается последней мыслью в коде. Обычно он нужен затем, чтобы:

- быстро собирать специализированные helper-функции;
- держать данные последним аргументом;
- без трения передавать функции в `pipe`, `flow`, `RA.map`, `RA.filter` и похожие combinator-ы.

В этом смысле `ch04` хорошо подготавливает следующую тему. Как только функции начинают стабильно принимать по одному аргументу и возвращать новый результат, композиция становится естественным следующим шагом.

Краткий итог раздела: currying в `fp-ts` проще всего понимать как дисциплину формы, из которой вырастает композиция.

## Exercises

## Exercise A: Построй `words` через частичное применение

**Difficulty:** beginner

В оригинальной главе упражнение просит избавиться от аргумента:

```typescript
const words = (str: string): ReadonlyArray<string> => split(' ', str)
```

Сделай то же самое в каррированной форме.

**Requirements:**

- helper `split` должен иметь форму `separator -> value -> pieces`
- `words` должен получаться без явного упоминания строки

**Test cases:**

```typescript
import { expect, test } from 'vitest'

const split =
  (_separator: string) =>
  (_value: string): ReadonlyArray<string> => {
    throw new Error('implement me')
  }

const words = split(' ')

test('words splits a string by spaces', () => {
  expect(words('currying loves pipelines')).toEqual(['currying', 'loves', 'pipelines'])
})
```

> [!tip]- Hint
> Сначала зафиксируй разделитель. Строка должна остаться последним аргументом.

> [!warning]- Solution
> ```typescript
> const split =
>   (separator: string) =>
>   (value: string): ReadonlyArray<string> =>
>     value.split(separator)
> ```

## Exercise B: Убери аргумент из `filterQs`

**Difficulty:** beginner

Адаптируй второе упражнение из оригинала к `ReadonlyArray` и `fp-ts`.

```typescript
import * as RA from 'fp-ts/ReadonlyArray'

const match =
  (pattern: RegExp) =>
  (value: string): RegExpMatchArray | null =>
    value.match(pattern)

const filterQs = (xs: ReadonlyArray<string>): ReadonlyArray<string> =>
  RA.filter((x: string) => match(/q/i)(x) !== null)(xs)
```

**Requirements:**

- не упоминать `xs` в итоговой версии;
- использовать partial application;
- сохранить дружелюбную к `pipe` форму.

**Test cases:**

```typescript
import { expect, test } from 'vitest'
import * as RA from 'fp-ts/ReadonlyArray'

const match =
  (pattern: RegExp) =>
  (value: string): RegExpMatchArray | null =>
    value.match(pattern)

const filterQs = (_xs: ReadonlyArray<string>): ReadonlyArray<string> => {
  throw new Error('implement me')
}

test('filterQs keeps only strings with q', () => {
  expect(filterQs(['quick', 'camus', 'quartz', 'stone'])).toEqual(['quick', 'quartz'])
  expect(RA.filter((x: string) => match(/q/i)(x) !== null)(['a', 'Q'])).toEqual(['Q'])
})
```

> [!tip]- Hint
> Сначала собери предикат, потом передай его в `RA.filter`.

> [!warning]- Solution
> ```typescript
> const hasQ = (value: string): boolean => match(/q/i)(value) !== null
>
> const filterQs = RA.filter(hasQ)
> ```

## Exercise C: Собери `max` из `reduce`

**Difficulty:** intermediate

Третье упражнение из оригинала просит переписать `max` без явного аргумента массива. Сделай это через curried `reduce`.

```typescript
const keepHighest = (x: number, y: number): number => (x >= y ? x : y)
```

**Test cases:**

```typescript
import { expect, test } from 'vitest'

const keepHighest = (x: number, y: number): number => (x >= y ? x : y)

const reduce =
  <A, B>(f: (acc: B, value: A) => B) =>
  (initial: B) =>
  (xs: ReadonlyArray<A>): B =>
    xs.reduce(f, initial)

const max = (_xs: ReadonlyArray<number>): number => {
  throw new Error('implement me')
}

test('max keeps the highest number', () => {
  expect(max([3, 9, 2, 7])).toBe(9)
  expect(max([-4, -10, -2])).toBe(-2)
})
```

> [!tip]- Hint
> `reduce(keepHighest)(-Infinity)` уже возвращает функцию, которая ждёт только массив.

> [!warning]- Solution
> ```typescript
> const max = reduce(keepHighest)(-Infinity)
> ```

## Anki Cards

> [!tip] Flashcards
> Q: Что меняется при currying?
> A: Функция нескольких аргументов превращается в цепочку функций по одному аргументу.

> [!tip] Flashcards
> Q: Где здесь появляется partial application?
> A: В момент, когда мы фиксируем часть аргументов и получаем более специализированную функцию.

> [!tip] Flashcards
> Q: Почему `data-last` важен для `fp-ts`?
> A: Потому что такая форма хорошо работает с частичным применением и легко встраивается в `pipe`.

> [!tip] Flashcards
> Q: Зачем `RA.map(normalizeTag)` удобнее, чем писать отдельную функцию над массивом?
> A: Он позволяет поднять функцию над одним значением на уровень коллекции без лишнего обвязочного кода.

> [!tip] Flashcards
> Q: Почему нестабильная arity мешает композиции?
> A: Сложнее понять форму функции и передавать её дальше как обычный шаг pipeline.

## Related Topics

- [[ch03-pure-functions|Pure Functions через призму fp-ts]]
- [[partial-application/readme|Частичное применение и каррирование в JavaScript]]
- [[function-composition/function-composition|Каррирование и композиция функций]]
- [[fp-ts-phase-1-2]]
- [[fp-ts-roadmap]]

## Sources

- [Mostly Adequate Guide, chapter 04](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch04)
- [Mostly Adequate Guide, Russian translation, ch04](https://github.com/MostlyAdequate/mostly-adequate-guide-ru/blob/master/ch04-ru.md)
- [fp-ts function.ts module](https://gcanti.github.io/fp-ts/modules/function.ts.html)
- [fp-ts ReadonlyArray.ts module](https://gcanti.github.io/fp-ts/modules/ReadonlyArray.ts.html)

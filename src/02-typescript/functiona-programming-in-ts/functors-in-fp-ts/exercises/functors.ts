/**
 * Упражнения к главе: Функторы в TypeScript и fp-ts.
 *
 * Запуск после решения:
 *   npx tsx functors.ts
 *   pnpm exec tsx functors.ts
 *
 * Все необходимые типы и вспомогательные функции определены ниже —
 * внешние зависимости (в т.ч. fp-ts) не нужны.
 */

// ---------------------------------------------------------------------------
// Базовые типы и вспомогательные функции
// ---------------------------------------------------------------------------

// --- Option<A> ---

type Option<A> = { _tag: 'Some'; value: A } | { _tag: 'None' }

const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value })
const none: Option<never> = { _tag: 'None' }
const isNone = <A>(x: Option<A>): x is { _tag: 'None' } => x._tag === 'None'

// --- Either<E, A> ---

type Either<E, A> = { _tag: 'Left'; left: E } | { _tag: 'Right'; right: A }

const left = <E>(e: E): Either<E, never> => ({ _tag: 'Left', left: e })
const right = <A>(a: A): Either<never, A> => ({ _tag: 'Right', right: a })
const isLeft = <E, A>(x: Either<E, A>): x is { _tag: 'Left'; left: E } => x._tag === 'Left'

// --- Predicate<A> ---

type Predicate<A> = (a: A) => boolean

// --- Eq<A> ---

type Eq<A> = { equals: (a: A, b: A) => boolean }

// --- Отображение значений в строку (для тестов) ---

const inspectOption = <A>(fa: Option<A>): string =>
  isNone(fa) ? 'None' : `Some(${JSON.stringify(fa.value)})`

const inspectEither = <E, A>(fa: Either<E, A>): string =>
  isLeft(fa) ? `Left(${JSON.stringify(fa.left)})` : `Right(${JSON.stringify(fa.right)})`

// ---------------------------------------------------------------------------
// Exercise A: mapOption
//
// Реализуйте функцию mapOption — функтор для Option<A>.
// Применяет функцию f к значению внутри Some, None оставляет нетронутым.
//
// Законы, которые должна соблюдать ваша реализация:
//   1. Закон тождественности: map(fa, x => x) ≡ fa
//   2. Закон композиции:      map(map(fa, f), g) ≡ map(fa, x => g(f(x)))
// ---------------------------------------------------------------------------

const mapOption = <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> => {
  // TODO: если fa = None — вернуть none
  //       если fa = Some(value) — вернуть some(f(value))
  return none
}

// ---------------------------------------------------------------------------
// Exercise B: mapEither
//
// Реализуйте функцию mapEither — функтор для Either<E, A>.
// Применяет функцию f только к значению Right; Left остаётся без изменений.
//
// Напоминание: Either — это «ориентированный» (biased) функтор:
// map работает по «счастливому» пути (Right), а Left — это «ошибка».
// ---------------------------------------------------------------------------

const mapEither = <E, A, B>(fa: Either<E, A>, f: (a: A) => B): Either<E, B> => {
  // TODO: если fa = Left(e) — вернуть left(e) (без изменений)
  //       если fa = Right(a) — вернуть right(f(a))
  return fa as any
}

// ---------------------------------------------------------------------------
// Exercise C: экземпляр Functor1 для Option и функция lift
//
// Упрощённый интерфейс type class Functor1 (без зависимостей от fp-ts).
// Создайте объект optionFunctor, реализующий этот интерфейс.
// Затем реализуйте обобщённую функцию lift, которая поднимает
// обычную функцию (a: A) => B в функцию над контейнером F.
// ---------------------------------------------------------------------------

// URI-метка для Option
const URI = 'Option' as const
type URI = typeof URI

// Упрощённый интерфейс Functor1 (аналог fp-ts, но без HKT-механизма).
// В настоящем fp-ts map принимает Kind<F, A> вместо Option<A>,
// но TypeScript не позволяет выразить это без URItoKind-реестра.
// Здесь map привязан к Option напрямую для простоты.
interface Functor1<F extends string> {
  readonly URI: F
  readonly map: <A, B>(fa: Option<A>, f: (a: A) => B) => Option<B>
}

// TODO: создайте объект optionFunctor, реализующий Functor1<'Option'>
const optionFunctor: Functor1<URI> = {
  URI,
  map: (_fa, _f) => {
    // TODO: делегируйте вызов к уже реализованной mapOption
    return none
  },
}

// TODO: реализуйте lift — поднимает функцию (a: A) => B
// в функцию (fa: Option<A>) => Option<B>, используя переданный экземпляр функтора
const lift =
  <A, B>(F: Functor1<URI>, f: (a: A) => B) =>
  (fa: Option<A>): Option<B> => {
    // TODO: применить f к fa через F.map
    return none
  }

// ---------------------------------------------------------------------------
// Exercise D: bimapEither
//
// Реализуйте bimapEither — функцию для Bifunctor:
// она принимает две функции и трансформирует обе стороны Either.
//
//   bimap(fa, f, g):
//     Left(e)  -> Left(f(e))
//     Right(a) -> Right(g(a))
//
// Затем выведите через bimap:
//   mapRight  — трансформирует только Right (эквивалент mapEither)
//   mapLeft   — трансформирует только Left
// ---------------------------------------------------------------------------

const bimapEither = <E1, E2, A, B>(
  fa: Either<E1, A>,
  f: (e: E1) => E2,
  g: (a: A) => B,
): Either<E2, B> => {
  // TODO: применить f к Left, g к Right
  return fa as any
}

// TODO: реализуйте mapRight через bimapEither, используя identity для левой стороны
const mapRight = <E, A, B>(fa: Either<E, A>, g: (a: A) => B): Either<E, B> => {
  // TODO
  return fa as any
}

// TODO: реализуйте mapLeft через bimapEither, используя identity для правой стороны
const mapLeft = <E1, E2, A>(fa: Either<E1, A>, f: (e: E1) => E2): Either<E2, A> => {
  // TODO
  return fa as any
}

// ---------------------------------------------------------------------------
// Exercise E: contramapPredicate
//
// Predicate<A> = (a: A) => boolean — это контравариантный функтор.
// Функция contramap позволяет «адаптировать» предикат под другой тип B
// с помощью функции преобразования f: (b: B) => A.
//
// Реализуйте contramapPredicate:
//   contramap(predicate, f) = b => predicate(f(b))
//
// Задача:
//   Дан predicate isEven: Predicate<number> (проверяет чётность числа).
//   Создайте isEvenLength: Predicate<string> — проверяет, что длина строки чётная.
//   Используйте только contramap и isEven (без прямой проверки длины).
// ---------------------------------------------------------------------------

const contramapPredicate = <A, B>(predicate: Predicate<A>, f: (b: B) => A): Predicate<B> => {
  // TODO: вернуть новый предикат, который сначала применяет f, затем predicate
  return (_b) => false
}

// Вспомогательный предикат — не изменяйте
const isEven: Predicate<number> = (n) => n % 2 === 0

// TODO: создайте isEvenLength через contramapPredicate и isEven
const isEvenLength: Predicate<string> = contramapPredicate(
  isEven,
  (_s: string) => 0, // TODO: заменить заглушку на корректное преобразование
)

// ---------------------------------------------------------------------------
// Exercise F: contramapEq
//
// Eq<A> = { equals: (a: A, b: A) => boolean } — тоже контравариантный функтор.
// contramap позволяет получить Eq<B> из Eq<A> и функции f: (b: B) => A.
//
// Логика: два значения типа B равны тогда, когда равны результаты f для каждого из них.
//
// Реализуйте contramapEq:
//   contramapEq(eqA, f) = { equals: (b1, b2) => eqA.equals(f(b1), f(b2)) }
//
// Задача:
//   Дан eqString: Eq<string>.
//   Создайте eqUserByName: Eq<User> — сравнивает пользователей по имени.
//   Используйте только contramapEq и eqString.
// ---------------------------------------------------------------------------

const contramapEq = <A, B>(eqA: Eq<A>, f: (b: B) => A): Eq<B> => {
  // TODO: вернуть экземпляр Eq<B>
  return { equals: (_b1, _b2) => false }
}

// Вспомогательные определения — не изменяйте
const eqString: Eq<string> = { equals: (a, b) => a === b }

type User = { id: number; name: string }

// TODO: создайте eqUserByName через contramapEq и eqString
const eqUserByName: Eq<User> = contramapEq(
  eqString,
  (_user: User) => '', // TODO: заменить заглушку на корректное преобразование
)

// ---------------------------------------------------------------------------
// Тесты. Они начнут проходить после выполнения TODO выше.
// ---------------------------------------------------------------------------

let passed = 0
let failed = 0

const test = (description: string, actual: unknown, expected: unknown): void => {
  if (actual === expected) {
    console.log(`  ПРОЙДЕН: ${description}`)
    passed += 1
  } else {
    console.error(`  ПРОВАЛЕН: ${description}`)
    console.error(`    Ожидалось: ${String(expected)}`)
    console.error(`    Получено:  ${String(actual)}`)
    failed += 1
  }
}

// --- Exercise A ---

console.log('\n--- Exercise A: mapOption ---\n')

// Базовые случаи
test(
  'mapOption(Some(2), x => x * 3) = Some(6)',
  inspectOption(mapOption(some(2), (x) => x * 3)),
  'Some(6)',
)
test('mapOption(None, x => x * 3) = None', inspectOption(mapOption(none, (x: number) => x * 3)), 'None')

// Закон тождественности: map(fa, id) ≡ fa
const identityOpt = some(42)
test(
  'Закон тождественности: map(Some(42), id) = Some(42)',
  inspectOption(mapOption(identityOpt, (x) => x)),
  inspectOption(identityOpt),
)

// Закон композиции: map(map(fa, f), g) ≡ map(fa, g ∘ f)
const fa42 = some(5)
const double = (x: number) => x * 2
const addOne = (x: number) => x + 1
test(
  'Закон композиции: map(map(Some(5), double), addOne) = map(Some(5), x => addOne(double(x)))',
  inspectOption(mapOption(mapOption(fa42, double), addOne)),
  inspectOption(mapOption(fa42, (x) => addOne(double(x)))),
)

// --- Exercise B ---

console.log('\n--- Exercise B: mapEither ---\n')

test(
  'mapEither(Right(10), x => x + 1) = Right(11)',
  inspectEither(mapEither(right(10), (x) => x + 1)),
  'Right(11)',
)
test(
  'mapEither(Left("ошибка"), x => x + 1) = Left("ошибка")',
  inspectEither(mapEither(left('ошибка') as Either<string, number>, (x) => x + 1)),
  'Left("ошибка")',
)
// Закон тождественности для Either
test(
  'Закон тождественности: mapEither(Right("ok"), id) = Right("ok")',
  inspectEither(mapEither(right('ok'), (x) => x)),
  'Right("ok")',
)

// --- Exercise C ---

console.log('\n--- Exercise C: optionFunctor и lift ---\n')

test(
  'optionFunctor.URI = "Option"',
  optionFunctor.URI,
  'Option',
)
test(
  'optionFunctor.map(Some(3), x => x * 10) = Some(30)',
  inspectOption(optionFunctor.map(some(3), (x) => x * 10)),
  'Some(30)',
)
test(
  'optionFunctor.map(None, x => x * 10) = None',
  inspectOption(optionFunctor.map(none as Option<number>, (x) => x * 10)),
  'None',
)

const liftedDouble = lift(optionFunctor, (x: number) => x * 2)
test('lift(double)(Some(7)) = Some(14)', inspectOption(liftedDouble(some(7))), 'Some(14)')
test('lift(double)(None) = None', inspectOption(liftedDouble(none as Option<number>)), 'None')

// --- Exercise D ---

console.log('\n--- Exercise D: bimapEither ---\n')

test(
  'bimapEither(Left("err"), s => s.toUpperCase(), x => x + 1) = Left("ERR")',
  inspectEither(bimapEither(left('err') as Either<string, number>, (s) => s.toUpperCase(), (x) => x + 1)),
  'Left("ERR")',
)
test(
  'bimapEither(Right(5), s => s.toUpperCase(), x => x + 1) = Right(6)',
  inspectEither(bimapEither(right(5) as Either<string, number>, (s: string) => s.toUpperCase(), (x) => x + 1)),
  'Right(6)',
)
test(
  'mapRight(Right(4), x => x * 2) = Right(8)',
  inspectEither(mapRight(right(4) as Either<string, number>, (x) => x * 2)),
  'Right(8)',
)
test(
  'mapRight(Left("e"), x => x * 2) = Left("e") — Left не тронут',
  inspectEither(mapRight(left('e') as Either<string, number>, (x) => x * 2)),
  'Left("e")',
)
test(
  'mapLeft(Left("err"), s => s.length) = Left(3)',
  inspectEither(mapLeft(left('err') as Either<string, number>, (s) => s.length)),
  'Left(3)',
)
test(
  'mapLeft(Right(1), s => s.length) = Right(1) — Right не тронут',
  inspectEither(mapLeft(right(1) as Either<string, number>, (s: string) => s.length)),
  'Right(1)',
)

// --- Exercise E ---

console.log('\n--- Exercise E: contramapPredicate ---\n')

test('isEven(4) = true',  isEven(4),  true)
test('isEven(7) = false', isEven(7), false)
test('isEvenLength("ab") = true — длина 2, чётная',   isEvenLength('ab'),   true)
test('isEvenLength("abc") = false — длина 3, нечётная', isEvenLength('abc'), false)
test('isEvenLength("") = true — длина 0, чётная',      isEvenLength(''),     true)
test('isEvenLength("abcd") = true — длина 4, чётная',  isEvenLength('abcd'), true)

// --- Exercise F ---

console.log('\n--- Exercise F: contramapEq ---\n')

const alice: User = { id: 1, name: 'Alice' }
const aliceDuplicate: User = { id: 99, name: 'Alice' } // другой id, то же имя
const bob: User = { id: 2, name: 'Bob' }

test(
  'eqUserByName.equals(alice, aliceDuplicate) = true — одно имя, разные id',
  eqUserByName.equals(alice, aliceDuplicate),
  true,
)
test(
  'eqUserByName.equals(alice, bob) = false — разные имена',
  eqUserByName.equals(alice, bob),
  false,
)
test(
  'eqUserByName.equals(bob, bob) = true — рефлексивность',
  eqUserByName.equals(bob, bob),
  true,
)

// ---------------------------------------------------------------------------

console.log(`\nИтог: ${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exitCode = 1
}

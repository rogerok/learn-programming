/**
 * Упражнения к главе 13: Semigroup и Monoid.
 *
 * Запуск после решения:
 *   npx tsx monoids.ts
 *
 * В этом файле нет внешних зависимостей. Цель — руками почувствовать:
 *   1. как задаётся правило комбинации
 *   2. зачем нужен empty
 *   3. почему fold безопаснее reduce без initial value
 */

interface Semigroup<A> {
  concat: (first: A, second: A) => A;
}

interface Monoid<A> extends Semigroup<A> {
  empty: A;
}

// ---------------------------------------------------------------------------
// Exercise A: concatAll
// ---------------------------------------------------------------------------

const concatAll = <A>(_monoid: Monoid<A>) =>
  (_items: readonly A[]): A => {
    // TODO:
    // 1. Начни с monoid.empty
    // 2. Иди по массиву слева направо
    // 3. Накапливай результат через monoid.concat(acc, item)
    return _monoid.empty;
  };

// ---------------------------------------------------------------------------
// Exercise B: базовые моноиды
// ---------------------------------------------------------------------------

const MonoidSum: Monoid<number> = {
  // TODO
  concat: (_first, _second) => 0,
  empty: 0,
};

const MonoidString: Monoid<string> = {
  // TODO
  concat: (_first, _second) => '',
  empty: '',
};

const MonoidAny: Monoid<boolean> = {
  // TODO
  concat: (_first, _second) => false,
  empty: false,
};

// ---------------------------------------------------------------------------
// Exercise C: product monoid для учебной статистики
// ---------------------------------------------------------------------------

type StudyStats = {
  solvedTasks: number;
  visitedTopics: readonly string[];
  hadConfusion: boolean;
};

const MonoidStudyStats: Monoid<StudyStats> = {
  // TODO:
  // solvedTasks -> суммировать
  // visitedTopics -> конкатенировать массивы
  // hadConfusion -> объединять через OR
  concat: (_first, _second) => ({
    solvedTasks: 0,
    visitedTopics: [],
    hadConfusion: false,
  }),
  empty: {
    solvedTasks: 0,
    visitedTopics: [],
    hadConfusion: false,
  },
};

const combineStudyDays = (_days: readonly StudyStats[]): StudyStats => {
  // TODO:
  // Используй concatAll(MonoidStudyStats)
  return MonoidStudyStats.empty;
};

// ---------------------------------------------------------------------------
// Exercise D: foldMap как мост к fp-ts
// ---------------------------------------------------------------------------

const foldMap = <A, B>(_monoid: Monoid<B>, _map: (value: A) => B) =>
  (_items: readonly A[]): B => {
    // TODO:
    // 1. Преврати каждый item в B через _map
    // 2. Сверни результат через concatAll(_monoid)
    return _monoid.empty;
  };

type QuizAnswer = {
  isCorrect: boolean;
  topic: string;
};

type QuizSummary = {
  correctAnswers: number;
  topics: readonly string[];
  madeAnyMistake: boolean;
};

const MonoidQuizSummary: Monoid<QuizSummary> = {
  concat: (first, second) => ({
    correctAnswers: first.correctAnswers + second.correctAnswers,
    topics: [...first.topics, ...second.topics],
    madeAnyMistake: first.madeAnyMistake || second.madeAnyMistake,
  }),
  empty: {
    correctAnswers: 0,
    topics: [],
    madeAnyMistake: false,
  },
};

const summarizeAnswers = (_answers: readonly QuizAnswer[]): QuizSummary => {
  // TODO:
  // Используй foldMap(MonoidQuizSummary, ...)
  return MonoidQuizSummary.empty;
};

// ---------------------------------------------------------------------------
// Exercise E: Semigroup без Monoid
// ---------------------------------------------------------------------------

const SemigroupFirst = <A>(): Semigroup<A> => ({
  // TODO:
  // всегда возвращай first
  concat: (_first, second) => second,
});

const keepOriginalId = (leftId: number, rightId: number): number =>
  SemigroupFirst<number>().concat(leftId, rightId);

// ---------------------------------------------------------------------------
// Тесты. Они начнут проходить после выполнения TODO выше.
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

const test = (description: string, actual: unknown, expected: unknown): void => {
  if (actual === expected) {
    console.log(`  ПРОЙДЕН: ${description}`);
    passed += 1;
  } else {
    console.error(`  ПРОВАЛЕН: ${description}`);
    console.error(`    Ожидалось: ${String(expected)}`);
    console.error(`    Получено:  ${String(actual)}`);
    failed += 1;
  }
};

const testJson = (description: string, actual: unknown, expected: unknown): void => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  test(description, actualJson, expectedJson);
};

console.log('\n--- Exercise A: concatAll ---\n');
const sumAll = concatAll(MonoidSum);
test('sumAll([1, 2, 3]) -> 6', sumAll([1, 2, 3]), 6);
test('sumAll([]) -> 0', sumAll([]), 0);

console.log('\n--- Exercise B: базовые моноиды ---\n');
const joinAll = concatAll(MonoidString);
const anyTrue = concatAll(MonoidAny);
test(`joinAll(['fp', '-ts']) -> "fp-ts"`, joinAll(['fp', '-ts']), 'fp-ts');
test('joinAll([]) -> empty string', joinAll([]), '');
test('anyTrue([false, true, false]) -> true', anyTrue([false, true, false]), true);
test('anyTrue([]) -> false', anyTrue([]), false);

console.log('\n--- Exercise C: StudyStats ---\n');
testJson(
  'combineStudyDays aggregates all fields',
  combineStudyDays([
    {
      solvedTasks: 2,
      visitedTopics: ['Semigroup'],
      hadConfusion: false,
    },
    {
      solvedTasks: 3,
      visitedTopics: ['Monoid', 'fold'],
      hadConfusion: true,
    },
  ]),
  {
    solvedTasks: 5,
    visitedTopics: ['Semigroup', 'Monoid', 'fold'],
    hadConfusion: true,
  }
);

testJson(
  'combineStudyDays([]) -> empty stats',
  combineStudyDays([]),
  {
    solvedTasks: 0,
    visitedTopics: [],
    hadConfusion: false,
  }
);

console.log('\n--- Exercise D: foldMap ---\n');
testJson(
  'summarizeAnswers aggregates quiz results',
  summarizeAnswers([
    { isCorrect: true, topic: 'Semigroup' },
    { isCorrect: false, topic: 'Monoid' },
    { isCorrect: true, topic: 'fold' },
  ]),
  {
    correctAnswers: 2,
    topics: ['Semigroup', 'Monoid', 'fold'],
    madeAnyMistake: true,
  }
);

testJson(
  'summarizeAnswers([]) -> empty summary',
  summarizeAnswers([]),
  {
    correctAnswers: 0,
    topics: [],
    madeAnyMistake: false,
  }
);

console.log('\n--- Exercise E: First semigroup ---\n');
test('keepOriginalId(101, 202) -> 101', keepOriginalId(101, 202), 101);

console.log('\n--- Результат ---\n');

if (failed === 0) {
  console.log(`Все тесты пройдены: ${passed}`);
} else {
  console.error(`Пройдено: ${passed}, провалено: ${failed}`);
  process.exitCode = 1;
}

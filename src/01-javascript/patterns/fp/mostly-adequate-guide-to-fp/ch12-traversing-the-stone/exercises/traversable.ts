/**
 * Упражнения к главе 12: Traversable, sequence и traverse.
 *
 * Запуск после решения:
 *   npx tsx traversable.ts
 *
 * В этом файле есть минимальные реализации Maybe, Either и Task, чтобы
 * сосредоточиться на идее обхода, а не на библиотеке.
 */

class Maybe<A> {
  private constructor(private readonly value: A | null | undefined) {}

  static just<A>(value: A): Maybe<A> {
    return new Maybe(value);
  }

  static nothing<A>(): Maybe<A> {
    return new Maybe<A>(null);
  }

  static of<A>(value: A | null | undefined): Maybe<A> {
    return value === null || value === undefined ? Maybe.nothing<A>() : Maybe.just(value);
  }

  map<B>(fn: (value: A) => B): Maybe<B> {
    return this.value === null || this.value === undefined
      ? Maybe.nothing<B>()
      : Maybe.just(fn(this.value));
  }

  fold<B>(onNothing: () => B, onJust: (value: A) => B): B {
    return this.value === null || this.value === undefined ? onNothing() : onJust(this.value);
  }

  inspect(): string {
    return this.fold(() => 'Nothing', (value) => `Just(${JSON.stringify(value)})`);
  }
}

class Left<E> {
  readonly tag = 'Left';

  constructor(readonly error: E) {}

  map<B>(_fn: (value: never) => B): Either<E, B> {
    return new Left(this.error);
  }

  fold<B>(onLeft: (error: E) => B, _onRight: (value: never) => B): B {
    return onLeft(this.error);
  }

  inspect(): string {
    return `Left(${JSON.stringify(this.error)})`;
  }
}

class Right<A> {
  readonly tag = 'Right';

  constructor(readonly value: A) {}

  map<B>(fn: (value: A) => B): Either<never, B> {
    return new Right(fn(this.value));
  }

  fold<B>(_onLeft: (error: never) => B, onRight: (value: A) => B): B {
    return onRight(this.value);
  }

  inspect(): string {
    return `Right(${JSON.stringify(this.value)})`;
  }
}

type Either<E, A> = Left<E> | Right<A>;

const left = <E, A = never>(error: E): Either<E, A> => new Left(error);
const right = <A, E = never>(value: A): Either<E, A> => new Right(value);

class Task<E, A> {
  constructor(readonly fork: (reject: (error: E) => void, resolve: (value: A) => void) => void) {}

  static of<E = never, A = never>(value: A): Task<E, A> {
    return new Task((_reject, resolve) => resolve(value));
  }

  static rejected<E, A = never>(error: E): Task<E, A> {
    return new Task((reject) => reject(error));
  }

  map<B>(fn: (value: A) => B): Task<E, B> {
    return new Task((reject, resolve) => this.fork(reject, (value) => resolve(fn(value))));
  }

  chain<E2, B>(fn: (value: A) => Task<E2, B>): Task<E | E2, B> {
    return new Task((reject, resolve) => this.fork(reject, (value) => fn(value).fork(reject, resolve)));
  }
}

const runTask = <E, A>(task: Task<E, A>): Promise<Either<E, A>> =>
  new Promise((resolve) => {
    task.fork(
      (error) => resolve(left(error)),
      (value) => resolve(right(value))
    );
  });

// ---------------------------------------------------------------------------
// Exercise A: sequence для массива Maybe
// ---------------------------------------------------------------------------

const sequenceMaybeArray = <A>(_items: readonly Maybe<A>[]): Maybe<A[]> => {
  // TODO:
  // 1. Пройти по массиву слева направо
  // 2. Если встретился Nothing, вернуть Nothing
  // 3. Иначе собрать все значения в Just([...])
  return Maybe.nothing<A[]>();
};

// ---------------------------------------------------------------------------
// Exercise B: traverse для массива Either
// ---------------------------------------------------------------------------

type Player = {
  id: number;
  name: string;
};

const validatePlayer = (player: Player): Either<string, Player> =>
  player.name.trim().length > 0
    ? right(player)
    : left(`Player ${player.id} must have name`);

const traverseEitherArray = <E, A, B>(
  _items: readonly A[],
  _fn: (item: A) => Either<E, B>
): Either<E, B[]> => {
  // TODO:
  // 1. Начни с Right([])
  // 2. На каждом шаге применяй fn к элементу
  // 3. Если получил Left, останавливайся и возвращай ошибку
  // 4. Если получил Right(value), добавляй value в накопленный массив
  return right([]);
};

const startGame = (_players: readonly Player[]): Either<string, string> => {
  // TODO:
  // Используй traverseEitherArray(players, validatePlayer)
  // Если все игроки валидны, верни Right('game started!')
  return left('TODO: implement startGame');
};

// ---------------------------------------------------------------------------
// Exercise C: traverse для массива Task
// ---------------------------------------------------------------------------

type Route = '/' | '/about' | '/contact' | '/missing';
type Json = {
  route: string;
  title: string;
};

const routeResponses = new Map<Route, Json>([
  ['/', { route: '/', title: 'Home' }],
  ['/about', { route: '/about', title: 'About' }],
  ['/contact', { route: '/contact', title: 'Contact' }],
]);

const httpGet = (route: Route): Task<string, Json> =>
  routeResponses.has(route)
    ? Task.of(routeResponses.get(route) as Json)
    : Task.rejected(`404: ${route}`);

const traverseTaskArray = <E, A, B>(
  _items: readonly A[],
  _fn: (item: A) => Task<E, B>
): Task<E, B[]> => {
  // TODO:
  // Подсказка по аккумулятору:
  //   Task.of<E, B[]>([])
  //
  // На каждом шаге:
  //   1. дождись текущего массива через chain
  //   2. запусти _fn(item)
  //   3. добавь новое значение в конец массива
  return Task.of([]);
};

const getJsons = (_routes: readonly Route[]): Task<string, Json[]> => {
  // TODO:
  // Используй traverseTaskArray(routes, httpGet)
  return Task.rejected('TODO: implement getJsons');
};

// ---------------------------------------------------------------------------
// Exercise D: traverse для Maybe и Task
// ---------------------------------------------------------------------------

const traverseMaybeTask = <E, A, B>(
  _value: Maybe<A>,
  _fn: (item: A) => Task<E, B>
): Task<E, Maybe<B>> => {
  // TODO:
  // - Nothing должно стать Task.of(Nothing)
  // - Just(a) должно стать _fn(a).map((value) => Just(value))
  return Task.of(Maybe.nothing<B>());
};

// ---------------------------------------------------------------------------
// Exercise E: readFirst
// ---------------------------------------------------------------------------

const fileSystem = new Map<string, string[]>([
  ['/docs', ['intro.txt', 'summary.txt']],
  ['/empty', []],
]);

const fileContents = new Map<string, string>([
  ['intro.txt', 'Functional programming is about composition'],
  ['summary.txt', 'Traversable reorganizes nested effects'],
]);

const readdir = (directory: string): Task<string, string[]> =>
  fileSystem.has(directory)
    ? Task.of(fileSystem.get(directory) as string[])
    : Task.rejected(`Directory not found: ${directory}`);

const safeHead = <A>(items: readonly A[]): Maybe<A> =>
  items.length === 0 ? Maybe.nothing<A>() : Maybe.just(items[0]);

const readFile = (fileName: string): Task<string, string> =>
  fileContents.has(fileName)
    ? Task.of(fileContents.get(fileName) as string)
    : Task.rejected(`File not found: ${fileName}`);

const readFirst = (_directory: string): Task<string, Maybe<string>> => {
  // TODO:
  // 1. readdir(directory)
  // 2. map(safeHead)
  // 3. chain((maybeFileName) => traverseMaybeTask(maybeFileName, readFile))
  return Task.rejected('TODO: implement readFirst');
};

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

const main = async (): Promise<void> => {
  console.log('\n--- Exercise A: sequenceMaybeArray ---\n');
  test(
    'all Just -> Just([1, 2, 3])',
    sequenceMaybeArray([Maybe.just(1), Maybe.just(2), Maybe.just(3)]).inspect(),
    'Just([1,2,3])'
  );
  test(
    'Nothing inside -> Nothing',
    sequenceMaybeArray([Maybe.just(1), Maybe.nothing<number>(), Maybe.just(3)]).inspect(),
    'Nothing'
  );

  console.log('\n--- Exercise B: traverseEitherArray / startGame ---\n');
  const validPlayers: Player[] = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Linus' },
  ];
  const invalidPlayers: Player[] = [
    { id: 1, name: 'Ada' },
    { id: 2, name: '   ' },
  ];

  test(
    'all players valid',
    traverseEitherArray(validPlayers, validatePlayer).inspect(),
    'Right([{"id":1,"name":"Ada"},{"id":2,"name":"Linus"}])'
  );
  test(
    'first invalid player stops traversal',
    traverseEitherArray(invalidPlayers, validatePlayer).inspect(),
    'Left("Player 2 must have name")'
  );
  test(
    'startGame(validPlayers) -> Right(game started!)',
    startGame(validPlayers).inspect(),
    'Right("game started!")'
  );
  test(
    'startGame(invalidPlayers) -> Left(Player 2 must have name)',
    startGame(invalidPlayers).inspect(),
    'Left("Player 2 must have name")'
  );

  console.log('\n--- Exercise C: traverseTaskArray / getJsons ---\n');
  const okJsons = await runTask(getJsons(['/', '/about', '/contact']));
  const failedJsons = await runTask(getJsons(['/', '/missing']));

  test(
    'getJsons success',
    okJsons.inspect(),
    'Right([{"route":"/","title":"Home"},{"route":"/about","title":"About"},{"route":"/contact","title":"Contact"}])'
  );
  test(
    'getJsons stops on failed route',
    failedJsons.inspect(),
    'Left("404: /missing")'
  );

  console.log('\n--- Exercise D: traverseMaybeTask ---\n');
  const justFile = await runTask(traverseMaybeTask(Maybe.just('intro.txt'), readFile));
  const nothingFile = await runTask(traverseMaybeTask(Maybe.nothing<string>(), readFile));

  test(
    'Just(intro.txt) -> Right(Just(content))',
    justFile.inspect(),
    'Right({"value":"Functional programming is about composition"})'
  );
  test(
    'Nothing -> Right(Nothing)',
    nothingFile.inspect(),
    'Right({"value":null})'
  );

  console.log('\n--- Exercise E: readFirst ---\n');
  const existingDirectory = await runTask(readFirst('/docs'));
  const emptyDirectory = await runTask(readFirst('/empty'));
  const missingDirectory = await runTask(readFirst('/missing'));

  test(
    'readFirst(/docs) -> Right(Just(content))',
    existingDirectory.inspect(),
    'Right({"value":"Functional programming is about composition"})'
  );
  test(
    'readFirst(/empty) -> Right(Nothing)',
    emptyDirectory.inspect(),
    'Right({"value":null})'
  );
  test(
    'readFirst(/missing) -> Left(error)',
    missingDirectory.inspect(),
    'Left("Directory not found: /missing")'
  );

  console.log(`\nИтог: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
};

void main();

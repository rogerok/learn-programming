//@ts-ignore
const partial =
  //@ts-ignore
  (fn, x) =>
    //@ts-ignore
    (...args) =>
      fn(x, ...args);

const partialTyped =
  <K, T extends unknown[]>(fn: (x: K, ...args: T) => unknown, x: K) =>
  (...args: T) =>
    fn(x, ...args);

const sum4 = (a: number, b: number, c: number, d: number) => {
  console.log({ a, b, c, d });

  return a + b + c + d;
};

const f11 = partial(sum4, 1);
const f12 = partial(f11, 2);
const f13 = partial(f12, 3);
const y1 = f13(4);
console.log(y1);

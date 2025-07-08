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
console.log(y2);

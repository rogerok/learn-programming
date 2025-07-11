const curry = (fn, ...params) => {
  const curried = (...args) => {
    return fn.length > args.length
      ? curry(fn.bind(null, ...args))
      : fn(...args);
  };

  return params.length ? curried(...params) : curried;
};

const sum4 = (a, b, c, d) => a + b + c + d;

const f = curry(sum4);

const y2 = f(1)(2)(3)(4);

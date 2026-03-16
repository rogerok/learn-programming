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

// Usage

const sum4 = (a, b, c, d) => a + b + c + d;

const f = sum4;
const y5 = f(1)(2)(3)(4);

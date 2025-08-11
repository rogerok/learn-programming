const argKey = (x) => x.toString() + ":" + typeof x;
const generateKey = (args) => args.map(argKey).join("|");

const memoize = (fn) => {
  // Чтобы не было лишнего прототипирования
  const cache = Object.create(null);

  return (...args) => {
    const key = generateKey(args);
    const val = cache[key];

    if (val) {
      return val;
    }

    const res = fn(...args);
    cache[key] = res;
    return res;
  };
};

const sumSeq = (a, b) => {
  console.log("Calculate sum");

  let r = 0;
  for (let i = a; i < b; i++) {
    r += i;
  }

  return r;
};

const memoized = memoize(sumSeq);

console.log("First call memoized(2, 5)");
console.log("Value:", memoized(2, 5));

console.log("Second call memoized(2, 5)");
console.log("From cache:", memoized(2, 5));

console.log("Call memoized(3, 6)");
console.log("Calculated:", memoized(3, 6));

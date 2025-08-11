const argKey = (x) => x.toString() + ":" + typeof x;
const generateKey = (args) => args.map(argKey).join("|");

const memoize = (fn, length) => {
  const cache = new Map();

  return (...args) => {
    const key = generateKey(args);
    console.log(`${fn.name}(${key}) call`);
    if (cache.has(key)) {
      return cache.get(key);
    }

    console.log(`max ${key} calculate`);
    const res = fn(...args);

    console.log("cache size ", cache.size);
    if (cache.size >= length) {
      const firstKey = cache.keys().next().value;
      console.log(`Delete key:`, firstKey);
      cache.delete(firstKey);
    }

    cache.set(key, res);

    return res;
  };
};

const max = (a, b) => (a > b ? a : b);
const memoizedMax = memoize(max, 3);

memoizedMax(10, 8);
memoizedMax(10, 8);
memoizedMax(1, 15);
memoizedMax(12, 3);
memoizedMax(1, 15);
memoizedMax(10, 8);
memoizedMax(0, 0);
memoizedMax(0, 0);

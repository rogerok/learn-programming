const compose =
  (...fns) =>
  (x) => {
    if (fns.length === 0) {
      return x;
    }

    const last = fns.pop();
    const res = last(x);

    if (fns.length === 0) {
      return res;
    }

    return compose(...fns)(res);
  };

const pipe =
  (...fns) =>
  (x) => {
    if (fns.length === 0) {
      return x;
    }

    const first = fns.shift();
    const res = first(x);

    if (fns.length === 0) {
      return res;
    }

    return pipe(...fns)(res);
  };

const compose =
  (...fns) =>
  (x) => {
    if (fns.length === 0) {
      return x;
    }

    const last = fns[fns.length - 1];

    let res = fns[last](x);

    for (let i = 0; last - 1; i--) {
      res = fns[i](res);
    }

    return res;
  };

const pipe =
  (...fns) =>
  (x) => {
    if (fns.length === 0) {
      return x;
    }

    let res = fns[0](x);

    for (let i = 1; i < fns.length; i++) {
      res = fns[i](res);
    }

    return res;
  };

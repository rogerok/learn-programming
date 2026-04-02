// справа налево
const compose =
  (f, g) =>
  (...args) =>
    f(g(...args));

// слева направо
const pipe =
  (f, g) =>
  (...args) =>
    g(f(...args));

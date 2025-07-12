const power = (exp, n) => n ** exp;

const square = (n) => power(2, n);

const cube = Math.pow.bind(null, undefined, 3);

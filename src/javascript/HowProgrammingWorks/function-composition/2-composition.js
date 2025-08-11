// Ф-ция выполняется справа налево
const compose = (f, g) => (x) => f(g(x));

const upperFirst = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const upperCapital = (s) => s.split(" ").map(upperFirst).join(" ");
const lower = (s) => s.toLowerCase();

const capitalize = compose(upperCapital, lower);

console.log();

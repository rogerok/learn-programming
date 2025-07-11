const log = (base: number, n: number) => Math.log(n) / Math.log(base);

// Usage

const lg = log.bind(null, 10);
const ln = log.bind(null, Math.E);

console.log("lg(5) = " + lg(5));
console.log("ln(5) = " + ln(5));

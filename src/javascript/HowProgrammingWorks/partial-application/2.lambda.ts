const log = (base: number, n: number) => Math.log(n) / Math.log(base);

// Usage

const lg = (n: number) => log(10, n);
const ln = (n: number) => log(Math.E, n);

console.log("lg(5) = " + lg(5));
console.log("ln(5) = " + ln(5));

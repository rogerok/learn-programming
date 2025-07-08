const log = (base: number, n: number) => Math.log(n) / Math.log(base);

const createLog = (base: number) => (n: number) => log(base, n);

// Usage

const lg = createLog(10);
const ln = createLog(Math.E);

console.log("lg(5) = " + lg(5));
console.log("lg(5) = " + ln(5));

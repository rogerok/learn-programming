import assert from "assert";

/*
  Generalized mean (Hölder mean)
  Given n numbers a₁, a₂, ... an
  Define Hk (for k != 0) as the k-th root of the arithmetic mean
  of the k-th power of a set of numbers
         ____________________________
  Hk = ᵏ√ (a₁ᵏ + a₂ᵏ + ... + anᵏ) / n
*/

const H = (exp, ...args) => {
  const sum = args.reduce((s, a) => s + Math.pow(a, exp), 0);
  const avg = sum / args.length;
  return Math.pow(avg, 1 / exp);
};

// Use method bind() to create new functions from function H.
// Create function `average` that returns arithmetic mean (H₁) of the arguments.
// Create function `rootMeanSquare` that returns quadratic mean (H₂).

const average = H.bind(null, 1);
const rootMeanSquare = H.bind(null, 2);
// const rootMeanSquare = null;

const tests = [
  {
    name: "rootMeanSquare",
    func: rootMeanSquare,
    cases: [
      { args: [7, 1, 5], expected: Math.sqrt((49 + 1 + 25) / 3) },
      { args: [4, 4, 4, 4], expected: 4 },
    ],
  },
  {
    name: "average",
    func: average,
    cases: [
      { args: [3, 4, 6, 7, 5], expected: (3 + 4 + 6 + 7 + 5) / 5 },
      { args: [4, 4, 4, 4], expected: 4 },
    ],
  },
];

for (const { name, func, cases } of tests) {
  for (const { args, expected } of cases) {
    const result = func(...args);
    try {
      assert.strictEqual(
        Math.abs(result - expected) < 1e-10,
        true,
        `${name}(${args.join(", ")}) expected ${expected}, got ${result}`,
      );
    } catch (e) {
      console.error(e.message);
    }
  }
}

console.log("Tests finished");

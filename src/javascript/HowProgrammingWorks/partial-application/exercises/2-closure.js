import assert from "assert";

const coffee = (volume, strength) =>
  `Coffee volume: ${volume}ml, strength: ${strength}`;

const defineCoffeeType = (volume) => (strength) => coffee(volume, strength);
// Use function defineCoffeeType to define new coffee types.
// Define coffee type espresso which volume should equal 50ml.
// Define coffee type americano which volume should equal 150ml.

const espresso = defineCoffeeType(50);
const americano = defineCoffeeType(150);

const tests = [
  {
    name: "espresso",
    fn: espresso,
    cases: [
      ["medium", "Coffee volume: 50ml, strength: medium"],
      ["strong", "Coffee volume: 50ml, strength: strong"],
    ],
  },
  {
    name: "americano",
    fn: americano,
    cases: [
      ["medium", "Coffee volume: 150ml, strength: medium"],
      ["strong", "Coffee volume: 150ml, strength: strong"],
    ],
  },
];

for (const { name, fn, cases } of tests) {
  for (const [input, expected] of cases) {
    const actual = fn(input);
    assert.strictEqual(
      actual,
      expected,
      `${name}("${input}") → "${actual}", expected "${expected}"`,
    );
  }
  console.log(`✅ ${name} passed`);
}

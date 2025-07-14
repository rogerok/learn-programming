// Check 4 digit pin.
const EXPECTED_PIN = "4967";
const checkPin = (...code) => code.join("") === EXPECTED_PIN;

// Define function curry that accepts the length of the function
// (amount of function arguments) and the function.

const curry = (length, fn) => {
  const curried = (...args) => {
    if (args.length >= length) {
      return fn(...args);
    } else {
      return (...next) => curried(...args, ...next);
    }
  };
  return curried;
};

// Allows to enter pin code by one character,
// Usage: press('3')('4')('5')('6')
const press = curry(4, checkPin);

const test = (press) => {
  {
    const f1 = press("1");
    if (typeof f1 !== "function") {
      throw new Error(`Expected press('1') to be a function.`);
    }
  }
  {
    const f2 = press("1")("2");
    console.log(f2);
    if (typeof f2 !== "function") {
      throw new Error(`Expected press('1')('2') to be a function.`);
    }
  }
  {
    const f3 = press("1")("2")("3");
    if (typeof f3 !== "function") {
      throw new Error(`Expected press('1')('2')('3') to be a function.`);
    }
  }
  {
    const e4 = press("1")("2")("3")("4");
    if (typeof e4 !== "boolean") {
      throw new Error(`Expected press('1')('2')('3')('4') to be a boolean.`);
    }
  }
  {
    const res = press("1")("2")("3")("4");
    if (res) {
      throw new Error(`Expected false when entered wrong pin code.`);
    }
  }
  {
    const res = press("4")("9")("6")("7");
    if (!res) {
      throw new Error(`Expected true when entered correct pin code.`);
    }
  }
};

try {
  test(press);
  console.log("✅ All tests passed");
} catch (err) {
  console.error("❌ Test failed:", err.message);
}

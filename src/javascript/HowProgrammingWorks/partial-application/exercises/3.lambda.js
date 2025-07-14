const tagged = (pref, str) => `[${pref}] ${str}`;

// Define function tagDate that prepends current date to the string.
// E.g. tagDate('My String') === '[2019-11-14] My String'
// Use function tagged to implement tagDate.

const tagDate = (str) => {
  return tagged(new Date().toISOString().slice(0, 10), str);
};

const tagDateTest = {
  name: "tagDate",
  length: [150, 400],
  test: (tagDate) => {
    {
      const date = new Date().toISOString().substring(0, 10);
      const expected = `[${date}] Test`;
      const y = tagDate("Test");
      if (y !== expected) {
        throw new Error(`tagDate('Test') === ${y} expected: ${expected}`);
      }
    }
    {
      const src = tagDate.toString();
      if (!src.includes("tagged("))
        throw new Error("Use function tagged to implement tagDate");
    }
  },
};

tagDateTest.test(tagDate);
console.log(`✅ ${tagDateTest.name} passed`);

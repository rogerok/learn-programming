class Person {
  constructor(name) {
    this.name = name;
  }
}

const factorify =
  (Category) =>
  (...args) =>
    new Category(...args);

const p1 = new Person("Marcus");

console.log({ p1 });

const personFactory = factorify(Person);
const p2 = personFactory("Marcus");

console.log({ p2 });

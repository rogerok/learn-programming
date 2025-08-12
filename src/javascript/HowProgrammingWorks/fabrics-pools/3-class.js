const loggable = (fields) =>
  class Loggable {
    constructor(data) {
      this.values = data;

      for (const key of fields) {
        Object.defineProperty(Loggable.prototype, key, {
          get() {
            console.log("Reading key:", key);
            return this.values[key];
          },
          set(value) {
            console.log("Writing key:", key, value);
            const def = fields[key];
            const valid = typeof value === def.type && def.validate(value);
            if (valid) {
              this.values[key] = value;
            } else {
              console.log("Validation failed:", key, value);
            }
          },
        });
      }
    }

    toString() {
      let result = this.constructor.name + "\t";
      for (const key in fields) {
        result += this.values[key] + "\t";
      }
      return result;
    }
  };

const Person = loggable({
  name: { type: "string", validate: (value) => value.length > 0 },
  born: { type: "number", validate: (value) => !(value % 1) },
});

const p1 = new Person({ name: "Alex", born: 21 });

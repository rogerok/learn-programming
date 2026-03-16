export const EventEmitter = function () {
  this.events = {}; // hash of array of function
};

EventEmitter.prototype.on = function (name, fn) {
  const event = this.events[name];
  if (event) {
    event.push(fn);
  } else {
    this.events[name] = [fn];
  }
};

EventEmitter.prototype.emit = function (name, ...data) {
  const event = this.events[name];
  if (event) {
    event.forEach((fn) => fn(...data));
  }
};

const ee = new EventEmitter();

ee.on("event", (data) => {
  console.log(data);
});

ee.emit("event", { a: 5 });

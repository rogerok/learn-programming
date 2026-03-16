import EventEmitter from "node:events";

const emitter = new EventEmitter();

emitter.on("new city", (city) => {
  console.log("Emitted city:" + city);
});

emitter.on("data", (arr) => {
  console.log(arr.reduce((a, b) => a + b));
});

emitter.emit("new city", "Los Santos");
emitter.emit("data", [1, 2]);

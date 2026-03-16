const Text = (string) => {
  this.value = string;
};

Text.prototype.line = function (a) {
  this.value += "\n" + a;
  return this;
};

Text.prototype.toString = function () {
  return this.value;
};

// Usage

const txt = new Text("line1").line("line2").line("line 3");

console.log(txt.toString());

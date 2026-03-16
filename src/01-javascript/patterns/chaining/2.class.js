class Text {
  value;

  constructor(string) {
    this.value = string;
  }

  line(a) {
    this.value = this.value + "\n" + a;
    return this;
  }
}

const txt = new Text("line1").line("line2").line("line3");

console.log(txt.value);

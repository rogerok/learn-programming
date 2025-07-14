/*
  В данном примере будет мутироваться объект, вместо возврата нового как в functor.
  В аргументах объявляем объект и возвращаем ссылку на него.
 */

const text = (
  s = "",
  o = {
    line: (a) => {
      s += "\n" + a;
      return o;
    },
    toString: () => s,
  },
) => o;

const txt = text("line1").line("line2").line("line3");

console.log(txt + " ");

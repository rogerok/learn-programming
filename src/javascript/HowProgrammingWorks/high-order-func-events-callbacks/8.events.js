const adder = (initial) => {
  let value = initial;

  const add = (delta) => {
    value += delta;
    if (value >= add.maxValue) {
      add.maxEvent(value);
    }
    // ф-ция из себя возвращает ссылку на саму же себя
    return add;
  };
  // добавляем свойства для ф-ции add
  add.max = (max, event) => {
    add.maxValue = max;
    add.maxEvent = event;
    // ф-ция из себя возвращает ссылку на саму же себя
    return add;
  };

  return add;
};

/*
 Ф-ция `adder` создаёт замыкание, в которой будет храниться initial значение.
 К значению будет применяться событие, когда оно достигнет определенного заданного значения
 (в нашем случае maxReached ф-ция)
 */

// Usage

const maxReached = (value) => {
  console.log("max value reached, value:" + value);
};

const a1 = adder(10).max(100, maxReached)(-12);

a1(25);
a1(50);

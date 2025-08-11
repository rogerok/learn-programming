const g1 = {};
const g2 = {};
const g3 = {
  area: 300,
};

g2.area = 200;

const mixinCalculateCost = (obj) => {
  // Если obj.area нет в объекте, то ф-ция "домешает" это поле.
  obj.area = obj.area || 0;

  // Ф-ция "домешивает" метод
  obj.calculateCost = function (price) {
    return this.area * price;
  };
};

mixinCalculateCost(g1);

console.log(g1.calculateCost(30));

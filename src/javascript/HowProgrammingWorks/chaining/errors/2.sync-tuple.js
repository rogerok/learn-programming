const sum = (a, b) => {
  if (typeof a === "number" && typeof b === "number") {
    return [null, a + b];
  } else {
    /*
      В данном случае не нужно ловить ошибку т.к. она лежит в массиве
      Через массив для того чтобы совместить ошибку с callback last, error first контрактом
      Например cb(...sum(7, 'A')) позволит нам при деструктуризации получить первым аргументом ошибку и соблюсти контракт
     */
    return [new Error("a should be numbers")];
  }
};

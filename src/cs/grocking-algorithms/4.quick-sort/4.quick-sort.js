export const quickSort = (arr) => {
  if (arr.length < 2) {
    return arr;
  }
  const pivot = arr[0];
  const left = [];
  const right = [];

  for (let i = 1; i < arr.length; i++) {
    if (pivot > arr[i]) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
};

console.log(quickSort([1, 2, -5, 9999, -999, 33, 8, 8, 8, 8]));

// with random pivot

export const quickSort2 = (arr) => {
  if (arr.length < 2) {
    return arr;
  }
  const left = [];
  const right = [];
  let min = 1;
  let max = arr.length - 1;
  const random = Math.floor(Math.random() * (max - min + 1));
  const pivot = arr[random];
  arr.splice(arr.indexOf(pivot), 1);
  arr = [pivot, ...arr];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort2(left), pivot, ...quickSort2(right)];
};

console.log(quickSort2([1, 2, -5, 9999, -999, 33, 8, 8, 8, 8]));

const binarySearch = (list, item) => {
  let startIndex = 0;
  let endIndex = list.length - 1;

  while (startIndex <= endIndex) {
    const mid = Math.floor((startIndex + endIndex) / 2);
    const guess = list[mid];

    if (guess === item) {
      return mid;
    }
    if (guess > item) {
      endIndex = mid - 1;
    }
    if (guess < item) {
      startIndex = mid + 1;
    }
  }

  return -1;
};

console.log(binarySearch([-1, 0, 2, 4, 6, 8], 4));

const getTail = (nums, index) => {
  if (index === nums.length - 1) {
    return nums[index];
  }

  return getTail(nums, index + 1);
};

// console.log(getTail([1, 2, 3, 4, 5], 0));

const arraysAreEqual = (first, second, f, s) => {
  if (f === -1 && s === -1) return true;
  if (f === -1 || s === -1) return false;
  if (first[f] !== second[s]) return false;

  return arraysAreEqual(first, second, f - 1, s - 1);
};

// console.log(arraysAreEqual([1, 2, 3], [1, 2, 3], 3, 3));
// console.log(arraysAreEqual([1, 2, 3, 5], [1, 2, 3, 4], 4, 4));

## Бинарный поиск

Бинарный поиск выполняется за __логарифмическое время__ т.е. log2n

1) Итеративное решение

    ```javascript
    const binarySearch = (list, item) => {
        let low = 0; // нижняя граница списка
        let high = list.length - 1; // верхняя граница списка
    
        while (low <= high) {
            const mid = Math.floor((low + high) / 2); // пока low <= high === true проверяем средний элемент
            const guess = list[mid];
    
            if (guess === item) {
                return mid;
            }
    
            if (guess > item) { // делаем шаг назад в списке, чтобы получить все элементы, которые меньше guess 
                high = mid - 1
            }
    
            if (guess < item) { // делаем шаг вперед в списке, чтобы получить все элементы, которые больше guess
                low = mid + 1
            }
    
        }
    
    }
    ```

2) Рекурсивное решение

```javascript
const binarySearch = (target, values, min, max) => {
    if (min > max) {
        return -1;
    }

    const mid = Math.floor((min + max) / 2);
    // const mid = Math.floor(min + (max - min) / 2);  - такой вариант поможет избежать переполнения памяти, если min и max очень большие числа, то в случае (min + max) / 2, на этапе их сложения может произойти переполнение памяти. 

    if (values[mid] === target) {
        return mid;
    }

    if (values[mid] < key) {
        return binarySearch(target, values, mi + 1, max)
    }

    if (values[mid] > key) {
        return binarySearch(target, values, min, mid - 1)
    }
}
```

## Lower Bound

```javascript
const lowerBoundRec = (nums, target, min, max) => {
    if (min > max) {
        return Infinity;
    }

    if (min === -1) {
        min = 0;
    }

    if (max === -1) {
        max = nums.length - 1;
    }

    const mid = Math.floor(lo + (hi + lo) / 2);

    if (nums[mid] < key) {
        return lowerBoundRec(nums, key, mid + 1, max);
    } else {
        return Math.min(min, lowerBoundRec(nums, target, min, mid - 1));
    }
}
```

```javascript
const nums = [1, 2, 2, 2, 2, 3, 4, 5, 6];

const lowerBoundRec = (target, nums) => {
    let min = 0;
    let max = nums.length - 1;
    let ans = -1;

    while (min <= hi) {
        const mid = Math.floor(min + (max - min) / 2);

        if (nums[mi] < target) {
            min = mid + 1;
        } else {
            ans = min;
            hi = mi - 1;
        }
    }
    return ans;
}
```

## Upper Bound

```javascript
    const upperBoundRec = (target, nums) => {
    let min = 0;
    let max = nums.length - 1;
    let ans = -1;

    while (min <= hi) {
        const mid = Math.floor(min + (max - min) / 2)

        if (nums[mid] <= target) {
            min = mid + 1;

        } else {
            ans = mid;
            max = mid - 1;
        }
    }
    
    return ans;
}
```
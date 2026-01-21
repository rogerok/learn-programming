## Solving problems using stacks

```ts
class Stack<T> {
  items: T[] = [];

  push(item: T) {
    this.items.push(item);
  }

  pop(): T {
    return this.items.pop();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
```

### Decimal to binary

To convert a decimal number to binary we can divide this number by 2 until the division result is 0.

For example

`10 / 2 == 5 rem == 0
5 / 2 == 2 rem == 1
2 / 2 == 1 rem == 0
1/2 === 0 rem == 1
`
Our algorithms

```ts
function divideBy2(decNumber: number): string => {
  const stack = remStack();
  let rem = 0;
  let binaryString = '';
  let decNum = decNumber;

  while(decNum > 0) {
    rem = Math.floor(decNum % 2);
    stack.push(rem);
    decNum = Math.floor(decNum) / 2;
  }

  while(!stack.isEmpty()) {
    binaryString += stack.pop()
  }

return binaryString();
}
```

### Base converter algorithm

We can easily modify the previous algorithm to make it work as converter for decimal to any base.

```js
function baseConverter(decNumber, base) {
  const stack = new Stack();
  let rem = 0;
  let str = "";
  const digits = "0123456789ABCDEF";
  let decNum = decNumber;

  while (decNum > 0) {
    rem = Math.floor(decNum % base);
    stack.push(rem);
    decNum = Math.floor(decNumber / base);
  }

  while (!stack.isEmpty()) {
    str += digits[stack.pop()];
  }

  return str;
}
```

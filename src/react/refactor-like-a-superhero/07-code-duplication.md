## Code duplication

### Not All Duplication is Evil

If two pieces of code have the same purpose, contain the same set of actions, and process the same data, that is
_direct_ duplication.
We can safely get rid of it by extracting the repeating code into a variable, function, or module.

But there are cases when two pieces of code seem "similar" but later turn out different.
If merge this code too early, then it will be harder to split such code later.
In general, it's much easier to combine identical code than to break modules merged earlier.

When we're not sure that we're facing two really identical pieces of code, we can mark these places with unique labels.
We can write assumption about what's duplicated there in these labels

```js
/** @duplicate Applies a discount coupon to the order. */
function applyCoupon(order, coupon) {
}

/** @duplicate Applies a discount coupon to the order. */
function applyDiscount(order, discount) {
}
```

**Such labels will only be helpful if we conduct their regular reviews.**

### Functions for actions

We can extract duplicated actions nad data transformations into functions and methods. To detect them, we can use the "
sameness deck".

- Actions are duplicated if they have the same goal - the desired result;
- Have the same scope - the part of the application they affect;
- Have the same direct input - arguments and parameters;
- Have the same indirect input - dependencies and imported modules;

In the example below, the code snippets pass this test:

```javascript
// - Goal: to add a field with the absolute discount value to the order;
// - Scope: the order object;
// - Direct input: order object, relative discount value;
// - Indirect input: function that converts percents to absolute value;

// a) 
const fromPercent = (amount, percent) => (amount * percent) / 100;

const order = {};
order.discount = fromPercent(order.total, 50);

// b)
const order = {};
const discount = (order.total * percent) / 100;
const discounted = {...order, discount};

// Actions in "a" and "b" are the same,
// so we can extract them into a function:

function applyDiscount(order, percent) {
    const discount = (order.total * percent) / 100;
    return {...order, discount};
}
```

---

In the other example, the goal and direct input are the same, but the dependencies are different:

```javascript
// The first snippet calculates discount in percent,
// the second one applies the "discount of the day"
// by using the "todayDiscount" function.

// a) 
const order = {};
const discount = (order.total * percent) / 100;

// b)
const todayDiscoubnt = () => {
    // ...Match the discount to today's date
}

const order = {};
const discount = todayDiscoubnt();
const dicounted = {...order, discounted}
```

In the example above ⬆, fragment "b" has the ```todayDiscount``` function among its dependencies.
Because of its dependencies. Because of it, the action sets differ enough to be considered "similar" but not "the same"

We can use `@duplicate` labels and wait a bit to get more information about how they should work.
When we know exactly how these functions should work, we can "generalize the actions".

```javascript
// The generalized `applyDiscount` function will take
// the absolute discount value:

function applyDiscount(order, discount) {
    return {...order, discount}
}

// Differences in the calculation (percentages, “discount of the day,” etc.)
// are collected as a separate set of functions:

const discountOptions = {
    percent: (order, percent) => order.total * percent / 100,
    daily: daysDiscount()
}

// As a result, we get a generalized action for applying a discount
// and a dictionary with discounts of different kinds.
// Then, the application of any discount will now become uniform:

const a = applyDiscount(order, discountOptions.daily)
const b = applyDiscount(order, discountOptions.percent(order, 40))
```
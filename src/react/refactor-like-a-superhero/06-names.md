## Names

Attention to the names of variables, functions, classes, and modules can be Pandora’s box in the world of refactoring. “Unclear” names can signal high coupling between modules, inadequate separation of concerns, or “leaking” abstractions.

### General Guidelines

An “obscure” name can hide valuable project details and the experience of other developers. We need to preserve them, so it’s worth diving into the meaning of such a name rather than discarding it altogether. If during refactoring, we see a name whose meaning isn’t clear to us, we can try:

- Find someone on the team who knows the meaning of that name;
- Search for the meaning in the code documentation;
- As a last resort, do a series of experiments, changing the variable and seeing how it affects the code.

---

_If the effect of a variable is visible on the “seam,” tests can help us with such experiments.
The test results will show how the different variable values change the code output. It can help us conclude the real variable purpose.
In other cases, we will probably have to evaluate the changes manually.
As an option in the debugger, we can observe how the different values affect the other variables and data the code works with.
Such experiments will not guarantee that we understand the meaning of the variable correctly, but they can tell us what knowledge about the project we lack._

---

### Too Short Names

We can consider a name “good” if it adequately represents the meaning of the variable or information about the domain. Too short names and uncommon abbreviations don’t do that. Sooner or later, someone will misread such a name because all the “knowledgeable” developers will stop working on the project.

```js
// Names `d`, `c`, and `p` are too short,
// so it's hard to reason about their meaning:

let d = 0;
if (c === "HAPPY_FRIDAY") d = p * 0.2;

// Variables with full-word names
// are easier to understand:

let discount = 0;
if (coupon === "HAPPY_FRIDAY") discount = price * 0.2;
```

One-letter names are okay in concise pieces of code, like `for`-loops. But for business logic, it’s better to use more descriptive words.

In other cases, it’s better to choose full word forms for the name:

### Too Long Names

Too long names signal that the entity is doing too many different things.
The key word here is “different” because non-cohesive functionality is the most difficult to combine in a single name.

When functionality is non-cohesive, the name tries to convey all its work details in a single phrase.
We should pay attention to names that contain words like that, **which**, **after**, **etc**.

Most often, long maes are signal of a function that does too much.
As rule, such functions uses either too primitive or too abstract terms.
The primary heuristic for finding such functions is to devise a shorter name for the function.
If we can't do that, the function os probably doing too much.

```js
async function submitOrderCreationFormIfValid() {
  // ...
}
```

The `submitOrderCreationFormIfValid` function from the example above does three things at once:

- It handles the form submission event;
- Validates the data from the form;
- Creates and sends a new order.

Each step is important enough to be reflected in the name, but this bloats the name.
It's better to think about how to split the tasks into smaller ones and separate responsibility between
the individual functions.

```js
// Serializes form data into an object:
function serializeForm() {}

// Validates the data object:
function validateFormData() {}

// Create a new order object from the data:
function createOrder() {}

// Sends the order to the server:
async function sendOrder() {}

// Handles the DOM event by calling other functions:
function handleOrderSubmit() {}
```

Then, instead of one big function, trying to do everything we would have a chain of
different, smaller ones.Inner functions would contain actions grouped by meaning/
Their names could take some of the details from the root function name, which would make it easier:

```js
async function handleOrderSubmit(event) {
  const formData = serializeForm(event.target);
  const validData = validateFormData(formData);
  const order = createOrder(validData);
  await sendOrder(order);
}
```

A goo tactic is to see the function name from the caller's perspective.
Does the form care how is submission handled? Probably not;
it only matters that the submission is handled in principle.
The handler might want to express what form it's going to handle in its name:

handle +
submit event +
on order form =

---

handleOrderSubmit

But how exactly this happens is implementation details of `handleOrderSubmit`. These details aren’t actually needed in the name because they are only important inside the function. And there, they can be expressed with inner function names.

**Option for Naming Functions**

Regarding functions, the A/HC/LC pattern helps maneuver between “too short” and “too long” names.
This pattern suggests combining the action, its subject, and its object:

```
prefix? + action (A) + high context (HC) + low context? (LC)
```

### Different Entities with Identical Names

When reading, we mostly rely on the names of classes, functions, and variables to understand the meaning of the code. If the name doesn’t correlate with a variable 1 to 1, we must figure out its meaning on the fly every time. To do this, we must remember a lot of “meta-information” about variables. It makes code harder to read.

In some cases, the same applies to different names for the same variable. For example, it’s better to avoid calling domain entities different names, but more on that later.

To make the code easier to read, it’s better to use different names for _different_ entities:

```js
// Here, `user` is an object with user data:
function isOldEnough(user, minAge) {
  return user.age >= minAge;
}

// And here, `user` is a user name:
function findUser(user, users) {
  return users.find(({ name }) => name === user);
}

// At first glance, it's hard to tell them apart,
// because the identical names force us to think
// that the variables have the same meaning.
// This can be misleading.

// To avoid this, we have to either remember
// the difference between how each variable is used,
// or express the meaning of the variable
// more precisely directly through its name:
function findUser(userName, users) {
  return users.find(({ name }) => name === userName);
}
```

Identical names for different entities are especially dangerous if they’re close. The close location creates a “common context” for the variables, reinforcing the feeling of “sameness.”


### Ubiquitous Language


_Ubiquitous_ language can help us fight naming problems. It is a set of terms that describe the domain, which the whole team uses. “The whole team” includes developers and the product team, designers, product owners, stakeholders, etc.

In practice, ubiquitous language tells us that if "business people" use
the term "Order" to describe orders, we should use this word in our code,
tests, documentation, and verbal communication.

The power of _ubiquitous_ language is unambiguity. If everyone calls a thing by the same name, we’ll lose less in the “translation between business and development.”

When we use terms close to reality, the mental model of a program becomes closer to what it’s modeling. In this case, it’s much easier to spot incorrect program behavior.

### Domain Types




## Module integration

The first and foremost thing we should check when analyzing the interaction of modules during refactoring is the
integration rule:

> ********************
> **Low coupling and high cohesion**
> Зацепление должно быть низким, а связность — высокой
> ********************

Program composed to this rule looks like islands connected by the bridges of public API,messages, events.

![img_2.png](img_2.png)

### Coupling and Cohesion

#### Task decomposition

The `purchase` module is heavily coupled with `cart` module.
It uses internal details of the cart object.
(object structure and `products` field type)

```typescript
// purchase.ts
const makePurchase = async (user, cart) => {
    if (!cart.products.length) {
        throw new Error('Cart is empty')
    }

    const order = createOrder(user, cart);
    await sendOrder();
}
```

The problem in this code is the encapsulation violation.
The `purchase` module _doesn't and shouldn't_ to know how to check is cart empty properly.

The details of checking the cart aren’t part of the “making a purchase” task.
The fact if cart is empty or not important to it, but it doesn't matter how that _fact_ is determined.
Implementing validation is task of `cart` module because it's the one that creates that object and knows how to keep it
valid.

```typescript
// carts.ts

export const isCartEmpty = (cart) => {
    return !cart.products.length
}

// purchase.ts
const makePurchase = async (cart, user) => {
    if (isCartEmpty(cart)) {
        throw new Error('cart is empty')
    }

    const order = createOrder(user, cart);
    await sendOrder();
}

```

Now if internal structure of `cart` module will change for some reason, the changes will be limited to the cart module.

```typescript
// cart.ts
type Cart = {
    // Was 'products' became 'items'
    items: ProductList;
}

export function isEmpty(cart) {
    // The only place that requires updates:
    return !cart.items.length;
}

// purchase.ts
const makePurchase = async (cart, user) => {
    if (isCartEmpty(cart)) {
        throw new Error('cart is empty')
    }
    // Other places in the code stay intact.
    // We've limited the changes propagation.
}
```

Modules that use the `isEmptyCart` function from public API, will remain unchanged.
If modules were to use the cart's internal structure directly, they would all be updated when property change.

#### Search for Cohesion

It's often not clear whether a task belong to a specific module or not.
To determine it, we can look at the data the module or function uses.

The "data" is the _input and output parameters_, and the _dependencies and context_ that module uses.
The more data of one module is different from data of other module, the more likely they relate to different tasks.
If, for example, a function often works with data from neighboring module, it most likely should be a part of that
module.

> ********************
> **We may know this problem as the Feature Envy code smell. **
> ********************
>

Let's imagine refactoring a finance management application that can track user expenses.
Suppose we see code like this in the module responsible for the budget:

```js
// budget.js

// Create a new budget: 

function createBudget(amount, days) {
    const daily = Math.floor(amount / days);
    return {amount, days, daily};
}

// Calculates how much was spent in total:
function totalSpent(history) {
    return history.reduce((tally, record) => tally + record.amount, 0);
}

// Adds a new expense, decreasing the current money amount
// and adding a new spending record in the history:
function addSpending(record, {budget, history}) {
    const newBudget = {...budget, amount: budget.amount - record.amount};
    const newHistory = [...history, record];

    return {
        budget: newBudget,
        history: newHistory,
    };
}
```

The `budget` module responsible for data transformation of the budget.
However, we see functions that don't work only with it:

- The `totalSpent` function doesn't work with budget, but it works with history.
- The `addSpending` function works with the budget, but also works with history.

From the data that these functions work with, we can conclude that they aren't so much about budget.
`totalSpent` more related to history,
while addSpending is more like an “Add Spending” use case functionality.( больше похожа на целый пользовательский
сценарий приложения.)

Let's try to break up the code.

```js
// budget.js
// Here's only the code realted to the budget:

const createBudget = (amount, days) => {
    const daily = Math.floor(amount / days);

    return {amount, days, daily};
}

const decreaseBy = (budget, record) => {
    const updated = budget.amount - recordl.amount;
    return {...budget, amount: updated};
}

// history.ts
// Here's only the code related to the expense history:

const totalSpent = (history) => {
    return history.reduce((tally, record) => tally + record.amount, 0);
}

const appendRecord = (history, record) => {
    return [...history, record];
}

// addSpending.js
// Here's the "Add spending" use case:
// - decrese the budget amount,
// - add the new history record.

const addSpending = (spending, appState) => {
    const budget = decreaseBy(state.budget, spending);
    const history = appendRecord(state.history, soending);

    return {budget, history}
}
```

---

### Contracts

Public api of module can be a contract.
Contracts fixate guarantees of one entity over others.

For example. In the code below we rely on structure of api module.

```typescript
await api.post(api.baseUrl + "/" + api.createUserUrl, {body: user});
await api.post(api.baseUrl + "/posts/" + api.posts.create, post);
```

`Api` module doesn't explicitly promise how it will work.
So when we use it, we need to know how it works.
If we now change `api` module, then we should change it code that uses `api` module.

Instead of it we can declare a contract - a set of guarantees describing how it'll work:

```typescript
type ApiResponse = {
    state: 'OK' | 'ERROR';
}

interface ApiClient {
    createUser(user: User): Promise<ApiResponse>,

    createPost(post: Post): Promise<ApiResponse>,
}
```

Then we would implement this contract inside the api module without extra details

```typescript
const client: ApiClient = {
    createUser: (user) =>
        api.post(api.baseUrl + "/" + api.createUserUrl, {body: user}),

    createPost: (post) =>
        api.post(api.baseUrl + "/posts/" + api.posts.create, post),
};
```

Different modules can fulfill the same "promises".
So if we rely on "promises", it's become easier to change implementation.

```typescript
interface SyncStorage {
    save(value: string): void;
}


function saveToStorage(value: string, storage: SyncStorage) {
    if (value) storage.save(value);
}

const storage = preferences.useCookie ? cookieAdapter : localStorageAdapter;
const saveCurrentTheme = () => saveToStorage(THEME, storage);
```

### Dependencies

We can manage dependencies in different ways, it depends on paradigm and style of the code.
It's usually separate dependencies which produce effects from the rest.

#### Object composition

For example:

```typescript
class BudgetManager {
    constructor(private settings: BudgetSettings, private budget: Budget) {
    }

    // The main problem with code is CQS violation - effects mixed with logic
    // This class at the same time validates the data and updates the budget value...

    checkIncome(record: Record): MoneyAmount | boolean {
        if (record.createdAt > this.budget.endsAt) {
            return false;
        }

        const saving = record.amount * this.settings.piggyBankFraction;
        this.budget.topUp(record.amount - saving);

        return savings;
    }
}

// ...But this isn't visible on the high level of the composition.
// We won't be able to tell there's any effect
// until we look inside BudgetManager code

class AddIncomeCommandHandler {
    constructor(private manager: BudgetManager, private piggyBank: PiggyBank) {
    }

    execute({record}: AddSpendingCommand) {
        const saving = this.manager.checkIncome(record);

        if (!saving) {
            return false;
        }

        this.piggyBank.add(saving);
    }
}
```

In the example above, because of the CQS violation, it's not clear to use how many effects occur when `execute` method
is called.
We can see 2 effects, but there are no guarantees that `this.budget.topUp` doesn't change anything in `budget` object.

The composition of side effects negates the point of abstraction: the more effects there are, the more overall state we
have to keep in mind.
(Компоновка сайд-эффектов сводит на нет суть абстракции: чем больше эффектов, тем больше общего состояния, за которым
надо следить и держать в голове )

f side effect composition can be avoided, it’s better to avoid it.

Instead, we could extract the data transformations and push effects to the edges of the application.

```typescript
// Extract validation into a separate entity
// This class will only handle validation

class AddIncomeValidator {
    constructor(private budget: Budget) {
    }

    // If necessary, the `canAddIncome` method can be made completely pure
    // if we pass the value of `endsAt` as an argument

    canAddIncome(record: Record) {
        return record.createdAt < this.buget.endsAt;
    }
}


// At the top level, we separate logic and effects.
// We strive for the Imperium sandwich we talked about earlier:
// - Impure effects for getting data (for example, work with database on backend)
// - Pure data tranfsormation logic (domain functions, creating entities);
// - Impure efffects for saving data (or displaying it on the screen);

class AddIncomeHandler {
    constructor(
        // The same technique allow us to see the problem with coupling.
        // If the class accumulates too many dependencies
        // we should probably think about improving its design

        private settings: BudgetSettings,
        private validator: AddIncomeValidator,
        private budget: Budget,
        private piggyBank: PiggyBank
    ) {

    }

    execute({record}: AddSpendingCommand) {
        // validation: 
        if (!this.validator.validate(record)) {
            return false;
        }

        // Pure(-ish because if injected settings) logic.
        // It can be extracted into a separate module

        const saving = record.amount * this.settings.piggyBank;
        const income = record.amount - saving;

        // Effects of saving the data 
        this.budget.topUp(income);
        this.piggyBank.add(saving);
    }
}
```

#### Separate data and behaviour
The next step could be to separate data from behavior. The `budget` and `piggyBank` objects would become “data containers”—entities in DDD terms, and data transformation would be handled by “services”:

```typescript
class AddIncomeCommandHandler {
    constructor(
        private settings: BudgetSettings,
        private validator: AddIncomeValidator,
        private budgetRepository: BudgetUpdater,
        private piggyBankRepository: PiggyBankUpdater
    ) {
    }
    
    // The `budget` and `piggyBank` objects now contain no behavior, only data:
    execute({record, budget, piggyBank}: AddSpendingCommand) {
        if(!this.validator.validate(record, budget)) {
            return false
        }
        
        const saving = record.amount * this.settings.piggyBankFraction;
        const income = record.amount - saving;

        // Updated data objects:
        const newBudget = new Budget({ ...budget, income });
        const newPiggyBank = new PiggyBank({ ...piggyBank, saving });

        // “Services” for effects with saving the data:
        this.budgetRepository.update(newBudget);
        this.piggyBankRepository.update(newPiggyBank);
    }
}
```
# Generics, Inheritance, and Composition

## Generic Algorithms
If several functions work by the same scheme, we can extract and formalize this scheme
as set of operations.
he generic algorithm doesn’t refer to specific variables and functions. Instead, it expects them as parameters.

In the code below there are two functions for counting expenses and incomes
throughout the history of records.


```typescript
// The type describrs the history of spending and income in the app
type RecordHistory = List<Entry>;

// The record in the history contains its kind, creation date, and amount:
type EntryKind = "Spend" | "Income";
type Entry = {
    type: EntryKind;
    created: TimeStamp;
    amount: MoneyAmount
}

// calculates how much spent in total
function calculateTotalSpent(history: RecordHistory) {
    return history.reduce(
        (total, {type, amount}) => total + (type === "Spend" ? amount : 0),
        0
    );
}

// Calculates how much is added in total:
function calculateTotalAdded(history: RecordHistory) {
    let total = 0;
    for (const {type, amount} of history) {
        if (type === "Income") total += amount;
    }
    return total;
}
```

Let's say we want to calculate total for a certain period.
When adding it, we should check if the new function has any common features.

Each function do two tasks: filter history and summarize `amount`.
We can extract tasks and generalize them:

```typescript
type HistorySegment = List<Entry>;
type EntryPredicate = (record: Entry) => boolean;

// Filtering now can be uses separetely.
// The `keepOnly` func can filter history of records
// By _any_ criterion that implements the `EntryPredicate` type:

const keepOnly = (history: RecordHistory, criterion: EntryPredicate): HistorySegment => history.filter(criterion);

// Summation can now also be used separately.
// We can pass _any_ fragment of history to the `totalOf` function,
// and it will calculate the amount of spending or income in it:

const totalOf = (history: HistorySegment): MoneyAmount =>
    history.reduce((total, {amount}) => total + amount);
```

Then we can combine the original algorithms from these two functions - this will be an implementation of generalized
algorithm.
All that's different is going to be used as parameters of this generalized algorithm:

```typescript
// Only the filter criteria differ; everything else is the same:
const isIncome: EntryPredicate = ({type}) => type === 'Income';
const isSpend: EntryPredicate = ({type}) => type === 'Spend';
const madeToday: EntryPredicate = ({created}) => created >= today && created < tommorow;

// The filtering criteria is passed as a "parametr" for `keepOnly`:
const added = keepOnly(history, isIncome);
const spent = keepOnly(history, isSpend);

// The sum can then be calculated for any fragment of history:
totalOf(spent);
totalOf(added);
totalOf(keepOnly(spent, madeToday));
```

Generalization can make the code more complicated. If we suspect that the "scheme" may change in the future, it's
probably too early to generalize.

## Generic Types
Similar types can be combined into a generic one, but we should follow the rule

> ********************
> **Generalize only when we’re sure there won’t be any exceptions**
> ********************

Data is harder to change than code.Careless type generalization can weaken typing and force us 
to add unnecessary checks to the code.
For example: 

```typescript
type EntryKind = "Spend" | "Encome";
type Entry = {
    type: EntryKind;
    created: TimeStamp;
    amount: MoneyAmount;
}
```

If we know that only records with these properties can be found in the history, then the type
describes the domain well.But if there’s a possibility that there may be other records in history, then we may have problems with this type.

For example, let’s say the history can show user comments that don’t `contain` amount but contain text:

```typescript
type EntryKind = "Spend" | "Income" | "Comment";
type Entry = {
    type: EntryKind;
    created: Timestamp;
    // The generalization weakens the `amount` field,
    // and with it the entire `Entry` type:
    amount?: MoneyAmount;
    // Here, a new field appears.
    // It "may or may not exists" - 
    // this also weakens the type.
    content?: TextContent;
}
```

There's contradiction in the `Entry` type. Its `amount` and `content` fields are optional,
so the type "allows" entries without amount and text.
But this reflects the domain incorrectly: a comment _must_ contain text, and spending records and incomes _must_ have amounts.
Without this condition, the data in the history of records is invalid.

The problem is that the `Entry` type with optional fields tries to mix _different_ entities and data states.
We can check this by creating a React component, to display the sum of the record from the history on the screen:

```typescript
type RecordProps = {
  record: Entry;
};

// We pass an `Entry` type record to the component,
// to output the amount of spending or income:
const Record = ({ record }: RecordProps) => {
  // But internally, we have to filter this data.
  // If the record is a comment, the render has to be skipped,
  // because comments don't contain amounts:
  if (record.type === "Comment") return null;

  const sign = isIncome(record) ? "+" : "–";

  // And here, we also have to tell the compiler,
  // that `amount` is “definitely there, we checked!”
  return `${sign} ${record.amount!}`;
};
```

To fix the problem, we first need to understand what we know about domain:

- Can there only be comments, or can other text messages appear?
- Can there be new record types that have the `amount` field?
- Can there be new record types that will have completely different fields?

We can't always answer these questions, so maybe it's too early to generalize the types.
In such cases, it's preferable to compose types instead of generalizing

```typescript
// We split the type into several.
// Unnecessary fields are gone,
// data states are separated more clearly,
// and static typing is more helpful this way.
type Spend = { type: "Spend"; created: TimeStamp; amount: MoneyAmount };
type Income = { type: "Income"; created: TimeStamp; amount: MoneyAmount };
type Comment = { type: "Comment"; created: TimeStamp; content: TextContent };
// Yup, we “wrote more code,” but in the early stages of the project,
// it's more important for us to understand the domain
// and grasp the app essence and the relationships between entities.

// Atomic types like the ones above are more flexible,
// because we can compose them by different properties
// that are important to us in a particular situation.

type FinanceEntry = Spend | Income;

type MessageEntry = Comment;

// The most general type `Entry` is represented as a choice of _all_ possible options.
// With these records, we can do only what we can do with _any_ record:
type Entry = FinanceEntry | MessageEntry;

// For example, `Entry` can be sorted by the `created` date,
// since the `created` field is guaranteed for all records:
const sortByDate = (a: Entry, b: Entry) => a.created - b.created;
```

After refactoring, the `Record` component no longer needs extra checks:

```typescript
type RecordProps = {
  record: FinanceEntry;
};

const Record = ({ record }: RecordProps) => {
  const sign = isIncome(record) ? "+" : "–";
  return `${sign} ${record.amount}`;
};
```

The basic idea of composition is not to generalize early.
Type composition is easier to extend as application requirements become more complex.
For example, let's add `Overdraft` and `Warning` types:

```typescript
type Spend = { type: "Spend"; created: TimeStamp; amount: MoneyAmount };
type Income = { type: "Income"; created: TimeStamp; amount: MoneyAmount };
type Overdraft = { type: "Overdraft"; created: TimeStamp; amount: MoneyAmount }; // New.

type Comment = { type: "Comment"; created: TimeStamp; content: TextContent };
type Warning = { type: "Warning"; created: TimeStamp; content: TextContent }; // New.

// In the unions, we only need to add a new variant
// to each place that needs to be expanded:
type FinanceEntry = Spend | Income | Overdraft;
type MessageEntry = Comment | Warning;
type Entry = FinanceEntry | MessageEntry;

// If necessary, we can recompose the types from scratch,
// to compose them by other properties.
```

```typescript
// If we're sure of the type structure now,
// we can generalize the types.

type FinanceEntry = {
  type: "Spend" | "Income" | "Overdraft";
  created: TimeStamp;
  amount: MoneyAmount;
};

type MessageEntry = {
  type: "Comment" | "Warning";
  created: TimeStamp;
  content: TextContent;
};
```

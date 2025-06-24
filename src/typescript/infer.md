
# **Mastering TypeScript's `infer` Keyword: A Deep Dive into Advanced Type Inference**
(для простоты infer R можно думать как "вытяни тип в R")

TypeScript's `infer` keyword is a powerful yet often misunderstood feature that enables **advanced type inference within
conditional types**. It allows developers to extract and manipulate types dynamically, enabling sophisticated typing
techniques that go beyond basic type definitions. In this article, we’ll explore how `infer` works, examine practical
use cases, and provide real-world examples to demonstrate its full potential.

## **Understanding `infer` in TypeScript**

The `infer` keyword is used **within conditional types** to **capture part of a type** and assign it to a type variable,
which can then be referenced later. This is particularly useful when working with **generic types, function return
types, and deeply nested structures**.

### **Basic Syntax of `infer`**

```ts
 type ExtractReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

Here’s what happens step-by-step:

1. We define a **generic type `ExtractReturnType<T>`**.
2. The condition `T extends (...args: any[]) => infer R` checks if `T` is a function type.
3. If `T` matches, the `infer R` syntax captures the return type of the function and assigns it to `R`.
4. The return type of `ExtractReturnType<T>` becomes `R`, otherwise, it resolves to `never`.

### **Example Usage**

```ts
 type ExampleFunction = () => string;
type Result = ExtractReturnType<ExampleFunction>;  // Result = string
```

---  

## **Advanced Use Cases of `infer`**

Now that we understand the basics, let’s explore some advanced scenarios where `infer` can be leveraged for **powerful
type manipulations**.

### **1. Extracting Function Argument Types**

We can use `infer` to extract **the parameters of a function type**:

```ts
 type ExtractArguments<T> = T extends (...args: infer A) => any ? A : never;
```

Example usage:

```ts
 type MyFunction = (name: string, age: number) => boolean;
type Args = ExtractArguments<MyFunction>;  // Args = [string, number]
```

This allows us to dynamically infer the **tuple of parameters** passed to a function.

---  

### **2. Inferring Promises and Unwrapping Async Values**

`infer` is especially useful for working with **Promises**, as it enables automatic extraction of their resolved types.

```ts
 type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
```

Example:

```ts
 type AsyncData = Promise<number>;
type Data = UnwrapPromise<AsyncData>;  // Data = number
```

If `T` is a `Promise`, the `infer` keyword extracts its **resolved type** (`R`), otherwise, it returns `T` as-is.

---  

### **3. Deeply Extracting Array Element Types**

We can use `infer` to extract **nested array types recursively**:

```ts
 type UnwrapArray<T> = T extends (infer U)[] ? U : T;
```

Example:

```ts
 type Numbers = number[];
type ValueType = UnwrapArray<Numbers>;  // ValueType = number
```

This works for **single-level arrays**, but what if we have **deeply nested arrays**? We can make it recursive:

```ts
 type DeepUnwrapArray<T> = T extends (infer U)[] ? DeepUnwrapArray<U> : T;
```

```ts
 type NestedArray = number[][][];
type DeepType = DeepUnwrapArray<NestedArray>;  // DeepType = number
```

Here, `infer` continuously extracts the nested type until the **deepest element type is found**.

---  

### **4. Extracting the First and Last Item from a Tuple**

We can use `infer` to **dynamically extract the first and last elements** of a tuple:

```ts
 type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
```

Example:

```ts
 type Names = ['Alice', 'Bob', 'Charlie'];
type FirstName = First<Names>;  // FirstName = "Alice"
type LastName = Last<Names>;    // LastName = "Charlie"
```

---  

### **5. Inferring Return Types of Methods in Objects**

Another powerful use case of `infer` is extracting the return type of **specific methods within objects**.

```ts
 type MethodReturnType<T, K extends keyof T> = T[K] extends (...args: any[]) => infer R ? R : never;
```

Example:

```ts
 type API = {
    getUser: () => { id: number; name: string };
    getAge: () => number;
};

type User = MethodReturnType<API, "getUser">;  // User = { id: number; name: string }
type Age = MethodReturnType<API, "getAge">;    // Age = number
```

This is particularly useful when working with **API response types**.

---  

## **When Not to Use `infer`**

Although `infer` is powerful, **misusing it can lead to overly complex types**. Some cases where `infer` is **not ideal
**:

- When **explicit type definitions** are more readable and maintainable.
- When TypeScript **cannot resolve a conditional type** due to excessive complexity.
- When it results in **ambiguous types** that could lead to unintended behavior.

For example, instead of using `infer` in simple cases like extracting types from an array, using **TypeScript’s built-in
utility types** like `ReturnType<T>` or `Parameters<T>` may be a better approach.
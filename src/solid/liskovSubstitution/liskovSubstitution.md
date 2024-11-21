### Liskov Substitution Principle (LSP)

The **Liskov Substitution Principle** states:

> "Objects of a superclass should be replaceable with objects of its subclasses without affecting the functionality of the program."

This principle emphasizes that **subtypes must be substitutable for their base types**. In simpler terms, if a program works with an object of a certain type, it should also work when that object is replaced with another object derived from the same base type, without introducing errors or unexpected behavior.





### Core Concepts of LSP

1. **Behavioral Consistency**
   A subclass must follow the behavior contract defined by its superclass. It should not override methods in a way that changes the expected behavior.
2. **No Strengthening of Preconditions**
   A subclass must not impose stricter requirements than its parent class. For example, if the parent class accepts all integers, the subclass should not reject negative integers.
3. **No Weakening of Postconditions**
   A subclass must meet all the guarantees (postconditions) made by the parent class. If the parent promises to return a non-negative value, the subclass cannot return a negative value.
4. **Avoiding Exceptions**
   Subclasses should not introduce new exceptions that are not handled by the parent type.



### Why LSP is Important

Violating LSP can lead to subtle bugs and reduced reusability of code. If a subclass cannot replace its parent without introducing issues, the abstraction breaks, defeating the purpose of inheritance.

## Dependency Inversion

Dependency Inversion Principle states that high-level modules should not depend on low-level modules, but rather on
absctractions. Secondly, absctraction should not depend on details.


### Key Concepts of DIP

1. **Inversion of Control:**
   High-level modules should control the behavior of low-level modules through abstractions, rather than directly depending on their implementations.
2. **Decoupling:**
   By introducing abstractions, you can replace or modify low-level implementations without affecting high-level modules. This improves flexibility and testability.
3. **Dependency Injection (DI):**
   DI is a common pattern to achieve DIP. Dependencies are injected into a class, rather than the class creating or managing its dependencies.

### Key Statements of DIP


| High-Level Module                                       | Low-Level Module                                                        | Abstraction                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------- |
| **Should not depend** on                                | **Should not depend** on                                                | **Both should depend on**       |
| The**business logic** or core part of your application. | Implementation details like specific classes, libraries, or frameworks. | Interfaces or abstract classes. |

---

### DIP in Action: Diagram

Below is a visual flow of how dependencies should be structured:

```text
Without DIP:
High-Level Module --> Low-Level Module (directly depends)

With DIP:
High-Level Module --> Abstraction <-- Low-Level Module
```



### Why DIP Matters

1. **Flexibility:** You can swap implementations without altering high-level logic.
2. **Testability:** Abstracted dependencies can be easily mocked or replaced during testing.
3. **Scalability:** Systems designed with DIP are easier to extend and refactor.


### Common Patterns to Implement DIP

1. **Dependency Injection (DI):**
   Pass dependencies (e.g., services, utilities) as arguments to constructors, functions, or components.
2. **Service Locator:**
   Use a central registry to resolve dependencies, though this pattern can reduce transparency.
3. **Inversion of Control (IoC):**
   Use frameworks like React or dependency injection libraries to manage dependencies automatically.

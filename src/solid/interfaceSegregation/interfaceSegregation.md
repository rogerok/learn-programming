## Interface segregation principle

Interface segregation principle - states that instead of a generalized interfaces for a class, it's better to use separate segregated interfaces with smaller functionalities.

If an interface becomes too large and includes methods not required by all clients, it violates ISP.


### Key Concepts of ISP

* Small, specific interfaces:
  Each interface should focus on a specific functionality. If an interface becomes too complex, it should be split into smaller, more focused interfaces.
* Avoid "fat" interfaces:
  A "fat" interfaces contains methods that are unnecessary for some clients. Clients implementing such an interface are forced to handle irrelevant methods, increasing complexity.
* Flexibility for extension:
  Dividing interfaces makes it easier to add new functionalities without affecting clients that only use a subset of the interface.

### Why ISP matters:

* Improves readability:
  Small interfaces are easier to understand and use
* Simplifies implementation:
  Dividing interfaces reduces the likelihood of erros caused by implementing unused methods.
* Increases flexibility:
  Independent interfaces ensure that changes in one part of the system don't affect unrelated components

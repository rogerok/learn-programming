## Open-closed principle

The open-closed principle states that software entities (classes, modules, functions, and so on) should be open for extension, but closed for modification.


### About

There are a few key concepts behind the Open-Closed Principle that are important to understand:

* You should design your code so that it is easy to extend. This means that you should avoid tightly coupling your components, and instead, use interfaces or abstract classes to define the behavior of your components.
* You should avoid modifying existing code whenever possible. This means that you should aim to encapsulate your components and keep their implementation details hidden from other parts of your code. This makes it easier to change the behavior of your components without affecting other parts of your code.


### How to implement

* One way to achieve the Open-Closed Principle is through the use of **inheritance** and **polymorphism**. By defining **abstract classes** or **interfaces** that define the behavior of your components, you can create a set of classes that implement that behavior in different ways. This allows you to add new functionality by creating new classes that extend the abstract class or implement the interface, without modifying the existing code.
* Another way to achieve the Open-Closed Principle is through the use of **dependency injection**. By designing your code to depend on abstractions rather than concrete implementations, you can easily swap out one implementation for another without affecting the rest of your code.

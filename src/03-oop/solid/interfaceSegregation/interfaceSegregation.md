---
tags: [solid, isp, interface-segregation, typescript]
aliases: [ISP, Принцип разделения интерфейса]
---

# Interface Segregation Principle (ISP)

Interface segregation principle — states that instead of a generalized interface for a class, it's better to use separate segregated interfaces with smaller functionalities.

If an interface becomes too large and includes methods not required by all clients, it violates ISP.

**Сущности не должны зависеть от интерфейсов, которые они не используют.**


### Key Concepts of ISP

* **Small, specific interfaces:**
  Each interface should focus on a specific functionality. If an interface becomes too complex, it should be split into smaller, more focused interfaces.
* **Avoid "fat" interfaces:**
  A "fat" interface contains methods that are unnecessary for some clients. Clients implementing such an interface are forced to handle irrelevant methods, increasing complexity.
* **Flexibility for extension:**
  Dividing interfaces makes it easier to add new functionalities without affecting clients that only use a subset of the interface.

### Why ISP matters:

* **Improves readability:** Small interfaces are easier to understand and use
* **Simplifies implementation:** Dividing interfaces reduces the likelihood of errors caused by implementing unused methods.
* **Increases flexibility:** Independent interfaces ensure that changes in one part of the system don't affect unrelated components.

---

## Практический пример из кода

### Нарушение ISP — «жирный» интерфейс

```typescript
interface PaymentProvider {
    validate: () => boolean;
    getPaymentCommission: () => number;
    processPayment: () => string;
    verifyPayment: () => boolean; // не нужен CreditCard!
}

// CreditCardPaymentProvider вынужден реализовать verifyPayment, хотя API не существует
class CreditCardPaymentProvider implements PaymentProvider {
    validate() { return true }
    getPaymentCommission() { return 10 }
    processPayment() { return 'Payment fingerprint'; }
    verifyPayment() { return false } // пустая заглушка — нарушение ISP
}

// WalletProvider вынужден реализовать validate, хотя API не существует
class WalletProvider implements PaymentProvider {
    validate() { return false } // пустая заглушка
    getPaymentCommission() { return 5; }
    processPayment() { return 'Payment fingerprint'; }
    verifyPayment() { return false; }
}
```

### Соответствие ISP — разделяем интерфейсы

```typescript
// Базовый интерфейс: только общие методы
interface PaymentProvider2 {
    getPaymentCommission: () => number;
    processPayment: () => string;
}

// Дополнительные интерфейсы для специфичного поведения
interface PaymentValidator {
    validate: () => boolean;
}

interface PaymentVerifier {
    verifyPayment: () => boolean;
}

// CreditCard реализует только то, что ему нужно
class CreditCardPaymentProvider2 implements PaymentProvider2, PaymentValidator {
    validate() { return true }
    getPaymentCommission() { return 10 }
    processPayment() { return 'Payment fingerprint'; }
}

// Wallet реализует только базовый интерфейс
class WalletProvider2 implements PaymentProvider2 {
    getPaymentCommission() { return 5; }
    processPayment() { return 'Payment fingerprint'; }
}
```

---

## Пример из solid-book: программисты и пицца

```typescript
// Нарушение — фрилансер вынужден реализовать eatPizza
interface Programmer {
    writeCode(): void;
    eatPizza(slicesCount: number): void;
}

// Решение — разделяем
interface CodeProducer { writeCode(): void; }
interface PizzaConsumer { eatPizza(slicesCount: number): void; }

class RegularProgrammer implements CodeProducer, PizzaConsumer {
  writeCode(): void {}
  eatPizza(slicesCount: number): void {}
}

class Freelancer implements CodeProducer {
  writeCode(): void {}
  // eatPizza не нужен — и не реализован!
}
```

> ISP можно представлять как [[singleResponsibility|SRP]] для интерфейсов.

---

## Ключевые моменты

- Если класс реализует метод заглушкой (`return false` / `throw`) — скорее всего нарушен ISP
- Разбивай «жирные» интерфейсы на роли
- Один класс может `implements` несколько маленьких интерфейсов
- ISP ↔ [[singleResponsibility|SRP]]: ISP — это SRP для интерфейсов

## Связанные темы

- [[singleResponsibility]] — SRP: каждый класс — одна задача
- [[../03-oop/interfaces]] — интерфейсы в TypeScript
- [[../solid-book/isp]] — углублённый разбор ISP из книги

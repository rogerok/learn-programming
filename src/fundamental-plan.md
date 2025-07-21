# Programming Knowledges

# Design Principles and Architecture

## Modular Systems and Architectural Patterns

### 1.1.1 Architectural Patterns

#### DOMAIN DRIVE DESIGN

### Model-View-Controller (MVC)

- **Model**
    - Definition and Responsibilities
    - Implementation in TypeScript: Creating Data Models
- **View**
    - Definition and Responsibilities
    - Implementation in TypeScript: UI Components
- **Controller**
    - Definition and Responsibilities
    - Implementation in TypeScript: Handling User Input

### Model-View-ViewModel (MVVM)

- **Model**
    - Definition and Responsibilities
    - Implementation in TypeScript: Data Structures
- **View**
    - Definition and Responsibilities
    - Implementation in TypeScript: UI Representation
- **ViewModel**
    - Definition and Responsibilities
    - Implementation in TypeScript: Data Binding

### Model-View-Presenter (MVP)

- **Model**
    - Definition and Responsibilities
    - Implementation in TypeScript: Business Logic
- **View**
    - Definition and Responsibilities
    - Implementation in TypeScript: Presentation Logic
- **Presenter**
    - Definition and Responsibilities
    - Implementation in TypeScript: Interaction between Model and View

### 1.1.2 Design Patterns

### Singleton

- Definition and Purpose
- Example Use Cases: Configuration Settings
- Implementation in TypeScript

### Factory Method

- Definition and Purpose
- Example Use Cases: Object Creation with Complex Initialization
- Implementation in TypeScript

### Observer

- Definition and Purpose
- Example Use Cases: Event Handling
- Implementation in TypeScript

### Strategy

- Definition and Purpose
- Example Use Cases: Algorithm Selection
- Implementation in TypeScript

## Layered and Clean Architecture

### 1.2.1 Layered Architecture

### Presentation Layer

- Responsibilities and Design
- User Interface and User Experience
- Implementation in TypeScript

### Business Logic Layer

- Responsibilities and Design
- Business Rules and Logic
- Implementation in TypeScript

### Data Access Layer

- Responsibilities and Design
- Database Access and Data Management
- Implementation in TypeScript

### 1.2.2 Clean Architecture

### Dependency Rule

- Understanding Dependencies
- Implementation in TypeScript
- Dependency Injection (InversifyJS)

### Boundaries and Interfaces

- Defining Boundaries
- Layer Boundaries
- Designing Interfaces for Clean Separation

## Inversion of Control and Dependency Injection

### 1.3.1 Inversion of Control (IoC)

- Concepts and Benefits
- IoC Containers in TypeScript (e.g., InversifyJS)

### 1.3.2 Dependency Injection (DI)

- **Constructor Injection**
    - Definition and Usage
    - Implementation in TypeScript
- **Property Injection**
    - Definition and Usage
    - Implementation in TypeScript
- **Method Injection**
    - Definition and Usage
    - Implementation in TypeScript

## Decomposition and GRASP

### 2.1.1 Information Expert

- Definition and Role
- Example Scenarios
- Applying Information Expert in Design

### 2.1.2 Creator

- Definition and Role
- Object Creation Responsibilities
- Applying Creator in Design

### 2.1.3 Low Coupling

- Reducing Dependencies
- Using Interfaces and DI

### 2.1.4 High Cohesion

- Grouping Related Functions
- Techniques for High Cohesion

## SOLID Principles

### 2.2.1 Single Responsibility Principle (SRP)

- Focusing on a Single Responsibility
- Refactoring for SRP

### 2.2.2 Open/Closed Principle (OCP)

- Designing for Extensibility
- Implementing OCP in TypeScript

### 2.2.3 Liskov Substitution Principle (LSP)

- Ensuring Substitutability
- Refactoring for LSP

### 2.2.4 Interface Segregation Principle (ISP)

- Creating Specific Interfaces
- Implementing ISP in TypeScript

### 2.2.5 Dependency Inversion Principle (DIP)

- Decoupling High-Level and Low-Level Modules
- Implementing DIP in TypeScript

## Contract Programming and Modeling

### 3.1.1 Contract Programming Basics

- Preconditions, Postconditions, and Invariants in TypeScript
- Implementing Runtime and Static Contracts in TypeScript

### 3.2.1 Data Modeling

- Defining Data Schemas and Interfaces in TypeScript

### 3.2.2 API Modeling

- Designing REST APIs
- Documenting APIs with OpenAPI

## Isolation and Separation of Concerns (SoC)

### 4.1.1 Using Interfaces and Abstractions

- Defining Interfaces in TypeScript
- Implementing Facades and Adapters

### 4.1.2 Modularization

- Structuring TypeScript Modules
- Managing Dependencies in Modules

## Coupling and Cohesion

### 5.1.1 Reducing Coupling

- Decoupling Techniques
- Implementing DI to Reduce Coupling

### 5.2.1 Enhancing Cohesion

- Refactoring for High Cohesion
- Designing Cohesive Modules

## Agnostic Approaches

### 6.1.1 Platform-Agnostic Design

- Designing Cross-Platform Components in TypeScript

### 6.2.1 Framework-Agnostic Design

- Defining Component Interfaces
- Implementing Design Patterns for Agnosticism

### 6.3.1 Protocol-Agnostic Design

- Designing Protocol-Agnostic APIs
- Examples and Techniques in TypeScript

## Multi-Paradigm Programming

### 7.1.1 Functional Programming in TypeScript

- Implementing Pure Functions, Immutability, Higher-Order Functions
- Libraries and Tools: Ramda, fp-ts

### 7.2.1 Object-Oriented Programming (OOP) in TypeScript

- Implementing Encapsulation, Polymorphism, and Inheritance
  **Encapsulation**
- Data Hiding
    - Object State Isolation
    - Access Modifiers

**Polymorphism**

- Behavior Substitution
    - Dynamic Dispatch
    - Virtual Methods

### 8  Domain-Driven Design (DDD)

- Fundamentals of DDD
- Tactical Patterns
- Strategic Patterns

# Books to read

- Domain Driven Design Quickly
- Domain-Driven Design Distilled — Vaughn Vernon
- Code complete
- Грокаем алгоритмы
  Погружение в Рефакторинг (Александр Швец)

---

1. Grokking Simplicity — Eric Normand
   🔍 Что даёт: научит думать как программист, особенно про «данные против поведения», side effects и чистые функции.
   🧠 Особенно важны 1, 2 часть — Actions, Calculations, Data; «Modeling the Domain»

   Напиши класс QueryParamsManager, не зная фреймворков. Сделай его SRP, независимым от window. Спроектируй как
   npm-библиотеку.

2. Designing Data-Intensive Applications — Martin Kleppmann
   📅 День 4–6
   🔍 Что даёт: фундамент в обработке данных, flow, состояние, консистентность. Даже если ты на фронте — этот бэкграунд
   перенесётся на работу со сторами, API, кэшами и т.п.
   🎯 Главы:
   Chapter 1: Reliable, Scalable, Maintainable
   Chapter 2: Data Models and Query Languages
   Chapter 5: Replication (мозг ломает — в хорошем смысле)
   Задания:
   Проанализируй: AgentModel, AgentQueryModel, AgentRouterOutput
   Где DTO? Где domain? Где адаптер?

3. Глава из “Mostly Adequate Guide to FP” — про функции как трансформеры данных
   Задание: Реализуй URLBuilder — чистая функция + опциональный OOP-обёртка.
4. Модульные границы и DTO
   ✍️ Задание: Проанализируй свою AgentModel, AgentQueryModel, AgentRouterOutput — где DTO? где domain?
   📘 Прочти: “Bounded Context” в DDD Lite
5. Стратегии обработки query params
   ✍️ Задание: Напиши стратегию сериализации/десериализации params (как бы ты сделал SearchParamsHandler, но для общего
   случая). Без MobX, без SSR.
   📘 Почитать: “Functional Core, Imperative Shell”

   💬 Осознай: SearchParamsHandler — это shell, но вся логика должна быть core.
6. Универсальные модели: где класс, где тип?
   ✍️ Задание: Напиши AgentFormModel, который умеет превращаться в AgentDTO и обратно. Сравни это с Zod и
   Class-validator.

   📘 Почитать: Effective TypeScript, глава “Types vs Interfaces”, The Little TypeScript Book (Type-Level Programming)

7. День 7: SSR, Hydration, и клиентские guarded-объекты
   ✍️ Задание: Перепиши SearchParamsHandler так, чтобы его инициализация была безопасна: createQueryHandler({ safe:
   true }).

   📘 Почитать: твоя же проблема с window — это классика: “Don't use window on
   SSR”, https://stephencook.dev/blog/using-window-in-react-ssr/
8. Твоя библиотека MobX+Form
   ✍️ Задание: Сделай FormModel<T> с MobX и класс-валидацией. Оберни его в useFormAdapter.

   📘 Почитать: MobX-State-Tree intro (иногда идеи MST хороши даже без самого MST)

   💬 Как обеспечить: 1) изоляцию формы, 2) перезапуск по reset, 3) кастомный isValid.
9. Архитектура Stores как Application State
   ✍️ Задание: Спроектируй: как бы выглядел твой rootStore, если бы проект был на 50 экранов?

   📘 Почитать: Extract from Clean Architecture про use case-ориентированную структуру
10. Side Effects в архитектуре
    ✍️ Задание: Напиши свою реализацию RequestStore и EffectStore, с флагами status, error, refetch().

    📘 Почитать: “Status Management” by Mark Erikson
11. Error Architecture
    ✍️ Задание: Построй свою архитектуру ошибок с классами AppError, ForbiddenError, ValidationError, и UI-мостом.
    📘 Почитать: глава из Refactoring UI или NeverThrow, Patterns: Long Parameter List, Feature Envy, Primitive
    Obsession.
12. Growing Object-Oriented Software, Guided by Tests (GOOS)
    📅 День 11–12
    🔍 Что даёт: учит проектировать классы через поведение. Особенно полезно, если тебе сложно продумать поведение
    SearchParamsHandler, MobX-сторов, их связи.
    📎 Делает сильный фокус на разбиении ответственности.
13. Domain-Driven Design Distilled — Vaughn Vernon
    🔍 Что даёт: чистое DDD без перегруза. Очень важно, если хочешь самовыражаться через архитектуру. Показывает, как из
    требований делать код, а не наоборот.
14. You Don't Know JS (YDKJS) — Scope & Closures
    Что даёт: если есть где-то страх, что "JS базу не добил" — это ответ.

15. Книга:
    Domain-Driven Design Distilled — Vaughn Vernon
    Прочитать всю, очень короткая
    Refactoring.guru → Code Smells
    Patterns: Primitive Obsession, Feature Envy, Data Clumps
    Что делать:
    Раздели DTO / QueryModel / DomainModel

    Устрой ревизию всех моделей (AgentModel, FormModel и т.д.)
16. Архитектура и UI
    Книга:
    Refactoring UI — читать выборочно:
    Visual hierarchy
    Alignment
    Reducing cognitive load

    Clean Architecture (Robert C. Martin) — Extract
    Прочитать:
    Chapter “The Interactor” и “Entities vs Use Cases”
    Что делать:
    Продумай RootStore для большого проекта

    Напиши usePaginatedList() — адаптер вокруг PaginatedStore<T>

# 💻 Back to Base — Программа укрепления инженерного ядра

Программа нацелена на формирование архитектурного мышления, глубокой проработки слоёв (core/domain/infrastructure),
понимания SRP, модели состояния и чистого кода.

---

## 1. Grokking Simplicity — Eric Normand

🔍 **Что даёт:** мышление в терминах «чистых функций», side effects, разделения данных и поведения.

🧠 **Особо важные главы:** Part 1 и 2 — *Actions, Calculations, Data*, «Modeling the Domain».

📌 **Задание:**

- Напиши `QueryParamsManager` без фреймворков.
- Принципы: SRP, no window, независим, тестируем, можно сделать npm-библиотекой.

---

## 2. Designing Data-Intensive Applications — Martin Kleppmann

📅 **День 4–6**  
🔍 **Что даёт:** архитектура данных, консистентность, потоки, распределение. Применимо даже во фронте: сторы, API, кеши.

📘 **Обязательно прочитать:**

- Chapter 1: Reliable, Scalable, Maintainable
- Chapter 2: Data Models and Query Languages
- Chapter 5: Replication (mind-blowing)

📌 **Задание:**

- Проанализируй `AgentModel`, `AgentQueryModel`, `AgentRouterOutput`.
- Определи: что DTO, что domain, что адаптер? Где слой преобразования?

---

## 3. Mostly Adequate Guide to FP (функции как трансформеры)

📌 **Задание:**

- Реализуй `URLBuilder` — как чистую функцию.
- Затем — обёртку-объект (optional OOP adapter, SRP).

---

## 4. Модульные границы и DTO

📌 **Задание:**

- Ревизия: `AgentModel`, `AgentQueryModel`, `AgentRouterOutput`.
- Определи чётко границы: DTO / Domain / Adapter.
- Обрати внимание на *“Bounded Context”* из DDD Lite.

---

## 5. Стратегии обработки query params

📌 **Задание:**

- Напиши `SearchParamsStrategy` — сериализация/десериализация query params.
- No MobX, No SSR.
- Выдели shell/core: логика должна быть в core.

📘 Почитать:

- “Functional Core, Imperative Shell”

---

## 6. Универсальные модели: класс vs тип

📌 **Задание:**

- Напиши `AgentFormModel`, умеющий превращаться в `AgentDTO` и обратно.
- Сравни с использованием Zod и class-validator.

📘 Почитать:

- Effective TypeScript → Types vs Interfaces
- The Little TypeScript Book → Type-Level Programming

---

## 7. SSR, Hydration и guarded-объекты

📌 **Задание:**

- Перепиши `SearchParamsHandler` для SSR: `createQueryHandler({ safe: true })`.
- Продумай инициализацию без window (или отложенную инициализацию).

📘 Почитать:

- https://stephencook.dev/blog/using-window-in-react-ssr/

---

## 8. Твоя библиотека MobX + Form

📌 **Задание:**

- Построй `FormModel<T>` с MobX и class-validator.
- Сделай `useFormAdapter()`.

📘 Почитать:

- MobX-State-Tree intro (не обязательно юзать MST — идеи полезны)

💬 Важно обеспечить:

- Изоляцию формы
- Перезапуск/reset
- Кастомный `isValid`

---

## 9. Архитектура Stores как Application State

📌 **Задание:**

- Опиши структуру `rootStore` для проекта на 50+ экранов.
- Учти: lazy-loading, scoped stores, SSR.

📘 Почитать:

- Clean Architecture → use case-ориентированная структура

---

## 10. Side Effects в архитектуре

📌 **Задание:**

- Реализуй `RequestStore` и `EffectStore`.
- Флаги: `status`, `error`, `refetch()`.

📘 Почитать:

- Status Management — Mark Erikson

---

## 11. Архитектура ошибок

📌 **Задание:**

- Построй: `AppError`, `ForbiddenError`, `ValidationError`.
- Свяжи с UI-ошибками (`ErrorMessage`, `ErrorBoundary`, `ErrorToast`).

📘 Почитать:

- NeverThrow
- Refactoring UI (глава про error UI)
- Patterns: Long Parameter List, Feature Envy, Primitive Obsession

---

## 12. Growing Object-Oriented Software, Guided by Tests (GOOS)

📅 **День 11–12**

🔍 **Что даёт:** классика проектирования через поведение. Отличный подход к MobX/Store/Handler слоям.

📎 Показывает:

- Как разделять ответственность
- Как писать тестируемые классы без моков
- Как мыслить действиями (behavior) и не состоянием (state)

---

## 13. Domain-Driven Design Distilled — Vaughn Vernon

🔍 **Что даёт:** быстрое, практичное введение в DDD. Преобразование требований в код. Без overengineering.

📌 Обязательно к прочтению — коротко, ёмко.

---

## 14. You Don’t Know JS — Scope & Closures

🔍 **Что даёт:** закрепление фундаментальной базы по JS. Особенно полезно, если осталась тревога "а точно я понимаю
замыкания?".

---

## 15. Ревизия моделей и code smells

📘 Почитать:

- Domain-Driven Design Distilled — полностью
- Refactoring.guru → Code Smells:
    - Primitive Obsession
    - Feature Envy
    - Data Clumps

📌 Что сделать:

- Ревизия всех моделей: `AgentModel`, `FormModel`, `QueryModel`, `DTO`.
- Чёткое разделение DTO / Query / Domain.

---

## 16. Архитектура и UI

📘 Прочитать:

- Refactoring UI (выборочно):
    - Visual hierarchy
    - Alignment
    - Reducing cognitive load

- Clean Architecture — Robert C. Martin:
    - Chapter: The Interactor
    - Entities vs Use Cases

📌 Задания:

- Продумай `RootStore` с выделением use-cases
- Напиши `usePaginatedList()` — адаптер над `PaginatedStore<T>`

---

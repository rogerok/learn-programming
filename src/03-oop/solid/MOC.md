---
tags: [solid, moc, index]
aliases: [SOLID]
---

# SOLID — Map of Content

5 принципов объектно-ориентированного проектирования.

## Как читать

Каждый принцип представлен в двух уровнях:
1. **Основы** — определение, мотивация, практические примеры на TypeScript/React
2. **Углублённо** — связанные паттерны проектирования (Facade, Proxy, Factory, Decorator, Adapter и др.)

> [!tip] Рекомендуемый порядок
> Сначала прочитай основной файл принципа, затем — углублённый разбор из solid-book.

## SRP — Single Responsibility

- [[singleResponsibility/singleResponsibility|Основы: определение, примеры (Student, ReportExporter)]]
- [[solid-book/srp|Углублённо: Extract Class, Facade, Proxy]]

## OCP — Open-Closed

- [[openClosed/openClosed|Основы: Weapon, React Notification, фильтрация списков]]
- [[solid-book/ocp|Углублённо: Abstract Factory, Strategy, Decorator, ограничения]]

## LSP — Liskov Substitution

- [[liskovSubstitution/liskovSubstitution|Основы: Rectangle/Square, Bird/Penguin, пред/постусловия]]
- [[solid-book/lsp|Углублённо: контрактное программирование, User/Guest иерархия]]

## ISP — Interface Segregation

- [[interfaceSegregation/interfaceSegregation|Основы: PaymentProvider, Programmer/Freelancer]]
- [[solid-book/isp|Углублённо: Adapter, TypeScript mixins, реальные примеры]]

## DIP — Dependency Inversion

- [[dependencyInversion/dependencyInversion|Основы: MusicAPI, Logger, Database, React Logger (4 примера)]]

## Связанные темы

- [[../MOC|OOP]] — ООП: концепции и паттерны
- [[../../04-architecture/MOC|Architecture]]

---
tags: [tips, architecture, ddd, clean-architecture]
---

# Чистая архитектура + DDD в контексте TypeScript

🗂 1. Domain Layer — мозг приложения
📍 Что хранит:

* Entities (User, Order, Product)
* Value Objects (Email, PhoneNumber)
* Domain Services
* Domain Events
* Domain Errors / Rules

📍 Что делает:

* Чистая бизнес-логика
* Никаких зависимостей на инфраструктуру

*Пример*

```typescript
// domain/user/User.ts
export class User {
    constructor(
        private readonly name: string,
        private readonly email: string,
        private readonly age: number
    ) {
    }

    getEmail(): string {
        return this.email;
    }

    isAdult(): boolean {
        return this.age >= 18;
    }
}
```

🛠 2. Application Layer — дирижёр оркестра
📍 Что хранит:

* Use cases (SendEmailToUser)
* Application Services
* DTO'шки (иногда)
* Контракты интерфейсов

📍 Что делает:

* Координирует работу domain-объектов
* Знает про domain, но не про инфраструктуру
* Взаимодействует через интерфейсы, не реализации
*

📦 Пример:

```typescript
// application/email/SendEmailToUser.ts
import {IUserData} from "./IUserData";
import {IEmailService} from "./IEmailService";

export class SendEmailToUser {
    constructor(private readonly emailService: IEmailService) {
    }

    execute(user: IUserData): void {
        if (user.getAge() < 18) return;

        this.emailService.send(user.getEmail(), `Привет, ${user.getName()}!`);
    }
}
```

🌉 3. Interface Layer — всё, что говорит наружу
📍 Что хранит:

* Controllers (например, HTTP или CLI)
* GraphQL Resolvers
* Serializers/Deserializers

📍 Что делает:

* Получает запросы, дергает use-cases, форматирует ответ
* Преобразует внешние данные в понятные application слою

```typescript
// interface/controllers/SendEmailController.ts
import {SendEmailToUser} from "../../application/email/SendEmailToUser";
import {User} from "../../domain/user/User";

export class SendEmailController {
    constructor(private readonly useCase: SendEmailToUser) {
    }

    handleRequest(req: any): void {
        const user = new User(req.name, req.email, req.age);
        this.useCase.execute(user); // User реализует IUserData
    }
}
```

🧱 4. Infrastructure Layer — все зависимости от внешнего мира
📍 Что хранит:

* Реализации интерфейсов (IEmailService)
* Работа с базой, сетью, файлами
* Фреймворки (Express, NestJS, Prisma, Mongoose, nodemailer, etc)

📍 Что делает:

* Реализует контракты из application layer
* Подключается к миру

📦 Пример:

```typescript
// infrastructure/services/EmailService.ts
import {IEmailService} from "../../application/email/IEmailService";

export class NodeMailerEmailService implements IEmailService {
    send(email: string, content: string): void {
        console.log(`Sent email to ${email}: ${content}`);
        // тут реально nodemailer
    }
}
```

src /
├── domain /
│ └── user /
│ └── User.ts
│
├── application /
│ └── email /
│ ├── IEmailService.ts
│ ├── IUserData.ts
│ └── SendEmailToUser.ts
│
├── interface

/
│ └── controllers /
│ └── SendEmailController.ts
│
├── infrastructure /
│ └── services /
│ └── EmailService.ts
│
└── main.ts < --точка
входа, wiring
зависимостей

**DTO — Data Transfer Object:**

* Простая структура, пришла из API
* Проверена Zod-схемой
* Может быть "грязной" (тип string вместо number, флаги вместо enum и т.д.)

**Entity — Доменный объект:**

* Богатое поведение (isAdult, getFullName, applyDiscount)

* Может содержать вложенные value objects (Email, PhoneNumber)

* Используется внутри компонентов, сторах, логике

**→ Мы не хотим, чтобы доменная логика жила на "сыром JSON".**

**Пример двусторонней трансформации**

```typescript
// schemas/UserDTO.ts
import {z} from "zod";

export const UserDTO = z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number()
});

export type UserDTOType = z.infer<typeof UserDTO>;

```

```typescript
// domain/User.ts
import {UserDTOType} from "../schemas/UserDTO";

export class User {
    constructor(
        private name: string,
        private email: string,
        private age: number
    ) {
    }

    isAdult(): boolean {
        return this.age >= 18;
    }

    getEmailDomain(): string {
        return this.email.split("@")[1];
    }

    static fromDTO(dto: UserDTOType): User {
        return new User(dto.name, dto.email, dto.age);
    }

    toDTO(): UserDTOType {
        return {
            name: this.name,
            email: this.email,
            age: this.age
        };
    }
}

```

**Применение**

```typescript
const raw = await fetch("/api/user").then(res => res.json());
const parsed = UserDTO.safeParse(raw);

if (!parsed.success) throw parsed.error;

const user = User.fromDTO(parsed.data);

if (user.isAdult()) {
    showBannerForAdults();
}

const dataToSend = user.toDTO();

```

#### Как уменьшить боль и дублирование?

* Использовать генерацию классов из схем - но только в DTO-моделях, не в домене.

```typescript
type UserDTOType = z.infer<typeof UserDTO>;
```

Далее писать генераторы

```typescript
function mapToUser(dto: UserDTOType): User {
    return new User(dto.name, dto.email, dto.age);
}
```

Оставь Zod в слое API/DTO. Не тащи его в домен. Тогда твой домен не зависит от схем.

Если структура сложная — используй отдельный маппер-файл

```typescript
// mappers/userMapper.ts
import {UserDTOType} from "../schemas/UserDTO";
import {User} from "../domain/User";

export function mapUserFromDTO(dto: UserDTOType): User {
    return new User(dto.name, dto.email, dto.age);
}

export function mapUserToDTO(user: User): UserDTOType {
    return {
        name: user.name,
        email: user.email,
        age: user.age
    };
}
```

`
[raw API data] → Zod → DTO → fromDTO → Entity (class) → UI/Store/Logic
`

`
Entity → toDTO → DTO → API request
`
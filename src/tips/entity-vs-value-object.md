# Разница между Entity и Value Object

Entity - это "живой объект с идентичностью".
*Пример*: `User`, `Todo`, `Post`.

* У каждого есть свой уникальный ID
* Может изменяться
* Имеет поведение: методы, мутации, жизненный цикл.

Пример `Entity`

```typescript
class Todo {
    id: string;
    title: string;
    completed: boolean;

    constructor(dto: { id: string; title: string; completed: boolean }) {
        makeAutoObservable(this);
        this.id = dto.id;
        this.title = dto.title;
        this.completed = dto.completed;
    }

    toggle() {
        this.completed = !this.completed;
    }

    rename(newTitle: string) {
        this.title = newTitle;
    }
}
```

**Value Object** — это "одноразовая капсула значения"
Пример: `Money`, `DateRange`, `Coordinates`.

* Нет ID — их сравнивают по содержимому
* Иммутабельные: чтобы "изменить", создаётся новый экземпляр
* Используются внутри других объектов, как значения

Мы не мутируем `this.amount`, а возвращаем новый `Money`.

```typescript
class Money {
    constructor(public amount: number, public currency: string) {
    }

    add(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error("Currency mismatch");
        }
        return new Money(this.amount + other.amount, this.currency);
    }
}
```

---

**Value Object** = иммутабельные, не нуждаются в MobX

**Entity** = реактивные, изменяемые, живут в MobX

---

**Рекомендации**

* Экшены, связанные с конкретным объектом (`todo.toggle()`, `user.rename())` — храни в модели `(Entity)`

* Экшены, координирующие несколько сущностей `(todoStore.completeAll())` — выноси в store

* `Value Object` не должны мутироваться. Хочешь новое значение — создай новый объект

* Если модель — `Entity`, и ты хочешь реактивности → используй `MobX` + экшены в классе

* Если это `Value Object` → обычный класс без `MobX`, без мутаций

---

### Пример

src/
├── domain/
│ ├── Money.ts # Value Object
│ └── User.ts # Entity
├── store/
│ └── UserStore.ts # MobX-реактивный стор
└── ui/
└── UserView.tsx # React-компонент

`domain/Money.ts` — `Value Object` (иммутабельный)

```typescript
export class Money {
    readonly amount: number;
    readonly currency: string;

    constructor(amount: number, currency: string) {
        if (amount < 0) throw new Error("Amount cannot be negative");
        this.amount = amount;
        this.currency = currency;
    }

    add(other: Money): Money {
        this.assertSameCurrency(other);
        return new Money(this.amount + other.amount, this.currency);
    }

    subtract(other: Money): Money {
        this.assertSameCurrency(other);
        return new Money(this.amount - other.amount, this.currency);
    }

    format(): string {
        return `${this.amount.toFixed(2)} ${this.currency}`;
    }

    private assertSameCurrency(other: Money): void {
        if (this.currency !== other.currency) {
            throw new Error("Currency mismatch");
        }
    }
}

```

`domain/User.ts` — `Entity` (реактивный с `MobX`)

```typescript
import {makeAutoObservable} from "mobx";
import {Money} from "./Money";

export class User {
    name: string;
    balance: Money;

    constructor(name: string, balance: Money) {
        this.name = name;
        this.balance = balance;
        makeAutoObservable(this, {}, {autoBind: true});
    }

    rename(newName: string) {
        if (!newName) throw new Error("Name cannot be empty");
        this.name = newName;
    }

    deposit(amount: Money) {
        this.balance = this.balance.add(amount);
    }

    withdraw(amount: Money) {
        this.balance = this.balance.subtract(amount);
    }

    get isRich(): boolean {
        return this.balance.amount > 1000;
    }
}

```

Это `Entity`: у него есть поведение (`rename`, `deposit`, `withdraw`) и **`MobX-реактивность`**.

`store/UserStore.ts` — стор, хранящий экземпляр `User`

```typescript
import {makeAutoObservable} from "mobx";
import {User} from "../domain/User";
import {Money} from "../domain/Money";

export class UserStore {
    user: User | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    loadUser() {
        // допустим, данные с API
        const dto = {name: "name", balance: {amount: 500, currency: "USD"}};
        this.user = new User(dto.name, new Money(dto.balance.amount, dto.balance.currency));
    }
}
```

`ui/UserView.tsx` — UI-компонент

```tsx
import {observer} from "mobx-react-lite";
import {useEffect} from "react";
import {UserStore} from "../store/UserStore";
import {Money} from "../domain/Money";

const store = new UserStore();

export const UserView = observer(() => {
    useEffect(() => {
        store.loadUser();
    }, []);

    const user = store.user;
    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h1>{user.name}</h1>
            <p>Balance: {user.balance.format()}</p>
            <p>Status: {user.isRich ? "💸 Rich" : "😐 Poor"}</p>

            <button onClick={() => user.rename("Name")}>Сменить имя</button>
            <button onClick={() => user.deposit(new Money(100, "USD"))}>+100$</button>
            <button onClick={() => user.withdraw(new Money(50, "USD"))}>-50$</button>
        </div>
    );
});

```

Ещё пример
`Product.ts — Entity`

```typescript
export class Product {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly price: number
    ) {
    }
}

```

`CartItem.ts — Entity`

```typescript
import {makeAutoObservable} from "mobx";
import {Product} from "./Product";

export class CartItem {
    product: Product;
    quantity: number;

    constructor(product: Product, quantity = 1) {
        makeAutoObservable(this);
        this.product = product;
        this.quantity = quantity;
    }

    increment() {
        this.quantity += 1;
    }

    decrement() {
        this.quantity = Math.max(this.quantity - 1, 1);
    }

    get total(): number {
        return this.product.price * this.quantity;
    }
}
```

`Basket.ts — Value Object`

```typescript
import {CartItem} from "./CartItem";

export class Basket {
    readonly items: CartItem[];

    constructor(items: CartItem[]) {
        this.items = items;
    }

    get total(): number {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }

    get isEmpty(): boolean {
        return this.items.length === 0;
    }
}

```

```typescript
import {Product} from "./Product";
import {Money} from "./Money";

export class Transaction {
    readonly id: string;
    readonly product: Product;
    readonly quantity: number;
    readonly total: Money;
    readonly timestamp: Date;

    constructor(id: string, product: Product, quantity: number, total: Money) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
        this.total = total;
        this.timestamp = new Date();
    }
}
```

`Transaction.ts — Entity`

```typescript
import {Product} from "./Product";
import {Money} from "./Money";

export class Transaction {
    readonly id: string;
    readonly product: Product;
    readonly quantity: number;
    readonly total: Money;
    readonly timestamp: Date;

    constructor(id: string, product: Product, quantity: number, total: Money) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
        this.total = total;
        this.timestamp = new Date();
    }
}

```

`PurchaseService.ts — бизнес-логика`

```typescript
import {User} from "./User";
import {CartItem} from "./CartItem";
import {Money} from "./Money";
import {Transaction} from "./Transaction";

export class PurchaseService {
    static buy(user: User, item: CartItem): Transaction {
        const cost = new Money(item.total, "USD");

        if (user.balance.amount < cost.amount) {
            throw new Error("Not enough money, подруга");
        }

        user.withdraw(cost);

        return new Transaction(
            crypto.randomUUID(),
            item.product,
            item.quantity,
            cost
        );
    }
}

```

`TransactionHistory.ts`

```typescript
import {makeAutoObservable} from "mobx";
import {Transaction} from "./Transaction";

export class TransactionHistory {
    history: Transaction[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    add(tx: Transaction) {
        this.history.push(tx);
    }

    get totalSpent(): number {
        return this.history.reduce((sum, tx) => sum + tx.total.amount, 0);
    }
}

```

Как будет выглядеть use-case:

```typescript
const tx = PurchaseService.buy(user, cartItem);
transactionHistory.add(tx);
```
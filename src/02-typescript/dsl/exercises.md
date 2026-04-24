---
tags: [typescript, dsl, fluent-builder, exercises]
---

# Упражнения: Fluent Builder DSL

> [!info] Context
> Практические задания к главе [[fluent-builder-dsl|Fluent Builder DSL]]. Упражнения выстроены от простого к сложному: от базового `return this` до type-safe builder'а с phantom types.
>
> Для каждого задания приведён желаемый call site — реализация пишется так, чтобы этот код компилировался и работал.

---

## Упражнение 1: CSS Class Builder

**Сложность:** начальная

**Задача:** Реализовать `ClassList` — builder для формирования строки CSS-классов. Поддерживает добавление классов, условное добавление и удаление.

### Желаемый синтаксис

```typescript
const classes = new ClassList()
  .add("btn")
  .add("btn-primary")
  .addIf(isLarge, "btn-lg")         // добавляет класс только если условие true
  .addIf(isDisabled, "btn-disabled")
  .remove("btn-primary")             // убирает ранее добавленный класс
  .build();                           // → "btn btn-lg" (если isLarge=true, isDisabled=false)
```

### Требования

- `.add(className)` — добавляет класс, возвращает `this`
- `.addIf(condition, className)` — добавляет класс только если `condition === true`
- `.remove(className)` — удаляет класс из списка
- `.build()` — возвращает строку с классами через пробел
- Дублирование классов не допускается: `.add("btn").add("btn")` → `"btn"`

### Тест-кейсы

```typescript
// Базовое использование
new ClassList().add("a").add("b").build() === "a b";

// Условное добавление
new ClassList().add("btn").addIf(false, "hidden").build() === "btn";

// Удаление
new ClassList().add("a").add("b").remove("a").build() === "b";

// Дедупликация
new ClassList().add("x").add("x").build() === "x";

// Пустой builder
new ClassList().build() === "";
```

---

## Упражнение 2: Email Builder

**Сложность:** базовая

**Задача:** Реализовать Fluent Builder для создания email-сообщений. Builder должен проверять обязательные поля при вызове `.build()`.

### Желаемый синтаксис

```typescript
const email = new EmailBuilder()
  .from("noreply@example.com")
  .to("alice@example.com")
  .to("bob@example.com")           // несколько получателей
  .cc("manager@example.com")
  .subject("Отчёт за неделю")
  .body("Текст письма...")
  .attachment("report.pdf")
  .priority("high")
  .build();

// email.recipients → ["alice@example.com", "bob@example.com"]
// email.cc → ["manager@example.com"]
// email.priority → "high"
```

### Требования

- `.from(address)` — обязательное поле
- `.to(address)` — обязательное, можно вызывать несколько раз (накапливает получателей)
- `.cc(address)` — необязательное, можно вызывать несколько раз
- `.subject(text)` — обязательное
- `.body(text)` — обязательное
- `.attachment(filename)` — необязательное, можно несколько
- `.priority("low" | "normal" | "high")` — необязательное, по умолчанию `"normal"`
- `.build()` — возвращает объект `Email`. Бросает ошибку, если обязательные поля не заданы

### Интерфейс результата

```typescript
interface Email {
  from: string;
  recipients: string[];
  cc: string[];
  subject: string;
  body: string;
  attachments: string[];
  priority: "low" | "normal" | "high";
}
```

---

## Упражнение 3: Form Validator DSL

**Сложность:** средняя

**Задача:** Построить мини-DSL для валидации форм в стиле Zod. Каждое поле конфигурируется цепочкой правил. Функция `validateForm()` проверяет объект данных по схеме.

### Желаемый синтаксис

```typescript
const loginSchema = {
  username: v.string().required().minLength(3).maxLength(20),
  password: v.string().required().minLength(8).matches(/[A-Z]/, "must contain uppercase"),
  age:      v.number().min(18).max(120),
  email:    v.string().required().email(),
};

const result = validateForm(loginSchema, {
  username: "ab",
  password: "weak",
  age: 15,
  email: "not-an-email",
});

// result → {
//   ok: false,
//   errors: {
//     username: ["must be at least 3 chars"],
//     password: ["must be at least 8 chars", "must contain uppercase"],
//     age: ["must be at least 18"],
//     email: ["invalid email format"],
//   }
// }
```

### Требования

- `v.string()` возвращает `StringValidator` с методами: `.required()`, `.minLength(n)`, `.maxLength(n)`, `.matches(regex, message?)`, `.email()`
- `v.number()` возвращает `NumberValidator` с методами: `.required()`, `.min(n)`, `.max(n)`, `.int()`
- Каждый метод возвращает `this`
- `validateForm(schema, data)` возвращает `{ ok: boolean; errors: Record<string, string[]> }`
- Поле без `.required()`, если отсутствует в данных, не генерирует ошибку
- `.email()` — это `.matches()` с предустановленным regex

### Подсказка

- Внутри каждого Validator храните массив правил: `{ check: (v) => boolean, message: string }[]`
- Метод `.validate(value)` прогоняет все правила и собирает ошибки

---

## Упражнение 4: Immutable Query Builder

**Сложность:** средняя

**Задача:** Переписать `QueryBuilder` из главы как immutable builder. Каждый метод должен возвращать новый экземпляр, а не мутировать текущий.

### Желаемый синтаксис

```typescript
const base = QueryBuilder.create()
  .from("orders")
  .select("id", "total", "status");

// Ветвление — base не мутируется
const pending = base.where("status", "=", "pending").build();
const completed = base.where("status", "=", "completed").orderBy("total", "desc").build();
const all = base.limit(100).build();

// pending  → SELECT id, total, status FROM orders WHERE status = 'pending'
// completed → SELECT id, total, status FROM orders WHERE status = 'completed' ORDER BY total DESC
// all      → SELECT id, total, status FROM orders LIMIT 100
```

### Требования

- Конструктор приватный, создание через `QueryBuilder.create()`
- Каждый метод (`from`, `select`, `where`, `orderBy`, `limit`, `offset`) возвращает **новый** экземпляр
- `base` после вызова `.where()` остаётся без условий
- Все поля внутри builder'а — `readonly`

### Тест-кейсы

```typescript
const base = QueryBuilder.create().from("users");
const q1 = base.where("a", "=", 1).build();
const q2 = base.where("b", "=", 2).build();

// q1 содержит WHERE a = 1, но НЕ содержит WHERE b = 2
// q2 содержит WHERE b = 2, но НЕ содержит WHERE a = 1
// base.build() не содержит WHERE вообще
```

---

## Упражнение 5: Type-Safe Builder с Phantom Types

**Сложность:** продвинутая

**Задача:** Создать `ConnectionBuilder`, который на уровне типов запрещает вызов `.connect()` до тех пор, пока не заданы обязательные параметры (`host` и `port`).

### Желаемый синтаксис

```typescript
// Компилируется — оба обязательных поля заданы
const conn = new ConnectionBuilder()
  .host("localhost")
  .port(5432)
  .database("mydb")        // опционально
  .ssl(true)                // опционально
  .connect();               // ← доступен, потому что host и port заданы

// НЕ компилируется — port не задан
const bad = new ConnectionBuilder()
  .host("localhost")
  .connect();               // ← ошибка типов: 'connect' does not exist on type...

// НЕ компилируется — ничего не задано
new ConnectionBuilder().connect();  // ← ошибка типов
```

### Требования

- Использовать phantom types (intersection types) для отслеживания состояния
- `.host(h)` — переводит тип в состояние `HasHost`
- `.port(p)` — переводит тип в состояние `HasPort`
- `.database(name)` и `.ssl(enabled)` — не влияют на тип состояния
- `.connect()` — доступен только когда тип содержит `HasHost & HasPort`
- `.connect()` возвращает объект `ConnectionConfig`

### Подсказка

```typescript
type HasHost = { readonly _host: true };
type HasPort = { readonly _port: true };
type Ready = HasHost & HasPort;

class ConnectionBuilder<State = {}> {
  // Методы возвращают ConnectionBuilder<State & HasXxx>
  // .connect() принимает this: ConnectionBuilder<Ready>
}
```

### Интерфейс результата

```typescript
interface ConnectionConfig {
  host: string;
  port: number;
  database?: string;
  ssl: boolean;
}
```

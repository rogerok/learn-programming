---
tags: [typescript, dsl, fluent-builder, exercises]
---

# Упражнения: Fluent Builder DSL

Практика к [[fluent-builder-dsl|главе о Fluent Builder DSL]] идёт по последовательности **predict → explain → modify → implement → diagnose → transfer**. Перед началом пройдите canonical fundamentals: [[../basics/code-basic/generics|generics]], [[../basics/code-basic/variability|variance]] и [[../basics/code-basic/readonly-array|readonly]].

Для compile-time контрактов используйте `tsc --strict --noEmit`; намеренно запрещённые вызовы помечайте `@ts-expect-error`. Runtime-проверки должны завершаться без исключений. В решениях не используйте `any` для обхода контракта.

## 1. Predict: identity и mutation в цепочке

**Результат:** до запуска предсказать identity объектов и строки, построенные двумя ветками mutable builder.

**Предпосылки:** разделы «ядро механизма: `return this`» и «Mutable vs Immutable» в [[fluent-builder-dsl|главе]].

```ts
class Parts {
  private readonly values: string[] = [];

  add(value: string): this {
    this.values.push(value);
    return this;
  }

  build(): string {
    return this.values.join("/");
  }
}

const base = new Parts().add("api");
const users = base.add("users");
const posts = base.add("posts");
```

До запуска запишите значения для `base === users`, `users === posts`, `base.build()`, `users.build()` и `posts.build()`.

**Наблюдаемая приёмка:** прогноз зафиксирован до запуска; пять фактических результатов записаны рядом; каждое несовпадение объяснено через aliasing и mutation одного экземпляра.

**Проверка:** выполните пять `console.assert` с вашими ожидаемыми значениями. Если прогноз неверен, сначала зафиксируйте расхождение, затем исправьте assertion.

> [!hint]- Подсказка 1
> Метод возвращает `this`, а не новый `Parts`.

> [!hint]- Подсказка 2
> Все три переменные могут указывать на один массив `values`.

**Рефлексия:** когда identity одного объекта полезна для fluent API, а когда она делает ветвление опасным?

## 2. Explain: `this` против имени базового класса

**Результат:** объяснить наблюдаемую разницу между return type `BaseBuilder` и polymorphic `this` при наследовании.

**Предпосылки:** задание 1, раздел «Почему `this`, а не имя класса» в [[fluent-builder-dsl|главе]].

Создайте две минимальные пары базового и производного builder. В первой паре chain-метод базового класса явно возвращает имя базового класса, во второй — `this`. В производном классе добавьте уникальный chain-метод.

**Наблюдаемая приёмка:**

- в первой паре вызов уникального метода после базового chain-метода отклоняется и отмечен `@ts-expect-error`;
- во второй тот же порядок вызовов компилируется;
- объяснение связывает разницу со статическим типом результата, а не с runtime-наличием метода;
- `tsc --strict --noEmit` завершается с кодом `0`.

**Ручной checkpoint:** проверьте обратный порядок вызовов и объясните, почему он может скрыть проблему плохого return type.

> [!hint]- Подсказка 1
> В runtime оба метода могут вернуть тот же объект; отличается обещание сигнатуры.

> [!hint]- Подсказка 2
> Polymorphic `this` означает тип конкретного наследника в текущем вызове.

**Рефлексия:** какой публичный контракт базового класса сохраняет расширяемость цепочки?

## 3. Modify: CSS Class Builder

**Результат:** дополнить простой mutable builder условной операцией, удалением и дедупликацией без разрыва цепочки.

**Предпосылки:** задания 1–2.

Начните с класса, у которого уже есть `.add(className)` и `.build()`. Добавьте `.addIf(condition, className)` и `.remove(className)`; все промежуточные операции должны поддерживать chaining.

Желаемый call site:

```ts
const classes = new ClassList()
  .add("btn")
  .add("btn-primary")
  .addIf(isLarge, "btn-lg")
  .addIf(isDisabled, "btn-disabled")
  .remove("btn-primary")
  .build();
```

**Наблюдаемая приёмка:**

- `.add("a").add("b").build()` возвращает `"a b"`;
- `.add("btn").addIf(false, "hidden").build()` возвращает `"btn"`;
- `.add("a").add("b").remove("a").build()` возвращает `"b"`;
- `.add("x").add("x").build()` возвращает `"x"`;
- пустой builder возвращает пустую строку;
- `tsc --strict --noEmit` и runtime assertions проходят.

**Проверка:** соберите перечисленные случаи в таблицу и прогоните циклом через `console.assert`.

> [!hint]- Подсказка 1
> Выберите внутреннюю коллекцию, которая естественно обеспечивает уникальность.

> [!hint]- Подсказка 2
> `addIf` может делегировать работу уже существующему `add`, когда условие истинно.

**Рефлексия:** какие инварианты хранит внутренняя коллекция и какие методы отвечают за их сохранение?

## 4. Implement: Email Builder с runtime-инвариантами

**Результат:** реализовать fluent API, накапливающий повторяемые поля и проверяющий обязательные данные на terminal operation.

**Предпосылки:** задание 3, разделы «terminal operations» и «runtime validation» в [[fluent-builder-dsl|главе]].

Контракт результата:

```ts
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

Реализуйте chain-методы `.from`, `.to`, `.cc`, `.subject`, `.body`, `.attachment`, `.priority` и terminal operation `.build()`.

**Наблюдаемая приёмка:**

- `from`, минимум один `to`, `subject` и `body` обязательны; отсутствие каждого по отдельности приводит к runtime-ошибке из `.build()`;
- повторные `to`, `cc` и `attachment` сохраняют все значения в порядке добавления;
- priority по умолчанию равен `"normal"`, допустимы только три литерала;
- результат соответствует `Email`, `tsc --strict --noEmit` проходит;
- входные массивы результата нельзя использовать для непреднамеренной мутации будущих результатов builder.

**Проверка:** выполните один happy path и четыре negative paths, проверив `throw` вручную или существующим test runner.

> [!hint]- Подсказка 1
> Отделите фазу накопления необязательного состояния от проверки в `.build()`.

> [!hint]- Подсказка 2
> Не возвращайте наружу внутренние mutable arrays по ссылке.

**Рефлексия:** какие гарантии здесь существуют только в runtime и что потребуется, чтобы перенести обязательные шаги в тип состояния?

## 5. Implement: Form Validator DSL

**Результат:** собрать небольшой Schema DSL, где chain-методы накапливают правила, а terminal operation возвращает наблюдаемый список ошибок.

**Предпосылки:** задания 3–4, раздел «Schema DSL» в [[fluent-builder-dsl|главе]].

Нужный vocabulary:

- `v.string()`: `.required()`, `.minLength(n)`, `.maxLength(n)`, `.matches(regex, message?)`, `.email()`;
- `v.number()`: `.required()`, `.min(n)`, `.max(n)`, `.int()`;
- `validateForm(schema, data)`: `{ ok: boolean; errors: Record<string, string[]> }`.

Пример схемы:

```ts
const loginSchema = {
  username: v.string().required().minLength(3).maxLength(20),
  password: v.string().required().minLength(8).matches(/[A-Z]/, "must contain uppercase"),
  age: v.number().min(18).max(120),
  email: v.string().required().email(),
};
```

**Наблюдаемая приёмка:**

- отсутствующее optional-поле не создаёт ошибку, отсутствующее required-поле создаёт;
- одно поле может вернуть несколько нарушений в порядке объявления правил;
- string-правило не принимает number и наоборот без runtime-исключения;
- `.email()` переиспользует общий механизм правила, не копируя весь pipeline;
- `tsc --strict --noEmit` проходит, runtime-таблица включает happy path и минимум по одному failure на каждый вид правила.

**Проверка:** сравнивайте массивы сообщений и `ok`, а не внутреннее устройство validators.

> [!hint]- Подсказка 1
> Храните правила как данные: предикат и сообщение, а не как отдельные режимы terminal operation.

> [!hint]- Подсказка 2
> Общий generic-базовый тип может описать `.validate(value)`, но vocabulary string и number остаётся разным.

**Рефлексия:** где находится граница между типом схемы и runtime-проверкой внешних данных?

## 6. Diagnose: ветвление Query Builder

**Результат:** воспроизвести протекание состояния между ветками mutable builder и исправить его через immutable state transitions.

**Предпосылки:** задания 1 и 3, [[../basics/code-basic/readonly-array|readonly]].

Используйте Query Builder из главы и создайте ветки:

```ts
const base = QueryBuilder.create()
  .from("orders")
  .select("id", "total", "status");

const pending = base.where("status", "=", "pending").build();
const completed = base.where("status", "=", "completed").orderBy("total", "desc").build();
const all = base.limit(100).build();
```

Сначала зафиксируйте фактическое протекание условий, затем измените builder так, чтобы каждый промежуточный метод возвращал новый экземпляр.

**Наблюдаемая приёмка:**

- в исходном варианте тест показывает хотя бы одно условие из чужой ветки;
- после исправления `pending` содержит только pending-условие, `completed` — только completed-условие, `all` — ни одного `WHERE`;
- повторный `.build()` для `base` стабилен;
- внутренние поля объявлены `readonly`, но проверка не полагается только на это слово: aliasing коллекций между экземплярами отсутствует;
- compile-time и runtime checks проходят.

**Проверка:** создайте две ветки из одного `base` в обоих порядках; результат каждой не должен зависеть от порядка вычисления.

> [!hint]- Подсказка 1
> `readonly` запрещает переприсвоить поле, но не делает вложенный array автоматически immutable.

> [!hint]- Подсказка 2
> При создании нового экземпляра копируйте только изменяемую часть состояния и не отдавайте mutable ссылку соседней ветке.

**Рефлексия:** почему порядок вычисления был скрытой зависимостью и какой инвариант сделал ветви независимыми?

## 7. Transfer: Type-Safe Builder с type-state

**Результат:** перенести generics и intersections в API, где `.connect()` недоступен до обязательных шагов.

**Предпосылки:** задания 2, 4 и 6; [[../basics/code-basic/generics|generics]], [[../basics/code-basic/intersections-types|intersection types]].

Создайте `ConnectionBuilder<State>` с шагами `.host(h)`, `.port(p)`, optional `.database(name)`, `.ssl(enabled)` и terminal operation `.connect()`. Состояние должно существовать только для компилятора; runtime config хранится отдельно.

Проверочные call sites:

```ts
new ConnectionBuilder()
  .host("localhost")
  .port(5432)
  .database("mydb")
  .ssl(true)
  .connect();

// @ts-expect-error — port не задан
new ConnectionBuilder().host("localhost").connect();

// @ts-expect-error — обязательные шаги не выполнены
new ConnectionBuilder().connect();
```

**Наблюдаемая приёмка:**

- `.host` и `.port` работают в любом порядке и расширяют type-state;
- optional-методы сохраняют текущий type-state;
- два запрещённых вызова действительно дают ошибки без `@ts-expect-error`;
- разрешённый вызов возвращает `{ host: string; port: number; database?: string; ssl: boolean }`;
- phantom markers не появляются в runtime-объекте;
- `tsc --strict --noEmit` и happy-path runtime check проходят без `any` и публичных assertions.

**Проверка:** временно удалите каждый `@ts-expect-error`; ошибка должна возникнуть на `.connect()`. Затем поменяйте порядок обязательных шагов в happy path.

> [!hint]- Подсказка 1
> Отдельные marker-типы могут представлять `HasHost` и `HasPort`, а следующий шаг возвращает пересечение текущего состояния с marker.

> [!hint]- Подсказка 2
> Ограничение `this` у terminal operation может выразить требование к готовому состоянию без изменения runtime-сигнатуры вызова.

> [!hint]- Подсказка 3
> Phantom state не обязан быть реальным полем объекта; важна его роль в generic-инстанцировании builder.

**Рефлексия:** какие ошибки перенесены из runtime в compile time и какую сложность этот контракт добавляет пользователю API?

## Навигация

- [[fluent-builder-dsl|Вернуться к главе]]
- [[../basics/exercises|Практика fundamentals]]
- [[../MOC|Маршрут TypeScript]]

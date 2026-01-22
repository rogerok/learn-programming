# [Open–Closed Principle](https://solidbook.vercel.app/ocp)

**Принцип открытости-закрытости** - согласно ему модули должны быть открыты для расширения, но закрыты для модификации.

Модули надо проектировать так, чтобы их требовалось менять как можно реже, а расширять функциональность можно было с помощью создания новых сущностей и композиции их со старыми.

Модуль удовлетворяет ОСР если:

- открыт для расширения - его функциональность может быть дополнена с помощью другого модуля
- закрыт для изменений - изменения в нем не нарушат работу модулей, которые его используют

**В коде**

Например, плохо спроектированный сервис мог бы выглядеть так

```ts
class SmsSender {
  sendSms(message: MessageText) {
    /* ... */
  }
}

class PushSender {
  sendPush(message: MessageText) {
    /* ... */
  }
}

class EmailSender {
  sendEmail(message: MessageText) {
    /* ... */
  }
}

class Notifier {
  constructor(private api: SmsSender | PushSender | EmailSender) {}

  notify(): void {
    const message = "Some user notification";

    if (this.api instanceof SmsSender) {
      this.api.sendSms(message);
    } else if (this.api instanceof PushSender) {
      this.api.sendPush(message);
    } else if (this.api instanceof EmailSender) {
      this.api.sendEmail(message);
    }
  }
}
```

Проблема в том, что при добавлении нового типа стороннего API, нам придется менять уже существующий код

**Вместо этого**

ОСР же предлагает не проверять конкретные типы, а использовать абстракцию, которая позволит не менять код класса Notifier.
Для этого мы создадим интерфейс `Sender`

```ts
interface Sender {
  sendMessage(message: MessageText): void;
}

class SmsSender implements Sender {
  sendMessage(message: MessageText) {
    /* ... */
  }
}

class PushSender implements Sender {
  sendMessage(message: MessageText) {
    /* То, что раньше было внутри метода `sendPush`. */
  }
}

class EmailSender implements Sender {
  sendMessage(message: MessageText) {
    /* То, что раньше было внутри метода `sendEmail`. */
  }
}

class Notifier {
  constructor(private api: Sender) {}

  notify(): void {
    const message = "Some user notification";
    this.api.sendMessage(message);
  }
}
```

В результате, при добавлении нового типа API, нам не нужном менять код `Notifier`.

## В идеально мире

Ключ к пониманию ОСР - применение абстракций в местах стыка модулей.

Основной индикатор проблемы с принципом открытости-закрытости — появление проверки на instanceof. Если внутри кода модуля проверяется реализация, значит модуль жёстко привязан к другому, и изменения в требованиях заставят менять код этого модуля.

Допустим есть класс прямоугольника `Rectangle`

```ts
class Rectangle {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
```

И есть класс `AreaCalculator`, который должен считать площадь фигур.
Но как его реализовать, чтобы его можно было безболезненно использовать с любым типом фигур?

Создадим интерфейс `AreaCalculatable`

```ts
interface AreaCalculatable {
  areaOf(): number;
}
```

Теперь классы фигур могут подчиняться новому ограничению и реализовывать интерфейс

```ts
class Rectangle implements AreaCalculatable {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  areaOf(): number {
    return this.width * this.height;
  }
}

class Circle implements AreaCalculatable {
  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  areaOf(): number {
    return Math.PI * this.radius ** 2;
  }
}
```

Теперь, когда у классов есть ограничения и правила, мы можем применить абстракцию, чтобы привязать их к `AreaCalculator`:

```ts
class AreaCalculator {
  shapes: AreaCalculatable[] = [];

  constructor(shapes: AreaCalculatable[]) {
    this.shapes = shapes;
  }

  totalAreaOf(): number {
    return this.shapes.reduce((acc, item) => {
      return acc + item.areaOf();
    }, 0);
  }
}
```

## Шаблоны проектирования и приёмы рефакторинга

Соблюдать принцип открытости-закрытости помогают несколько шаблонов проектирования и приёмов рефакторинга.

**Фабрика** - сущность, которая создает другие сущности по заданным правилам, например, создает экземпляры классов или объекты.

**Абстрактная фабрика** - фабрика, которая создаёт фабрики.

Рассмотрим применение абстрактной на том же примере с отчётом из раздела SRP

```ts
interface FormatterFactory {
  createFormatter(data: ReportData): Formatter;
}

// Метод `createFormatter` возвращает абстрактный интерфейс,
// поэтому обе фабрики ниже взаимозаменяемы:

class HtmlFormatterFactory implements FormatterFactory {
  createFormatter(data: ReportData) {
    return new HtmlFormatter(data);
  }
}

class TxtFormatterFactory implements FormatterFactory {
  createFormatter(data: ReportData) {
    return new TxtFormatter(data);
  }
}

// При конфигурации приложение выберет нужный
// тип фабрики и будет работать с ним.
// Коду приложения при этом будет не важно,
// с какой фабрикой он будет работать,
// потому что он будет зависеть от интерфейсов,
// а не от конкретных классов:

class AppConfigurator {
  reportType: ReportTypes;

  constructor(reportType: ReportType) {
    this.reportType = reportType;
  }

  configure(reportData: ReportData): FormatterFactory {
    if (this.reportType === ReportTypes.Html) {
      return new HtmlFormatterFactory(reportData);
    } else {
      return new TxtFormatterFactory(reportData);
    }
  }
}
```

### Стратегия

В примере выше мы избавились от необходимости менять код форматтеров при добавлении новых требований, но в методе `configure` класса `AppConfigurator`
есть условие, которое проверяет тип формата для отчёта.

По-хорошему, подобные условия надо заменять на динамический выбор нужных сущностей.
С этим может помочь шаблон стратегия.

```ts
function formatterStrategy(reportType: ReportTypes) {
  const formatters = {
    [ReportTypes.Html]: HtmlFormatterFactory,
    [ReportTypes.Txt]: TxtFormatterFactory,
    default: TxtFormatterFactory,
  };

  return formatters[reportType] || formatters.default;
}
```

Теперь выбор фабрик стал динамическим, и при изменении требований нам потребуется только добавить новую сущность и обновить список фабрик.

### Декоратор

Декоратор - шаблон, который заключается в создании обёрток с дополнительной функциональностью для объектов.

Отличие декоратора от наследования в возможности расширять функциональность динамически, без необходимости описывать каждый класс-наследник отдельно.

```ts
interface Greeting {
  username: string;

  greet(): string;
}

// Базовая функциональность описывается в классе, который будет обернут с помощью декораторов:

class BaseGreeting implements Greeting {
  username: string;

  constructor(username: string) {
    this.username = username;
  }

  greet(): string {
    return `Hello ${this.username}`;
  }
}

// Здесь `decorated` — это объект,
// функциональность которого мы будем расширять:

interface GreetingDecorator {
  decorated: Greeting;

  greet(): string;
}

class GreetingWithUpperCase implements GreetingDecorator {
  decorated: Greeting;

  constructor(decorated: Greeting) {
    this.decorated = decorated;
  }

  greet(): string {
    //   1. Используем базовое поведение

    const baseGreeting = this.decorated.greet();

    // 2.Расширяем его
    return baseGreeting.toUpperCase();
  }
}
```

Сама философия этого шаблона повторяет принцип открытости-закрытости — мы не меняем базовый класс, а добавляем сущности, которые содержат в себе изменения бизнес-требований.

Разница между декоратором и прокси в том, что прокси предоставляет тот же интерфейс, а декоратор может предоставлять расширенный интерфейс

## Ограничения и подводные камни

- Система не может быть закрыта на 100%
- Большое количество сущностей
- Может быть не нужен для маленьких приложений

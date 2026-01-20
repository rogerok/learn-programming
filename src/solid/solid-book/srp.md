# [Single responsibility principle](https://solidbook.vercel.app/srp)

## Принцип единой ответственности

Означает, что у модуля (часть кода обособленная от других) есть только одна причина для изменения, весь код который меняется по этой причине должен бысть собран в этом модуле.

Основной инструмент принципа - объеденять те части кода, которые меняются по одной причине, и разделять те, которые меняются по разным.

## В идеальном мире

В идеальном мире каждый класс решает одну и только одну задачу. В этом случае модели доплняют друг друга, а их совокупность описывает систему.

Допустим, у нас есть задача создать отчёт об активности пользователей и вывести его в нескольких вариантах: как строку HTML или TXT.

### Отчёт

```ts
type ReportData = {
  content: string;
  date: Date;
  size: number;
};

/*Возможные форматы*/

enum ReportTypes {
  Html,
  Txt,
}

// Класс, который занимается экспортом данных

class ReportExporter {
  name: string;
  data: ReportData;

  constructor(name: string, data: ReportData) {
    this.name = name;
    this.data = data;
  }

  export(reportType: ReportType) {
    const formatter: Formatter = FormatSelector.selectFor(reportType);
    return formatter.format(this.data);
  }
}
```

### Форматы экспорта

В соответствии SRP форматирование данных - это отдельная задача. Поэтому создадим отдельные классы

```ts
interface Formatter {
  format(data: ReportData): string;
}

class HtmlFormatter implements Formatter {
  format(data: ReportData): string {
    return `html string`;
  }
}

class TxtFormatter implements Formatter {
  format(data: ReportData) {
    return "txt string";
  }
}
```

Выбор формата не входит задачу форматировання или их подготовку.

Для решения этой задачи воспользуемся паттерном "Стратегия", который поможет выбрать подходящий формат.

```ts
class FormatSelector {
  private static formatters = {
    [ReportTypes.Html]: HtmlFormatter,
    [ReportTypes.Txt]: TxtFormatter,
  };

  static selectFor(reportType: ReportTypes) {
    const FormatterFactory = FormatSelector.formatters[type];

    return new FormatterFactory();
  }
}

const dynamicForammter = FormatSelector.selectFor(ReportTypes.Html);
```

## Шаблоны проектирования и приёмы рефакторинга

### Выделение класса

Выделение класса - прием, когда из одного класса с множеством слабо связанных методов и полей, создают несколько классов.

Смысл в том, чтобы явно выделить назначение класса, и в идеале чтобы этот класс описывался одной фразой или словом.

```ts
// До

class Person {
  name: string;
  phone: string;
  officeCode: string;

  constructor(name: string, phone: string, officeCode: string) {
    this.name = name;
    this.phone = phone;
    this.officeCode = officeCode;
  }

  phoneNumberOf(): string {
    return `${this.phone} доб. ${this.officeCode}`;
  }
}

// После

interface IPhoneNumber {
  phone: string;
  officeCode: string;
  valueOf: string;
}

class PhoneNumber implements IPhoneNumber {
  phone: string;
  officeCode: string;

  constructor(phone: string, officeCode: string) {
    this.phone = phone;
    this.officeCode = officeCode;
  }

  valueOf(): string {
    return `${this.phone} доб. ${this.officeCode}`;
  }
}

class Person {
  name: string;
  phoneNumber: IPhoneNumber;

  constructor(name: string, phoneNumber: IPhoneNumber) {
    this.name = name;
    this.phoneNumber = phoneNumber;
  }

  phoneNumberOf(): string {
    return this.phoneNumber.valueOf();
  }
}
```

### Фасад

Фасад - шаблон проектирования, при котором сложная логика скрывается за вызвовом более простого API.
Фасад обеспечивает простое общение со сложной частью системы, беря ответственность за настройку и вызов специфических методов конкретных объектов на себя.

```ts
class Square extends Figure {
  length: number;

  constructor(length: number) {
    super();
    this.length = length;
  }

  areaOf(): number {
    return this.length * 2;
  }
}

class Circle extends Figure {
  radius: number;

  constructor() {
    super();
    this.radius = radius;
  }

  areaOf(): number {
    return Math.PI * this.radius ** 2;
  }
}

class ShapeFacade {
  square: Square;
  circle: Circle;

  constructor(square: Square, circle: Circle) {
    this.square = square;
    this.circle = circle;
  }

  areaOf(figure: string) {
    switch (figure) {
      case "square":
        return this.square.areaOf();
      case "circle":
        return this.circle.areaOf();

      default:
        return 0;
    }
  }
}
```

### Прокси

Прокси - шаблон проектирования, при котором общение с каким-то объектом контролирует другой объект-заместитель(прокси).
Он позволяет расширять функциональность существующих классов, не меняя их.

```ts
class RequestClient {
  async request(url: string): Promise<any> {
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      return data;
    } catch (e) {
      return nul;
    }
  }
}

class LoggedRequest {
  client: RequestClient;

  async request(url: string): Promise<any> {
    console.log("started request");

    return await this.client.request(url);
  }
}
```

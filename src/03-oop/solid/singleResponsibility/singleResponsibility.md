---
tags: [solid, srp, single-responsibility, typescript]
aliases: [SRP, Принцип единой ответственности]
---

# Single Responsibility Principle (SRP)

According to single-responsibility principle, a class should be responsible for only one activity and only have one cause to change. This rule also includes modules and functions.

Основной инструмент принципа — объединять те части кода, которые меняются по одной причине, и разделять те, которые меняются по разным.

---

## Практический пример из кода

### Нарушение SRP

```typescript
// Один класс делает всё: создаёт аккаунт, считает оценки, генерирует данные
class Student {
    public createStudentAccount() {
        console.log(`Create Student Account`);
    }

    public calculateStudentGrade() {
        console.log(`Calculate Student Grade`);
    }

    public generateStudentData() {
        console.log(`Generate Student Data`);
    }
}
```

Проблема: если изменится логика расчёта оценок — придётся трогать класс, который отвечает за создание аккаунта.

### Соответствие SRP

```typescript
// Каждый класс отвечает за одну задачу
class StudentAccount {
    public createStudentAccount() {
        console.log(`Create Student Account`);
    }
}

class StudentGrade {
    public calculateStudentGrade() {
        console.log(`Calculate Student Grade`);
    }
}

class StudentData {
    public generateStudentData() {
        console.log(`Generate Student Data`);
    }
}
```

Теперь изменение в логике оценок затронет только `StudentGrade`.

---

## Пример из solid-book: экспорт отчётов

```typescript
type ReportData = { content: string; date: Date; size: number; };
enum ReportTypes { Html, Txt }

// Экспортёр — только координирует
class ReportExporter {
  name: string;
  data: ReportData;

  constructor(name: string, data: ReportData) {
    this.name = name;
    this.data = data;
  }

  export(reportType: ReportTypes) {
    const formatter = FormatSelector.selectFor(reportType);
    return formatter.format(this.data);
  }
}

// Форматирование — отдельная задача
interface Formatter {
  format(data: ReportData): string;
}

class HtmlFormatter implements Formatter {
  format(data: ReportData): string { return `html string`; }
}

class TxtFormatter implements Formatter {
  format(data: ReportData) { return "txt string"; }
}

// Выбор формата — отдельная задача (паттерн Стратегия)
class FormatSelector {
  private static formatters = {
    [ReportTypes.Html]: HtmlFormatter,
    [ReportTypes.Txt]: TxtFormatter,
  };

  static selectFor(reportType: ReportTypes) {
    const FormatterFactory = FormatSelector.formatters[reportType];
    return new FormatterFactory();
  }
}
```

---

## Ключевые моменты

- Один класс = одна причина для изменения
- Если описать класс одной фразой сложно — скорее всего нарушен SRP
- Разбивай «fat»-классы на специализированные
- SRP для интерфейсов = [[interfaceSegregation|ISP]]

## Связанные темы

- [[interfaceSegregation]] — ISP: разделение интерфейсов
- [[openClosed]] — OCP: расширение без модификации
- [[../solid-book/srp]] — углублённый разбор SRP из книги
- [[../03-oop/composition]] — разбивка на небольшие компоненты

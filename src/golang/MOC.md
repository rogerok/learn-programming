---
tags: [golang, moc, index]
aliases: [Go, Golang]
---

# Go — Map of Content

## Цель

Научиться читать и писать небольшие запускаемые программы Go с функциями и `switch`: до запуска предсказывать stdout, объяснять named и explicit returns, диагностировать нежелательный `fallthrough` и проверять поведение командой `go run`.

## Пререквизиты

- Переменные, целые числа, строки и булева логика.
- Базовое понимание вызова функции и ветвления.
- Установленный Go toolchain для практики; проверить можно командой `go version`.

## Канонический маршрут

1. [[functions|Функции в Go]] — named return values, zero values, naked и explicit returns.  
   **Проверка:** без запуска предскажите возвращаемые значения короткой функции, затем подтвердите их через `fmt.Println`.
2. [[switch|Switch в Go]] — выбор ветки, неявный `break` и явный `fallthrough`.  
   **Проверка:** для трёх входов отметьте выполненные `case`; после запуска stdout должен совпасть с предсказанием строка в строку.
3. [[practice|Практика: функции и switch]] — соединение обоих понятий в запускаемом поведении.  
   **Проверка:** `go run` завершается с кодом `0`, а каждый заявленный граничный случай имеет наблюдаемую строку в stdout.

## Практика

- [[practice|Предсказание, диагностика и перенос поведения Go]].

## Справочные материалы

- [[functions|Named return values и explicit returns]]
- [[switch|Неявный break и fallthrough]]

## Связанные темы

- [[../07-craftsmanship/MOC|Мастерство программирования]]
- [[../06-algorithms/MOC|Algorithms]]

## Трек источников

### Начальный курс

- [Хороший курс по Go от ВК — Stepik](https://stepik.org/course/187490/syllabus)
- [Backend developer roadmap — oh-my-backend](https://github.com/bzick/oh-my-backend)

### REST API и структура

- [Учимся разрабатывать REST API на Go: сокращатель ссылок](https://habr.com/ru/companies/selectel/articles/747738/)
- [REST API with Go, Chi, MySQL and sqlx](https://dev.to/kashifsoofi/rest-api-with-go-chi-mysql-and-sqlx-39fa)
- [Еще один вариант структуры Go-приложения](https://habr.com/ru/articles/911248/)
- [Best Practices for Designing a Pragmatic RESTful API](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)

### Базы данных

- [Как работать с Postgres в Go: практики, особенности, нюансы](https://habr.com/ru/companies/oleg-bunin/articles/461935/)
- [Go database/sql tutorial](http://go-database-sql.org/)
- [Курс «PostgreSQL для начинающих»: #2 — Простые SELECT](https://habr.com/ru/companies/tensor/articles/780276/)

Эти источники — отдельные курсовые треки. Они не заменяют канонический маршрут по существующим заметкам `functions` и `switch`.

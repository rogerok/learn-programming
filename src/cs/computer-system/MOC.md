---
tags: [cs, csapp, moc, index]
aliases: [CS:APP, Computer Systems]
---

# CS:APP — Map of Content

> [!info] Context
> Заметки по книге *Computer Systems: A Programmer's Perspective* (Bryant, O'Hallaron).
> Язык практики: Zig (вместо C из книги). Каждый раздел содержит обзор, упражнения и Anki-карточки.

## Прогресс

| Глава | Тема | Статус |
|-------|------|--------|
| 1 | A Tour of Computer Systems | Done |
| 2.1 | Information Storage | Done |
| 2.2 | Integer Representations | Done |
| 2.3 | Integer Arithmetic | Done |
| 2.4 | Floating Point (IEEE 754) | -- |
| 3 | Machine-Level Representation of Programs | -- |
| 4 | Processor Architecture | -- |
| 5 | Optimizing Program Performance | -- |
| 6 | The Memory Hierarchy | -- |
| 7 | Linking | -- |
| 8 | Exceptional Control Flow | -- |
| 9 | Virtual Memory | -- |
| 10 | System-Level I/O | -- |
| 11 | Network Programming | -- |
| 12 | Concurrent Programming | -- |

## Глава 1: A Tour of Computer Systems

- [[1.chapter/1.chapter|Обзор: компиляция, hardware, кэши, ОС, Amdahl's Law, параллелизм]]

## Глава 2: Representing and Manipulating Information

### 2.1 Information Storage

- [[2.chapter/2.1/2.1-overview|Обзор: hex, word size, endianness, строки, побитовые операции, сдвиги]]
- [[2.chapter/2.1/2.1-exercises|Упражнения: showBytes, endianness detection, RGB packing, BitSet8]]

### 2.2 Integer Representations

- [[2.chapter/2.2/2.2-overview|Обзор: B2U, B2T, T2U, U2T, расширение, усечение, unsigned-ловушки]]
- [[2.chapter/2.2/2.2-exercises|Упражнения: таблица B2U/B2T, ручная реализация B2T, signed/unsigned трюки]]

### 2.3 Integer Arithmetic

- [[2.chapter/2.3/2.3-overview|Обзор: модулярная арифметика, переполнение, отрицание, умножение, деление]]
- [[2.chapter/2.3/exercises/exercise-1.zig|Упражнение 1: wrapping arithmetic]]
- [[2.chapter/2.3/exercises/exercise-2.zig|Упражнение 2: overflow detection]]
- [[2.chapter/2.3/exercises/exercise-3.zig|Упражнение 3: two's complement negation]]
- [[2.chapter/2.3/exercises/exercise-4.zig|Упражнение 4: multiplication via shifts]]
- [[2.chapter/2.3/exercises/exercise-5.zig|Упражнение 5: security / accuracy scenarios]]

### 2.4 Floating Point

> [!warning] Ещё не написано
> Следующий раздел: IEEE 754, float/double representation, rounding, FP arithmetic.

## Связанные темы

- [[../../08-internals/jit-compilation|JIT-компиляция в V8]] — как JS-движок компилирует в машинный код
- [[../../01-javascript/MOC|JavaScript]] — высокоуровневый язык поверх этих абстракций

## Sources

- Bryant, O'Hallaron — *Computer Systems: A Programmer's Perspective*, 3rd Edition
- [CS:APP Student Site](http://csapp.cs.cmu.edu/)

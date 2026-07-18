---
tags: [internals, moc, index, v8, jit, javascript]
aliases: [Internals, Внутренности JS]
---

# Внутренности V8 — Map of Content

## Цель

Построить проверяемую mental model выполнения JavaScript в V8: проследить путь от исходного кода до оптимизированного машинного кода, объяснить деоптимизацию, предсказать представление объектов и массивов и подтвердить гипотезу наблюдаемым выводом Node.js.

## Пререквизиты

- Уверенное чтение функций, объектов и массивов JavaScript: [[../01-javascript/MOC|JavaScript]].
- Понимание стека вызовов, кучи и базовой оценки сложности.
- Node.js нужен только для практических трассировок; чтение маршрута от него не зависит.

## Канонический маршрут

1. **Базовый JIT-пайплайн.** [[jit-compilation|JIT-компиляция в V8]]: parsing → Ignition → profiling → TurboFan → deoptimization; затем Hidden Classes и Inline Caches.  
   **Проверка:** по вызовам одной функции со стабильными, а затем изменёнными типами нарисуйте состояния кода и укажите, какое предположение стало недействительным.
2. **Современные тиры и представление значений.** [[v8-engine-internals#1. Пайплайн компиляции: четыре тира|Ignition, Sparkplug, Maglev и TurboFan]] → [[v8-engine-internals#2. Модель памяти|Tagged Pointers и зоны кучи]].  
   **Проверка:** разместите SMI, HeapNumber, молодой объект и скомпилированный код в соответствующих представлениях или зонах и объясните каждое решение.
3. **Время жизни объектов.** [[v8-engine-internals#3. Сборка мусора: Orinoco|Minor и Major GC]].  
   **Проверка:** по двум строкам `--trace-gc` отличите Scavenge от Mark-Compact и назовите, какие зоны кучи они обслуживают.
4. **Формы объектов и массивов.** [[v8-engine-internals#4. Объекты: Hidden Classes|Hidden Classes]] → [[v8-engine-internals#5. Массивы: ElementsKind|ElementsKind]].  
   **Проверка:** предскажите Map для объектов с разным порядком инициализации и цепочку переходов массива после добавления дроби, строки и дыры.
5. **Строки и наблюдение.** [[v8-engine-internals#6. Строки: внутренние представления|Представления строк]] → [[v8-engine-internals#7. Инструменты для наблюдения за V8|Флаги Node.js и DebugPrint]].  
   **Проверка:** выберите между `--trace-deopt`, `--trace-gc` и `%DebugPrint()` для заданной гипотезы и укажите, какой фрагмент вывода её подтвердит или опровергнет.

## Практика

- [[practice|Трассировка и проверка mental model V8]] — предсказание ElementsKind, диагностика Hidden Classes и перенос модели на новый код.

## Справочные материалы

- [[v8-engine-internals#Сводная таблица тиров|Сводная таблица тиров]]
- [[v8-engine-internals#7.1 Флаги Node.js|Флаги наблюдения]]

## Связанные темы

- [[../01-javascript/MOC|JavaScript]]
- [[../06-algorithms/MOC|Algorithms]]

## Источники

Источники по архитектуре V8 собраны в разделе [[v8-engine-internals#Sources|«Sources»]] основной заметки. Ссылки на браузер, CSS и устройство Internet из прежнего списка не относятся к этому маршруту и поэтому не используются как трек обучения V8.

### Дополнительные материалы из исходного MOC

Эти ссылки сохранены отдельно: они посвящены браузеру, рендерингу и Internet, а не внутренностям V8.

- [Let's learn how modern JavaScript frameworks work by building one](https://nolanlawson.com/2023/12/02/lets-learn-how-modern-javascript-frameworks-work-by-building-one/)
- [Improving rendering performance with CSS content-visibility](https://nolanlawson.com/2024/09/18/improving-rendering-performance-with-css-content-visibility/)
- [Как работает браузер](https://habr.com/ru/companies/skillfactory/articles/678400/)
- [How Internet Works — explained from first principles](https://explained-from-first-principles.com/internet/)

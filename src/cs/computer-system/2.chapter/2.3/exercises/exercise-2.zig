const std = @import("std");
const print = std.debug.print;

// ============================================================
// Упражнение 2: Обнаружение переполнения
// Сложность: начинающий+
//
// CS:APP §2.3.2: при сложении двух u8 результат может не
// помещаться в u8. Важно уметь ОБНАРУЖИТЬ это переполнение,
// не допуская неопределённого поведения.
//
// В Zig для этого есть встроенные функции @addWithOverflow
// и @mulWithOverflow, которые возвращают и результат, и флаг.
//
// Запуск:  /usr/local/zig/zig run exercise-2.zig
// ============================================================

// --- Основы синтаксиса Zig для этого упражнения ---
//
// Встроенные функции начинаются с @:
//   @addWithOverflow(a, b)  — возвращает структуру { result, overflow_bit }
//   @mulWithOverflow(a, b)  — аналогично для умножения
//
// Деструктуризация результата:
//   const res = @addWithOverflow(a, b);
//   res[0]  — сам результат (оборачивающий, как +%)
//   res[1]  — флаг переполнения: 1 если было, 0 если нет
//
// Опциональный тип ?T (Optional):
//   Значение типа ?u8 может быть либо числом u8, либо null.
//   Это как "результат или его отсутствие".
//
//   fn maybe_value() ?u8 {
//       return null;       // нет значения
//       return 42;         // есть значение
//   }
//
// Условие if/else:
//   if (условие) {
//       // выполнится если условие == true
//   } else {
//       // иначе
//   }
//
// Сравнение с true/false (тип bool):
//   res[1] == 1   — проверка флага переполнения
//   res[1] == 0   — нет переполнения

// ============================================================
// Задание 2.1
// Реализуй функцию has_add_overflow_u8, которая возвращает true,
// если сложение двух u8 вызывает переполнение.
//
// Примеры:
//   has_add_overflow_u8(200, 100) -> true  (300 > 255)
//   has_add_overflow_u8(100, 100) -> false (200 <= 255)
//   has_add_overflow_u8(255, 1)   -> true  (256 > 255)
//   has_add_overflow_u8(0, 0)     -> false
//
// Подсказка: используй @addWithOverflow и проверь res[1].
// ============================================================
fn has_add_overflow_u8(x: u8, y: u8) bool {
    // TODO: используй @addWithOverflow(x, y)
    // и верни true если res[1] == 1
    _ = x;
    _ = y;
    return false; // <- заполнитель
}

// ============================================================
// Задание 2.2
// Реализуй функцию has_mul_overflow_u32, которая возвращает true,
// если умножение двух u32 вызывает переполнение.
//
// Примеры:
//   has_mul_overflow_u32(100_000, 100_000) -> true  (10^10 > 2^32-1)
//   has_mul_overflow_u32(1000, 1000)       -> false (10^6 < 2^32-1)
//   has_mul_overflow_u32(65536, 65536)     -> true  (2^32 — ровно не влезает)
//   has_mul_overflow_u32(0, 999_999_999)   -> false (0 * x = 0)
//
// Подсказка: используй @mulWithOverflow(x, y).
// ============================================================
fn has_mul_overflow_u32(x: u32, y: u32) bool {
    // TODO: используй @mulWithOverflow(x, y)
    _ = x;
    _ = y;
    return false; // <- заполнитель
}

// ============================================================
// Задание 2.3
// Реализуй функцию safe_add_u8:
//   - если сложение x + y переполняет u8 — верни null
//   - иначе — верни сумму
//
// Тип возвращаемого значения ?u8 — это "опциональный u8":
// может быть u8 или null.
//
// Примеры:
//   safe_add_u8(200, 100) -> null  (переполнение)
//   safe_add_u8(100, 55)  -> 155
//   safe_add_u8(255, 0)   -> 255
//   safe_add_u8(255, 1)   -> null
// ============================================================
fn safe_add_u8(x: u8, y: u8) ?u8 {
    // TODO: если переполнение — return null
    //       иначе — return res[0] (результат из @addWithOverflow)
    _ = x;
    _ = y;
    return null; // <- заполнитель
}

// ============================================================
// Тесты — не изменяй эту секцию
// ============================================================
pub fn main() void {
    var passed: u32 = 0;
    var failed: u32 = 0;

    print("\n--- Упражнение 2: Обнаружение переполнения ---\n\n", .{});

    // --- Тесты 2.1 ---
    print("2.1 has_add_overflow_u8:\n", .{});
    {
        const cases = [_]struct { x: u8, y: u8, expect: bool }{
            .{ .x = 200, .y = 100, .expect = true },
            .{ .x = 100, .y = 100, .expect = false },
            .{ .x = 255, .y = 1,   .expect = true },
            .{ .x = 0,   .y = 0,   .expect = false },
            .{ .x = 128, .y = 127, .expect = false },
            .{ .x = 128, .y = 128, .expect = true },
        };
        for (cases) |c| {
            const result = has_add_overflow_u8(c.x, c.y);
            if (result == c.expect) {
                print("  ПРОЙДЕН: has_add_overflow_u8({}, {}) = {}\n", .{ c.x, c.y, c.expect });
                passed += 1;
            } else {
                print("  ПРОВАЛЕН: has_add_overflow_u8({}, {}) — ожидалось {}, получено {}\n", .{ c.x, c.y, c.expect, result });
                failed += 1;
            }
        }
    }

    // --- Тесты 2.2 ---
    print("\n2.2 has_mul_overflow_u32:\n", .{});
    {
        const cases = [_]struct { x: u32, y: u32, expect: bool }{
            .{ .x = 100_000,     .y = 100_000,     .expect = true },
            .{ .x = 1_000,       .y = 1_000,       .expect = false },
            .{ .x = 65_536,      .y = 65_536,      .expect = true },
            .{ .x = 0,           .y = 999_999_999, .expect = false },
            .{ .x = 2,           .y = 2_147_483_647, .expect = false },
            .{ .x = 3,           .y = 2_000_000_000, .expect = true },
        };
        for (cases) |c| {
            const result = has_mul_overflow_u32(c.x, c.y);
            if (result == c.expect) {
                print("  ПРОЙДЕН: has_mul_overflow_u32({}, {}) = {}\n", .{ c.x, c.y, c.expect });
                passed += 1;
            } else {
                print("  ПРОВАЛЕН: has_mul_overflow_u32({}, {}) — ожидалось {}, получено {}\n", .{ c.x, c.y, c.expect, result });
                failed += 1;
            }
        }
    }

    // --- Тесты 2.3 ---
    print("\n2.3 safe_add_u8:\n", .{});
    {
        // Проверка случаев с переполнением (должно вернуть null)
        const overflow_cases = [_]struct { x: u8, y: u8 }{
            .{ .x = 200, .y = 100 },
            .{ .x = 255, .y = 1 },
            .{ .x = 128, .y = 128 },
        };
        for (overflow_cases) |c| {
            const result = safe_add_u8(c.x, c.y);
            if (result == null) {
                print("  ПРОЙДЕН: safe_add_u8({}, {}) = null (переполнение)\n", .{ c.x, c.y });
                passed += 1;
            } else {
                print("  ПРОВАЛЕН: safe_add_u8({}, {}) — ожидалось null, получено {?}\n", .{ c.x, c.y, result });
                failed += 1;
            }
        }

        // Проверка случаев без переполнения (должно вернуть значение)
        const ok_cases = [_]struct { x: u8, y: u8, expect: u8 }{
            .{ .x = 100, .y = 55,  .expect = 155 },
            .{ .x = 255, .y = 0,   .expect = 255 },
            .{ .x = 0,   .y = 0,   .expect = 0 },
            .{ .x = 127, .y = 1,   .expect = 128 },
        };
        for (ok_cases) |c| {
            const result = safe_add_u8(c.x, c.y);
            // result — это ?u8, сравниваем с конкретным значением
            if (result != null and result.? == c.expect) {
                print("  ПРОЙДЕН: safe_add_u8({}, {}) = {}\n", .{ c.x, c.y, c.expect });
                passed += 1;
            } else {
                print("  ПРОВАЛЕН: safe_add_u8({}, {}) — ожидалось {}, получено {?}\n", .{ c.x, c.y, c.expect, result });
                failed += 1;
            }
        }
    }

    print("\nИтог: {} пройдено, {} провалено\n", .{ passed, failed });
    if (failed == 0) {
        print("Все тесты пройдены!\n", .{});
    } else {
        print("Есть ошибки — исправь TODO и запусти снова.\n", .{});
    }
}

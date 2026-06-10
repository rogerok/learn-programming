---
tags: [cs, csapp, machine-code, x86-64, assembly, data-formats, c, abi, exercises]
---

# Упражнения: CS:APP 3.3 --- Форматы данных

> [!info] Контекст
> Практика к [[3.3-overview|Главе 3.3 --- Форматы данных]]. Цель --- научиться связывать C-типы, размеры данных, ABI-модель и суффиксы инструкций `x86-64`: `b`, `w`, `l`, `q`.
>
> Работай в отдельной временной папке, например `csapp-3.3-lab/`, чтобы не смешивать учебные `.c`, `.s` и executable-файлы с заметками vault.

> [!warning] Важно про assembly output
> Точный assembly зависит от версии `gcc`, ABI, ОС, flags, настроек PIE/CET и оптимизаций. В этих упражнениях не требуется совпадение с CS:APP байт-в-байт или строка-в-строку. Сравнивай смысл: размер операции, суффикс инструкции, тип объекта и направление данных.
>
> Команды с `sed -n '/function:/,/\.size/p'` рассчитаны на GCC/Linux ELF output. На macOS/Clang имена symbols и assembler directives могут отличаться.

> [!important] Как работать с упражнениями
> Сначала выполни задание самостоятельно и запиши ответ. Потом открой `Hint`, уточни решение и только затем открой `Solution / self-review`. Для challenge не ищи готовый ответ: цель --- построить собственное объяснение и проверить его по критериям.
>
> **Minimum path:** упражнения 1, 2, 4 и итоговая самопроверка. **Full path:** упражнения 1-5. **Challenge/optional:** упражнение 6, особенно floating-point часть.

---

## Упражнение 1: Таблица размеров и суффиксов

**Difficulty:** beginner

**Task:** заполни таблицу для учебной платформы CS:APP: `x86-64`, Linux-style `LP64`, GCC-like output.

| C type | Intel / machine-level format | Assembly suffix | Size |
|---|---|---:|---:|
| `char` |  |  |  |
| `short` |  |  |  |
| `int` |  |  |  |
| `long` |  |  |  |
| `char *` |  |  |  |
| `int *` |  |  |  |
| `float` |  |  |  |
| `double` |  |  |  |

После заполнения ответь коротко:

```text
1. Почему pointer types имеют одинаковый размер, хотя указывают на разные типы?
2. Почему `long` в CS:APP/x86-64 обычно связан с `q`, а не с `l`?
3. Почему `word` в Intel terminology не означает 64-bit machine word?
```

> [!tip]- Hint
> Для integer-like типов используй цепочку: `byte -> word -> double word -> quad word`. Для `float` и `double` помни, что это floating-point форматы, а не обычные integer `movb/w/l/q`.

> [!warning]- Solution / self-review
> Проверь себя:
>
> | C type | Intel / machine-level format | Assembly suffix | Size |
> |---|---|---:|---:|
> | `char` | byte | `b` | 1 byte |
> | `short` | word | `w` | 2 bytes |
> | `int` | double word | `l` | 4 bytes |
> | `long` | quad word | `q` | 8 bytes |
> | `char *` | quad word | `q` | 8 bytes |
> | `int *` | quad word | `q` | 8 bytes |
> | `float` | single precision | `s` | 4 bytes |
> | `double` | double precision | `l` | 8 bytes |
>
> Главное: `l` в integer-инструкциях вроде `movl` означает 32-bit double word, а не C `long`. В floating-point контексте `l` может относиться к double precision, поэтому всегда смотри на семейство инструкций.

**Ключевой вывод:** таблица размеров --- это не абстрактный закон C, а конкретная связка `C type -> ABI -> machine size -> suffix`.

---

## Упражнение 2: Прочитай `movb`, `movw`, `movl`, `movq`

**Difficulty:** beginner

**Task:** для каждой инструкции определи, сколько байтов она читает или записывает.

```asm
movb    $0, (%rdi)
movw    $0, (%rdi)
movl    $0, (%rdi)
movq    $0, (%rdi)

movb    (%rdi), %al
movw    (%rdi), %ax
movl    (%rdi), %eax
movq    (%rdi), %rax
```

Заполни шаблон:

```text
Instruction:
- suffix:
- operation size:
- memory read/write size:
- likely C object size:
```

Контрольные вопросы:

```text
1. Какая инструкция затрагивает 1 byte?
2. Какая инструкция затрагивает 2 bytes?
3. Какая инструкция затрагивает 4 bytes?
4. Какая инструкция затрагивает 8 bytes?
5. Почему `movl` не означает "move long" в смысле C `long` на CS:APP/x86-64?
```

> [!tip]- Hint
> Суффиксы читаются так: `b = byte`, `w = word`, `l = double word`, `q = quad word`. Историческое имя `word` в x86 --- это 16 bits, а не 64 bits.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - `movb` работает с 1 byte.
> - `movw` работает с 2 bytes.
> - `movl` работает с 4 bytes.
> - `movq` работает с 8 bytes.
> - `movl` часто соответствует `int`, а не `long`, если речь идет о CS:APP на `x86-64`/Linux.
> - C `long` на LP64 обычно занимает 8 bytes, поэтому для него ожидается `q`-операция.

**Ключевой вывод:** базовое имя `mov` говорит "переместить данные", а суффикс говорит "какого размера данные".

---

## Упражнение 3: Проверь `sizeof` на своей машине

**Difficulty:** intermediate

**Task:** создай программу `sizes.c`, запусти ее и сравни результат с таблицей из главы.

```c
/* sizes.c */
#include <stdio.h>

int main(void) {
  printf("sizeof(char)        = %zu\n", sizeof(char));
  printf("sizeof(short)       = %zu\n", sizeof(short));
  printf("sizeof(int)         = %zu\n", sizeof(int));
  printf("sizeof(long)        = %zu\n", sizeof(long));
  printf("sizeof(long long)   = %zu\n", sizeof(long long));

  printf("sizeof(char *)      = %zu\n", sizeof(char *));
  printf("sizeof(int *)       = %zu\n", sizeof(int *));
  printf("sizeof(long *)      = %zu\n", sizeof(long *));

  printf("sizeof(float)       = %zu\n", sizeof(float));
  printf("sizeof(double)      = %zu\n", sizeof(double));
  printf("sizeof(long double) = %zu\n", sizeof(long double));

  return 0;
}
```

Собери и запусти:

```bash
gcc -Wall -Wextra -Og -o sizes sizes.c
./sizes
```

Дополнительно проверь архитектуру:

```bash
uname -m
```

Заполни наблюдения:

```text
Architecture:
- uname -m:

Integer sizes:
- char:
- short:
- int:
- long:
- long long:

Pointer sizes:
- char *:
- int *:
- long *:

Floating-point sizes:
- float:
- double:
- long double:

Что совпало с CS:APP LP64:
Что удивило:
```

> [!tip]- Hint
> На типичной Linux `x86-64` системе ты ожидаешь `sizeof(long) == 8` и `sizeof(pointer) == 8`. На Windows x64 часто используется `LLP64`: pointer имеет 8 bytes, но `long` может оставаться 4 bytes.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - Я понимаю, что `sizeof(int *)`, `sizeof(char *)` и `sizeof(long *)` проверяют размер адреса, а не размер объекта, на который указывает pointer.
> - Я не делаю универсальный вывод "C `long` всегда 8 bytes".
> - Я могу объяснить разницу между `LP64` и `LLP64` на уровне идеи.
> - Я отдельно отметил `long double`, потому что его размер и хранение зависят от ABI/compiler.
> - Я не использую результат `sizeof(long double)` как основу для выводов про обычные integer-инструкции `movb/w/l/q`.

**Ключевой вывод:** `sizeof` показывает реальную ABI-модель твоей сборки, а не универсальные размеры языка C.

---

## Упражнение 4: Сгенерируй `movb/w/l/q` через C-типы

**Difficulty:** intermediate

**Task:** создай файл `stores.c`, скомпилируй его в assembly и найди, какие `mov`-инструкции использует компилятор для разных типов.

```c
/* stores.c */
void store_char(char *p, char x) {
  *p = x;
}

void store_short(short *p, short x) {
  *p = x;
}

void store_int(int *p, int x) {
  *p = x;
}

void store_long(long *p, long x) {
  *p = x;
}
```

Собери assembly:

```bash
gcc -Og -S stores.c
test -f stores.s
```

Посмотри функции:

```bash
sed -n '/store_char:/,/\.size/p' stores.s
sed -n '/store_short:/,/\.size/p' stores.s
sed -n '/store_int:/,/\.size/p' stores.s
sed -n '/store_long:/,/\.size/p' stores.s
```

Быстрый поиск:

```bash
grep -nE 'mov[bwlq]' stores.s
```

Заполни таблицу:

```text
| Function | C pointed value type | Expected store size | Instruction I found |
|---|---|---:|---|
| store_char | char | 1 byte | |
| store_short | short | 2 bytes | |
| store_int | int | 4 bytes | |
| store_long | long | 8 bytes | |
```

> [!tip]- Hint
> В параметре `char *p` сам `p` является адресом и обычно приходит в 64-bit register. Но операция `*p = x` записывает размер объекта `char`, то есть 1 byte.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - Для `store_char` я ожидаю byte store, например `movb`.
> - Для `store_short` я ожидаю word store, например `movw`.
> - Для `store_int` я ожидаю double-word store, например `movl`.
> - Для `store_long` я ожидаю quad-word store, например `movq`.
> - Я объясняю размер записи через тип `*p`, а не через размер самого pointer.
> - Если регистры или дополнительные строки отличаются от книги, я не считаю это ошибкой.

**Ключевой вывод:** pointer несет адрес, а суффикс store-инструкции определяется размером объекта, в который происходит запись.

---

## Упражнение 5: Pointer size vs pointed value size

**Difficulty:** intermediate

**Task:** сравни assembly для записи значения `int`, записи значения `long` и записи самого pointer.

Создай файл `pointers.c`:

```c
/* pointers.c */
void set_int_value(int *p, int x) {
  *p = x;
}

void set_long_value(long *p, long x) {
  *p = x;
}

void set_pointer(long **dst, long *src) {
  *dst = src;
}
```

Собери assembly:

```bash
gcc -Og -S pointers.c
test -f pointers.s
grep -nE 'set_int_value|set_long_value|set_pointer|mov[bwlq]' pointers.s
```

Посмотри каждую функцию отдельно:

```bash
sed -n '/set_int_value:/,/\.size/p' pointers.s
sed -n '/set_long_value:/,/\.size/p' pointers.s
sed -n '/set_pointer:/,/\.size/p' pointers.s
```

Ответь:

```text
1. В какой функции запись должна быть 4-byte?
2. В какой функции запись должна быть 8-byte из-за `long`?
3. В какой функции запись должна быть 8-byte из-за pointer value?
4. Почему `long **dst` не означает, что запись будет размером "два указателя"?
```

> [!tip]- Hint
> `set_pointer` записывает значение `src` в ячейку `*dst`. Значение `src` --- это pointer, а pointer в LP64 занимает 8 bytes. Но `dst` сам тоже pointer; не смешивай адрес места записи и значение, которое туда записывается.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - `set_int_value`: запись размера `int`, обычно `movl`.
> - `set_long_value`: запись размера `long`, обычно `movq` на LP64.
> - `set_pointer`: запись pointer value, обычно `movq` на LP64.
> - Я могу объяснить, что `long **dst` --- это pointer на место, где хранится `long *`; размер записываемого значения равен размеру одного pointer.
> - Я не путаю "сколько байтов занимает адрес" и "сколько байтов занимает объект по этому адресу".

**Ключевой вывод:** для `*p = x` нужно отдельно определить размер `p`, размер `*p` и размер `x`; они не всегда совпадают.

---

## Упражнение 6: Challenge --- мини-аудит форматов данных

**Difficulty:** advanced / challenge

**Task:** создай небольшой C-файл, сгенерируй assembly и подготовь мини-отчет: какие размеры операций ты видишь и как они связаны с C-типами.

Core часть challenge --- integer/pointer audit. Floating-point часть является optional extension: она нужна, чтобы увидеть границу применимости `movb/w/l/q`, а не чтобы заранее изучить весь floating-point assembly.

Создай файл `formats_audit.c`:

```c
/* formats_audit.c */
void copy_int(int *dst, int *src) {
  *dst = *src;
}

void copy_long(long *dst, long *src) {
  *dst = *src;
}

void copy_pointer(long **dst, long **src) {
  *dst = *src;
}

float add_float(float x, float y) {
  return x + y;
}

double add_double(double x, double y) {
  return x + y;
}

long double pass_long_double(long double x) {
  return x;
}
```

Собери:

```bash
gcc -Og -S formats_audit.c
test -f formats_audit.s
```

### Challenge A: integer/pointer audit

Посмотри integer/pointer functions:

```bash
sed -n '/copy_int:/,/\.size/p' formats_audit.s
sed -n '/copy_long:/,/\.size/p' formats_audit.s
sed -n '/copy_pointer:/,/\.size/p' formats_audit.s
grep -nE 'mov[bwlq]' formats_audit.s
```

Подготовь мини-отчет:

```text
Integer and pointer operations:
1. copy_int:
   - C object size:
   - assembly evidence:
   - why this size:

2. copy_long:
   - C object size:
   - assembly evidence:
   - why this size:

3. copy_pointer:
   - C object size:
   - assembly evidence:
   - why this size:
```

### Challenge B: optional floating-point caveats

Посмотри floating-point functions:

```bash
sed -n '/add_float:/,/\.size/p' formats_audit.s
sed -n '/add_double:/,/\.size/p' formats_audit.s
sed -n '/pass_long_double:/,/\.size/p' formats_audit.s
grep -nE 'xmm|st\(|fld|fst|addss|addsd|movss|movsd' formats_audit.s
```

Заполни optional часть отчета:

```text
Floating-point operations:
4. add_float:
   - expected C size:
   - assembly evidence:
   - what differs from integer movb/w/l/q:

5. add_double:
   - expected C size:
   - assembly evidence:
   - why `double` does not mean ordinary integer `movq` reasoning:

6. pass_long_double:
   - sizeof caveat:
   - assembly evidence:
   - why this is platform/compiler-specific:
```

**Мини-тесты для отчета:**

```text
PASS: ты явно объяснил `movl` как 4-byte integer operation, а не как C `long`.
PASS: ты разделил pointer size и pointed value size.
PASS: ты отметил, что `float`/`double` часто используют SSE/XMM instructions.
PASS: ты не сделал универсальный вывод про `long double`.
FAIL: ты написал "`l` всегда значит long".
FAIL: ты написал "все pointers записывают размер объекта, на который указывают".
FAIL: ты требуешь точного совпадения assembly с книгой.
```

> [!tip]- Hint 1
> Для `copy_pointer` сначала определи тип выражения `*src`, потом тип значения, которое записывается в `*dst`.

> [!tip]- Hint 2
> Для `add_float` и `add_double` ищи не только `mov...`, но и floating-point/SSE-инструкции вроде `addss`, `addsd`, `movss`, `movsd` или использование `xmm` registers.

> [!tip]- Hint 3
> `long double` --- intentionally messy case. Для этой главы достаточно увидеть, что его нельзя свести к простой таблице `b/w/l/q`.

> [!warning]- Solution / self-review
> Не копируй готовое решение. Проверь свой мини-отчет по критериям:
>
> - Я могу для каждой integer/pointer function назвать размер операции: 4 bytes или 8 bytes.
> - Я могу показать конкретную строку assembly, на которую опираюсь.
> - Я объяснил `copy_pointer` через размер pointer value, а не через размер `long`.
> - Я могу объяснить `movl (%rsi), %eax` как 4-byte load из адреса `%rsi`, а не как "загрузка C `long`".
> - Я разделил integer suffix `l` и floating-point usage of `l`.
> - Я написал caveat про `LP64` vs `LLP64`.
> - Я написал caveat про `float`, `double`, `long double`: они могут использовать другой набор инструкций и ABI-правил.
> - Я сформулировал вывод своими словами, а не просто вставил вывод `grep`.

**Ключевой вывод:** хороший разбор assembly начинается с вопроса "какой размер операции?", но заканчивается проверкой контекста: C expression, ABI, instruction family и compiler output.

---

## Итоговая самопроверка

Ответь письменно, без подглядывания:

```text
1. Сколько bytes в x86 `word`?
2. Что означает suffix `b`?
3. Что означает suffix `w`?
4. Что означает suffix `l` в integer-инструкции?
5. Что означает suffix `q`?
6. Почему `movl` не означает C `long` на CS:APP/x86-64?
7. Почему `int *p` обычно занимает 8 bytes, но `*p = x` для int записывает 4 bytes?
8. Чем LP64 отличается от LLP64 на уровне `long` и pointer?
9. Почему `float`/`double` не стоит объяснять только через integer `movb/w/l/q`?
10. Почему `long double` нужно держать как platform-specific caveat?
```

> [!tip]- Hint
> Если ты можешь ответить на эти вопросы и показать хотя бы один собственный `.s` файл с `movb/w/l/q`, материал 3.3 усвоен на рабочем уровне.

## Related Topics

- [[3.3-overview|Глава 3.3 --- Форматы данных]]
- [[../3.1/3.1-overview|3.1 --- Историческая перспектива x86]]
- [[../3.2/3.2-overview|3.2 --- Программный код]]
- [[../3.4/3.4-overview|3.4 --- Доступ к информации]]
- [[../../2.chapter/2.1/2.1-overview|2.1 --- Хранение информации]]
- [[../../2.chapter/2.4/2.4-overview|2.4 --- Числа с плавающей точкой]]

## Sources

- [[3.3-overview|Глава 3.3 --- Форматы данных]]
- Bryant, R. E., O'Hallaron, D. R. *Computer Systems: A Programmer's Perspective*, 3rd Edition, Section 3.3.

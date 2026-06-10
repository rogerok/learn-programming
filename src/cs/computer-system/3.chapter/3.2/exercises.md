---
tags: [cs, csapp, machine-code, x86-64, assembly, gcc, object-code, disassembly, exercises]
---

# Упражнения: CS:APP 3.2 --- Программный код

> [!info] Контекст
> Эти упражнения закрепляют материал из [[3.2-overview|Главы 3.2 --- Программный код]]: GCC pipeline, `.s`, `.o`, executable, `objdump`, машинные байты, `gdb x/...`, а также различия AT&T и Intel syntax.
>
> Работай в отдельной временной папке, например `csapp-3.2-lab/`, чтобы не смешивать учебные артефакты с заметками vault.

> [!warning] Важно про версии GCC
> На современной Ubuntu/GCC в начале функции может появиться `endbr64` с байтами `f3 0f 1e fa`. В упражнениях не требуется точное совпадение байтов с CS:APP. Сравнивай структуру: функции, инструкции, вызовы, адреса, relocation и направление операндов.

> [!important] Как работать с упражнениями
> Упражнения 1-3 и итоговая самопроверка являются core route. Сначала выполни команду сам, запиши наблюдение своими словами, потом открывай `Hint`, затем сверяйся с `Solution / self-review`. Упражнения 4-6 являются optional lab: возвращайся к ним после первого прохода по главе.

---

## Упражнение 1: Получить assembly file из `mstore.c`

**Difficulty:** beginner

**Task:** создай C-файл `mstore.c`, скомпилируй его до `.s` и найди в assembly output функцию `multstore`.

**Requirements:**

- Создай файл `mstore.c`.
- В файле должна быть функция `multstore`, которая вызывает внешнюю функцию `mult2`.
- Получи файл `mstore.s` через `gcc -Og -S`.
- Найди в `mstore.s` label функции `multstore`.
- Отдели реальные инструкции от assembler directives.

**Test cases/commands:**

```c
/* mstore.c */
long mult2(long, long);

void multstore(long x, long y, long *dest) {
  long t = mult2(x, y);
  *dest = t;
}
```

```bash
gcc -Og -S mstore.c
test -f mstore.s
grep -n "multstore" mstore.s
grep -n "call" mstore.s
grep -n "ret" mstore.s
```

Дополнительная проверка без точного сравнения байтов:

```bash
sed -n '/multstore:/,/\.size/p' mstore.s
```

Ожидаемо: ты видишь label `multstore:`, вызов `mult2` через `call` или похожую инструкцию вызова, и возврат из функции через `ret`.

> [!tip]- Hint 1
> `gcc -S` останавливает pipeline после стадии compilation: C уже превращен в assembly text, но assembler еще не создал object file.

> [!tip]- Hint 2
> Строки вроде `.file`, `.text`, `.globl`, `.type`, `.size` --- это assembler directives. CPU не исполняет их как обычные инструкции.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - Я могу показать команду, которая создала `mstore.s`.
> - Я нашел label `multstore:`.
> - Я могу назвать хотя бы две реальные инструкции внутри функции.
> - Я могу объяснить, почему `.globl multstore` не является CPU-инструкцией.
> - Я не пытаюсь требовать точного совпадения вывода с книгой.

**Ключевой вывод:** `.s` файл --- это читаемое assembly-представление, но еще не machine code.

---

## Упражнение 2: Получить object file и disassembly

**Difficulty:** beginner

**Task:** собери `mstore.c` в relocatable object file `mstore.o`, затем посмотри disassembly через `objdump -d`.

**Requirements:**

- Получи `mstore.o` через `gcc -Og -c`.
- Убедись, что это binary object file, а не текстовый файл.
- Запусти `objdump -d mstore.o`.
- Найди функцию `multstore` в disassembly.
- Выпиши для 3 инструкций: offset, bytes, instruction.

**Test cases/commands:**

```bash
gcc -Og -c mstore.c
test -f mstore.o

file mstore.o
objdump -d mstore.o
objdump -d mstore.o | sed -n '/<multstore>:/,/^$/p'
```

Проверки, которые не зависят от точных байтов:

```bash
objdump -d mstore.o | grep -q "<multstore>:"
objdump -d mstore.o | grep -Eq "call|callq"
objdump -d mstore.o | grep -Eq "ret|retq"
```

Шаблон для твоего разбора:

```text
Instruction 1:
- offset:
- bytes:
- instruction:
- что меняется в machine state:

Instruction 2:
- offset:
- bytes:
- instruction:
- что меняется в machine state:

Instruction 3:
- offset:
- bytes:
- instruction:
- что меняется в machine state:
```

> [!tip]- Hint 1
> В выводе `objdump -d` слева обычно идет offset, затем байты инструкции, затем assembly-представление этих байтов.

> [!tip]- Hint 2
> Если видишь `endbr64`, не удаляй его и не считай ошибкой. Просто отметь, что это дополнительная инструкция, появившаяся из-за настроек современного toolchain.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - Я понимаю, почему `mstore.o` нельзя читать как обычный текст.
> - Я могу показать строку disassembly для `multstore`.
> - Я могу объяснить, что `objdump` не восстанавливает C-код, а декодирует байты.
> - Я нашел instruction bytes хотя бы у трех инструкций.
> - Я не ожидаю, что offsets и bytes совпадут с книгой один-в-один.

**Ключевой вывод:** object file уже содержит машинные байты, а `objdump` показывает их в читаемом виде.

---

## Упражнение 3: Сравнить `.s` и `objdump -d`

**Difficulty:** intermediate

**Task:** сравни compiler-generated assembly из `mstore.s` с disassembly из `mstore.o`.

**Requirements:**

- Используй уже созданные `mstore.s` и `mstore.o`.
- Найди инструкции функции `multstore` в обоих представлениях.
- Составь таблицу соответствия: instruction in `.s` -> instruction in `objdump`.
- Отметь, какие строки из `.s` не появляются как инструкции в `objdump`.
- Объясни, почему `.s` может содержать больше строк, чем disassembly функции.

**Test cases/commands:**

```bash
gcc -Og -S mstore.c
gcc -Og -c mstore.c

sed -n '/multstore:/,/\.size/p' mstore.s
objdump -d mstore.o | sed -n '/<multstore>:/,/^$/p'
```

Шаблон таблицы:

```text
| mstore.s line | objdump instruction | Это CPU-инструкция? | Комментарий |
|---|---|---|---|
| | | yes/no | |
| | | yes/no | |
| | | yes/no | |
```

Контрольные вопросы:

```text
1. Почему `.globl multstore` есть в `.s`, но не выглядит как инструкция в disassembly?
2. Почему `call mult2` в `.s` может выглядеть иначе в object file?
3. Где удобнее видеть bytes: в `.s` или в `objdump -d`?
```

> [!tip]- Hint 1
> `.s` --- это input для assembler. Там есть и инструкции, и directives. `objdump -d` показывает disassembly байтов из секции кода.

> [!tip]- Hint 2
> В object file вызов внешней функции еще может содержать placeholder/relocation, потому что linker пока не выбрал финальный адрес `mult2`.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - Я отделил directives от инструкций.
> - Я нашел соответствие между `call` в `.s` и `call` в `objdump`.
> - Я могу объяснить, почему object file еще не является готовой программой.
> - Я понимаю, что bytes появляются после работы assembler, а не на стадии `.s`.

**Ключевой вывод:** `.s` и `objdump` показывают похожую программу, но на разных стадиях toolchain.

---

## Упражнение 4: Optional lab --- Object file vs executable file

**Difficulty:** intermediate / optional

**Task:** создай `main.c`, собери executable `prog`, затем сравни disassembly функции `multstore` в `mstore.o` и в executable.

**Requirements:**

- Создай `main.c` с функцией `main` и реализацией `mult2`.
- Собери executable из `main.c` и `mstore.c`.
- Запусти программу и проверь результат.
- Сравни `objdump -d mstore.o` и `objdump -d prog`.
- Найди, как изменился `call mult2` после linking.
- Объясни, почему executable содержит больше кода, чем твои два C-файла.

**Test cases/commands:**

```c
/* main.c */
#include <stdio.h>

void multstore(long, long, long *);

long mult2(long a, long b) {
  long s = a * b;
  return s;
}

int main(void) {
  long d = 0;
  multstore(2, 3, &d);
  printf("2 * 3 --> %ld\n", d);
  return 0;
}
```

```bash
gcc -Og -c mstore.c
gcc -Og -o prog main.c mstore.c

./prog

objdump -d mstore.o | sed -n '/<multstore>:/,/^$/p'
objdump -d prog | sed -n '/<multstore>:/,/^$/p'
objdump -d prog | sed -n '/<mult2>:/,/^$/p'
```

Ожидаемый запуск:

```text
2 * 3 --> 6
```

Проверки без точных адресов:

```bash
./prog | grep -q "2 \* 3 --> 6"
objdump -d prog | grep -q "<multstore>:"
objdump -d prog | grep -q "<mult2>:"
objdump -d prog | grep -Eq "call.*<mult2>|callq.*<mult2>"
```

Если `grep` не находит `call.*<mult2>`, посмотри вывод вручную: compiler/linker могут менять детали вывода, особенно при других flags.

> [!tip]- Hint 1
> В `mstore.o` адрес вызова `mult2` еще не финальный. В executable linker уже знает, где находится `mult2`.

> [!tip]- Hint 2
> Если адреса в executable выглядят не как `0x400...`, это нормально: современные Linux-сборки часто используют PIE. Для учебного сравнения важнее найти символы и направление вызова.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - Я получил working executable и увидел `2 * 3 --> 6`.
> - Я нашел `multstore` в object file и executable.
> - Я могу объяснить, почему executable больше и сложнее object file.
> - Я увидел, что после linking вызов `mult2` стал более конкретным.
> - Я не делаю выводы на основе абсолютных адресов, потому что они зависят от сборки и платформы.

**Ключевой вывод:** object file --- промежуточная форма для linker, а executable --- связанная программа, которую может загрузить ОС.

---

## Упражнение 5: Optional lab --- найти байты функции в памяти через GDB

**Difficulty:** intermediate / optional

**Task:** используй GDB, чтобы посмотреть raw bytes функции `multstore` в памяти запущенной программы.

**Requirements:**

- Собери executable с debug symbols.
- Запусти `gdb ./prog`.
- Поставь breakpoint на `main`.
- Запусти программу.
- Используй `x/...xb multstore`, чтобы посмотреть байты функции.
- Сравни первые байты из GDB с байтами из `objdump -d prog`.

**Test cases/commands:**

```bash
gcc -Og -g -o prog main.c mstore.c
gdb ./prog
```

Внутри GDB:

```text
break main
run
x/24xb multstore
disassemble multstore
quit
```

Сравнение с `objdump`:

```bash
objdump -d prog | sed -n '/<multstore>:/,/^$/p'
```

Шаблон для наблюдений:

```text
GDB bytes:
- first bytes:
- есть ли endbr64:
- какая первая знакомая инструкция после возможного endbr64:

Objdump bytes:
- first bytes:
- совпадает ли начало с GDB:
- что отличается и почему:
```

> [!tip]- Hint 1
> Команда `x/24xb multstore` читается так: examine 24 units, hexadecimal format, byte size, начиная с адреса symbol `multstore`.

> [!tip]- Hint 2
> GDB показывает bytes в памяти процесса. `objdump` показывает bytes из файла. Для обычного кода они должны соответствовать, но адреса и окружение загрузки могут отличаться.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - Я могу расшифровать `x/24xb`.
> - Я понимаю, что GDB показывает bytes, а не C-код.
> - Я сравнил GDB bytes с disassembly из `objdump`.
> - Если увидел `f3 0f 1e fa`, я отметил это как возможный `endbr64`, а не как ошибку.
> - Я могу объяснить связь: source code -> assembly text -> object bytes -> bytes in memory.

**Ключевой вывод:** исполняемый код реально находится в памяти процесса как последовательность байтов.

---

## Упражнение 6: Optional stretch --- AT&T vs Intel direction и итоговый мини-отчет

**Difficulty:** advanced / optional

**Task:** сгенерируй assembly в AT&T и Intel syntax, сравни направление операндов и подготовь короткий мини-отчет по всей pipeline.

**Requirements:**

- Получи AT&T assembly через обычный `gcc -Og -S`.
- Получи Intel assembly через `gcc -Og -S -masm=intel`.
- Найди инструкцию, которая записывает return value `mult2` по адресу `dest`.
- Объясни направление операндов в AT&T и Intel syntax.
- Подготовь мини-отчет на 10-15 строк: что происходит на стадиях `.c -> .s -> .o -> executable`.
- В отчете отдельно упомяни, почему нельзя требовать точного совпадения bytes с книгой.

**Test cases/commands:**

```bash
gcc -Og -S -o mstore-att.s mstore.c
gcc -Og -S -masm=intel -o mstore-intel.s mstore.c

sed -n '/multstore:/,/\.size/p' mstore-att.s
sed -n '/multstore:/,/\.size/p' mstore-intel.s
```

Команды для поиска похожих операций записи:

```bash
grep -nE "mov.*%rax|mov.*rax" mstore-att.s mstore-intel.s
grep -nE "\(%r|\[r" mstore-att.s mstore-intel.s
```

Шаблон сравнения:

```text
AT&T:
- instruction:
- source:
- destination:
- meaning:

Intel:
- instruction:
- source:
- destination:
- meaning:
```

Шаблон мини-отчета:

```text
1. C source содержит функции, типы и имена переменных.
2. ...
3. ...
```

> [!tip]- Hint 1
> В AT&T syntax порядок операндов обычно `source, destination`. В Intel syntax --- `destination, source`.

> [!tip]- Hint 2
> AT&T `movq %rax, (%rbx)` и Intel `mov QWORD PTR [rbx], rax` описывают одну и ту же идею: записать значение из `rax` в память по адресу, который лежит в `rbx`.

> [!tip]- Hint 3
> Не привязывайся к конкретному регистру `rbx` слишком жестко. Compiler может выбрать другой регистр. Ищи смысл: return value находится в `%rax`/`rax`, затем записывается по адресу `dest`.

> [!warning]- Solution / self-review
> Проверь себя:
>
> - Я не перепутал направление `mov` в AT&T и Intel.
> - Я могу объяснить, почему `(%rbx)` и `[rbx]` означают memory operand.
> - Я связал `.c`, `.s`, `.o` и executable в одну pipeline.
> - Я упомянул роль compiler, assembler и linker.
> - Я явно написал, что `endbr64`, PIE, версия GCC и настройки сборки могут менять bytes и адреса.
> - Мой отчет объясняет поведение, а не просто копирует команды.

**Ключевой вывод:** одна и та же машинная операция может выглядеть по-разному в AT&T и Intel syntax; главное --- понять направление данных и изменение machine state.

---

## Итоговая самопроверка

Ответь письменно, без подглядывания в главу:

```text
1. Что создает команда gcc -Og -S mstore.c?
2. Что создает команда gcc -Og -c mstore.c?
3. Почему mstore.o обычно нельзя запустить как программу?
4. Что делает objdump -d?
5. Почему executable содержит больше, чем только твои функции?
6. Что означает x/24xb multstore в GDB?
7. В чем главное отличие порядка операндов AT&T и Intel syntax?
8. Почему байты на твоей машине могут отличаться от байтов из CS:APP?
```

> [!tip]- Hint
> Если ты можешь объяснить эти ответы своими словами и показать команды, которыми проверял вывод, материал 3.2 усвоен на рабочем уровне.

## Related Topics

- [[3.2-overview|Глава 3.2 --- Программный код]]
- [[../3.1/3.1-overview|3.1 --- Историческая перспектива x86]]
- [[../../2.chapter/2.1/2.1-overview|2.1 --- Хранение информации]]

## Sources

- [[3.2-overview|Глава 3.2 --- Программный код]]
- Bryant, R. E., O'Hallaron, D. R. *Computer Systems: A Programmer's Perspective*, 3rd Edition, Section 3.2.

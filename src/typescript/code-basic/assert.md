# Функция assert

Assert-функция — это специальная функция, которая:

Проверяет условие в рантайме.
Выбрасывает ошибку `throw Error`, если условие не истинно.
Сообщает компилятору TypeScript, что после успешного выполнения переменная имеет определённый тип (сужает тип).

Это мощнее, чем утверждение типа `as`, которое не выполняет проверок в runtime.

```ts
// Пример: утверждаем, что value является строкой
function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== 'string') {
        throw new Error('Ошибка: значение не является строкой!');
    }
    // Если функция не выбросила ошибку, TypeScript считает value типом string
}
```

| Характеристика | Type Guard | Assert-функция |
| :--- | :--- | :--- |
| **Возвращаемое значение** | `boolean` (`true`/`false`) | `void` (или ничего) |
| **При неудаче** | Возвращает `false` | **Выбрасывает ошибку** (`throw`) |
| **Использование** | В `if`-условиях (`if (isString(val))`) | Для **раннего выхода** из кода |

Пример использования: Валидация данных
```ts
interface User {
  name: string;
  age: number;
}

function assertIsUser(obj: unknown): asserts obj is User {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Это не объект');
  }
  const user = obj as Record<string, unknown>;
  if (typeof user.name !== 'string' || typeof user.age !== 'number') {
    throw new Error('Неверная структура объекта User');
  }
}

function processData(data: unknown) {
  try {
    assertIsUser(data); // Проверяем и сужаем тип
    // Здесь TypeScript знает, что data - это User
    console.log(`Имя: ${data.name}, Возраст: ${data.age}`);
  } catch (e) {
    console.error('Ошибка валидации:', e.message);
  }
}
```
⚠️ Важные моменты
Ответственность на вас: TypeScript доверяет вашей логике. Если проверка написана неверно, компилятор это не поймает.
Используйте try/catch: Так как assert-функции выбрасывают ошибки, их нужно обрабатывать.
Не путайте с as: as — это чисто компиляционная подсказка без проверок. assert — это runtime-проверка, которая помогает компилятору.

Type Guard отвечает на вопрос «верно ли?»
Assert отвечает на вопрос «может ли код продолжаться?»

Формально

asserts — это statement-level narrowing
boolean — это expression-level result
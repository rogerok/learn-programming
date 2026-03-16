# Структурная типизация

TypeScript проверяет совместимость типов **по структуре (форме)**, а не по имени.

## Лишние поля — допустимы

```ts
type User = { type: string; firstName: string; lastName: string };

const moderator = {
  firstName: 'Danil',
  lastName: 'Polovinkin',
  type: 'moderator',
  email: 'danil@example.com', // лишнее поле
};

function formatUser(user: User): string {
  return `${user.type}: ${user.firstName} ${user.lastName}`;
}

formatUser(moderator); // OK — moderator имеет все поля User
```

Объект с дополнительными полями совместим, потому что **подмножество** значений User включает объекты с любыми дополнительными полями.

## Ширина типа и количество полей

- **Меньше полей** → менее специфичное ограничение → **более широкий тип** (больше значений подходит).
- **Больше полей** → более специфичное ограничение → **более узкий тип** (подмножество).

```
{ name: string, age: number } ⊂ { name: string }
```

Объектный тип с дополнительными полями — **подтип** типа без этих полей.

## Excess Property Check — защита от опечаток

При **прямом** присваивании литерального объекта TypeScript запрещает лишние поля:

```ts
const user: User = {
  type: 'admin',
  firstName: 'Ivan',
  lastName: 'Petrov',
  emial: 'typo@example.com', // Error — excess property
};
```

Это **не** часть структурной типизации, а отдельная эвристика для object literals. Через промежуточную переменную — пропускает.

## Когда структурная типизация нарушается

Классы с `private`/`protected` полями проверяются **номинально** — по происхождению, а не по форме.

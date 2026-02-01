# unknown

Главное отличие `unknown` от `any` связано с проверкой типов. `unknown` запрещает выполнять любые операции

```ts
let value: unknown = 'code-basics';

value.toUpperCase(); // Error!
value.trim(); // Error!

```
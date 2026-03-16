# Tuples (Кортежи)

Кортеж — массив **фиксированной длины** с **типизированными позициями**:

```ts
const point: [number, number] = [1, 3];
point[0] = 4;    // OK
point[3];        // Error — индекс за пределами
```

## Именованные элементы (labeled tuples, TS 4.0+)

```ts
type Range = [start: number, end: number];
// Не влияет на типы, но улучшает читаемость в IDE
```

## Опциональные элементы

```ts
type HttpResponse = [number, string, object?];
const ok: HttpResponse = [200, 'OK'];
const detailed: HttpResponse = [200, 'OK', { data: [] }];
```

## Rest-элементы в кортежах

```ts
type StringAndNumbers = [string, ...number[]];
const val: StringAndNumbers = ['hello', 1, 2, 3]; // OK
```

## Проблема: push/pop не запрещены

```ts
const point: [number, number] = [1, 3];
point.push(10);        // Компилируется!
console.log(point);    // [1, 3, 10] — нарушена фиксированная длина
```

Это сохранено для обратной совместимости. Используйте `readonly` для защиты:

```ts
const point: readonly [number, number] = [1, 3];
point.push(10); // Error — push не существует на readonly tuple
```

## Кортежи и `as const`

```ts
const rgb = [255, 128, 0] as const;
// тип: readonly [255, 128, 0] — readonly tuple с литеральными типами
```

## Деструктуризация

TypeScript выводит типы из позиции в кортеже:

```ts
const [status, message]: [number, string] = [200, 'OK'];
// status: number, message: string
```

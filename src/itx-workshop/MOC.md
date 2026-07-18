---
tags: [itx-workshop, moc, index, zod, validation, typescript]
aliases: [ITX Workshop]
---

# ITX Workshop — source/workshop track

## Роль и результат

Это упорядоченный трек работы с [[../09-practice/zod-validator/readme|reference implementation Zod-like validator]], а не ещё один каталог и не готовое решение задания «реализовать Zod с нуля». Сначала зафиксируйте модель, затем читайте source, диагностируйте контракт и только потом переносите подход.

**Наблюдаемый результат:** вы можете на одном примере отдельно проследить compile-time type flow и runtime value flow, подтвердить их конкретными type aliases и methods, а затем сформулировать boundary test для нового composite validator.

## Предварительные знания

1. [[../02-typescript/MOC|TypeScript]]: generics, union types, mapped types и `unknown`.
2. [[../03-oop/MOC|OOP]]: class, наследование и abstract method.
3. [[../02-typescript/advanced/type-level-programming/type-level-programming|Type-level programming]]: преобразование ключей объекта.
4. [[../02-typescript/advanced/infer|Извлечение типа]]: полезно для сравнения с phantom field.

**Входной check:** не открывая source, запишите сигнатуру parser, который принимает `unknown` и возвращает `string` либо сообщает об ошибке; затем одним предложением отделите compile-time guarantee от runtime check. Если оба артефакта не получаются, сначала вернитесь к пунктам 1–2.

## Порядок прохождения

### 1. Predict: зафиксировать модель до source

Предскажите inferred type для `object({ name: string().optional() })` и порядок runtime-вызовов для отсутствующего `name`. Ответ сохраните без исправлений.

**Check:** есть две подписанные цепочки — type flow и value flow; у каждой указан вход и ожидаемый результат.

### 2. Explain: прочитать source по зависимостям

Пройдите по порядку: [[../09-practice/zod-validator/readme#Архитектура|карта файлов]] → [[../09-practice/zod-validator/readme#util.ts — вспомогательные типы|вспомогательные типы]] → [[../09-practice/zod-validator/readme#schema.ts — ядро валидатора|ядро validator]] → [[../09-practice/zod-validator/readme#Тесты (z.spec.ts)|тесты]]. Для каждой стрелки из шага 1 назовите конкретный type alias или method.

**Check:** по вашей схеме другой читатель может найти каждое звено в source; исходное предсказание и исправленная модель видны отдельно.

### 3. Diagnose: проверить неподтверждённый контракт

Выполните [[../09-practice/MOC#Diagnosis: найти неподтверждённый контракт|diagnosis-задачу]] для `array` или `object`: задайте негативный input, ожидаемое поведение, фактическую ветку `parse` и минимальный различающий test. Исправление не реализуйте.

**Check:** test не дублирует опубликованные примеры и его pass/fail однозначно различает ожидаемый и фактический runtime contract.

### 4. Transfer: спроектировать новый случай

Для `tuple` или `record` опишите inferred type, допустимые runtime inputs, один error case и boundary test. Не копируйте полный листинг и не начинайте реализацию до согласования этих четырёх пунктов.

**Check:** type-level контракт, runtime contract и test не противоречат друг другу; test содержит конкретные input и наблюдаемый результат.

## Завершение

Сверьте артефакты с [[../09-practice/MOC#Маршрут чтения Zod reference|расширенным маршрутом чтения source]]. Трек завершён, когда вы можете воспроизвести обе цепочки без заметки и объяснить, какой новый test сильнее всего изменил вашу уверенность в реализации.

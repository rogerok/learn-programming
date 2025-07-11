# Эти CSS-техники устарели

[оригинал](https://habr.com/ru/companies/ruvds/articles/917204/)

## Центрирование элемента с помощью свойства transform и значения translate(-50%, 50%)

```css
.parent {
    position: relative;
}

.parent::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

Можно заменить на

```css
.parent {
    display: grid;
    place-items: center;
}

.parent::before {
    content: "";
    position: absolute;
}
```

Что это делает:
`place-items: center` — это сокращение для:

`align-items: center;` (по вертикали)

`justify-items: center;` (по горизонтали)

Это автоматически выравнивает содержимое по центру внутри грид-контейнера.
Работает только с дочерними элементами грид-контейнера, и не требует абсолютного позиционирования, `top/left` или
`transform`.

Но способ с `transform: translate(-50%, -50%)` всё ещё нужен, когда мы работаем с абсолютным позиционированием и не
можем (или не хотим) использовать `grid`.

## Объявление стека системных шрифтов

Сегодня поддержка ключевого слова system-ui позволяет нам отказаться от этих фрагментов кода
Нам осталось просто добавить его в качестве единственного значения для свойства font-family.

```css
body {
    font-family: system-ui;
}
```

## Установка размеров с помощью свойств `width` и `height` для элементов с `position: absolute` или `position: fixed`

```css
.modal {
    display: none;
    width: 100%;
    height: 100%;

    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;

    justify-content: center;
    align-items: center;

    background-color: rgba(0, 0, 0, 0.5);
}
```

Браузеры, обработав свойства `top`, `left`, `width` и `height`, расположат элемент в левом верхнем углу, растянув на всё
пространство по ширине и высоте.

Это можно заменить выражением `inset: 0`

```css
.modal {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;

    justify-content: center;
    align-items: center;

    background-color: rgba(0, 0, 0, 0.5);
}
```

Это же работает для `absolute`

```css
.awesome-block {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
}
```

## Объявление значения для свойств margin и padding вместе со значением 0

```css
.awesome-block {
    margin: 0 auto;
    padding: 1rem 0 2rem;
}
```

Можно заменить свойствами `margin-inline` и `padding-block`

```css
.awesome-block {
    margin-inline: auto;
    padding-block: 1rem 2rem;
}
```

## Расположение элементов в столбец с помощью свойства flex-direction со значением

```css
.container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
```

Можно заменить на

```css
.container {
    display: grid;
    gap: 1rem;
}
```
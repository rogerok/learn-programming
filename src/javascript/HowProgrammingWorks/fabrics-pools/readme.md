# [Фабрики и пулы объектов в JavaScript, factorify, poolify](https://www.youtube.com/watch?v=Ax_mSvadFp8&ab_channel=TimurShemsedinov)

Pool - это пул объектов, который позволяет избежать создания новых объектов, а использовать уже существующие.
Плюсы:

1) Производительность - создание сложных или больших объектов может быть медленным.
2) Предсказуемое использование ресурсов - можно контролировать количество одновременно используемых объектов.
3) Уменьшение задержки - нет дорогостоящих этапов инициализации при переиспользовании.

```javascript
const WebSocket = require("ws");

// Simple buffer pool
const bufferPool = (buf) => {
    bufferPool.items = bufferPool.items || Array.from({length: 5}, () => new Uint8Array(1024));

    if (buf) {
        bufferPool.items.push(buf); // recycle buffer
        return;
    }

    return bufferPool.items.pop() || new Uint8Array(1024);
};

// WebSocket server
const wss = new WebSocket.Server({port: 8080});

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Send data every second
    const interval = setInterval(() => {
        const buf = bufferPool(); // get buffer from pool
        buf.fill(65); // fill with "A" ASCII code for example
        ws.send(buf);
        bufferPool(buf); // recycle buffer after sending
    }, 1000);

    ws.on("close", () => clearInterval(interval));
});

```
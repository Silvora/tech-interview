---
title: Web Worker是什么？
date: 2025-3-09 03:15:09
categories: 
- JavaScript
---

# 面试官：setTimeout 和 setInterval 的区别?

## 一、区别
`setTimeout`: 用于在指定的延迟时间后执行一次回调函数。只会执行一次回调函数。

`setInterval`: 用于每隔指定的时间间隔重复执行回调函数，直到被清除。会重复执行回调函数，直到调用 `clearInterval` 停止。

#### 内存方面

`setTimeout`:
- 由于 `setTimeout` 只执行一次，回调函数执行完毕后，相关的引用会被垃圾回收器（`GC`）清理，内存占用较低。

- 如果 `setTimeout` 嵌套调用自身（递归），可能会导致调用栈增长，但每次回调执行完毕后，栈会被清空。

`setInterval`:
- `setInterval` 会持续运行，回调函数的引用会一直存在于内存中，直到调用 `clearInterval` 停止。

- 如果回调函数中引用了外部变量或闭包，这些变量会一直保留在内存中，可能导致内存泄漏。

- 如果回调函数的执行时间超过了间隔时间，可能会导致多个回调函数堆积，增加内存和 `CPU` 的负担。

## 二、倒计时问题
使用 setTimeout 或 setInterval 实现倒计时时，由于 JavaScript 是单线程的，且定时器的执行可能会受到事件循环、主线程阻塞（如长时间运行的代码）等因素的影响，导致定时器的时间间隔不准确，从而产生时间偏差。为了解决这个问题，可以采取以下方法：

- 基于系统时间计算偏差
  - 在每次执行定时器回调时，基于当前的系统时间动态计算剩余时间，而不是依赖固定的时间间隔。这种方法可以有效减少偏差的累积。
```js
// 记录倒计时的结束时间。
// 在每次回调中，获取当前系统时间，计算与结束时间的差值。
// 根据差值更新倒计时显示。
// 动态调整下一次回调的时间。
function countdown(endTime) {
    function update() {
        const now = Date.now(); // 当前系统时间
        const remaining = endTime - now; // 剩余时间
        if (remaining <= 0) {
            console.log("倒计时结束");
            return;
        }
        // 更新倒计时显示
        const seconds = Math.floor(remaining / 1000);
        console.log(`剩余时间：${seconds} 秒`);
        // 动态调整下一次回调的时间
        const delay = Math.max(0, remaining % 1000); // 计算偏差
        setTimeout(update, delay);
    }
    update(); // 启动倒计时
}
// 设置倒计时结束时间（当前时间 + 10 秒）
const endTime = Date.now() + 10000;
countdown(endTime);
```



- 使用 Web Worker 避免主线程阻塞
```js
// 主线程代码
const worker = new Worker("countdown-worker.js");

worker.postMessage({
    endTime: Date.now() + 10000, // 10 秒倒计时
});

worker.onmessage = function (event) {
    console.log(`剩余时间：${event.data.remaining} 秒`);
};

// countdown-worker.js
self.onmessage = function (event) {
    const endTime = event.data.endTime;

    function update() {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
            self.postMessage({ remaining: 0 });
            self.close(); // 关闭 Worker
            return;
        }

        self.postMessage({ remaining: Math.floor(remaining / 1000) });
        setTimeout(update, 1000); // 每秒更新一次
    }

    update();
};
```


- 使用 requestAnimationFrame
```js
function countdown(endTime) {
    function update() {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
            console.log("倒计时结束");
            return;
        }

        // 更新倒计时显示
        const seconds = Math.floor(remaining / 1000);
        console.log(`剩余时间：${seconds} 秒`);

        // 继续调用 requestAnimationFrame
        requestAnimationFrame(update);
    }

    update(); // 启动倒计时
}

// 设置倒计时结束时间（当前时间 + 10 秒）
const endTime = Date.now() + 10000;
countdown(endTime);
```


- 结合 setTimeout 和偏差校正
```js
function countdown(duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;

    function update() {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
            console.log("倒计时结束");
            return;
        }

        // 更新倒计时显示
        const seconds = Math.floor(remaining / 1000);
        console.log(`剩余时间：${seconds} 秒`);

        // 计算偏差并调整下一次回调时间
        const expectedDelay = 1000; // 预期延迟 1 秒
        const actualDelay = expectedDelay - (now - startTime) % expectedDelay;
        setTimeout(update, actualDelay);
    }

    update(); // 启动倒计时
}

// 10 秒倒计时
countdown(10000);
```


|方法|优点|缺点|适用场景|
|--|--|--|--|
|基于系统时间计算偏差|	避免偏差累积，动态调整|	频繁获取系统时间，性能开销|	通用倒计时|
|使用 Web Worker|	避免主线程阻塞，提高精度	|增加复杂性**，需要额外线程管理|	复杂或高精度倒计时|
|使用 requestAnimationFrame	|高精度，适合动画或高频更新	|不适合固定间隔场景	|动画或高频更新倒计时|
|结合 setTimeout 和偏差校正	|简单易实现，动态调整延迟|	可能受主线程阻塞影响	|通用倒计时|

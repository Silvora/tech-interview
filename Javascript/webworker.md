---
title: Web Worker是什么？
date: 2024-12-20 10:24:28
categories: 
- JavaScript
---

# 面试官：Web Worker是什么？

## Web Worker作用

`Web Worker` 是 `HTML5` 标准的一部分，这一规范定义了一套 `API`，允许我们在 `js` 主线程之外开辟新的 `Worker` 线程，并将一段 js 脚本运行其中，它赋予了开发者利用 `js` 操作多线程的能力。

`Worker` 线程与 `js` 主线程能够同时运行，互不阻塞

虽然 `Worker` 线程是在浏览器环境中被唤起，但是它与当前页面窗口运行在不同的全局上下文中，我们常用的顶层对象 `window`，以及 `parent` 对象在 `Worker` 线程上下文中是不可用的。

在 `Worker` 线程上下文中，操作 `DOM` 的行为也是不可行的，`document`对象也不存在。但是，`location`和`navigator`对象可以以可读方式访问。除此之外，绝大多数 `Window` 对象上的方法和属性，都被共享到 `Worker` 上下文全局对象 `WorkerGlobalScope` 中。同样，`Worker` 线程上下文也存在一个顶级对象 `self`。


## Web Worker使用

创建 `worker` 只需要通过 `new` 调用 `Worker()` 构造函数即可，它接收两个参数

```js
const worker = new Worker(path, options);
// path	有效的js脚本的地址，必须遵守同源策略。无效的js地址或者违反同源策略，会抛出SECURITY_ERR 类型错误

// options.type可选，用以指定 worker 类型。该值可以是 classic 或 module。 如未指定，将使用默认值 classic

// options.credentials可选，用以指定 worker 凭证。该值可以是 omit, same-origin，或 include。如果未指定，或者 type 是 classic，将使用默认值 omit (不要求凭证)

// options.name可选，在 DedicatedWorkerGlobalScope 的情况下，用来表示 worker 的 scope 的一个 DOMString 值，主要用于调试目的。
```

#### 通信

主线程与 `worker` 线程都是通过 `postMessage` 方法来发送消息，以及监听 `message` 事件来接收消息

`postMessage()` 方法接收的参数可以是字符串、对象、数组等

> PS: 主线程与 worker 线程之间的数据传递是传值而不是传地址

```js
// main.js（主线程）

const myWorker = new Worker('/worker.js'); // 创建worker

myWorker.addEventListener('message', e => { // 接收消息
    console.log(e.data); // Greeting from Worker.js，worker线程发送的消息
});

// 这种写法也可以
// myWorker.onmessage = e => { // 接收消息
//    console.log(e.data);
// };

myWorker.postMessage('Greeting from Main.js'); // 向 worker 线程发送消息，对应 worker 线程中的 e.data

```

```js
// worker.js（worker线程）

self.addEventListener('message', e => { // 接收到消息
    console.log(e.data); // Greeting from Main.js，主线程发送的消息
    self.postMessage('Greeting from Worker.js'); // 向主线程发送消息
});

// 当worker内部出现错误时触发
self.addEventListener('error', err => {
    console.log(err.message);
});


// 当 message 事件接收到无法被反序列化的参数时触发
self.addEventListener('messageerror', err => {
    console.log(err.message);
});
```

关闭线程
```js
// main.js（主线程）
const myWorker = new Worker('/worker.js'); // 创建worker
myWorker.terminate(); // 关闭worker


// worker.js（worker线程）
self.close(); // 直接执行close方法就ok了

```

无论是在主线程关闭 `worker`，还是在 `worker` 线程内部关闭 `worker`，`worker` 线程当前的 `Event Loop` 中的任务会继续执行。至于 `worker` 线程下一个 `Event Loop` 中的任务，则会被直接忽略，不会继续执行。

区别是，在主线程手动关闭 `worker`，主线程与 `worker` 线程之间的连接都会被立刻停止，即使 `worker` 线程当前的 `Event Loop` 中仍有待执行的任务继续调用 `postMessage()` 方法，但主线程不会再接收到消息。

在 `worker` 线程内部关闭 `worker`，不会直接断开与主线程的连接，而是等 `worker` 线程当前的 `Event Loop` 所有任务执行完，再关闭。也就是说，在当前 `Event Loop` 中继续调用 `postMessage()` 方法，主线程还是能通过监听`message`事件收到消息的。





## SharedWorker

`SharedWorker` 是一种特殊类型的 `Worker`，可以被多个浏览上下文访问，比如多个 `windows`，`iframes` 和 `workers`，但这些浏览上下文必须同源。它们实现于一个不同于普通 `worker` 的接口，具有不同的全局作用域：`SharedWorkerGlobalScope` ，但是继承自`WorkerGlobalScope`


`SharedWorker` 线程的创建和使用跟 `worker` 类似，事件和方法也基本一样。 不同点在于，主线程与 `SharedWorker` 线程是通过`MessagePort`建立起链接，数据通讯方法都挂载在`SharedWorker.port`上。

值得注意的是，如果你采用 `addEventListener` 来接收 `message` 事件，那么在主线程初始化`SharedWorker()` 后，还要调用 `SharedWorker.port.start()` 方法来手动开启端口。

```js
// main.js（主线程）
const myWorker = new SharedWorker('./sharedWorker.js');

myWorker.port.start(); // 开启端口

myWorker.port.addEventListener('message', msg => {
    console.log(msg.data);
})

```
如果采用 `onmessage` 方法，则默认开启端口，不需要再手动调用`SharedWorker.port.start()`方法
```js
// main.js（主线程）
const myWorker = new SharedWorker('./sharedWorker.js');

myWorker.port.onmessage = msg => {
    console.log(msg.data);
};

```

由于 `SharedWorker` 是被多个页面共同使用，那么除了与各个页面之间的数据通讯是独立的，同一个`SharedWorker` 线程上下文中的其他资源都是共享的。基于这一点，很容易实现不同页面之间的数据通讯。

示例
```js
// index.html
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="utf-8">
        <title>index page</title>
    </head>
    <body>
        <p>index page: </p>
        count: <span id="container">0</span>
        <button id="add">add</button>
        <br>
        // 利用iframe加载
        <iframe src="./iframe.html"></iframe>
    </body>
    <script type="text/javascript">
        if (!!window.SharedWorker) {
            const container = document.getElementById('container');
            const add = document.getElementById('add');
            
            const myWorker = new SharedWorker('./sharedWorker.js');
            
            myWorker.port.start();

            myWorker.port.addEventListener('message', msg => {
                container.innerText = msg.data;
            });

            add.addEventListener('click', () => {
                myWorker.port.postMessage('add');
            });
        }
    </script>
</html>

```
`iframe` 页面的 `reduce` 按钮，每点击一次，向 `sharedWorker` 发送一次 `reduce` 数据，页面`count` 减少`1`
```js
// iframe.html
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="utf-8">
        <title>iframe page</title>
    </head>
    <body>
        <p>iframe page: </p>
        count: <span id="container">0</span>
        <button id="reduce">reduce</button>
    </body>
    <script type="text/javascript">
        if (!!window.SharedWorker) {
            const container = document.getElementById('container');
            const reduce = document.getElementById('reduce');

            const myWorker = new SharedWorker('./sharedWorker.js');

            myWorker.port.start();
            
            myWorker.port.addEventListener('message', msg => {
                container.innerText = msg.data;
            })

            reduce.addEventListener('click', () => {
                myWorker.port.postMessage('reduce');
            });
        }
    </script>
</html>

```

`sharedWorker` 在接收到数据后，根据数据类型处理 `num` 计数，然后返回给每个已连接的主线程。
```js
// sharedWorker.js
let num = 0;
const workerList = [];

self.addEventListener('connect', e => {
    const port = e.ports[0];
    port.addEventListener('message', e => {
        num += e.data === 'add' ? 1 : -1;
        workerList.forEach(port => { // 遍历所有已连接的part，发送消息
            port.postMessage(num);
        })
    });
    port.start();
    workerList.push(port); // 存储已连接的part
    port.postMessage(num); // 初始化
});

```
![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20241227174707528.webp)

#### sharedWorker调试
在 `sharedWorker` 线程里使用 `console` 打印信息，不会出现在主线程的的控制台中。如果你想调试 sharedWorker`，需要在 `Chrome` 浏览器输入 `chrome://inspect/` ，这里能看到所有正在运行的 `sharedWorker`，然后开启一个独立的 `dev-tool` 面板。
![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20241227173032168.webp)
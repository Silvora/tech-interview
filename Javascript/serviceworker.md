---
title: ServiceWorker是什么？
date: 2024-12-20 14:56:31
categories: 
- JavaScript
---

# 面试官：ServiceWorker是什么？

## ServiceWorker作用

`ServiceWorker` 是一个运行在浏览器背后的独立线程，它拥有访问网络的能力，可以用来实现缓存、消息推送、后台自动更新等功能，甚至可以用来实现一个完整的 `Web` 服务器。

主要用于控制页面的缓存和网络请求。它让开发者能够创建更高效、更可靠的网络应用。Service Worker 的主要功能包括以下几个方面：
- 缓存管理：Service Worker 可以缓存关键资源，从而提高应用的加载速度和离线可用性。
- 推送通知：通过 Service Worker，应用可以在后台接收并显示推送通知。
- 后台同步：允许应用在网络连接恢复后自动同步数据。
- 拦截网络请求：可以拦截和处理网络请求，提供更灵活的响应策略。

`ServiceWorker`提供了一个一对一的代理服务器，它可以拦截浏览器的请求，然后根据自己的逻辑来处理这些请求，比如可以直接返回缓存的资源，或者从网络上获取资源，然后将资源缓存起来，再返回给浏览器。

既然作为一个服务器，那么它就拥有着对应的生命周期，它没有传统的服务器那么复杂，它只有两个生命周期，分别是安装和激活，这个状态可以通过`ServiceWorker.state`来获取。

## ServiceWorker使用
`ServiceWorker`的注册是通过`navigator.serviceWorker.register`来完成的

```js
if ('serviceWorker' in navigator) {
    // 第一个参数是ServiceWorker的脚本地址
    // 第二个参数是一个配置对象，目前只有一个属性scope，用来指定ServiceWorker的作用域，它的默认值是ServiceWorker脚本所在目录
    navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
    }).then(function (registration) {
        // 注册成功
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function (err) {
        // 注册失败 :(
        console.log('ServiceWorker registration failed: ', err);
    });
}

```


```js
// service-worker.js
self.addEventListener('install', function (event) {
    console.log('install');
});

self.addEventListener('activate', function (event) {
    console.log('activate');
});

self.addEventListener('fetch', function (event) {
    console.log('fetch');
});

```

## ServiceWorker 生命周期

`Service Worker` 的生命周期主要包括以下几个阶段：
- 安装（`Install`）：当浏览器首次加载 `Service Worker` 时，会触发安装事件。在这个阶段，开发者通常会预缓存一些静态资源
- 激活（`Activate`）：安装完成后，`Service Worker` 会进入激活阶段。在这个阶段，可以清理旧缓存等操作
- 运行（`Running`）：激活后，`Service Worker` 开始拦截网络请求，并根据开发者定义的策略进行响应


#### 安装
安装阶段是在`ServiceWorker`注册成功之后，浏览器开始下载`ServiceWorker`脚本的阶段

这个阶段是一个异步的过程，我们可以在`install`事件中监听它，它的回调函数会接收到一个`event`对象

我们可以通过`event.waitUntil`来监听它的完成状态，当它完成之后，我们需要调用`event.waitUntil`的参数，这个参数是一个`Promise`对象，当这个`Promise`对象完成之后，浏览器才会进入下一个阶段

```js
self.addEventListener('install', function (event) {
    console.log('install');
    event.waitUntil(
        // 这里可以做一些缓存的操作
    );
});

```
> PS: `event.waitUntil`不要乱用，它会阻塞浏览器的安装，如果你的`Promise`对象一直没有完成，那么浏览器就会一直处于安装的状态，这样会影响到浏览器的正常使用。


#### 激活

这个阶段也是一个异步的过程，我们可以在`activate`事件中监听它，它的回调函数会接收到一个`event`对象

```js
self.addEventListener('activate', function (event) {
    console.log('activate');
    event.waitUntil(
        // 这里可以做一些清理缓存的操作
    );
});
```
不同于安装阶段，激活阶段不需要等待`event.waitUntil`的传递的`Promise`对象完成，它会立即进入下一个阶段

但是永远不要传递一个可能一直处于`pending`状态的`Promise`对象，否则会导致`ServiceWorker`一直处在某一个状态而无法响应，导致浏览器卡死


#### 运行
这个阶段是一个长期存在的过程，我们可以在`fetch`事件中监听它，它的回调函数会接收到一个`event`对象；
```js
self.addEventListener('fetch', function (event) {
    console.log('fetch');
});
```
任何请求拦截都是在这个阶段进行的，我们可以在这个阶段中对请求进行拦截，然后返回我们自己的响应。

## ServiceWorker 请求拦截

上面我们已经成功的注册了`ServiceWorker`，并且它已经进入了运行阶段，那么我们就可以在这个阶段中对请求进行拦截了

`ServiceWorker`连插件的请求都拦截，这是因为`ServiceWorker`的优先级是最高的，它会拦截所有的请求，包括插件的请求

插件的请求咱们不用管，现在来看看我们的`ServiceWorker`到底能拦截多少种类型的请求

```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
<!-- 加载外部js，axios -->
<script src="axios.js"></script>
<script>
    // 注册service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        }).then(function (registration) {
            // 注册成功
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(function (err) {
            // 注册失败 :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }

    // 使用axios发送请求
    axios.get('/').then(function (response) {
        console.log('axios 成功');
    });

    // 使用XMLHttpRequest发送请求
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/');
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log('XMLHttpRequest 成功');
        }
    }

    // 使用fetch发送请求
    fetch('/').then(function (response) {
        console.log('fetch 成功');
    });
</script>

</body>
</html>

```

上面的代码中我发送了五个请求，分别是请求`axios.js`，`axios`发送请求，`XMLHttpRequest`发送请求，`fetch`发送请求，最头部还有一个`css`请求

![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20241227181030175.webp)

`ServiceWorker`只进入了`7`次`fetch`事件，也就是说只拦截了`7`次请求，我们可以通过`event.request.url`来查看请求的地址
```js
self.addEventListener('fetch', function (event) {
    console.log('fetch', event.request.url);
});
```


## ServiceWorker 监听事件
上面因为我们只监听了`fetch`事件，所以只有`fetch`请求被拦截了，那么我们可以监听哪些事件呢？

从最开始的生命周期的两个事件，`install`和`activate`，到后面的`fetch`网络请求的，还有其他什么事件呢？

现在就来看看`ServiceWorker`的事件列表：

- `install`：安装事件，当`ServiceWorker`安装成功后，就会触发这个事件，这个事件只会触发一次。
- `activate`：激活事件，当`ServiceWorker`激活成功后，就会触发这个事件，这个事件只会触发一次。
- `fetch`：网络请求事件，当页面发起网络请求时，就会触发这个事件。
- `push`：推送事件，当页面发起推送请求时，就会触发这个事件。
- `sync`：同步事件，当页面发起同步请求时，就会触发这个事件。
- `message`：消息事件，当页面发起消息请求时，就会触发这个事件。
- `messageerror`：消息错误事件，当页面发起消息错误请求时，就会触发这个事件。
- `error`：错误事件，当页面发起错误请求时，就会触发这个事件。


> PS: 翻了很多资料，`ServiceWorker`还可以监听`notification`事件


## ServiceWorker 缓存

缓存是我们日常开发中经常会用到的一个功能，`ServiceWorker`也提供了缓存的功能，我们可以通过`ServiceWorker`来缓存我们的静态资源，这样就可以离线访问我们的页面了。

`ServiceWorker`的缓存是基于`CacheStorage`的，它是一个`Promise`对象，我们可以通过`caches`来获取它；

```js
caches.open('my-cache').then(function (cache) {
    // 这里可以做一些缓存的操作
});
```

`CacheStorage`提供了一些方法，我们可以通过这些方法来对缓存进行操作；
```js
// 添加缓存
caches.open('my-cache').then(function (cache) {
    cache.put(new Request('/'), new Response('Hello World'));
});

// 获取缓存
caches.open('my-cache').then(function (cache) {
    cache.match('/').then(function (response) {
        console.log(response);
    });
});

// 删除缓存
caches.open('my-cache').then(function (cache) {
    cache.delete('/').then(function () {
        console.log('删除成功');
    });
});

// 清空缓存
caches.open('my-cache').then(function (cache) {
    cache.keys().then(function (keys) {
        keys.forEach(function (key) {
            cache.delete(key);
        });
    });
});


```

## ServiceWorker 缓存策略

`ServiceWorker`的缓存策略是基于`fetch`事件的，我们可以在`fetch`事件中监听请求，然后对请求进行拦截，然后返回我们自己的响应；

```js
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

```
上面的代码是一个最简单的缓存策略，它会先从缓存中获取请求，如果缓存中没有请求，那么就会从网络中获取请求；


#### 缓存资源

通常我们会在`install`事件中缓存一些资源，因为`install`事件只会触发一次，并且会阻塞`activate`事件，所以我们可以在`install`事件中缓存一些资源，然后在`activate`事件中删除一些旧的资源；

```js
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('my-cache').then(function (cache) {
            return cache.addAll([
                '/',
                '/index.css',
                '/axios.js',
                '/index.html'
            ]);
        })
    );
});
```
上面的代码中我们缓存了刚才提到的所有资源，缓存了之后当然是使用缓存的资源了，所以我们可以在`fetch`事件中返回缓存的资源；

使用`caches.match`来匹配请求，如果匹配到了，那么就返回缓存的资源，如果没有匹配到，那么就从网络中获取资源，这也就是我们刚才提到的缓存策略：缓存优先


#### 缓存更新
通常情况下，我们会在`activate`事件中删除旧的缓存，然后在`install`事件中缓存新的资源；
```js
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== 'my-cache') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
```
如果你想看缓存在哪里，可以在`Application`中的`Cache Storage`中查看

![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20241227181800242.webp)



---
title: GET 和 POST 的区别？
date: 2023-03-08 22:48:16
categories: 
- HTTP
---

# 面试官：说一下 GET 和 POST 的区别？

 ![](https://static.vue-js.com/6e8d19e0-bc3d-11eb-ab90-d9ae814b240d.png)



## 一、是什么

`GET`和`POST`，两者是`HTTP`协议中发送请求的方法

#### GET

`GET`方法请求一个指定资源的表示形式，使用GET的请求应该只被用于获取数据

#### POST
`POST`方法用于将实体提交到指定的资源，通常导致在服务器上的状态变化或**副作用**

本质上都是`TCP`链接，并无差别

但是由于`HTTP`的规定和浏览器/服务器的限制，导致他们在应用过程中会体现出一些区别

## 二、区别

从`w3schools`得到的标准答案的区别如下：

- GET在浏览器回退时是无害的，而POST会再次提交请求。
- GET产生的URL地址可以被Bookmark，而POST不可以。
- GET请求会被浏览器主动cache，而POST不会，除非手动设置。
- GET请求只能进行url编码，而POST支持多种编码方式。
- GET请求参数会被完整保留在浏览器历史记录里，而POST中的参数不会被保留。
- GET请求在URL中传送的参数是有长度限制的，而POST没有。
- 对参数的数据类型，GET只接受ASCII字符，而POST没有限制。
- GET比POST更不安全，因为参数直接暴露在URL上，所以不能用来传递敏感信息。
- GET参数通过URL传递，POST放在Request body中


### 参数位置

貌似从上面看到`GET`与`POST`请求区别非常大，但两者实质并没有区别

无论 `GET `还是 `POST`，用的都是同一个传输层协议，所以在传输上没有区别

当不携带参数的时候，两者最大的区别为第一行方法名不同

> POST /uri HTTP/1.1 \r\n
>
> GET /uri HTTP/1.1 \r\n

当携带参数的时候，我们都知道`GET`请求是放在`url`中，`POST`则放在`body`中

`GET` 方法简约版报文是这样的

```
GET /index.html?name=qiming.c&age=22 HTTP/1.1
Host: localhost
```

`POST `方法简约版报文是这样的

```
POST /index.html HTTP/1.1
Host: localhost
Content-Type: application/x-www-form-urlencoded

name=qiming.c&age=22
```

注意：这里只是约定，并不属于`HTTP`规范，相反的，我们可以在`POST`请求中`url`中写入参数，或者`GET`请求中的`body`携带参数


### 参数长度

`HTTP `协议没有` Body `和 `URL` 的长度限制，对 `URL `限制的大多是浏览器和服务器的原因

`IE`对`URL`长度的限制是2083字节(2K+35)。对于其他浏览器，如Netscape、FireFox等，理论上没有长度限制，其限制取决于操作系统的支持

这里限制的是整个`URL`长度，而不仅仅是参数值的长度

服务器处理长` URL` 要消耗比较多的资源，为了性能和安全考虑，会给 `URL` 长度加限制

### 安全

`POST `比` GET` 安全，因为数据在地址栏上不可见

然而，从传输的角度来说，他们都是不安全的，因为` HTTP` 在网络上是明文传输的，只要在网络节点上捉包，就能完整地获取数据报文

只有使用`HTTPS`才能加密安全


### 数据包

对于`GET`方式的请求，浏览器会把`http header`和`data`一并发送出去，服务器响应200（返回数据）

对于`POST`，浏览器先发送`header`，服务器响应100 `continue`，浏览器再发送`data`，服务器响应200 ok

现代浏览器（如 `Chrome`、`Edge`、`Firefox`）默认不会使用 `Expect: 100-continue`，除非遇到特定的情况，如：
- 请求体较大（比如上传大文件）。
- 明确设置了 `Expect: 100-continue` 头。


### 预检请求(option)
并不是所有 POST 请求都会触发预检请求，只有当请求 不符合 “简单请求” 的标准时，浏览器才会发送 OPTIONS 预检请求。

根据 CORS 规范，符合以下条件的请求才算“简单请求”（不会触发预检请求）：
- 请求方法必须是以下之一：
  - GET
  - HEAD
  - POST
- 请求头（Headers）必须满足以下要求：
  - 仅允许 Accept、Accept-Language、Content-Language、Content-Type、DPR、Downlink、Save-Data、Viewport-Width、Width
  - Content-Type 只能是：
    - application/x-www-form-urlencoded
    - multipart/form-data
    - text/plain
- 请求中不能使用 XMLHttpRequest 或 fetch 的一些特殊功能：
  - 不能手动设置 Authorization 头（比如 Bearer token）。
  - 不能使用 custom headers（如 X-My-Custom-Header）。
  - 不能发送 application/json（因为 application/json 不属于简单请求的 Content-Type）。


## 参考文献

- https://mp.weixin.qq.com/s?__biz=MzI3NzIzMzg3Mw==&mid=100000054&idx=1&sn=71f6c214f3833d9ca20b9f7dcd9d33e4#rd
- https://blog.fundebug.com/2019/02/22/compare-http-method-get-and-post/
- https://www.w3school.com.cn/tags/html_ref_httpmethods.asp
- https://vue3js.cn/interview
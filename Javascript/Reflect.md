---
title: 说下你对 Reflect 的理解？
date: 2023-01-07 11:39:04
categories: 
- JavaScript
---

# 面试官：说下你对 Reflect 的理解？


## 一、特点

`Reflect` 是 `ES6` 引入的一个内置对象，提供了与 `JavaScript` 操作相关的方法。它的设计目的是为了更规范、更统一地操作对象，取代一些传统的、不够一致的 `Object` 方法。`Reflect` 的方法与 `Proxy` 的陷阱方法一一对应，使得 `Proxy` 可以更方便地拦截和自定义对象操作。

`Reflect` 的主要特点包括：

- **统一性**：`Reflect` 提供了一组标准的方法来操作对象，避免了以往 `Object` 方法的不一致性。

- **函数式风格**：`Reflect` 的方法都是函数，而非 `Object` 的静态方法，使用起来更一致。

- **返回值**：`Reflect` 的方法通常返回布尔值或操作结果，便于错误处理和流程控制。


#### 为什么会有 Reflect 的出现？
`Reflect` 的出现主要有以下原因：

- **规范化**：`JavaScript` 早期的对象操作方法（如 `Object.defineProperty`、`Object.getPrototypeOf` 等）设计不一致，`Reflect` 提供了更统一的 `API`。

- **与 Proxy 配合**：`Reflect` 的方法与 `Proxy` 的陷阱方法一一对应，方便在 `Proxy` 中调用默认行为。

- **函数式风格**：`Reflect` 的方法更适合函数式编程，避免了 `Object` 方法中一些设计上的问题。
  
```js
const target = {
  name: "Alice",
  age: 25
};

const handler = {
  get(target, prop, receiver) {
    console.log(`Getting ${prop}`);
    return Reflect.get(target, prop, receiver); // 调用默认行为
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${prop} to ${value}`);
    return Reflect.set(target, prop, value, receiver); // 调用默认行为
  }
};

const proxy = new Proxy(target, handler);

proxy.name; // 输出: Getting name
proxy.age = 30; // 输出: Setting age to 30
```


## 二、Reflect 的使用方法

获取对象的属性值: `Reflect.get(target, propertyKey[, receiver])`

```js
const obj = { name: "Alice" };
console.log(Reflect.get(obj, "name")); // 输出: Alice
```

设置对象的属性值: `Reflect.set(target, propertyKey, value[, receiver])`

```js
const obj = { name: "Alice" };
Reflect.set(obj, "name", "Bob");
console.log(obj.name); // 输出: Bob
```

检查对象是否包含某个属性: `Reflect.has(target, propertyKey)`

```js
const obj = { name: "Alice" };
console.log(Reflect.has(obj, "name")); // 输出: true
console.log(Reflect.has(obj, "age")); // 输出: false
```

删除对象的属性: `Reflect.deleteProperty(target, propertyKey)`

```js
const obj = { name: "Alice", age: 25 };
Reflect.deleteProperty(obj, "age");
console.log(obj); // 输出: { name: "Alice" }
```

类似于 `new` 操作符，用于调用构造函数: `Reflect.construct(target, argumentsList[, newTarget])`

```js
function Person(name) {
  this.name = name;
}
const instance = Reflect.construct(Person, ["Alice"]);
console.log(instance.name); // 输出: Alice
```


调用函数，类似于 `Function.prototype.apply: Reflect.apply(target, thisArgument, argumentsList)`

```js
function greet(name) {
  return `Hello, ${name}!`;
}
console.log(Reflect.apply(greet, null, ["Alice"])); // 输出: Hello, Alice!
```

定义对象的属性: `Reflect.defineProperty(target, propertyKey, attributes)`

```js
const obj = {};
Reflect.defineProperty(obj, "name", { value: "Alice" });
console.log(obj.name); // 输出: Alice
```


获取对象的原型: `Reflect.getPrototypeOf(target)`

```js
const obj = {};
console.log(Reflect.getPrototypeOf(obj) === Object.prototype); // 输出: true
```


设置对象的原型: `Reflect.setPrototypeOf(target, prototype)`

```js
const obj = {};
Reflect.setPrototypeOf(obj, { greet: () => "Hello" });
console.log(obj.greet()); // 输出: Hello
```

检查对象是否可扩展: `Reflect.isExtensible(target)`

```js
const obj = {};
console.log(Reflect.isExtensible(obj)); // 输出: true
```


阻止对象扩展: `Reflect.preventExtensions(target)`

```js
const obj = {};
Reflect.preventExtensions(obj);
console.log(Reflect.isExtensible(obj)); // 输出: false
```


获取对象的所有属性键（包括 `Symbol` 属性）: `Reflect.ownKeys(target)`

```js
const obj = { name: "Alice", [Symbol("id")]: 123 };
console.log(Reflect.ownKeys(obj)); // 输出: ["name", Symbol(id)]
```

## 总结

使用方法：`Reflect` 提供了一系列方法用于操作对象，如 `get`、`set`、`has`、`deleteProperty` 等。

原理：`Reflect` 的设计目的是统一对象操作、支持函数式风格、与 `Proxy` 配合使用，并提供更合理的返回值。

适用场景：`Reflect` 常用于与 `Proxy` 配合实现元编程，或者替代传统的 `Object` 方法以增强代码的一致性和可读性。
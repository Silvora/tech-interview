---
title: Vue2的响应式数据理解
date: 2023-02-23 23:49:37
categories: 
- Vue
---

# Vue2的响应式数据理解

## 对象

- 可以监控一个数据的修改和获取

- 针对对象每个对象的属性进行劫持，对象递归劫持，数组重写方法

- vu2使用defineProperty，vue3使用proxy进行对象劫持

- initData -> observe -> defineReactive

  **缺点**

  - 内部重写，性能低
  - 层级过深，考虑优化
  - 不是响应式不放在data，考虑object.freeze()冻结对象
  - 避免多次取值

## 数组

- 用defineProperty浪费性能（修改索引）
- 重写数组（7个）'push',  'pop', 'shift', 'unshift', 'splice', 'sort','reverse'方法
- 对数组更新会重写
- 修改索引和长度无法劫持




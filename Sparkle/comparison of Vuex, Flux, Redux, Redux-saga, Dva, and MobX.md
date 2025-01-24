---
title: Vuex、Flux、Redux、Redux-saga、Dva、MobX?
date: 2022-11-23 10:04:44
categories: 
- Sparkle
---

# 面试官：Vuex、Flux、Redux、Redux-saga、Dva、MobX 对比?


## 一、概念

> 一切前端概念，都是纸老虎

不管是Vue，还是 React，都需要管理状态（state），比如组件之间都有共享状态的需要。什么是共享状态？比如一个组件需要使用另一个组件的状态，或者一个组件需要改变另一个组件的状态，都是共享状态


#### Store 模式
最简单的处理就是把状态存到一个外部变量里面，比如：`this.$root.$data`，当然也可以是一个全局变量。但是这样有一个问题，就是数据改变后，不会留下变更过的记录，这样不利于调试。

所以我们稍微搞得复杂一点，用一个简单的 Store 模式:
```js

var store = {
  state: {
    message: 'Hello!'
  },
  setMessageAction (newValue) {
    // 发生改变记录点日志啥的
    this.state.message = newValue
  },
  clearMessageAction () {
    this.state.message = ''
  }
}
```

`store` 的 `state` 来存数据，`store` 里面有一堆的 `action`，这些 `action` 来控制 `state` 的改变，也就是不直接去对 `state` 做改变，而是通过 `action` 来改变，因为都走 `action`，我们就可以知道到底改变`（mutation）`是如何被触发的，出现错误，也可以记录记录日志

![](https://picx.zhimg.com/v2-9f751fb87f2512d9e907f7e226d8e271_1440w.jpg)



 
#### Flux 思想

`Flux`其实是一种思想，就像`MVC`，`MVVM`之类的，他给出了一些基本概念，所有的框架都可以根据他的思想来做一些实现

`Flux`把一个应用分成了4个部分： `View` `Action` `Dispatcher` `Store`

![](https://pic2.zhimg.com/v2-fb6a545f55dac505d0ded33fa2284bc5_1440w.jpg)

> Flux的最大特点就是数据都是单向流动的


## 二、Redux

#### 流程
![](https://picx.zhimg.com/v2-9e7e7d6b492706746ba19845bd559963_1440w.jpg)

#### 对比`Flux`
`Flux` 中 `Store` 是各自为战的，每个 `Store` 只对对应的 `View` 负责，每次更新都只通知对应的View：

![](https://pic1.zhimg.com/v2-4f3428e4dbb2e0c5b1988275b82da14e_1440w.jpg)


`Redux` 中各子 `Reducer` 都是由根 `Reducer` 统一管理的，每个子 `Reducer` 的变化都要经过根 `Reducer` 的整合：

![](https://picx.zhimg.com/v2-3eea040acf4cd03884ba3e903b936425_1440w.jpg)

简单来说，`Redux`有三大原则： 单一数据源：`Flux` 的数据源可以是多个。 `State` 是只读的：`Flux` 的 `State` 可以随便改。 * 使用纯函数来执行修改：`Flux` 执行修改的不一定是纯函数。

> Redux 和 Flux 一样都是单向数据流


## Vuex

#### 流程

![](https://pic3.zhimg.com/v2-1b21813cd1d621658fe7402f0af4b104_1440w.jpg)

其实可以感觉到 `Flux`、`Redux`、`Vuex` 三个的思想都差不多，在具体细节上有一些差异，总的来说都是让 `View` 通过某种方式触发 `Store` 的事件或方法，`Store` 的事件或方法对 `State` 进行修改或返回一个新的 `State`，`State` 改变之后，`View` 发生响应式改变


## MobX

前面扯了这么多，其实还都是 `Flux` 体系的，都是单向数据流方案。接下来要说的 `MobX`，就和他们不太一样了。

我们先清空一下大脑，回到初心，什么是初心？就是我们最初要解决的问题是什么？最初我们其实为了解决应用状态管理的问题，不管是 `Redux` 还是 `MobX`，把状态管理好是前提。什么叫把状态管理好，简单来说就是：统一维护公共的应用状态，以统一并且可控的方式更新状态，状态更新后，View跟着更新。不管是什么思想，达成这个目标就`ok`。

`Flux` 体系的状态管理方式，只是一个选项，但并不代表是唯一的选项。`MobX` 就是另一个选项。

`MobX`背后的哲学很简单：`任何源自应用状态的东西都应该自动地获得`。译成人话就是状态只要一变，其他用到状态的地方就都跟着自动变。

![](https://pic2.zhimg.com/v2-fe37245ce0be3d15fcc4afdbb6cc7e31_1440w.jpg)


`Flux` 或者说 `Redux` 的思想主要就是函数式编程`（FP）`的思想，所以学习起来会觉得累一些。而 `MobX` 更接近于面向对象编程，它把 `state` 包装成可观察的对象，这个对象会驱动各种改变。什么是可观察？就是 `MobX` 老大哥在看着 `state` 呢。`state` 只要一改变，所有用到它的地方就都跟着改变了。这样整个 `View` 可以被 `state` 来驱动

```js
const obj = observable({
    a: 1,
    b: 2
})

autoRun(() => {
    console.log(obj.a)
})

obj.b = 3 // 什么都没有发生
obj.a = 2 // observe 函数的回调触发了，控制台输出：2
```

#### 对比
但其实 `Redux` 和 `MobX` 并没有孰优孰劣，`Redux` 比 `Mobx` 更多的样板代码，是因为特定的设计约束。如果项目比较小的话，使用 `MobX` 会比较灵活，但是大型项目，像 `MobX` 这样没有约束，没有最佳实践的方式，会造成代码很难维护，各有利弊。一般来说，小项目建议 `MobX` 就够了，大项目还是用 `Redux` 比较合适
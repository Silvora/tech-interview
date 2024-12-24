---
title: 对vue生命周期的理解？
date: 2023-02-23 23:49:37
categories: 
- Vue
---

#  面试官：请描述下你对vue生命周期的理解？在created和mounted这两个生命周期中请求数据有什么区别呢？

![](https://static.vue-js.com/3a119e10-3aca-11eb-85f6-6fac77c0c9b3.png)

## 一、生命周期是什么  

生命周期`（Life Cycle）`的概念应用很广泛，特别是在政治、经济、环境、技术、社会等诸多领域经常出现，其基本涵义可以通俗地理解为“从摇篮到坟墓”`（Cradle-to-Grave）`的整个过程在`Vue`中实例从创建到销毁的过程就是生命周期，即指从创建、初始化数据、编译模板、挂载Dom→渲染、更新→渲染、卸载等一系列过程我们可以把组件比喻成工厂里面的一条流水线，每个工人（生命周期）站在各自的岗位，当任务流转到工人身边的时候，工人就开始工作PS：在`Vue`生命周期钩子会自动绑定 `this` 上下文到实例中，因此你可以访问数据，对 `property` 和方法进行运算这意味着**你不能使用箭头函数来定义一个生命周期方法** \(例如 `created: () => this.fetchTodos()`\)

## 二、生命周期有哪些

Vue生命周期总共可以分为8个阶段：创建前后, 载入前后,更新前后,销毁前销毁后，以及一些特殊场景的生命周期

| 生命周期 | 描述 |
| :-- | :-- |
| beforeCreate | 组件实例被创建之初 |
| created | 组件实例已经完全创建 |
| beforeMount | 组件挂载之前 |
| mounted | 组件挂载到实例上去之后 |
| beforeUpdate | 组件数据发生变化，更新之前 |
| updated | 组件数据更新之后 |
| beforeDestroy | 组件实例销毁之前 |
| destroyed | 组件实例销毁之后 |
| activated | keep-alive 缓存的组件激活时 |
| deactivated | keep-alive 缓存的组件停用时调用 |
| errorCaptured | 捕获一个来自子孙组件的错误时被调用 |

## 三、生命周期整体流程

`Vue`生命周期流程图

 ![](https://static.vue-js.com/44114780-3aca-11eb-85f6-6fac77c0c9b3.png)

#### 具体分析

**beforeCreate -> created**

- 初始化`vue`实例，进行数据观测

**created**

- 完成数据观测，属性与方法的运算，`watch`、`event`事件回调的配置
- 可调用`methods`中的方法，访问和修改data数据触发响应式渲染`dom`，可通过`computed`和`watch`完成数据计算
- 此时`vm.$el` 并没有被创建

**created -> beforeMount**

- 判断是否存在`el`选项，若不存在则停止编译，直到调用`vm.$mount(el)`才会继续编译
- 优先级：`render` > `template` > `outerHTML`
- `vm.el`获取到的是挂载`DOM`的

**beforeMount**

- 在此阶段可获取到`vm.el`
- 此阶段`vm.el`虽已完成DOM初始化，但并未挂载在`el`选项上

**beforeMount -> mounted**

- 此阶段`vm.el`完成挂载，`vm.$el`生成的`DOM`替换了`el`选项所对应的`DOM`

**mounted**

- `vm.el`已完成`DOM`的挂载与渲染，此刻打印`vm.$el`，发现之前的挂载点及内容已被替换成新的DOM

**beforeUpdate**

- 更新的数据必须是被渲染在模板上的（`el`、`template`、`render`之一）
- 此时`view`层还未更新
- 若在`beforeUpdate`中再次修改数据，不会再次触发更新方法

**updated**

- 完成`view`层的更新
- 若在`updated`中再次修改数据，会再次触发更新方法（`beforeUpdate`、`updated`）

**beforeDestroy**

- 实例被销毁前调用，此时实例属性与方法仍可访问

**destroyed**

- 完全销毁一个实例。可清理它与其它实例的连接，解绑它的全部指令及事件监听器
- 并不能清除DOM，仅仅销毁实例

  

**使用场景分析**

  

| 生命周期 | 描述 |
| :-- | :-- |
| beforeCreate | 执行时组件实例还未创建，通常用于插件开发中执行一些初始化任务 |
| created | 组件初始化完毕，各种数据可以使用，常用于异步数据获取 |
| beforeMount | 未执行渲染、更新，dom未创建 |
| mounted | 初始化结束，dom已创建，可用于获取访问数据和dom元素 |
| beforeUpdate | 更新前，可用于获取更新前各种状态 |
| updated | 更新后，所有状态已是最新 |
| beforeDestroy | 销毁前，可用于一些定时器或订阅的取消 |
| destroyed | 组件已销毁，作用同上 |

## 四、题外话：数据请求在created和mouted的区别

`created`是在组件实例一旦创建完成的时候立刻调用，这时候页面`dom`节点并未生成；`mounted`是在页面`dom`节点渲染完毕之后就立刻执行的。触发时机上`created`是比`mounted`要更早的，两者的相同点：都能拿到实例对象的属性和方法。
讨论这个问题本质就是触发的时机，放在`mounted`中的请求有可能导致页面闪动（因为此时页面`dom`结构已经生成），但如果在页面加载前完成请求，则不会出现此情况。建议对页面内容的改动放在`created`生命周期当中。


## 五、vue3的生命周期
- `onBeforeMount()`: 注册一个钩子，在组件被挂载之前被调用。
- `onMounted()`: 注册一个回调函数，在组件挂载完成后执行。
- `onBeforeUpdate()`: 注册一个钩子，在组件即将因为响应式状态变更而更新其 `DOM` 树之前调用。
- `onUpdated()`: 注册一个回调函数，在组件因为响应式状态变更而更新其 DOM 树之后调用。
- `onActivated()`: 注册一个回调函数，若组件实例是 `<KeepAlive>` 缓存树的一部分，当组件被插入到 DOM 中时调用。
- `onDeactivated()`: 注册一个回调函数，若组件实例是 `<KeepAlive>` 缓存树的一部分，当组件从 DOM 中被移除时调用。
- `onBeforeUnmount()`: 注册一个钩子，在组件实例被卸载之前调用。
- `onUnmounted()`: 注册一个回调函数，在组件实例被卸载之后调用。
- `onErrorCaptured()`: 注册一个钩子，在捕获了后代组件传递的错误时调用。
- `onRenderTracked()`: 注册一个调试钩子，当组件渲染过程中追踪到响应式依赖时调用(仅在开发模式下可用)。
- `onRenderTriggered()`: 注册一个调试钩子，当响应式依赖的变更触发了组件渲染时调用(仅在开发模式下可用)。
- `onServerPrefetch()`: 注册一个异步函数，在组件实例在服务器上被渲染之前调用(ssr)。

`vue3`为什么没有`created`?
`created` 生命周期钩子函数并没有完全消失，而是被整合到了 `setup()` 函数中。理解这一点需要先了解 `Vue 3` 中 `Composition API` 的引入以及 `setup()` 函数的作用

关键在于 `setup()` 的执行时机。它在 `beforeCreate` 之前执行。这意味着在 `setup()` 内部，组件实例 已经 被创建，但组件的 `data`、`methods` 等选项 尚未 被处理

由于 `setup()` 的执行时机早于这两者，所以在 `setup()` 内部执行的逻辑，实际上就包含了 `beforeCreate` 和 `created` 的功能。换句话说，你可以在 `setup()` 中执行所有原本在 `beforeCreate` 和 `created` 中执行的操作

## 参考文献

- https://juejin.cn/post/6844903811094413320
- https://baike.baidu.com/
- http://cn.vuejs.org/

  

面试官VUE系列总进度：4／33

[面试官：说说你对vue的理解\?](http://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247484101&idx=1&sn=83b0983f0fca7d7c556e4cb0bff8c9b8&chksm=fc10c093cb674985ef3bd2966f66fc28c5eb70b0037e4be1af4bf54fb6fa9571985abd31d52f&scene=21#wechat_redirect)  

[面试官：说说你对SPA（单页应用）的理解\?](http://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247484119&idx=1&sn=d171b28a00d42549d279498944a98519&chksm=fc10c081cb6749976814aaeda6a6433db418223cec57edda7e15b9e5a0ca69ad549655639c61&scene=21#wechat_redirect)

[面试官：说说你对双向绑定的理解\?](http://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247484167&idx=1&sn=7b00b4333ab2722f25f12586b70667ca&chksm=fc10c151cb6748476008dab2f4e6c6264f5d19678305955c85cec1b619e56e8f7457b7357fb9&scene=21#wechat_redirect)  

![](https://static.vue-js.com/821b87b0-3ac6-11eb-ab90-d9ae814b240d.png)

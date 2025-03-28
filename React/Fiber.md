---
title: 对Fiber架构的理解？
date: 2023-02-16 23:09:26
categories: 
- React
---

# 面试官：说说对Fiber架构的理解？解决了什么问题？

 ![](https://static.vue-js.com/554da6d0-ed24-11eb-85f6-6fac77c0c9b3.png)


## 一、问题

`JavaScript `引擎和页面渲染引擎两个线程是互斥的，当其中一个线程执行时，另一个线程只能挂起等待
> **JavaScript引擎：** 负责执行JavaScript代码。
> **渲染引擎：** 负责解析HTML、CSS，构建DOM树、CSSOM树，布局和绘制页面。
>
> 它们通常运行在同一个线程（主线程）中，但现代浏览器采用了更复杂的机制来优化性能。
>
> 它们不是严格互斥的？
> - **事件循环机制：** 浏览器通过事件循环（Event Loop）来调度任务。JavaScript代码和渲染任务都被分解为更小的任务，交替执行。
>   - 当JavaScript代码运行时，渲染任务会被暂时挂起。
>   - 当JavaScript代码执行完成后，渲染引擎会继续工作（例如重新计算样式、布局、绘制等）。
> - **异步任务：** JavaScript中的异步任务（如setTimeout、Promise、fetch等）不会阻塞渲染引擎。浏览器会在适当的时机执行这些任务，同时允许渲染引擎继续工作。
>
> 什么情况下会“互斥”？
> - **长时间运行的JavaScript代码：** 如果JavaScript代码执行时间过长（例如复杂的计算或同步阻塞操作），会导致渲染任务被延迟，页面出现卡顿。
> - **强制同步布局（Forced Synchronous Layout）：** 如果在JavaScript中频繁读取布局属性（如offsetWidth、offsetHeight等），会强制渲染引擎立即重新计算布局，导致性能问题。
>
>
> 现代浏览器的优化
> - **多线程支持：** 现代浏览器利用多线程技术（如Web Worker）将一些任务（如JavaScript计算）放到后台线程中执行，避免阻塞主线程。
> - **增量渲染：** 浏览器会将渲染任务分解为多个小任务，逐步完成，避免长时间阻塞。
>
>
> 总结
> - **不完全互斥：** JavaScript引擎和渲染引擎并不是严格互斥的，它们通过事件循环机制交替执行任务。
> - **可能阻塞：** 如果JavaScript代码执行时间过长，会阻塞渲染引擎，导致页面卡顿。
> - **优化手段：** 通过异步编程、Web Worker、避免强制同步布局等方式，可以减少阻塞，提升性能。


如果 `JavaScript` 线程长时间地占用了主线程，那么渲染层面的更新就不得不长时间地等待，界面长时间不更新，会导致页面响应度变差，用户可能会感觉到卡顿

而这也正是 `React 15` 的 `Stack Reconciler `所面临的问题，当 `React `在渲染组件时，从开始到渲染完成整个过程是一气呵成的，无法中断

如果组件较大，那么`js`线程会一直执行，然后等到整棵`VDOM`树计算完成后，才会交给渲染的线程

这就会导致一些用户交互、动画等任务无法立即得到处理，导致卡顿的情况

 ![](https://static.vue-js.com/5eb3a850-ed24-11eb-ab90-d9ae814b240d.png)



## 二、是什么

React Fiber 是 Facebook 花费两年余时间对 React 做出的一个重大改变与优化，是对 React 核心算法的一次重新实现。从Facebook在 React Conf 2017 会议上确认，React Fiber 在React 16 版本发布

在`react`中，主要做了以下的操作：

- 为每个增加了优先级，优先级高的任务可以中断低优先级的任务。然后再重新，注意是重新执行优先级低的任务
- 增加了异步任务，调用requestIdleCallback api，浏览器空闲的时候执行
- dom diff树变成了链表，一个dom对应两个fiber（一个链表），对应两个队列，这都是为找到被中断的任务，重新执行

从架构角度来看，`Fiber` 是对 `React `核心算法（即调和过程）的重写

从编码角度来看，`Fiber `是 `React `内部所定义的一种数据结构，它是 `Fiber `树结构的节点单位，也就是 `React 16` 新架构下的虚拟`DOM`

一个 `fiber `就是一个 `JavaScript `对象，包含了元素的信息、该元素的更新操作队列、类型，其数据结构如下：

```js
type Fiber = {
  // 用于标记fiber的WorkTag类型，主要表示当前fiber代表的组件类型如FunctionComponent、ClassComponent等
  tag: WorkTag,
  // ReactElement里面的key
  key: null | string,
  // ReactElement.type，调用`createElement`的第一个参数
  elementType: any,
  // The resolved function/class/ associated with this fiber.
  // 表示当前代表的节点类型
  type: any,
  // 表示当前FiberNode对应的element组件实例
  stateNode: any,

  // 指向他在Fiber节点树中的`parent`，用来在处理完这个节点之后向上返回
  return: Fiber | null,
  // 指向自己的第一个子节点
  child: Fiber | null,
  // 指向自己的兄弟结构，兄弟节点的return指向同一个父节点
  sibling: Fiber | null,
  index: number,

  ref: null | (((handle: mixed) => void) & { _stringRef: ?string }) | RefObject,

  // 当前处理过程中的组件props对象
  pendingProps: any,
  // 上一次渲染完成之后的props
  memoizedProps: any,

  // 该Fiber对应的组件产生的Update会存放在这个队列里面
  updateQueue: UpdateQueue<any> | null,

  // 上一次渲染的时候的state
  memoizedState: any,

  // 一个列表，存放这个Fiber依赖的context
  firstContextDependency: ContextDependency<mixed> | null,

  mode: TypeOfMode,

  // Effect
  // 用来记录Side Effect
  effectTag: SideEffectTag,

  // 单链表用来快速查找下一个side effect
  nextEffect: Fiber | null,

  // 子树中第一个side effect
  firstEffect: Fiber | null,
  // 子树中最后一个side effect
  lastEffect: Fiber | null,

  // 代表任务在未来的哪个时间点应该被完成，之后版本改名为 lanes
  expirationTime: ExpirationTime,

  // 快速确定子树中是否有不在等待的变化
  childExpirationTime: ExpirationTime,

  // fiber的版本池，即记录fiber更新过程，便于恢复
  alternate: Fiber | null,
}
```



## 三、如何解决

`Fiber`把渲染更新过程拆分成多个子任务，每次只做一小部分，做完看是否还有剩余时间，如果有继续下一个任务；如果没有，挂起当前任务，将时间控制权交给主线程，等主线程不忙的时候在继续执行

即可以中断与恢复，恢复后也可以复用之前的中间状态，并给不同的任务赋予不同的优先级，其中每个任务更新单元为 `React Element` 对应的 `Fiber `节点

实现的上述方式的是`requestIdleCallback`方法

`window.requestIdleCallback()`方法将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应

首先 React 中任务切割为多个步骤，分批完成。在完成一部分任务之后，将控制权交回给浏览器，让浏览器有时间再进行页面的渲染。等浏览器忙完之后有剩余时间，再继续之前 React 未完成的任务，是一种合作式调度。

该实现过程是基于 `Fiber `节点实现，作为静态的数据结构来说，每个 `Fiber` 节点对应一个 `React element`，保存了该组件的类型（函数组件/类组件/原生组件等等）、对应的 DOM 节点等信息。

作为动态的工作单元来说，每个 `Fiber` 节点保存了本次更新中该组件改变的状态、要执行的工作。

每个 Fiber 节点有个对应的 `React element`，多个 `Fiber `节点根据如下三个属性构建一颗树：

```javascript
// 指向父级Fiber节点
this.return = null
// 指向子Fiber节点
this.child = null
// 指向右边第一个兄弟Fiber节点
this.sibling = null
```
通过这些属性就能找到下一个执行目标


## 参考文献

- https://juejin.cn/post/6926432527980691470
- https://zhuanlan.zhihu.com/p/137234573
- https://vue3js.cn/interview
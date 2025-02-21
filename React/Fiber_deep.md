---
title: Fiber核心原理？
date: 2025-02-16 23:09:26
categories: 
- React
---

# 面试官：说说Fiber核心原理？



## 一、核心原理

`Fiber` 是 `React` 的新的协调引擎，核心目标是实现增量渲染，即将渲染工作拆分为多个小任务，允许 `React` 在每帧之间处理任务，避免长时间占用主线程，提升用户体验。

- **可中断的渲染：** `Fiber` 允许 `React` 在渲染过程中中断任务，处理更高优先级的更新（如用户输入），之后再恢复之前的任务。

- **优先级调度：** `Fiber` 引入了优先级机制，`React` 根据任务的紧急程度（如用户交互、动画等）动态调整任务执行顺序。

- **双缓存机制：** `Fiber` 使用双缓存技术，维护两棵 `Fiber` 树：当前树（`current Tree`）和工作树（`workInProgress Tree`）。`React` 在工作树上进行更新，完成后替换当前树，减少界面闪烁。

> 双缓存技术是一种常见的图形渲染优化技术，通过维护两个缓冲区（当前帧和下一帧）来避免渲染过程中的闪烁问题。React 借鉴了这一思想，将其应用到 Fiber 树的渲染中。
> 
> 当前树（Current Tree）：
> - 当前树是已经渲染到屏幕上的 Fiber 树。
> - 它代表了当前的 UI 状态。
> 
> 工作树（WorkInProgress Tree）：
> - 工作树是正在构建的 Fiber 树。
> - 它代表了即将渲染的 UI 状态。
>
>
>> 双缓存的工作流程(三个阶段)
>> 1. 构建工作树：
>> - React 在更新时，会基于当前树构建一棵新的工作树。
>> - 工作树的节点会复用当前树的节点（通过 alternate 属性链接）。
>> 2. 渲染工作树：
>> - React 在工作树上进行协调（Reconciliation），标记需要更新的节点。
>> - 渲染完成后，工作树包含了最新的 UI 状态。
>> 3. 替换当前树：
>> - 当工作树构建完成后，React 会将工作树切换为当前树。
>> - 旧的当前树会被丢弃或复用。
>
>
> 双缓存的优势:
> 1. 避免界面闪烁
> - 双缓存技术确保在渲染过程中，屏幕上始终显示完整的 UI 树。
> - 工作树在后台构建，只有在完全准备好后才会替换当前树，避免了界面闪烁和不一致问题。
> 2. 提高性能
> - React 可以复用当前树的节点，减少创建和销毁节点的开销。
> - 通过增量渲染，React 可以将渲染任务拆分为多个小任务，避免长时间占用主线程。
> 3. 支持并发模式
> - 双缓存技术是 React 并发模式的基础。React 可以在后台构建工作树，同时保持当前树的稳定性。
> - 当高优先级任务到来时，React 可以中断工作树的构建，优先处理高优先级任务。
>
> 并发（Concurrency）指的是多个任务可以在同一时间段内交替执行，而不是串行执行。React 并发模式的核心目标是让渲染不再是“同步、阻塞、不可中断”的，而是可以被中断和恢复，从而提高交互流畅度



Fiber 的工作流程分为两个阶段：渲染阶段和提交阶段。

- **渲染阶段（Reconciliation Phase）**
  - **可中断：** React 遍历 Fiber 树，标记需要更新的节点，生成副作用列表。
  - **深度优先遍历：** React 从根节点开始，递归遍历子节点，处理更新。
- **提交阶段（Commit Phase）**
    - **不可中断：** React 根据副作用列表，同步更新 DOM。
    - **生命周期调用：** 在提交阶段，React 调用 componentDidMount、componentDidUpdate 等生命周期方法。
  

Fiber 使用 requestIdleCallback 或 requestAnimationFrame 进行任务调度，确保高优先级任务优先执行。

优先级:
- **Immediate：** 立即执行，如用户输入。
- **UserBlocking：** 用户交互相关任务。
- **Normal：** 普通更新。
- **Low：** 低优先级任务，如数据预取。
- **Idle：** 空闲时执行的任务。


## 二、Fiber 如何中断和恢复的

`React Fiber` 的中断和恢复机制是其核心特性之一，主要通过 **可中断的渲染** 和 **优先级调度** 来实现。

#### 如何中断
`React` 将渲染任务拆分为多个小任务（`Fiber` 节点），并在每帧的空闲时间执行这些任务。如果主线程需要处理更高优先级的任务（如用户输入），`React` 会中断当前的渲染任务。

- **任务拆分**
  - `React` 将整个渲染过程分解为多个 `Fiber` 节点，每个节点对应一个 `React` 元素（组件或 `DOM` 节点）。`React` 通过 深度优先遍历 的方式处理这些节点。

- **优先级调度**
  - `React` 使用 优先级机制 来决定任务的执行顺序。每个 `Fiber` 节点都有一个优先级（`lanes`），`React` 会根据任务的紧急程度动态调整优先级。例如：

    - 用户输入（如点击事件）的优先级高于普通渲染任务。

    - 动画任务的优先级高于数据更新任务。

- **中断的条件**
  - **时间片用尽：** `React` 为每个任务分配一个时间片（通常是 `5ms`），如果时间片用尽，`React` 会暂停当前任务。

  - **高优先级任务到来：** 如果有更高优先级的任务（如用户交互），`React` 会中断当前任务，优先处理高优先级任务。

  - **浏览器需要渲染帧：** `React` 会在每帧的空闲时间执行任务，如果浏览器需要渲染下一帧，`React` 会暂停当前任务。

#### 如何恢复

中断后，`React` 需要能够恢复之前的任务。`Fiber` 通过以下机制实现任务的恢复：

- `Fiber` 节点的链接：
  > 每个 Fiber 节点都包含以下属性：
  > return：指向父节点。
  > child：指向第一个子节点。
  > sibling：指向下一个兄弟节点。
  >
  > 通过这些链接，React 可以记住当前处理到的节点位置。中断后，React 会从上次中断的节点继续处理。


- 工作循环（`Work Loop`）
```js
// React 使用一个 工作循环 来处理 Fiber 节点。
// 这个循环会依次处理每个节点，直到所有节点处理完毕或任务被中断。
function workLoop(deadline) {
  while (nextUnitOfWork && !shouldYield()) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (nextUnitOfWork) {
    // 如果任务未完成，请求下一次调度
    requestIdleCallback(workLoop);
  }
}
// performUnitOfWork：处理当前 Fiber 节点，并返回下一个待处理的节点。
// shouldYield：检查是否需要中断任务（时间片用尽或高优先级任务到来）。
```

- 恢复机制
当任务被中断后，`React` 会保存当前的 `nextUnitOfWork`（下一个待处理的 `Fiber` 节点）。下次调度时，`React` 会从 `nextUnitOfWork` 继续处理，直到任务完成。


#### 总结
`Fiber` 的中断和恢复机制是 `React` 实现高性能渲染的关键：

- **中断：** 通过任务拆分和优先级调度，`React` 可以在时间片用尽或高优先级任务到来时中断当前任务。

- **恢复：** 通过 `Fiber` 节点的链接和工作循环，React 可以从中断的位置继续处理任务。



## 二、为什么使用MessageChannel的调度机制

`React Fiber` 最初确实考虑过使用 `requestIdleCallback` 来实现任务调度，但最终选择了基于 `MessageChannel` 的调度机制。这种选择是基于 `requestIdleCallback` 的一些局限性以及 `MessageChannel` 的优势。以下是两者的对比及其优缺点分析：

`requestIdleCallback` 的局限性：
- **浏览器兼容性问题**
  - `requestIdleCallback` 并不是所有浏览器都支持，尤其是在 `React 16` 发布时，许多浏览器（如 `Safari`）尚未实现该 `API`。
  - 即使支持，不同浏览器的实现可能存在差异，导致行为不一致。
- **调度频率不足**
  - `requestIdleCallback` 的调用频率较低，通常只在浏览器真正空闲时才会触发。对于需要高频率调度的场景（如动画），这可能不够及时。
  - 如果主线程长时间繁忙，`requestIdleCallback` 可能无法及时执行任务，导致任务积压。
- **无法控制优先级**
  - `requestIdleCallback` 本身不提供优先级机制，`React` 需要额外实现优先级调度逻辑。
  - 由于 `requestIdleCallback` 的调度不可控，`React` 难以精确控制任务的执行顺序。
- **时间片不精确**
  - `requestIdleCallback` 提供的 `deadline` 时间片可能不准确，尤其是在高负载情况下，浏览器可能会缩短空闲时间。



`React` 最终选择了基于 `MessageChannel` 的任务调度机制。`MessageChannel` 是浏览器提供的一种通信机制，允许在不同的上下文（如主线程和 `Web Worker`）之间传递消息。`React` 利用 `MessageChannel` 的 异步特性 来实现任务调度。

`MessageChannel` 的优势：
- 更高的调度频率
  - `MessageChannel` 的 `postMessage` 是异步的，且优先级高于 `setTimeout` 和 `setInterval`，能够更及时地触发任务调度。
  - `React` 可以更精确地控制任务的执行频率，确保每帧都能处理任务。
- 更好的浏览器兼容性
  - `MessageChannel` 的兼容性比 `requestIdleCallback` 更好，几乎所有现代浏览器都支持。
  - `React` 不需要担心不同浏览器的行为差异。
- 更灵活的任务控制
  - 使用 `MessageChannel`，`React` 可以完全控制任务的调度逻辑，包括优先级管理和时间片分配。
  - `React` 能够根据任务的优先级动态调整调度策略，确保高优先级任务优先执行。
- 更精确的时间片管理
  - `React` 可以手动实现时间片管理，确保每个任务在合理的时间内执行，避免长时间占用主线程。
  - 通过 `MessageChannel`，`React` 能够更精确地模拟 `requestIdleCallback` 的行为，同时避免其局限性。


`MessageChannel` 的缺点：
- 额外的性能开销
  - `MessageChannel` 的 `postMessage` 会触发事件循环，可能带来额外的性能开销。
  - 对于非常简单的任务，这种开销可能比 `requestIdleCallback` 更大。
- 手动实现复杂度较高
  - `React` 需要手动实现时间片管理和优先级调度，增加了代码复杂度。
  - 相比 `requestIdleCallback`，`MessageChannel` 的实现需要更多的底层控制。

#### 总结

`React` 选择 `MessageChannel` 而不是 `requestIdleCallback` 的主要原因包括：

- 更好的兼容性：`MessageChannel` 在所有现代浏览器中都支持。

- 更高的调度频率：`MessageChannel` 能够更及时地触发任务调度。

- 更灵活的控制：`React` 可以完全控制任务的优先级和时间片管理。











遍历规则
![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20250220145135784.png)
链表规则
![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20250220145410068.png)
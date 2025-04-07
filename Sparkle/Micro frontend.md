---
title: Micro frontend?
date: 2025-03-03 20:12:04
categories: 
- Sparkle
---

# 面试官：微前端技术方案对比?

![](https://cdn.jsdelivr.net/gh/Silvora/oss@main/images/20250303215003134.webp)

## 一、什么微前端

微前端（Micro Frontend）是借鉴微服务（Microservices）架构的理念，将一个大型前端应用拆分成多个较小的、独立的、自治的模块或应用。每个模块（或子应用）都是一个完整的、可独立部署的前端应用，拥有自己的前端技术栈、生命周期和开发流程。
![](https://cdn.jsdelivr.net/gh/Silvora/oss@main/images/20250303215528415.png)
在微前端架构下，每个子应用都可以独立开发、部署和维护。多个子应用可以通过一个统一的容器（或框架）进行集成和渲染，从而在浏览器中共同展示，提供无缝的用户体验。

#### 微前端的优势
- **模块化管理：** 微前端将大型应用拆分成多个独立模块，每个模块都可以独立开发、测试和部署。这样有助于团队之间的协作和代码的解耦。
- **技术栈多样化：** 每个子应用可以选择自己最适合的技术栈，不同团队可以根据需求使用不同的框架（如 React、Vue、Angular 等），减少了技术选择上的制约。
- **独立部署：** 子应用独立部署，避免了全应用重构和发布的风险。开发人员可以在不影响其他模块的情况下，快速推出新功能或修复 bug。
- **可扩展性：** 随着业务增长，可以非常方便地添加新的子应用，或者升级现有的模块，而不会影响整个系统的运行。
提高团队效率： 多个小团队可以并行开发和维护各自的模块，各模块之间通过标准的接口进行通信，降低了开发流程中的依赖关系。
![](https://cdn.jsdelivr.net/gh/Silvora/oss@main/images/20250303215845364.png)

## 二、微前端实现方式

微前端的实现有多种方式，常见的有以下几种：

- **Iframe 方式：** 每个子应用通过独立的 Iframe 嵌入到主应用中，子应用拥有自己的全局上下文，避免了相互影响。
- **Web Components 方式：** Web Components 提供了一个原生的封装机制，可以将子应用作为组件嵌入主应用中，不同技术栈的子应用通过 Web Components 进行集成。
- **JavaScript 脚本加载方式：** 通过动态加载 JavaScript 文件，将每个子应用的脚本通过 URL 引入到主应用中，主应用根据需要渲染和销毁子应用。
- **模块化加载工具（如 Single SPA、Qiankun 等）：** 使用框架来实现微前端的加载和管理，支持子应用的独立生命周期管理，并提供了子应用之间的通信机制。

| 特性            | qiankun                          | Micro App                      | wujie                          |
|-----------------|----------------------------------|--------------------------------|--------------------------------|
| **设计理念**    | 基于 Single-SPA，支持多框架      | 基于 Web Components，轻量级    | 基于虚拟 iframe + Proxy    |
| **应用隔离**    | JS 沙箱（快照/Proxy） + 样式隔离               | Web Components 隔离+ Proxy 沙箱            | iframe 隔离 + Proxy                   |
| **通信机制**    | 全局状态管理 + 事件通信          | 简单事件通信（postMessage 等）                   | 自带 bus 通信 + postMessage              |
| **资源加载**    | 按需加载 + 预加载                | 按需加载 + 预加载              | 按需加载 + 预加载              |
| **性能**        | 中等 （受 single-spa 影响）                            | 较高（轻量级方案）                           | 高 （更强的沙箱优化）                            |
| **适用场景**    | 大型企业级应用                   | 中小型项目                     | 高性能、高安全性场景           |
| **优点**        | 功能丰富，社区活跃               | 轻量级，隔离性好，性能较优               | 高性能，安全性高，支持 Worker              |
| **缺点**        | 配置复杂，兼容性较差， 依赖 single-spa，性能一般           | 功能简单，社区较少，需要 Web Components 支持             | 部分 API 适配配置复杂，社区较少             |



- wujie 的设计理念
    - wujie 并非原生 iframe，而是模拟 iframe 的虚拟沙箱（Proxy + Document 冻结）。
    - 它也支持 Worker 方案来加载子应用，但不是完全基于 Web Workers。
- 应用隔离
  - qiankun: 依赖 Proxy 沙箱（主要是 window.Proxy 代理）+ 事件冒泡隔离。
  - MicroApp: 主要基于 Web Components 进行 DOM 层隔离，同时结合 Proxy 实现 JS 隔离。
  - wujie: 采用 虚拟 iframe 沙箱（模拟 iframe 的隔离环境）+ Proxy，隔离性最强。
- 通信机制
  - qiankun: 提供 setGlobalState() 实现全局状态管理，可用于主子应用数据共享。
  - MicroApp: 主要采用 自定义事件（如 dispatchEvent、postMessage）。
  - wujie: 提供 bus 事件通信机制，也可以使用 postMessage 进行跨应用通信。


简单总结：
- qiankun = 兼容性强、生态成熟，适用于大多数场景。
- MicroApp = 性能较优、隔离性更强，适用于轻量化微前端架构。
- wujie = 最高性能 & 最强隔离，适用于对安全性、稳定性要求极高的项目。

## 三、Proxy实现css/js隔离

#### 使用 Shadow DOM

Shadow DOM 是浏览器提供的原生方法，可以隔离 JavaScript 作用域和 CSS 样式。

优点：
-	CSS 作用域隔离，不会影响外部样式。
- 组件化开发，适用于 Web Components。


```js
const shadowHost = document.createElement('div');
document.body.appendChild(shadowHost);

// 创建 Shadow DOM
const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

// 添加样式
const style = document.createElement('style');
style.textContent = `
  .box {
    color: red;
    font-size: 20px;
  }
`;
shadowRoot.appendChild(style);

// 添加 HTML 内容
const div = document.createElement('div');
div.className = 'box';
div.textContent = 'Shadow DOM 内容';
shadowRoot.appendChild(div);
```

#### 使用 Proxy 进行 JS 变量隔离

虽然 Proxy 不能直接隔离 CSS，但它可以用于隔离 JS 变量，防止全局污染。例如，可以拦截 window 对象的访问，实现“沙箱环境”。

适用于：在 iframe、Web Components 或微前端应用中隔离全局变量。
```js
function createSandbox() {
  const fakeWindow = new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return window[prop]; // 允许访问原始 window 的属性
    },
    set(target, prop, value) {
      target[prop] = value; // 仅存储在 fakeWindow 里，不污染全局
      return true;
    }
  });

  return fakeWindow;
}

const sandbox = createSandbox();
sandbox.alert('这条消息仍然会显示'); // 使用原 window.alert
sandbox.foo = 'sandbox value';
console.log(window.foo); // undefined
```


#### CSS 作用域隔离
适用于： 微前端、多个应用共存的情况。
使用 :scope 或 scoped（部分浏览器支持）

```css
:scope .box {
  color: blue;
}
```
通过 data- 属性命名空间
```css
[data-app="app1"] .box {
  color: green;
}
```
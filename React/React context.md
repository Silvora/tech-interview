---
title: React context的理解？
date: 2023-02-16 23:09:26
categories: 
- React
---

# 面试官：说说对React context的理解？


`React Context` 是 `React` 提供的一种跨组件传递数据的机制，主要用于解决组件树中深层嵌套组件之间的数据共享问题，避免“`prop drilling`”（逐层传递 `props`）的繁琐。



#### 核心概念

**Context 对象**：
通过 `React.createContext(defaultValue)` 创建，包含 `Provider` 和 `Consumer` 两个组件。
`defaultValue` 是默认值，当组件不在 `Provider` 的子树中时使用。


**Provider**：
`Provider` 组件用于提供数据，通过 `value` 属性传递数据。
所有子组件都可以访问 `Provider` 提供的数据。


**Consumer**：
`Consumer` 组件用于消费数据，通常通过函数作为子组件的方式访问 `Provider` 提供的数据。
在函数组件中，`useContext Hook` 可以替代 `Consumer`。

```js
import React, { createContext, useContext } from 'react';

// 创建 Context
const ThemeContext = createContext('light');

function App() {
  return (
    // 提供数据
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  // 消费数据
  const theme = useContext(ThemeContext);
  return <button style={{ background: theme === 'dark' ? '#333' : '#FFF' }}>Themed Button</button>;
}

export default App;
```


#### 优点
减少 `prop drilling`：避免逐层传递 `props`，简化代码。

全局数据管理：适合共享全局数据，如主题、用户状态等。

#### 缺点
组件复用性降低：依赖 `Context` 的组件难以复用。

性能问题：`Context` 数据变化会导致所有消费组件重新渲染，需优化。

#### 总结
`React Context` 是解决跨组件数据共享的有效工具，适合全局数据管理，但需注意性能问题。
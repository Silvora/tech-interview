---
title: vue和react跳转路由组件怎样销毁?
date: 2025-03-16 17:56:51
categories: 
- Sparkle
---

# 面试官：vue和react跳转路由组件怎样销毁?

在Vue和React中，路由跳转时组件的销毁和创建是由路由管理器控制的。


#### Vue
在Vue中，使用Vue Router进行路由管理。当路由跳转时，Vue Router会根据路由配置动态加载和卸载组件。

1. 组件销毁
当从当前路由跳转到另一个路由时，Vue Router会销毁当前路由对应的组件。具体过程如下：

- beforeDestroy 生命周期钩子：在组件销毁前触发，可以在这里进行清理工作，如取消定时器、解绑事件监听器等。

- destroyed 生命周期钩子：在组件销毁后触发，此时组件已经从DOM中移除，所有的事件监听器和子组件也已被销毁。

2. 组件创建
当进入新路由时，Vue Router会创建并挂载新路由对应的组件。具体过程如下：

- beforeCreate 生命周期钩子：在组件实例化之前触发。

- created 生命周期钩子：在组件实例化之后触发，此时组件的属性和方法已经初始化，但尚未挂载到DOM。

- beforeMount 生命周期钩子：在组件挂载到DOM之前触发。

- mounted 生命周期钩子：在组件挂载到DOM之后触发，此时可以访问DOM元素。


3. Vue3
- onMounted：组件挂载后执行，适合初始化操作。

- onBeforeUnmount：组件卸载前执行，适合清理操作。

- onUnmounted：组件卸载后执行。

```js
export default {
  beforeDestroy() {
    console.log('组件即将销毁');
    // 清理工作
  },
  destroyed() {
    console.log('组件已销毁');
  },
  beforeCreate() {
    console.log('组件即将创建');
  },
  created() {
    console.log('组件已创建');
  },
  beforeMount() {
    console.log('组件即将挂载');
  },
  mounted() {
    console.log('组件已挂载');
  }
};
```

#### React

在React中，通常使用React Router进行路由管理。React Router会根据路由配置动态渲染组件。

1. 组件卸载
当从当前路由跳转到另一个路由时，React Router会卸载当前路由对应的组件。具体过程如下：

- componentWillUnmount 生命周期钩子：在组件卸载前触发，可以在这里进行清理工作，如取消定时器、解绑事件监听器等。

2. 组件挂载
当进入新路由时，React Router会挂载新路由对应的组件。具体过程如下：

- constructor：组件实例化时调用，初始化状态和绑定方法。

- componentDidMount 生命周期钩子：在组件挂载到DOM之后触发，此时可以访问DOM元素。

3. react hooks

- 当路由跳转时，React Router会卸载当前路由对应的组件。可以通过useEffect的清理函数来处理组件的卸载逻辑。
- 当进入新路由时，React Router会挂载新路由对应的组件。可以通过useEffect来处理组件的挂载逻辑。

```js
import React, { Component } from 'react';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    console.log('组件实例化');
  }

  componentDidMount() {
    console.log('组件已挂载');
  }

  componentWillUnmount() {
    console.log('组件即将卸载');
    // 清理工作
  }

  render() {
    return <div>My Component</div>;
  }
}

export default MyComponent;


// hooks ....

import React, { useEffect } from 'react';

const MyComponent = () => {
  useEffect(() => {
    console.log('组件已挂载');

    // 清理函数（组件卸载时执行）
    return () => {
      console.log('组件即将卸载');
      // 清理工作
    };
  }, []); // 空数组表示只在组件挂载和卸载时执行

  return <div>My Component</div>;
};

export default MyComponent;

```
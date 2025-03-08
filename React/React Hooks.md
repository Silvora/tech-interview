---
title: React Hooks的理解？
date: 2023-02-16 23:09:26
categories: 
- React
---

# 面试官：说说对React Hooks的理解？解决了什么问题？

 ![](https://static.vue-js.com/8d357c50-e12e-11eb-85f6-6fac77c0c9b3.png)

## 一、是什么

`Hook` 是 React 16.8 的新增特性。它可以让你在不编写 `class` 的情况下使用 `state` 以及其他的 `React` 特性

至于为什么引入`hook`，官方给出的动机是解决长时间使用和维护`react`过程中常遇到的问题，例如：

- 难以重用和共享组件中的与状态相关的逻辑
- 逻辑复杂的组件难以开发与维护，当我们的组件需要处理多个互不相关的 local state 时，每个生命周期函数中可能会包含着各种互不相关的逻辑在里面
- 类组件中的this增加学习成本，类组件在基于现有工具的优化上存在些许问题
- 由于业务变动，函数组件不得不改为类组件等等

在以前，函数组件也被称为无状态的组件，只负责渲染的一些工作

因此，现在的函数组件也可以是有状态的组件，内部也可以维护自身的状态以及做一些逻辑方面的处理


## 二、有哪些

上面讲到，`Hooks`让我们的函数组件拥有了类组件的特性，例如组件内的状态、生命周期

最常见的`hooks`有如下：

- useState
- useEffect
- 其他


### useState

首先给出一个例子，如下：

```js
import React, { useState } from 'react';

function Example() {
  // 声明一个叫 "count" 的 state 变量
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p >
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

在函数组件中通过`useState`实现函数内部维护`state`，参数为`state`默认的值，返回值是一个数组，第一个值为当前的`state`，第二个值为更新`state`的函数

该函数组件等价于的类组件如下：

```js
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p >
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
```

从上述两种代码分析，可以看出两者区别：

- state声明方式：在函数组件中通过 useState 直接获取，类组件通过constructor 构造函数中设置
- state读取方式：在函数组件中直接使用变量，类组件通过`this.state.count`的方式获取

- state更新方式：在函数组件中通过 setCount 更新，类组件通过this.setState()

总的来讲，useState 使用起来更为简洁，减少了`this`指向不明确的情况



### useEffect

`useEffect`可以让我们在函数组件中进行一些带有副作用的操作

同样给出一个计时器示例：

```js
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  componentDidMount() {
    document.title = `You clicked ${this.state.count} times`;
  }
  componentDidUpdate() {
    document.title = `You clicked ${this.state.count} times`;
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p >
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
```

从上面可以看见，组件在加载和更新阶段都执行同样操作

而如果使用`useEffect`后，则能够将相同的逻辑抽离出来，这是类组件不具备的方法

对应的`useEffect`示例如下：

```jsx
import React, { useState, useEffect } from 'react';
function Example() {
  const [count, setCount] = useState(0);
 
  useEffect(() => {    document.title = `You clicked ${count} times`;  });
  return (
    <div>
      <p>You clicked {count} times</p >
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

`useEffect`第一个参数接受一个回调函数，默认情况下，`useEffect`会在第一次渲染和更新之后都会执行，相当于在`componentDidMount`和`componentDidUpdate`两个生命周期函数中执行回调

如果某些特定值在两次重渲染之间没有发生变化，你可以跳过对 effect 的调用，这时候只需要传入第二个参数，如下：

```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 仅在 count 更改时更新
```

上述传入第二个参数后，如果 `count` 的值是 `5`，而且我们的组件重渲染的时候 `count` 还是等于 `5`，React 将对前一次渲染的 `[5]` 和后一次渲染的 `[5]` 进行比较，如果是相等则跳过`effects`执行

回调函数中可以返回一个清除函数，这是`effect`可选的清除机制，相当于类组件中`componentwillUnmount`生命周期函数，可做一些清除副作用的操作，如下：

```jsx
useEffect(() => {
    function handleStatusChange(status) {
        setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
        ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
});
```

所以， `useEffect`相当于`componentDidMount`，`componentDidUpdate` 和 `componentWillUnmount` 这三个生命周期函数的组合



### 其它 hooks

在组件通信过程中可以使用`useContext`，`refs`学习中我们也用到了`useRef`获取`DOM`结构......

还有很多额外的`hooks`，如：

> `React.memo`: 用于函数组件，避免在 props 没有变化时重新渲染。
> `React.memo` 是一个高阶组件（`HOC`），用于优化函数组件的渲染行为。它通过浅比较组件的  `props` 来决定是否重新渲染组件。


- `useReducer`:适用于管理复杂的状态逻辑，尤其是当状态更新依赖于之前的状态时。
```js

// reducer 是一个纯函数，接收当前状态和动作，返回新的状态。

// useReducer 返回当前状态和 dispatch 函数，用于触发状态更新。

// 适合处理复杂的状态逻辑，比如多个状态相互依赖的场景。

import React, { useReducer } from 'react';

// 定义 reducer 函数
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error('Unknown action type');
  }
};

const Counter = () => {
  // 初始化 useReducer
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
};

export default Counter;
```

- `useCallback`: 用于缓存函数引用，避免在每次渲染时创建新的函数，特别适合将函数作为 `props` 传递给子组件时使用。
```js
// useCallback 返回一个缓存的函数，只有当依赖项变化时才会重新创建。

// 配合 React.memo 使用，可以避免子组件不必要的渲染。

// 适合将函数作为 props 传递给子组件的场景。

import React, { useState, useCallback } from 'react';

const ChildComponent = React.memo(({ onClick }) => {
  console.log('ChildComponent rendered');
  return <button onClick={onClick}>Click Me</button>;
});

const ParentComponent = () => {
  const [count, setCount] = useState(0);

  // 使用 useCallback 缓存函数
  const handleClick = useCallback(() => {
    setCount((prevCount) => prevCount + 1);
  }, []); // 依赖项为空数组，表示函数不会改变

  return (
    <div>
      <h1>Count: {count}</h1>
      <ChildComponent onClick={handleClick} />
    </div>
  );
};

export default ParentComponent;
```

- `useMemo`: 用于缓存计算结果，避免在每次渲染时重复计算，特别适合处理昂贵的计算逻辑。
```js
// useMemo 返回一个缓存的值，只有当依赖项变化时才会重新计算。

// 避免在每次渲染时重复执行昂贵的计算逻辑。

// 适合处理需要缓存的计算结果或复杂的数据转换。
import React, { useState, useMemo } from 'react';

const ExpensiveCalculation = ({ number }) => {
  // 使用 useMemo 缓存计算结果
  const result = useMemo(() => {
    console.log('Calculating...');
    let sum = 0;
    for (let i = 1; i <= number; i++) {
      sum += i;
    }
    return sum;
  }, [number]); // 只有当 number 变化时才会重新计算

  return <div>Result: {result}</div>;
};

const App = () => {
  const [number, setNumber] = useState(1);
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment Count</button>
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(parseInt(e.target.value))}
      />
      <ExpensiveCalculation number={number} />
    </div>
  );
};

export default App;
```

- `useRef`:可以用来存储可变值，且不会触发重新渲染。
```js
  const intervalRef = useRef();

useEffect(() => {
  intervalRef.current = setInterval(() => {
    // do something
  }, 1000);

  return () => clearInterval(intervalRef.current);
}, []);
```





## 三、解决什么

通过对上面的初步认识，可以看到`hooks`能够更容易解决状态相关的重用的问题：

- 每调用useHook一次都会生成一份独立的状态

- 通过自定义hook能够更好的封装我们的功能

编写`hooks`为函数式编程，每个功能都包裹在函数中，整体风格更清爽，更优雅

`hooks`的出现，使函数组件的功能得到了扩充，拥有了类组件相似的功能，在我们日常使用中，使用`hooks`能够解决大多数问题，并且还拥有代码复用机制，因此优先考虑`hooks`


## 四、解析

#### 为什么 `React useState` 要使用数组而不是对象?

`useState` 使用数组而不是对象的主要原因是 灵活性和简洁性。具体来说，数组的解构赋值允许开发者自由命名状态变量和更新函数，而对象则需要预先定义属性名。以下是详细原因：
1. 灵活命名
   - 数组的解构赋值允许开发者在调用 `useState` 时自由命名状态变量和更新函数。例如：

    ```js
    const [count, setCount] = useState(0);
    const [name, setName] = useState("John");
    ```

    - 如果使用对象，开发者需要预先定义属性名，灵活性较低：
    ```js
    const { state: count, setState: setCount } = useState(0);
    const { state: name, setState: setName } = useState("John");
    ```
2. 简洁性
  - 数组的解构赋值语法更简洁，适合处理多个状态
  - 如果使用对象，代码会显得冗长
3. 一致性
  - 数组的解构赋值方式在 `React` 中广泛使用（如 `useState`、`useReducer`），保持了 API 的一致性。
  - 如果使用对象，可能会引入不一致的 `API` 设计。
4. 性能
   - 数组的解构赋值在性能上略微优于对象，因为对象需要查找属性名，而数组直接按索引访问。
5. 扩展性
   - 数组结构更容易扩展。例如，`useReducer` 也返回数组（`[state, dispatch]`），与 `useState` 的设计一致。

`useState` 使用数组而非对象，主要是为了提供更灵活、简洁且一致的 API 设计。数组的解构赋值允许开发者自由命名状态变量和更新函数，同时保持了代码的简洁性和一致性。




## 参考文献

- https://zh-hans.reactjs.org/docs/hooks-state.html
- https://zh-hans.reactjs.org/docs/hooks-effect.html
- https://www.cnblogs.com/lalalagq/p/9898531.html

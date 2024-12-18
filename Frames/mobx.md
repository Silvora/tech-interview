---
title: Mobx的基本使用
date: 2023-03-23 17:53:57
categories: 
- Frames
---

# Mobx的基本使用

## 一、安装Mobx6

安装 mobx、mobx-react 或者 mobx-react-lite【只支持函数组件】

```bash
Yarn: yarn add mobx mobx-react

NPM: npm install --save mobx mobx-react
```

核心概念
- observable 定义一个存储 state 的可追踪字段（Proxy）
- action 将一个方法标记为可以修改 state 的 action
- computed 标记一个可以由 state 派生出新值并且缓存其输出的计算属性

目录结构
```
- store
    - models
        - count.js
        - ...
    - index.js
```

## 二、入门案例

修改main.js 全局注入
```js
//main.js

import {Provider} from "mobx-react"
import { useStore } from './store'

root.render(
    <Provider store={useStore}>
      <App />
    </Provider>
)

```

编写mobx实例,进行模块化管理

```js
//store/index.js

import {createContext,useContext} from "react"
import state from "./models/state"
class RootStore{
    state = state
}


const store = new RootStore()

const Context = createContext(store)

export const useStore = ()=>{
    return useContext(Context)
}


```

实现响应式数据
```js
//store/models/count.js

import { action, makeAutoObservable, observable } from "mobx";

class Count {
	constructor() {
		//makeAutoObservable(target, overrides?, options?)
		// target: 将目标对象中的属性和方法设置为 observable state 和 action
		// overrides: 覆盖默认设置, 将 target 对象中的某些属性或者方法设置为普通属性
		// options: 配置对象, autoBind, 使 action 方法始终拥有正确的 this 指向

		// 参数1：target，把谁变成响应式（可观察）
		// 参数2：指定哪些属性或者方法变成可观察,{}代表所有,
		// 参数3: {autoBind:true}绑定内部this
		makeAutoObservable(
			this,
			{
				// count: observable,
				// increment: action,
				// decrement: action,
				// reset: action,
			},
			{ autoBind: true }
		);
	}

	count = 0;
	get double() {
		return this.count * 2;
	}
	increment() {
		this.count++;
	}
	decrement() {
		this.count--;
	}
	reset() {
		this.count = 0;
	}
}

const count = new Count();
export default count;

```

组件内基本用法

```js

import { useStore } from '../store'
import {observer} from "mobx-react"

export default observer(()=>{

    const {count} = useStore()

    const handleAdd = ()=>{
        count.increment()
    }
    const handleDel = ()=>{
        count.decrement()
    }
  return (
    <div>
        <p>{count.count}</p>
        <p>{count.double}</p>
        <button onClick={handleAdd}>+</button>
        <button onClick={handleDel}>-</button>
    </div>
  )
})


```




## 参考文献

- https://zh.mobx.js.org/

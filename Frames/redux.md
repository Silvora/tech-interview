---
title: Redux的基本使用
date: 2023-03-23 17:53:28
categories: 
- Frames
---

# Redux的基本使用

## 一、安装Redux
```bash
# NPM
npm install react-redux @reduxjs/toolkit

# Yarn
yarn add react-redux @reduxjs/toolkit
```


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

import {Provider} from "react-redux"
import store from './store'

root.render(
    <Provider store={store}>
      <App />
    </Provider>
)

```

模块化管理,返回全局store
```js
//store/index.js

import { configureStore } from "@reduxjs/toolkit";

import countSlice from "./models/count";

const store = configureStore({
	reducer: {
		count: countSlice,
	},
});
export default store;
```

编写实例,实现响应式数据
```js
//store/models/count.js

import { createSlice } from "@reduxjs/toolkit";

const countSlice = createSlice({
	name: "count",
	initialState: {
		value: 0,
	},
	reducers: {
		incremented: (state, payload: any) => {
			// Redux Toolkit 允许在 reducers 中编写 "mutating" 逻辑。
			// 它实际上并没有改变 state，因为使用的是 Immer 库，检测到“草稿 state”的变化并产生一个全新的
			// 基于这些更改的不可变的 state。
			state.value += payload.payload;
		},
		decremented: (state, payload: any) => {
			state.value -= payload.payload;
		},
	},
});

//返回方法,组件调用
export const { incremented, decremented } = counterSlice.actions;

//异步方法
export const asyncIncrement = (payload: any) => (dispatch: any) => {
	setTimeout(() => {
		dispatch(incremented(payload));
	}, 2000);
};

//返回实例
export default countSlice.reducer;

```

组件使用
```js
import { useSelector, useDispatch } from 'react-redux';
import { incremented,decremented,asyncIncrement } from '../redux/models/count';

export default ()=> {
    //获取响应式数据,name查找
  const { value } = useSelector((state:any) => state.count);
  const dispatch = useDispatch();

    const handleAdd = ()=>{
        dispatch(incremented(1))
    }
    const handleDel = ()=>{
        dispatch(decremented(1))
    }
    const handleAsync = ()=>{
      dispatch(asyncIncrement(100))
  }
  return (
    <div>
        <p>{value}</p>
        <button onClick={handleAdd}>+++</button>
        <button onClick={handleDel}>---</button>
        <button onClick={handleAsync}>async</button>
    </div>
  )
}


```

## 参考文献

- https://cn.redux.js.org/


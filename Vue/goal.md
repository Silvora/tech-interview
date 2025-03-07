---
title: Vue3.0的设计目标是什么？做了哪些优化
date: 2022-12-09 14:34:12
categories: 
- Vue
---

# 面试官：Vue3.0的设计目标是什么？做了哪些优化

![](https://static.vue-js.com/b93b49c0-5c58-11eb-85f6-6fac77c0c9b3.png)

## 一、设计目标

不以解决实际业务痛点的更新都是耍流氓，下面我们来列举一下`Vue3`之前我们或许会面临的问题

- 随着功能的增长，复杂组件的代码变得越来越难以维护

- 缺少一种比较「干净」的在多个组件之间提取和复用逻辑的机制

- 类型推断不够友好

- `bundle`的时间太久了

而 `Vue3` 经过长达两三年时间的筹备，做了哪些事情？

我们从结果反推

- 更小
- 更快
- TypeScript支持
- API设计一致性
- 提高自身可维护性
- 开放更多底层功能

一句话概述，就是更小更快更友好了


### 更小

`Vue3`移除一些不常用的 `API`

引入`tree-shaking`，可以将无用模块“剪辑”，仅打包需要的，使打包的整体体积变小了



### 更快

主要体现在编译方面：

- diff算法优化
 ```js
 // 在 Vue2 里 updateChildren 会进行:
 // 头和头比
 // 尾和尾比
 // 头和尾比
 // 尾和头比
 // 都没有命中的对比


 // 在 Vue3 里 patchKeyedChildren 为
 // 头和头比
 // 尾和尾比
 // 基于最长递增子序列进行移动/添加/删除
 ```
- 静态提升
```js
// 使用静态标记
export const enum PatchFlags {
  TEXT = 1 ,  // 动态文本节点
  CLASS = 1 << 1,  // 2   动态class
  STYLE = 1 << 2,  // 4   动态style
  PROPS = 1 << 3,  // 8   除去class/style以外的动态属性
  FULL_PROPS = 1 << 4,       // 16  有动态key属性的节点，当key改变时，需进行完整的diff比较
  HYDRATE_EVENTS = 1 << 5,   // 32  有监听事件的节点
  STABLE_FRAGMENT = 1 << 6,  // 64  一个不会改变子节点顺序的fragment (一个组件内多个根元素就会用fragment包裹)
  KEYED_FRAGMENT = 1 << 7,   // 128 带有key属性的fragment或部分子节点有key
  UNKEYEN_FRAGMENT = 1 << 8, // 256  子节点没有key的fragment
  NEED_PATCH = 1 << 9,       // 512  一个节点只会进行非props比较
  DYNAMIC_SLOTS = 1 << 10,   // 1024   动态slot
  HOISTED = -1,  // 静态节点 
  BAIL = -2      // 表示 Diff 过程中不需要优化
}

// 在什么地方用到的呢？比如下面这样的代码
<div id="app">
    <div>沐华</div>
    <p>{{ age }}</p>
</div>

// Vue2 中编译的结果
with(this){
    return _c(
      'div',
      {attrs:{"id":"app"}},
      [ 
        _c('div',[_v("沐华")]),
        _c('p',[_v(_s(age))])
      ]
    )
}

// Vue3 中编译的结果
const _hoisted_1 = { id: "app" }
const _hoisted_2 = /*#__PURE__*/_createElementVNode("div", null, "沐华", -1 /* HOISTED */)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _hoisted_2,
    _createElementVNode("p", null, _toDisplayString(_ctx.age), 1 /* TEXT */)
  ]))
}

// 看到上面编译结果中的 -1 和 1 了吗，这就是静态标记，这是在 Vue2 中没有的，patch 过程中就会判断这个标记来 Diff 优化流程，跳过一些静态节点对比
```

- 事件监听缓存
```js
// 比如这样一个有点击事件的按钮
<button @click="handleClick">按钮</button>
// Vue3 被编译后的结果
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("button", {
    onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.handleClick && _ctx.handleClick(...args)))
  }, "按钮"))
} 
// onClick 会先读取缓存，如果缓存没有的话，就把传入的事件存到缓存里，都可以理解为变成静态节点了，优秀吧，而在 Vue2 中就没有缓存，就是动态的
  ```


- SSR优化
```js
// createStaticVNode 的使用
<template>
  <div>
    <p>This is static content.</p>
    <p>This is also static content.</p>
    <dynamic-component />
  </div>
</template>

<script>
import { createStaticVNode } from 'vue';

export default {
  setup() {
    // 在编译时，静态节点会被转换为 createStaticVNode
    // 类似于：
    // const staticVNode = createStaticVNode('<div><p>This is static content.</p><p>This is also static content.</p></div>');

    return {};
  },
};
</script>
// 两个 <p> 标签的内容是静态的，不会发生变化。Vue 3 在编译时会将它们转换为 createStaticVNode，在渲染时直接将其 innerHTML 到 DOM 中，避免了创建虚拟 DOM 和进行 diff 的开销
```
```js
// 字符串拼接的优化
<template>
  <div>
    <span>{{ message }}</span>
  </div>
</template>


// 类似于：
const html = `<div><span>${message}</span></div>`;

// 在 Vue 2 中，这段代码会生成一个包含 span 节点的 VDOM 树。而在 Vue 3 中，如果 message 是一个简单的字符串，Vue 可能会将其直接拼接成字符串
```


```js
// 按需响应式
import { reactive } from 'vue';

const state = reactive({
  a: 1,
  b: 2,
});

// 只有访问 state.a 时，才会触发 getter，将相关的 effect 收集起来
console.log(state.a);
```

### 更友好

`vue3`在兼顾`vue2`的`options API`的同时还推出了`composition API`，大大增加了代码的逻辑组织和代码复用能力

这里代码简单演示下：

存在一个获取鼠标位置的函数

```js
import { toRefs, reactive } from 'vue';
function useMouse(){
    const state = reactive({x:0,y:0});
    const update = e=>{
        state.x = e.pageX;
        state.y = e.pageY;
    }
    onMounted(()=>{
        window.addEventListener('mousemove',update);
    })
    onUnmounted(()=>{
        window.removeEventListener('mousemove',update);
    })

    return toRefs(state);
}
```

我们只需要调用这个函数，即可获取`x`、`y`的坐标，完全不用关注实现过程

试想一下，如果很多类似的第三方库，我们只需要调用即可，不必关注实现过程，开发效率大大提高

同时，`VUE3`是基于`typescipt`编写的，可以享受到自动的类型定义提示



## 三、优化方案

`vue3`从很多层面都做了优化，可以分成三个方面：

- 源码
- 性能
- 语法 API



### 源码

源码可以从两个层面展开：

- 源码管理
- TypeScript



#### 源码管理

`vue3`整个源码是通过 `monorepo `的方式维护的，根据功能将不同的模块拆分到`packages `目录下面不同的子目录中

 ![](https://static.vue-js.com/d7c32520-5c58-11eb-ab90-d9ae814b240d.png)

这样使得模块拆分更细化，职责划分更明确，模块之间的依赖关系也更加明确，开发人员也更容易阅读、理解和更改所有模块源码，提高代码的可维护性

另外一些 `package`（比如 `reactivity` 响应式库）是可以独立于 `Vue` 使用的，这样用户如果只想使用 `Vue3 `的响应式能力，可以单独依赖这个响应式库而不用去依赖整个 `Vue`



#### TypeScript

`Vue3`是基于`typeScript`编写的，提供了更好的类型检查，能支持复杂的类型推导



### 性能

`vue3`是从什么哪些方面对性能进行进一步优化呢？

- 体积优化
- 编译优化
- 数据劫持优化

这里讲述数据劫持：

在`vue2`中，数据劫持是通过`Object.defineProperty `，这个 API 有一些缺陷，并不能检测对象属性的添加和删除

```js
Object.defineProperty(data, 'a',{
  get(){
    // track
  },
  set(){
    // trigger
  }
})
```

尽管` Vue`为了解决这个问题提供了 `set `和`delete `实例方法，但是对于用户来说，还是增加了一定的心智负担

同时在面对嵌套层级比较深的情况下，就存在性能问题

```js
default {
  data: {
    a: {
      b: {
          c: {
          d: 1
        }
      }
    }
  }
}
```

相比之下，`vue3`是通过`proxy`监听整个对象，那么对于删除还是监听当然也能监听到

同时`Proxy ` 并不能监听到内部深层次的对象变化，而 `Vue3` 的处理方式是在` getter` 中去递归响应式，这样的好处是真正访问到的内部对象才会变成响应式，而不是无脑递归



### 语法 API

这里当然说的就是`composition API`，其两大显著的优化：

- 优化逻辑组织
- 优化逻辑复用



#### 逻辑组织

一张图，我们可以很直观地感受到 `Composition API `在逻辑组织方面的优势

 ![](https://static.vue-js.com/e5804bc0-5c58-11eb-85f6-6fac77c0c9b3.png)



相同功能的代码编写在一块，而不像`options API`那样，各个功能的代码混成一块



#### 逻辑复用

在`vue2`中，我们是通过`mixin`实现功能混合，如果多个`mixin`混合，会存在两个非常明显的问题：命名冲突和数据来源不清晰

而通过`composition`这种形式，可以将一些复用的代码抽离出来作为一个函数，只要的使用的地方直接进行调用即可

同样是上文的获取鼠标位置的例子

```js
import { toRefs, reactive, onUnmounted, onMounted } from 'vue';
function useMouse(){
    const state = reactive({x:0,y:0});
    const update = e=>{
        state.x = e.pageX;
        state.y = e.pageY;
    }
    onMounted(()=>{
        window.addEventListener('mousemove',update);
    })
    onUnmounted(()=>{
        window.removeEventListener('mousemove',update);
    })

    return toRefs(state);
}
```

组件使用

```js
import useMousePosition from './mouse'
export default {
    setup() {
        const { x, y } = useMousePosition()
        return { x, y }
    }
}
```

可以看到，整个数据来源清晰了，即使去编写更多的` hook `函数，也不会出现命名冲突的问题



## 参考文献

- https://juejin.cn/post/6850418112878575629#heading-5
- https://vue3js.cn/docs/zh
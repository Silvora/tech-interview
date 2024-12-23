---
title: Vite的原理
date: 2024-11-18 16:14:34
categories: 
- Webpack
---

# 面试官：Vite的原理?

## 一、Vite是什么
`Vite`是新一代的前端构建工具，类似于`Webpack+ Webpack-dev-server`。其主要利用浏览器`ESM`特性导入组织代码，在服务器端按需编译返回，完全跳过了打包这个概念，服务器随起随用。生产中利用`Rollup`作为打包工具，号称下一代的前端构建工具。

由于 `ESM` 的浏览器支持 才有`Vite`的方案

Vite有如下特点：

- 快速的冷启动: `No Bundle + esbuild` 预构建
- 即时的模块热更新: 基于`ESM`的`HMR`，同时利用浏览器缓存策略提升速度
- 真正的按需加载: 利用浏览器`ESM`支持，实现真正的按需加载

#### Esbuild
`Vite`底层使用`Esbuild`实现对`.ts、jsx、.js`代码文件的转化
`Esbuild`是一个`JavaScript Bundler` 打包和压缩工具，它提供了与`Webpack、Rollup`等工具相似的资源打包能力。可以将`JavaScript` 和`TypeScript`代码打包分发在网页上运行。但其打包速度却是其他工具的10～100倍

`esbuild`总共提供了四个函数：`transform、build、buildSync、Service`

目前他支持以下的功能：

- 加载器
- 压缩
- 打包
- `Tree shaking`
- `Source map`生成


#### 基于Esbuild的依赖预编译优化
1. 为什么需要预构建？
- 支持`commonJS`依赖: `Vite`是基于浏览器原生支持`ESM`的能力实现的，但要求用户的代码模块必须是`ESM`模块，因此必须将`commonJs`的文件提前处理，转化成 `ESM` 模块并缓存入 `node_modules/.vite`
- 减少模块和请求数量: 我们常用的`lodash`工具库，里面有很多包通过单独的文件相互导入，而 `lodash-es`这种包会有几百个子模块，当代码中出现 `import { debounce } from 'lodash-es'` 会发出几百个 `HTTP` 请求，这些请求会造成网络堵塞，影响页面的加载。`Vite` 将有许多内部模块的 ESM 依赖关系转换为单个模块，以提高后续页面加载性能。通过预构建 `lodash-es` 成为一个模块，也就只需要一个 `HTTP` 请求了！


2. 为什么使用`Esbuild`?
- “快”就一个字
- 编译运行 VS 解释运行: `JavaScript`是解释型语言，边运行边解释。而 `Esbuild` 则选择使用 `Go` 语言编写，该语言可以编译为原生代码,在编译的时候都将语言转为机器语言，在启动的时候直接执行即可，在 `CPU` 密集场景下，`Go` 更具性能优势
- 多线程 VS 单线程: `JavaScript` 本质上是一门单线程语言，直到引入 `WebWorker` 之后才有可能在浏览器、`Node` 中实现多线程操作。就我对`Webpack`的源码理解，其源码也并未使用 `WebWorker` 提供的多线程能力。而`GO`天生的多线程优势。(ps: 源码没有, loader和plugin有)
- 对构建流程进行了优化，充分利用 CPU 资源


3. 实现原理
- `Vite`预编译之后，将文件缓存在`node_modules/.vite/`文件夹下。根据以下地方来决定是否需要重新执行预构建。
  - `package.json`中：`dependencies`发生变化
  - 包管理器的`lockfile`
- 如果想强制让`Vite`重新预构建依赖，可以使用`--force`启动开发服务器，或者直接删掉`node_modules/.vite/`文件夹。


4. 为什么不用`esbuild`进行生产打包构建
- 生产环境的稳定性与功能丰富性：
  - 生态成熟： `Rollup` 在模块打包领域有更长的历史，生态更加成熟，拥有富的插件和工具。这对于生产环境来说是非常重要的，可以保证打包过程的稳定性和可靠性。
  - 功能全面： `Rollup` 的功能更加全面，能够处理各种复杂的打包场景，例如构建库、支持多种输出格式等。
  - 社区支持： `Rollup` 有一个庞大的社区，可以提供更多的支持和资源。
- `esbuild` 的局限性：
  - 插件生态： `esbuild` 的插件生态虽然在快速发展，但相较于 `Rollup` 来说还比较年轻，插件的丰富程度和稳定性有待提高。
  - 功能覆盖： `esbuild` 虽然性能出色，但目前还有一些功能上的限制，例如对某些高级打包配置的支持可能不够完善。
- `Vite` 结合 `esbuild` 和 `Rollup` 的做法，可以看作是取长补短。`esbuild` 提供了极致的开发体验，而 `Rollup` 则保证了生产环境的稳定性和功能丰富性。这种组合方式使得 `Vite` 成为一个非常优秀的构建工具。

1. Vite 如何结合 esbuild 和 Rollup？
- 开发阶段：Vite 利用 esbuild 的高性能特点，对项目中的模块进行快速打包和热更新。esbuild 在开发阶段能够极大地提升开发效率。
- 生产阶段：Vite 使用 Rollup 来构建最终的生产版本。Rollup 可以生成更加优化和高质量的产物，同时也能充分利用其丰富的插件生态和功能。
  

#### Rollup
在生产环境下，`Vite`使用`Rollup`来进行打包

`Rollup`是基于`ESM`的`JavaScript`打包工具。相比于其他打包工具如`Webpack`，他总是能打出更小、更快的包。因为 `Rollup` 基于 `ESM` 模块，比 `Webpack` 和 `Browserify` 使用的 `CommonJS`模块机制更高效。`Rollup`的亮点在于同一个地方，一次性加载。能针对源码进行 `Tree Shaking`(去除那些已被定义但没被使用的代码)，以及 `Scope Hoisting` 以减小输出文件大小提升运行性能。

`Rollup`分为`build`（构建）阶段和`output generate`（输出生成）阶段。主要过程如下：

- 获取入口文件的内容，包装成module，生成抽象语法树
- 对入口文件抽象语法树进行依赖解析
- 生成最终代码
- 写入目标文件
  
#### 分包原理
Vite 的分包机制主要基于 Rollup 的配置，并结合了 Vite 自身的特性
- 代码分割： Vite 会将代码分割成多个更小的块（chunk），每个 chunk 包含相关的模块。
- 动态导入： 通过动态导入（import()），按需加载这些 chunk，从而减少初始加载的体积。
- 缓存： 浏览器会缓存这些 chunk，在后续访问时直接从缓存中获取，提高加载速度。
- 优化： Vite 会对 chunk 进行优化，如 tree shaking、代码压缩等，进一步减小文件体积。

Vite 提供了多种方式进行分包：
- 自动分包: Vite 会默认根据代码的导入导出关系进行自动分包。
- 手动分包: 
  - manualChunks 选项： 可以自定义 chunk 的划分规则。
  - 代码分割插件： 使用第三方插件，如 vite-plugin-split-chunks，实现更复杂的分割策略。
- 动态导入： 在代码中使用 import() 动态加载模块，实现按需加载。


#### 基于Rollup的 Plugins
`Vite` 从 `preact` 的 `WMR` 中得到了启发，将`Vite Plugins`继承`Rollup Plugins API`，在其基础上进行了一些扩展(如`Vite`特有的钩子等)，同时`Vite`也基于`Rollup plugins`机制提供了强大的插件`API`。目前和 `Vite` 兼容或者内置的插件

使用`Vite`插件可以扩展`Vite`能力，通过暴露一些构建打包过程的一些时机配合工具函数，让用户可以自定义地写一些配置代码，执行在打包过程中。比如解析用户自定义的文件输入，在打包代码前转译代码，或者查找。
在实际的实现中，`Vite` 仅仅需要基于`Rollup`设计的接口进行扩展，在保证兼容 `Rollup`插件的同时再加入一些`Vite`特有的钩子和属性来进行扩展。

## 二、核心原理

1.当声明一个 `script` 标签类型为 `module` 时,如
```js
  <script type="module" src="/src/main.js"></script>
```

2.当浏览器解析资源时，会往当前域名发起一个GET请求main.js文件
```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```

3.请求到了`main.js`文件，会检测到内部含有`import`引入的包，又会`import` 引用发起HTTP请求获取模块的内容文件，如`App.vue、vue`文件

`Vite`其核心原理是利用浏览器现在已经支持`ES6`的`import`,碰见`import`就会发送一个`HTTP`请求去加载文件，`Vite`启动一个 `koa` 服务器拦截这些请求，并在后端进行相应的处理将项目中使用的文件通过简单的分解与整合，然后再以`ESM`格式返回返回给浏览器。`Vite`整个过程中没有对文件进行打包编译，做到了真正的按需加载，所以其运行速度比原始的`webpack`开发编译速度快出许多！

#### 基于ESM的Dev server
在`Vite`出来之前，传统的打包工具如`Webpack`是先解析依赖、打包构建再启动开发服务器，`Dev Server` 必须等待所有模块构建完成，当我们修改了 `bundle`模块中的一个子模块， 整个 `bundle` 文件都会重新打包然后输出。项目应用越大，启动时间越长。

![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20241218163722624.webp)

而`Vite`利用浏览器对`ESM`的支持，当 `import` 模块时，浏览器就会下载被导入的模块。先启动开发服务器，当代码执行到模块加载时再请求对应模块的文件,本质上实现了动态加载。灰色部分是暂时没有用到的路由，所有这部分不会参与构建过程。随着项目里的应用越来越多，增加`route`，也不会影响其构建速度。

![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20241218163808735.webp)


#### 基于ESM 的 HMR 热更新

目前所有的打包工具实现热更新的思路都大同小异：主要是通过`WebSocket`创建浏览器和服务器的通信监听文件的改变，当文件被修改时，服务端发送消息通知客户端修改相应的代码，客户端对应不同的文件进行不同的操作的更新。

#### 整体流程
![](https://cdn.jsdelivr.net/gh//Silvora/oss@main/images/20241218164141725.webp)


## 三、总结
优点：
- 快速的冷启动: 采用`No Bundle`和`esbuild`预构建，速度远快于`Webpack`
- 高效的热更新：基于`ESM`实现，同时利用`HTTP`头来加速整个页面的重新加载，增加缓存策略
- 真正的按需加载: 基于浏览器`ESM`的支持，实现真正的按需加载

缺点:

- 生态：目前`Vite`的生态不如`Webpack`，不过我觉得生态也只是时间上的问题。
- 生产环境由于`esbuild`对`css`和代码分割不友好使用`Rollup`进行打包


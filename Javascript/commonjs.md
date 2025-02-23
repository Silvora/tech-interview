---
title: CommonJS的本质
date: 2023-01-07 11:39:04
categories: 
- JavaScript
---

# 面试官：CommonJS的本质


当使用 `require` 函数加载一个模块时，`Node.js` 会执行以下步骤：

- 解析路径：根据传入的模块标识符（如 `'./moduleA'`），确定模块的绝对路径。

- 缓存检查：检查该模块是否已经被加载并缓存。如果已经缓存，则直接返回缓存中的 `module.exports` 对象。

- 文件读取：如果模块未被缓存，`Node.js` 会读取该文件的内容。

- 封装执行：将文件内容封装在一个函数中，并传入 `require、module、exports` 等参数。然后执行该函数。


```js
// 伪代码
function require(modulePath) {
  // 1. 根据传递的模块路径，得到模块完整的绝对路径
  var moduleId = getModuleId(modulePath);
  // 2. 判断缓存
  if (cache[moduleId]) {
    return cache[moduleId];
  }
  // 3. 真正运行模块代码的辅助函数
  function _require(exports, require, module, __filename, __dirname) {
    // 目标模块的代码在这里
  }
  // 4. 准备并运行辅助函数
  var module = {
    exports: {},
  };
  var exports = module.exports;
  // 得到模块文件的绝对路径
  var __filename = moduleId;
  // 得到模块所在目录的绝对路径
  var __dirname = getDirname(__filename);
  _require.call(exports, exports, require, module, __filename, __dirname);
  // 5. 缓存模块
  cache[moduleId] = module.exports;
  // 6. 返回模块导出的内容
  return module.exports;
}
```



```js
// 均相等
console.log(this === exports);
console.log(this === module.exports);

// 函数环境运行 里面包含argument

this.a = 1;
exports.b = 2;
exports = {
  c: 3,
};
// 最终返回这个
module.exports = {
  d: 4
};
exports.e = 5;
this.f = 6;


console.log(this); // {a:1, b:2, f:6}
console.log(exports); // {c:3, e:5}
console.log(module.exports); // {d:4}
```











/** 手写 call
 * 用法：call 方法用于调用一个函数，并指定函数内部 this 的指向，传入一个对象
 * 思路：
 *  1、判断 this 是否指向一个函数  只有函数才可以执行
 *  2、获取传入的 context 上下文 也就是我们要指向的 如果不存在就指向 window
 *  3、将当前 this 也就是外部需要执行的函数 绑定到 context 上 然后执行获取 result 传入 ...args 确保参数位置正确
 *  4、删除 context 对象的 fn 属性 并将 result 返回
 */

Function.prototype.myCall = function (context, ...args) {
    if (typeof this !== 'function') {
      return new TypeError('type error')
    }
    context = context || window
  
    // 缓存this
  
    context.fn = this
  
    const result = context.fn(...args)
  
    delete context.fn
  
    return result
  }
  
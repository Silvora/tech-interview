/** 手写 bind
 * 用法：bind() 方法创建一个新的函数，在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。
 * 思路：
 *  1、判断 this 是否指向一个函数  只有函数才可以执行
 *  2、获取传入的 context 上下文 也就是我们要指向的 如果不存在就指向 window
 *  3、将当前 this 也就是外部需要执行的函数 绑定到 context 上的一个 fn 属性上
 *  4、返回一个函数 供外部调用 执行函数后传入新的参数
 *  5、执行在闭包内缓存的 fn 将两次参数一起传入 删除 fn 返回 result
 */

Function.prototype.myBind = function (context, ...args1) {
    if (typeof this !== 'function') {
      return new TypeError('type error')
    }
    context = context || window
    context.fn = this
  
    // 和 call apply 不一样的是 bind 返回一个函数 需要在外部执行  参数为多个对象 且返回的对象里也会有参数
    return function (...args2) {
      const result = context.fn(...args1, ...args2)
      delete context.fn
      return result
    }
  }
  
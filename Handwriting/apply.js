/** 手写 apply
 * 用法：apply 方法用于调用一个函数，并指定函数内部 this 的指向，传入一个数组
 * 思路：
 *  1、判断 this 是否指向一个函数  只有函数才可以执行
 *  2、获取传入的 context 上下文 也就是我们要指向的 如果不存在就指向 window
 *  3、将当前 this 也就是外部需要执行的函数 绑定到 context 上的一个 fn 属性上
 *  4、执行 fn 函数 判断 args 是否有 如果没有参数就直接执行 如果有参数 将参数展开传入 fn
 *  5、删除 context 对象的 fn 属性 并将 result 返回
 */

Function.prototype.myApply = function (context, args) {
    if (typeof this !== 'function') {
      return new TypeError('type error')
    }
  
    // 和 call 一样 只不过传入的参数只有一个 类型为数组 在执行 fn 的时候将参数展开
    context = context || window
  
    context.fn = this
  
    const result = args ? context.fn(...args) : context.fn()
  
    delete context.fn
  
    return result
  }
  
  
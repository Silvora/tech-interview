/** 函数柯里化
 * 用法：函数柯里化是一种将接受多个参数的函数转换为接受一系列单一参数的函数的技术
 * 思路：
 *  1、使用 fn.length 获取函数的形参数量
 *  2、如果没有传入初始参数数组 则将其初始化为空数组 在递归的时候会接受上一次的形参
 *  3、返回一个闭包函数 接受函数的实参 将 args 中的形参和当前的形参进行合并 得到 newArgs
 *  4、如果新的参数数组 newArgs 长度大于等于 length 函数的形参数量 调用 apply 执行函数 传入 newArgs
 *  5、如果新的参数数组长度小于函数的形参数量 则再次调用 curry 函数 将新的参数数组作为初始参数传入 返回一个新的闭包函数
 * @param {*} fn
 * @param {*} args
 * @return {*} 
 */
function curry(fn, args) {
    // 获取 fn 获取 add 函数的形参数量
    const length = fn.length
  
    // 递归执行时传递的上一次参数 第一次执行 [] 第二次执行 [1]
    args = args || []
    return function () {
      // 将上一次参数和这次的参数进行合并  得到新的参数数组
      const newArgs = [...args, ...arguments]
  
      // 判断 newArgs 长度是否和 add 函数形参长度一致 如果超过就执行 fn 函数 传递 newArgs
      if (newArgs.length >= length) {
        return fn.apply(this, newArgs)
      } else {
        // 小于 add 函数形参长度 递归调用 curry 函数 累积参数 传递 newArgs
        return curry(fn, newArgs)
      }
    }
  }
  
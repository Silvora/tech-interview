/** 手写节流
 * 用法：函数在 n 秒内只执行一次，如果多次触发，则忽略执行。
 * 思路：
 *  1、记录函数上一次执行的时间戳 startTime
 *  2、返回一个闭包函数 当被调用时会记录一下执行时间 nowTime
 *  3、比较两次执行时间间隔 是否超过了 wait 时间
 *  4、如果是大于 wait 时间 说明已经过了一个 wait 时间 可以执行函数
 *    4.1、更新 startTime 方便下次对比
 *    4.2、通过 apply 执行函数fn 传入 arguments 参数
 *  5、如果没有超过 wait 时间  说明是在 wait 时间内又执行了一次  忽略
 * @param {Function} fn 执行函数
 * @param {Number} wait 等待时间
 * @return {*} 
 */
function throttle(fn, wait) {
    let startTime = Date.now()
  
    return function () {
      const nowTime = Date.now()
  
      // 计算两次执行的间隔时间 是否大于 wait 时间
      if (nowTime - startTime >= wait) {
        startTime = nowTime
        return fn.apply(this, arguments)
      }
    }
  }
  
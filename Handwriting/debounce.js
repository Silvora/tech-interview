/** 手写防抖
 * 用法：函数在 n 秒后再执行，如果 n 秒内被触发，重新计时，保证最后一次触发事件 n 秒后才执行。
 * 思路：
 *  1、保存一个变量 timer
 *  2、返回一个闭包函数 函数内判断一下 timer 是否有值
 *    2.1、如果有值 说明 定时器已经开启 需要将定时器清空
 *  3、设置定时器 等待 wait 后执行 将定时器赋值给 timer 记录
 *  4、通过 apply 执行函数 传入 arguments
 * @param {*} fn
 * @param {*} wait
 * @param {boolean} [immediate=false]
 * @return {*} 
 */
function debounce(fn, wait, immediate = false) {
    let timer = null
  
    return function () {
      // 存在定时器 清空
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      // 立即执行
      if (immediate) {
        // 判断是否执行过  如果执行过 timer 不为空
        const flag = !timer
  
        // 执行函数
        flag && fn.apply(this, arguments)
  
        // n 秒后清空定时器
        timer = setTimeout(() => {
          timer = null
        }, wait)
      } else {
        timer = setTimeout(() => {
          fn.apply(this, arguments)
        }, wait)
      }
    }
  }
  
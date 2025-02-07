/** 深拷贝
 * 用法：拷贝一个对象的属性值 如果遇到属性值为引用类型的时候，它新建一个引用类型并将对应的值复制给它，因此对象获得的一个新的引用类型而不是一个原有类型的引用
 * 思路：
 *  1、判断是否为对象
 *  2、判段对象是否在 map 中 如果存在就不需要操作
 *  3、将 obj 放入 map 中 避免重复引用
 *  4、for in 遍历对象 拿到 key 判断 key 是否在 obj 中
 *  5、value 如果为对象 就递归拷贝 否则就赋值
 * @param {*} obj
 * @param {*} [map=new Map()]
 * @return {*} 
 */
function deepCopy(obj, map = new Map()){
    if (!obj || typeof obj !== 'object'){
      return obj
    }
  
    // 判断 obj 是否在 map 中存在 如果存在就不需要递归调用 直接返回数据
    if (map.get(obj)) {
      return map.get(obj)
    }
    const newObj = Array.isArray(obj) ? [] : {}
  
    // 放入 map 中 记录当前对象 避免重复拷贝 循环引用
    map.set(obj, newObj)
  
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // 如果 value 还是一个对象 递归获取 否则就赋值
        newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key], map) : obj[key]
      }
    }
  
    return newObj
  }
  
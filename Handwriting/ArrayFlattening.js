
let arr = [1, [2, [3, 4, 5]]]


function flatten_1(arr) {
    return arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten_1(b) : b), [])
}

function flatten_2(arr) {
   let result = []

   for (let i = 0; i < arr.length; i++) {
       if (Array.isArray(arr[i])) {
           result = result.concat(flatten_2(arr[i]))
       } else {
           result.push(arr[i])
       }
   }
   return result
}

function flatten_3(arr) {
    return arr.flat(Infinity)
}


function myReduce(arr, fn, init) {
    let acc = init !== undefined ? init : arr[0];
    let index = init !== undefined ? 0 : 1;
    for (let i = index; i < arr.length; i++) {
        acc = fn(acc, arr[i], i, arr);
    }
    return acc;
}

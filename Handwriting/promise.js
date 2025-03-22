class MyPromise {
    /**
     * 构造函数，用于实例化 Promise
     * @param {function} executor  executor 函数，执行器函数
     * @param {function} executor.resolve  executor 函数的 resolve 回调
     * @param {function} executor.reject  executor 函数的 reject 回调
     */
    constructor(executor) {
        this.state = 'pending'
        this.value = undefined
        this.reason = undefined
        this.fulfilledCallbacks = []
        this.rejectedCallbacks = []
        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled'
                this.value = value
                this.fulfilledCallbacks.forEach(fn => fn())
            }
        }
        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected'
                this.reason = reason
                this.rejectedCallbacks.forEach(fn => fn())
            }
        }
        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    /**
     * @static
     * @param {*} value
     * @returns {MyPromise}
     * @description
     * 如果 value 是一个 Promise,则直接返回它
     * 如果 value 是一个普通值,则返回一个 resolved 状态的 Promise
     * 如果 value 是一个 thenable 对象,则将其转换为一个 Promise
     */
    static resolve(value) {
        return new MyPromise((resolve, reject) => {
            if (value instanceof MyPromise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }

    /**
     * @static
     * @param {*} reason
     * @returns {MyPromise}
     * @description
     * Returns a Promise object that is rejected with the given reason.
     */

    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason)
        })
    }

    /**
     * @description
     * Adds a rejection handler to the promise, or null to make sure the promise is never rejected.
     * @param {function} onRejected The handler to call when the promise is rejected.
     * @returns {MyPromise} A new promise that handles the rejection.
     */
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }

    /**
     * @description
     * Adds a handler to the promise that will be called when the promise is either resolved or rejected.
     * @param {function} onFinally The handler to call when the promise is either resolved or rejected.
     * @returns {MyPromise} A new promise.
     */
    finally(onFinally) {
        return this.then(onFinally, onFinally)
    }

    /**
     * @description
     * Returns a promise that resolves when all of the promises in the iterable have resolved,
     * or rejects with the reason of the first promise that rejects.
     * @param {MyPromise[]} promises - An array of promises.
     * @returns {MyPromise} A promise that resolves with an array of the results of the input promises in the same order.
     * If any promise in the array rejects, the returned promise will also reject with the reason of the first rejected promise.
     * If the input is not an array, returns a TypeError.
     */

    static all(promises) {
      
        if(Array.isArray(promises) === false) {
            return new TypeError('promises must be an array')
        }

        return new MyPromise((resolve, reject) => {
            const values = []
            let count = 0
            for (let i = 0; i < promises.length; i++) {
                MyPromise.resolve(promises[i]).then(res => {
                    values[i] = res
                    count++
                    if (count === promises.length) {
                        resolve(values)
                    }
                }, reject)
            }
        })
    }

    static race(promises) {

        if(Array.isArray(promises) === false) {
            return new TypeError('promises must be an array')
        }

        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                MyPromise.resolve(promises[i]).then(resolve, reject)
            }
        })
    }

    static allSettled(promises) {
        return new MyPromise((resolve, reject) => {
            const values = []
            let count = 0
            for (let i = 0; i < promises.length; i++) {
                MyPromise.resolve(promises[i]).then(res => {
                    values[i] = { status: 'fulfilled', value: res }
                   
                }, reason => {
                    values[i] = { status: 'rejected', reason }
                    count++
                }).finally(() => {
                    count++
                    if (count === promises.length) {
                        resolve(values)
                    }
                })
            }
        })
    }

    /**
     * 如果所有的promise都reject,那么将所有的rejected原因传递给reject方法
     * 如果有一个promise resolve,那么将resolve的值传递给resolve方法
     * @param {MyPromise[]} promises
     * @returns {MyPromise}
     */
    static any(promises) {
        return new MyPromise((resolve, reject) => {
            let count = 0
            for (let i = 0; i < promises.length; i++) {
                MyPromise.resolve(promises[i]).then(resolve, reason => {
                    count++
                    if (count === promises.length) {
                        reject(reason)
                    }
                })
            }
        })
    }

    resolvePromise(x, resolve, reject) {
        if (x instanceof MyPromise) {
            x.then(y => resolvePromise(y, resolve, reject), reject)
        } else {
            resolve(x)
        }
    }

    /**
     * 
     * @param {Function} onFulfilled 成功回调
     * @param {Function} onRejected  失败回调
     * @returns {MyPromise} 一个新的promise
     */
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason } 

        return new MyPromise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value)
                        resolvePromise(x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0)
            } else if (this.state === 'rejected') {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason)
                        resolvePromise(x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0)
            } else {
                this.fulfilledCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.value)
                            resolvePromise(x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0)
                })
                this.rejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.reason)
                            resolvePromise(x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0)
                })
            }
        })
    }
}
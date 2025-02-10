class MyPromise {
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

    static resolve(value) {
        return new MyPromise((resolve, reject) => {
            if (value instanceof MyPromise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }

    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason)
        })
    }

    catch(onRejected) {
        return this.then(undefined, onRejected)
    }

    finally(onFinally) {
        return this.then(onFinally, onFinally)
    }

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
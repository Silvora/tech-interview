
class EventCenter {
    constructor() {
        this.events = {}
    }
    // 订阅
    on(type, callback) {
        if (!this.events[type]) {
            this.events[type] = []
        }
        this.events[type].push(callback)
    }
    // 触发
    emit(type, ...args) {
        if (this.events[type]) {
            this.events[type].forEach(callback => {
                callback(...args)
            })
        }
    }
    // 取消订阅
    off(type, callback) {
        if (this.events[type]) {
            this.events[type] = this.events[type].filter(fn => fn !== callback)
        }
    }
}
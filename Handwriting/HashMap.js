class MyHashMap {
    constructor(size = 100) {
        this.size = size; // 哈希表大小
        this.buckets = new Array(size).fill(null).map(() => []); // 初始化存储桶
    }

    // _getBucket(key) {
    //     const index = this._hash(key);
    //     const bucket = this.buckets[index];
    //     return bucket;
    // }

    // 简单哈希函数：计算字符串键的哈希值
    _hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) % this.size;
        }
        return hash;
    }

    // 插入或更新键值
    set(key, value) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        // const bucket = this._getBucket(key);

        for (let pair of bucket) {
            if (pair[0] === key) {
                pair[1] = value; // 更新值
                return;
            }
        }

        bucket.push([key, value]); // 插入新键值对
    }

    // 获取键的值
    get(key) {
        const index = this._hash(key);
        const bucket = this.buckets[index];

        for (let pair of bucket) {
            if (pair[0] === key) {
                return pair[1];
            }
        }

        return undefined; // 没找到返回 undefined
    }

    // 删除键
    delete(key) {
        const index = this._hash(key);
        const bucket = this.buckets[index];

        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    // 检查是否包含某个键
    has(key) {
        return this.get(key) !== undefined;
    }
}



const map = new MyHashMap();
map.set("name", "Alice");
map.set("age", 25);
console.log(map.get("name")); // Alice
console.log(map.get("age")); // 25
console.log(map.has("name")); // true
map.delete("name");
console.log(map.has("name")); // false


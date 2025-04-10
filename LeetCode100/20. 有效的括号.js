// 示例 1： 元素必须对应
// 输入：s = "()"
// 输出：true

// 示例 2：
// 输入：s = "()[]{}"
// 输出：true

// 示例 3：
// 输入：s = "(]"
// 输出：false

// 示例 4：
// 输入：s = "([])"
// 输出：true


/**
 * @param {string} s
 * @return {boolean}
 */
// 栈
var isValid = function(s) {
    const stack = []
    const map = {
        '(': ')',
        '[': ']',
        '{': '}'
    }
    for (let char of s) {
        if (char in map) {
            stack.push(char);
        } else {
            const last = stack.pop();
            if (map[last] !== char) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
};

// 栈 优化实现
var isValid = function(s) {
    if (s.length % 2 !== 0) return false;
    
    const stack = [];
    
    for (let char of s) {
        switch (char) {
            case '(': stack.push(')'); break;
            case '[': stack.push(']'); break;
            case '{': stack.push('}'); break;
            default:
                if (char !== stack.pop()) {
                    return false;
                }
        }
    }
    
    return stack.length === 0;
};
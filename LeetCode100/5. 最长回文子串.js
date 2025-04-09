// 示例 1：
// 输入：s = "babad"
// 输出："bab"
// 解释："aba" 同样是符合题意的答案。

// 示例 2：
// 输入：s = "cbbd"
// 输出："bb"


/**
 * @param {string} s
 * @return {string}
 */

// 动态规划
var longestPalindrome = function(s) {
    const n = s.length;
    if (n < 2) return s;
    
    let maxLen = 1;
    let begin = 0;
    const dp = Array.from({length: n}, () => new Array(n).fill(false));
    
    // 所有长度为1的子串都是回文
    for (let i = 0; i < n; i++) {
        dp[i][i] = true;
    }
    
    // 枚举子串长度
    for (let L = 2; L <= n; L++) {
        // 枚举左边界
        for (let i = 0; i < n; i++) {
            // 右边界 j = i + L - 1
            const j = i + L - 1;
            if (j >= n) break;
            
            if (s[i] !== s[j]) {
                dp[i][j] = false;
            } else {
                if (j - i < 3) {
                    dp[i][j] = true;
                } else {
                    dp[i][j] = dp[i+1][j-1];
                }
            }
            
            // 更新最长回文子串
            if (dp[i][j] && j - i + 1 > maxLen) {
                maxLen = j - i + 1;
                begin = i;
            }
        }
    }
    
    return s.substring(begin, begin + maxLen);
};



// 中心扩展法
var longestPalindrome = function(s) {
    if (s.length < 2) return s;
    
    let start = 0, end = 0;
    
    const expandAroundCenter = (left, right) => {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    };
    
    for (let i = 0; i < s.length; i++) {
        const len1 = expandAroundCenter(i, i);    // 奇数长度
        const len2 = expandAroundCenter(i, i+1); // 偶数长度
        const maxLen = Math.max(len1, len2);
        
        if (maxLen > end - start) {
            start = i - Math.floor((maxLen - 1) / 2);
            end = i + Math.floor(maxLen / 2);
        }
    }
    
    return s.substring(start, end + 1);
};


// Manacher算法（最优解）
var longestPalindrome = function(s) {
    // 预处理字符串
    let t = '#';
    for (const c of s) {
        t += c + '#';
    }
    t = '^' + t + '$';
    
    const n = t.length;
    const p = new Array(n).fill(0);
    let center = 0, right = 0;
    let maxLen = 0, start = 0;
    
    for (let i = 1; i < n - 1; i++) {
        // 利用对称性
        if (i < right) {
            p[i] = Math.min(right - i, p[2 * center - i]);
        }
        
        // 中心扩展
        while (t[i + p[i] + 1] === t[i - p[i] - 1]) {
            p[i]++;
        }
        
        // 更新中心和右边界
        if (i + p[i] > right) {
            center = i;
            right = i + p[i];
        }
        
        // 记录最长回文
        if (p[i] > maxLen) {
            maxLen = p[i];
            start = (i - p[i]) / 2;
        }
    }
    
    return s.substring(start, start + maxLen);
};
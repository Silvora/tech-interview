// 示例 1：
// 输入：[7,1,5,3,6,4]
// 输出：5
// 解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
//      注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。
// 示例 2：
// ：prices = [7,6,4,3,1]
// 输出：0
// 解释：在这种情况下, 没有交易完成, 所以最大利润为 0。

/**
 * @param {number[]} prices
 * @return {number}
 */
// 暴力法
var maxProfit = function(prices) {
    let max = 0;
    for (let i = 0; i < prices.length; i++) {
        for (let j = i + 1; j < prices.length; j++) {
            max = Math.max(max, prices[j] - prices[i]);
        }
    }
    return max;
};

// 一次遍历
var maxProfit = function(prices) {
    let min = prices[0];
    let max = 0;
    for (let i = 1; i < prices.length; i++) {
        min = Math.min(min, prices[i]);
        max = Math.max(max, prices[i] - min);
    }
    return max;
};

// 动态规划
var maxProfit = function(prices) {
    const n = prices.length;
    if (n === 0) return 0;
    
    let dp = Array(n).fill(0);
    for (let i = 1; i < n; i++) {
        dp[i] = Math.max(dp[i - 1], prices[i] - prices[i - 1]);
    }
    
    return dp[n - 1];
};

// 动态规划（空间优化）
var maxProfit = function(prices) {
    const n = prices.length;
    if (n === 0) return 0;
    
    let max = 0;
    for (let i = 1; i < n; i++) {
        max = Math.max(max, prices[i] - prices[i - 1]);
        prices[i] = Math.min(prices[i], prices[i - 1]);
    }
    
    return max;
};

/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */

// 示例 1：
// 输入：nums1 = [1,3], nums2 = [2]
// 输出：2.00000
// 解释：合并数组 = [1,2,3] ，中位数 2

// 示例 2：
// 输入：nums1 = [1,2], nums2 = [3,4]
// 输出：2.50000
// 解释：合并数组 = [1,2,3,4] ，中位数 (2 + 3) / 2 = 2.5

// 归并排序法（直观解法）
var findMedianSortedArrays = function(nums1, nums2) {
    const merged = [];
    let i = 0, j = 0;
    
    // 合并两个有序数组
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) {
            merged.push(nums1[i++]);
        } else {
            merged.push(nums2[j++]);
        }
    }
    
    // 处理剩余元素
    while (i < nums1.length) merged.push(nums1[i++]);
    while (j < nums2.length) merged.push(nums2[j++]);
    
    const len = merged.length;
    if (len % 2 === 0) {
        return (merged[len/2 - 1] + merged[len/2]) / 2;
    } else {
        return merged[Math.floor(len/2)];
    }
};


// 二分查找法（高效解法）
var findMedianSortedArrays = function(nums1, nums2) {
    const merged = [...nums1, ...nums2].sort((a, b) => a - b);
    const len = merged.length;
    if (len % 2 === 0) {
        return (merged[len/2 - 1] + merged[len/2]) / 2;
    } else {
        return merged[Math.floor(len/2)];
    }
}

// 二分查找法（高效解法）
var findMedianSortedArrays = function(nums1, nums2) {
    // 确保nums1是较短的数组
    if (nums1.length > nums2.length) {
        [nums1, nums2] = [nums2, nums1];
    }
    
    const m = nums1.length;
    const n = nums2.length;
    let left = 0, right = m;
    const halfLen = Math.floor((m + n + 1) / 2);
    
    while (left <= right) {
        const i = Math.floor((left + right) / 2);
        const j = halfLen - i;
        
        if (i < m && nums2[j-1] > nums1[i]) {
            left = i + 1;
        } else if (i > 0 && nums1[i-1] > nums2[j]) {
            right = i - 1;
        } else {
            let maxLeft = 0;
            if (i === 0) maxLeft = nums2[j-1];
            else if (j === 0) maxLeft = nums1[i-1];
            else maxLeft = Math.max(nums1[i-1], nums2[j-1]);
            
            if ((m + n) % 2 === 1) return maxLeft;
            
            let minRight = 0;
            if (i === m) minRight = nums2[j];
            else if (j === n) minRight = nums1[i];
            else minRight = Math.min(nums1[i], nums2[j]);
            
            return (maxLeft + minRight) / 2;
        }
    }
    
    return 0;
};
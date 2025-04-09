// 示例 1：
// 输入：nums = [2,7,11,15], target = 9
// 输出：[0,1]
// 解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。

// 示例 2：
// 输入：nums = [3,2,4], target = 6
// 输出：[1,2]

// 示例 3：
// 输入：nums = [3,3], target = 6
// 输出：[0,1]


/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */

// 暴力解法
// 时间复杂度 O(n^2)
// 空间复杂度 O(1)
var twoSum = function(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
};


// 哈希表解法
// 时间复杂度 O(n)
// 空间复杂度 O(n)
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
};


// 双指针解法
// 时间复杂度 O(nlogn)
// 空间复杂度 O(1)
var twoSum = function(nums, target) {
    nums.sort((a, b) => a - b);
    let left = 0;
    let right = nums.length - 1;
    while (left < right) {
        const sum = nums[left] + nums[right];
        if (sum === target) {
            return [nums.indexOf(nums[left]), nums.indexOf(nums[right])];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return [];
};


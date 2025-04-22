// 示例 1：
// 输入：root = [3,9,20,null,null,15,7]
// 输出：3
// 解释：
//       3
//      / \
//     9   20
//        /  \
//       15   7

// 示例 2：
// 输入：root = [1,null,2]
// 输出：2
// 解释：
//       1
//        \
//         2


/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
// 递归法
var maxDepth = function(root) {
    if (!root) return 0;
    return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}

// 迭代法
var maxDepth = function(root) {
    if (!root) return 0;
    const stack = [[root, 1]];
    let maxDepth = 0;
    while (stack.length) {
        const [node, depth] = stack.pop();
        maxDepth = Math.max(maxDepth, depth);
        if (node.left) stack.push([node.left, depth + 1]);
        if (node.right) stack.push([node.right, depth + 1]);
    }
    return maxDepth;
};

// 层序遍历法
var maxDepth = function(root) {
    if (!root) return 0;
    const queue = [[root, 1]];
    let maxDepth = 0;
    while (queue.length) {
        const [node, depth] = queue.shift();
        maxDepth = Math.max(maxDepth, depth);
        if (node.left) queue.push([node.left, depth + 1]);
        if (node.right) queue.push([node.right, depth + 1]);
    }
    return maxDepth;
};
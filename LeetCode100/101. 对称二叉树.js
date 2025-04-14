// 示例 1：
// 输入：root = [1,2,2,3,4,4,3]
// 输出：true
// 解释：
//    1
//   / \
//  2   2
// / \ / \
//3  4 4  3

// 示例 2：
// 输入：root = [1,2,2,null,3,null,3]
// 输出：false
// 解释：
//    1
//   / \
//  2   2
//   \   \
//    3    3

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
 * @return {boolean}
 */
// 递归法
// 判断两棵树是否镜像对称
function isMirror(t1, t2) {
    if (!t1 && !t2) return true; // 两棵树都为空
    if (!t1 || !t2) return false; // 一棵树为空，另一棵树不为空
    return (t1.val === t2.val) && // 当前节点值相等
           isMirror(t1.left, t2.right) && // 左子树与右子树镜像对称
           isMirror(t1.right, t2.left); // 右子树与左子树镜像对称
}

var isSymmetric = function(root) {
    if (!root) return true; // 空树是对称的
    return isMirror(root.left, root.right); // 判断左右子树是否镜像对称
}

// 迭代法
var isSymmetric = function(root) {
    if (!root) return true;
    const queue = [root.left, root.right];
    while (queue.length) {
        const left = queue.shift();
        const right = queue.shift();
        if (!left && !right) continue;
        if (!left || !right || left.val !== right.val) return false;
        queue.push(left.left, right.right);
        queue.push(left.right, right.left);
    }
    return true;
};

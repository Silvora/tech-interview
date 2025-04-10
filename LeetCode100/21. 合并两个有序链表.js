// 示例 1：
// 输入：l1 = [1,2,4], l2 = [1,3,4]
// 输出：[1,1,2,3,4,4]


// 示例 2：
// 输入：l1 = [], l2 = []
// 输出：[]


// 示例 3：
// 输入：l1 = [], l2 = [0]
// 输出：[0]

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
// 迭代法
var mergeTwoLists = function(list1, list2) {
    let dummy = new ListNode(0); // 虚拟头节点
    let current = dummy;
    
    while (list1 && list2) {
        if (list1.val < list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }
    
    current.next = list1 || list2; // 将剩余节点连接到合并后的链表
    
    return dummy.next;
}

// 递归法
var mergeTwoLists = function(list1, list2) {
    if (!list1) return list2;
    if (!list2) return list1;
    
    if (list1.val < list2.val) {
        list1.next = mergeTwoLists(list1.next, list2);
        return list1;
    } else {
        list2.next = mergeTwoLists(list1, list2.next);
        return list2;
    }
}


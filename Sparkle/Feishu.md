---
title: 说一下飞书文档核心逻辑? 具体是怎么实现的?
date: 2025-03-13 12:56:23
categories: 
- Sparkle
---

# 面试官：说一下飞书文档核心逻辑? 具体是怎么实现的?

## 一、重难点
- 编辑器底层基础处理
- 光标,框选,缓存区等换器(json2html,html2json,md2html,html2md)
- 协同,冲突解决,undo/redo


#### 怎么实现
主要功能:
- 文本格式化, 如加粗,斜体,下划线,删除线,标题,列表,引用,代码块等
- 丰富的文本节点, 如图片,表格,链接,视频,音频,文件等
- 光标
- 框选
- undo/redo
- 协同编辑,wss(websocket)
- 兼容性(API的兼容性,execCommand弃用)
  - 使用window.getSelection替代execCommand

数据协议: JSON
JSONContent <---> html string 互转

细节: contenteditable="true" 使文本可编辑


#### 怎么设计
- 基于block架构(低代码基于物料)
- 协同操作(OT,CRDT(状态,操作)算法),强一致性
  - ot:操作变换
    - 转换函数: 在接收到一个外部操作后,将本地未提交的操作与外部操作合并
    - 操作队列: ot使用一个操作队列来存储未提交的操作
    - 操作序列: 将所有编辑操作按顺序排列,这样可以按一致性性算法进行合并
  - CRDT: 无冲突复制数据类型(automerge,yjs)
    - 基于状态: 每个节点维护自身状态,通过合并不同节点的状态来达到一致性
    - 基于操作: 每个节点间操作传播给其他节点,节点收到操作后按顺序应用来更新状态
  - 实时性: indexedDB, webrtc, websocket
  - 冲突解决: 多用户对同一内容编写,能够合理解决对应冲突
  - 权限版本,undo/redo,弱网恢复
  - yjs
    - provider: 
      - 面向连接: y-webrtc, y-websocket(数据同步)
      - 面向存储: y-indexeddb(弱网存储),y-redis
      - 面向协议: y-protocal
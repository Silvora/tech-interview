---
title: 说一下低代码核心逻辑? 具体是怎么实现的?
date: 2025-03-13 12:56:23
categories: 
- Sparkle
---

# 面试官：说一下低代码核心逻辑? 具体是怎么实现的?

## 一、业务场景
- 企业内部系统
  - 报表,运营后台,审批
  - 通过多种模版,快速搭建系统
- 业务自动化系统
  - 订单处理,通知系统
  - 流程引擎和自动化为核心,减少人员干预
- C端产品
  - 活动页,落地页
- 设计类工具软件
  - figma ai
- 竞品
  - retool, webflow, framer, illa, appsmith, tooljet, zion, flutterFlow

## 二、核心功能
- 物料编排
- 物料渲染引擎
- 数据源管理
- 流程编辑器(负责配置) + 流程引擎(负责执行(内存型引擎,工作流流程引擎[OA, 审批流, 自动化批处理流]))
- 资源中心(静态资源)

**沉淀产物(monorepo packages)**
- layout-engine-sdk(物料编排)
- material-renderer(物料渲染引擎)
- online-database(千万行数据渲染)
- flow-engin(flow-editor流程编辑器 flow-interpreter流程执行器)
- resource (大文件上传)
  - file-uploader

**业务价值**
- 灵活的布局引擎,支持多种场景
- 动态数据源管理,支持复杂业务联动, 是否支持多表关联
- 流程引擎讲话复杂业务逻辑, 业务是怎么样自动化批处理的,怎么界定内存引擎和工作流引擎

**技术架构**
- 模块化设计,支持不同功能解藕
- 可扩展性,支持未来新增,物料可以通过插件体系组织,支持灵活横向扩展
- 高性能渲染机制与缓存机制

#### layout-engine-sdk(物料编排)
基础功能
- 引擎分类
  - grid
  - flex
  - canvas
  - block

- 应用场景
  - 后台管理,crm,erp
  - 仪表盘
  - 表单,OA,数据源

#### material-renderer(物料渲染引擎)
基础功能
- 渲染方式
- 设备兼容
- 主题定制
  - 样式定制
  - 样式消费

#### online-database(千万行数据渲染)
- canvas table
- 类似飞书多维表, 字段管理, 单元格交互(CellEditor, CellRenderer, CellValidator, CellRules)
- 表设计
  - schema(管理字段),业务表(存储字段数据)
- 外部数据连接


#### flow-engin
#### resource


---
title: serverless?
date: 2025-03-03 20:12:04
categories: 
- Sparkle
---

# 面试官：详细说一下什么是serverless?


## 一、什么serverless

Serverless（无服务器）架构是一种云计算执行模型，开发者无需管理服务器，云服务商自动分配和管理计算资源。它的核心思想是 按需执行，应用的代码只在需要时运行，并按执行时间或请求次数计费，而非持续运行。

Serverless并不意味着没有服务器，而是服务器的管理和资源分配被云平台完全抽象化，开发者专注于 编写业务逻辑，而无需关心底层基础设施。


Serverless 的特点
- 无需服务器管理：不需要手动配置或维护服务器，云平台负责资源管理。
- 自动扩展：流量增加时自动扩展，流量减少时自动回收资源，提升资源利用率。
- 按需计费：只为实际运行的计算资源付费，没有闲置成本。
- 事件驱动：应用基于事件触发执行，如HTTP请求、数据库变更、消息队列等。
- 高可用性：云服务商自动提供高可用性和容错能力。


#### Serverless 架构组成
![](https://cdn.jsdelivr.net/gh/Silvora/oss@main/images/20250304025910595.png)
- FaaS（Function as a Service）：允许开发者部署独立的函数，例如 AWS Lambda、阿里云函数计算、腾讯云云函数等。
- BaaS（Backend as a Service）：提供无需管理的后端服务，如数据库、认证、消息队列、存储等。例如 Firebase、AWS DynamoDB、MongoDB Atlas。

## 一、工作原理

- 事件驱动
    - 代码（通常称为函数）会在特定事件触发时执行，这些事件可能来源于 HTTP 请求、文件上传、数据库变更等。
- 按需计费
    - 用户只为代码实际执行时消耗的计算资源付费，避免了传统服务器长时间空闲时的资源浪费。
- 自动伸缩
    - 云平台能够根据请求的频率和负载情况自动扩展或收缩资源，满足流量高峰的需求而在低流量时降低成本。
- 开发者专注业务逻辑
    - 由于无需关注服务器的部署、维护、扩容等问题，开发者可以将更多精力投入到业务功能的设计和实现上。


#### Serverless 架构的优缺点

优点:
- 降低运维成本：无需管理服务器、操作系统及中间件，从而简化了开发与运维流程。
- 弹性伸缩：自动根据请求量调整资源，适应高并发或低负载的场景。
- 高效资源利用：按实际使用计费，避免长时间的资源闲置。
- 快速部署：无需提前预置和配置大量服务器，适合敏捷开发和快速上线。

缺点:
- 冷启动问题：当函数长时间未调用时，首次请求可能因初始化延迟而响应较慢。
- 调试与监控复杂：由于执行环境高度抽象，问题排查和性能监控可能较为困难。
- 供应商锁定风险：不同云服务商提供的 Serverless 平台存在差异，迁移时可能需要重新适配。
- 资源和执行时间限制：大部分平台对单个函数的内存、CPU、执行时长等都有明确限制。
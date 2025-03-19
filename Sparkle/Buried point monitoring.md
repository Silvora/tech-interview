---
title: 如何从0搭建前端埋点监控系统?
date: 2025-03-14 15:17:48
categories: 
- Sparkle
---

# 面试官：如何从0搭建前端埋点监控系统?

1. **确定需求**
首先明确系统的目标，例如：
- 性能监控：白屏时间、首屏时间、可交互时间、资源加载时间等
- 错误监控：捕获 JS 报错、Promise 未捕获异常、资源加载失败等
- 行为埋点：记录用户点击、页面跳转、输入行为等
- PV/UV 统计：页面访问量、用户唯一标识、留存、跳出率等
- 用户设备信息：浏览器、操作系统、网络环境、屏幕分辨率等
- 告警通知：性能异常、错误爆发、流量突增/突减预警

前端SDK:
- 性能采集：Performance API（performance.timing、performance.getEntriesByType()）
- 错误捕获：window.onerror、window.addEventListener('error')、unhandledrejection
- 行为埋点：代理 addEventListener、MutationObserver、History API 劫持路由
- 用户信息：navigator、window.screen、userAgent 解析设备信息
- 数据上报：Beacon API（低影响）、XHR/Fetch（兼容性）


1. **选择埋点方式**
常见的埋点方式有：
- 手动埋点：在代码中手动插入埋点代码。
- 自动埋点：通过工具或框架自动捕获事件。
- 可视化埋点：通过可视化工具选择页面元素进行埋点。


3. **设计数据格式**
定义统一的数据格式，通常包括：
- 事件类型（如点击、页面浏览）
- 事件时间
- 用户信息（如用户 ID）
- 页面信息（如 URL）
- 设备信息（如浏览器、操作系统）

4. **实现数据收集**
编写代码收集数据并发送到服务器。以下是一个简单示例：

```js
function trackEvent(eventType, eventData) {
    const data = {
        eventType,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...eventData
    };

    // 发送数据到服务器
    fetch('https://your-server-endpoint.com/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

// 示例：点击事件埋点
document.getElementById('button').addEventListener('click', () => {
    trackEvent('click', { buttonId: 'button' });
});
```


5. **数据存储**
选择数据库存储收集到的数据，常用选项有：
- 关系型数据库（如 MySQL、PostgreSQL）
- NoSQL 数据库（如 MongoDB、Cassandra）
- 时序数据库（如 InfluxDB）


6. **数据处理与分析**
对收集到的数据进行处理和分析，常见方式有：
- 批处理：使用 Hadoop、Spark 等工具。
- 实时处理：使用 Kafka、Flink 等工具。



7. **可视化展示**
使用可视化工具展示分析结果，常用工具有：
- Grafana
- Kibana
- Tableau

8. **错误监控**
捕获前端错误并上报：
```js
window.onerror = function(message, source, lineno, colno, error) {
    trackEvent('error', {
        message,
        source,
        lineno,
        colno,
        stack: error ? error.stack : null
    });
};
```

9. **性能监控**
监控页面性能：
```js
window.addEventListener('load', () => {
    const timing = performance.timing;
    trackEvent('performance', {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart,
        // 其他性能指标
    });
});
```

10. **测试与优化**
- 测试：确保埋点数据准确无误。
- 优化：减少埋点对性能的影响，如延迟发送数据、合并请求等。

11. **安全与隐私**
- 确保数据安全和用户隐私，遵守 GDPR 等法规。

12. **部署与维护**
- 部署：将系统部署到生产环境。
- 维护：定期更新和维护系统，确保其稳定运行。


**难点**:
1. 数据采集性能开销
- 需要保证 SDK 本身足够轻量、上报异步非阻塞，避免二次拖累页面性能
- 可引入 Web Worker 处理复杂逻辑
2.	跨域上报与可靠性
- CORS 配置 or img 打点
- Beacon API 支持离开页面时的可靠上报
3.	数据清洗与存储扩展
- 日志量大时，按项目/设备/用户标签做分库分表
- 错误堆栈归并，去重相同报错
4.	实时计算与告警延迟
- Redis + Lua 脚本实现高效频次统计，防止告警风暴
- Kafka 解耦大数据流，支持实时消费与离线分析
5.	用户标识与隐私合规
- localStorage / cookie 生成唯一标识
- 支持匿名访问，避免存储敏感信息
6.	前端 SDK 易用性与扩展性
- 设计插件式架构，按需加载性能、错误、行为模块
- 提供 API 自定义埋点、错误上报、用户属性绑定



#### 如果是精确到组件级别的性能监控系统呢?

1. **明确监控目标**
确定需要监控的组件性能指标，例如：
- 组件挂载时间（Mount）
- 组件更新时间（Update）
- 组件卸载时间（Unmount）
- 渲染时间（Render）
- 副作用执行时间（如 useEffect 的执行时间）

2. **选择技术栈**
- 前端框架：React、Vue、Angular 等（本文以 React 为例）。
- 性能监控工具：使用 Performance API 或第三方库（如 React Profiler）。
- 数据上报：通过 HTTP 或 WebSocket 将数据发送到服务器。


3. **实现组件性能监控**
- 使用 React Profiler, React 提供了 Profiler API，可以精确测量组件的渲染时间。
```js
import React, { Profiler } from 'react';

function onRenderCallback(
  id, // 组件树 ID
  phase, // "mount" 或 "update"
  actualDuration, // 本次渲染耗时
  baseDuration, // 不使用 memoization 时的预估耗时
  startTime, // 渲染开始时间
  commitTime, // 提交时间
  interactions // 本次更新的交互集合
) {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  });

  // 将数据上报到服务器
  fetch('https://your-server-endpoint.com/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    }),
  });
}

function MyComponent() {
  return <div>My Component</div>;
}

function App() {
  return (
    <Profiler id="MyComponent" onRender={onRenderCallback}>
      <MyComponent />
    </Profiler>
  );
}

export default App;
```

- 如果不想依赖 Profiler，可以手动实现组件性能监控。使用 Performance API
```js
const start = performance.now();

// 模拟组件渲染
setTimeout(() => {
  const end = performance.now();
  const duration = end - start;

  console.log(`Component rendered in ${duration}ms`);

  // 上报数据
  fetch('https://your-server-endpoint.com/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      component: 'MyComponent',
      duration,
    }),
  });
}, 100);
```

在组件的生命周期方法中插入性能监控代码。

```js
class MyComponent extends React.Component {
  componentDidMount() {
    const end = performance.now();
    const duration = end - this.startTime;

    console.log(`Component mounted in ${duration}ms`);

    // 上报数据
    fetch('https://your-server-endpoint.com/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        component: 'MyComponent',
        phase: 'mount',
        duration,
      }),
    });
  }

  componentDidUpdate() {
    const end = performance.now();
    const duration = end - this.startTime;

    console.log(`Component updated in ${duration}ms`);

    // 上报数据
    fetch('https://your-server-endpoint.com/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        component: 'MyComponent',
        phase: 'update',
        duration,
      }),
    });
  }

  componentWillUnmount() {
    const end = performance.now();
    const duration = end - this.startTime;

    console.log(`Component unmounted in ${duration}ms`);

    // 上报数据
    fetch('https://your-server-endpoint.com/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        component: 'MyComponent',
        phase: 'unmount',
        duration,
      }),
    });
  }

  render() {
    this.startTime = performance.now();
    return <div>My Component</div>;
  }
}
```



4. **监控副作用性能**
对于 React 的函数组件，可以使用 useEffect 监控副作用的执行时间。
```js
import React, { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const start = performance.now();

    // 模拟副作用
    setTimeout(() => {
      const end = performance.now();
      const duration = end - start;

      console.log(`useEffect executed in ${duration}ms`);

      // 上报数据
      fetch('https://your-server-endpoint.com/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          component: 'MyComponent',
          phase: 'useEffect',
          duration,
        }),
      });
    }, 100);
  }, []);

  return <div>My Component</div>;
}
```


5. **数据存储与分析**
将收集到的性能数据存储到数据库中，并进行可视化分析。
- 数据库：MySQL、PostgreSQL、MongoDB 等。
- 可视化工具：Grafana、Kibana、Tableau 等。

6. **优化与扩展**
性能优化：减少监控代码对性能的影响，例如延迟上报、批量上报。
扩展功能：
- 监控组件层级关系。
- 监控组件渲染次数。
- 监控组件内存占用。

7. **测试与部署**
- 测试：确保监控代码的准确性和稳定性。
- 部署：将监控系统集成到生产环境中。
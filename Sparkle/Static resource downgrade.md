---
title: web 应用中如何对静态资源加载失败的场景做降级处理?
date: 2025-03-14 16:56:19
categories: 
- Sparkle
---

# 面试官：web 应用中如何对静态资源加载失败的场景做降级处理?


1. 资源重试
- 自动重试：当资源加载失败时，自动重试几次。

- 备用资源：如果主资源加载失败，尝试加载备用资源。
```js
<img src="primary-image.jpg" onerror="this.src='fallback-image.jpg';" alt="Fallback Image">
```


2. 使用 <picture> 标签
多格式支持：提供多种格式的图片，确保至少一种能加载。
```js
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Fallback Image">
</picture>
```


3. CDN 回源
本地回源：如果 CDN 资源加载失败，回源到本地服务器。
```js
const resourceUrl = 'https://cdn.example.com/resource.js';
fetch(resourceUrl).catch(() => {
  const localResourceUrl = '/local/resource.js';
  loadScript(localResourceUrl);
});
```


4. 资源预加载与懒加载
- 预加载：提前加载关键资源，减少失败概率。

- 懒加载：非关键资源延迟加载，失败时影响较小。
```js
<link rel="preload" href="critical-resource.js" as="script">
<img data-src="lazy-image.jpg" class="lazyload" alt="Lazy Image">
```


5. 错误监控与日志
- 监控：实时监控资源加载状态。
- 日志：记录加载失败信息，便于排查。

```js
window.addEventListener('error', (event) => {
  if (event.target.tagName === 'IMG') {
    console.error('Image failed to load:', event.target.src);
  }
}, true);
```

6. 用户提示
友好提示：资源加载失败时，提示用户并提供解决方案。
```js
const img = document.querySelector('img');
img.onerror = function() {
  alert('图片加载失败，请刷新页面或检查网络。');
};
```


7. Service Worker 缓存
离线缓存：使用 Service Worker 缓存资源，提升离线体验。
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

8. 资源压缩与优化
- 压缩：减小资源体积，降低加载失败概率。

- 优化：优化资源加载顺序，优先加载关键资源。

9. HTTP/2 与 HTTP/3
- 协议升级：使用 HTTP/2 或 HTTP/3 提升加载效率。

10. 资源完整性校验
校验：确保资源未被篡改。
```js
<script src="script.js" integrity="sha384-..."></script>
```
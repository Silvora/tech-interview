---
title: 1000万的数据流怎么渲染?
date: 2022-11-23 10:04:44
categories: 
- Sparkle
---

# 面试官：1000万的数据流怎么渲染? 


## 一、虚拟滚动（Virtual Scrolling）

对于大量数据的滚动展示，可以使用虚拟列表技术（如 react-window、react-virtualized）来只渲染当前可视区域的数据

虚拟滚动是优化表格渲染的核心技术。只渲染当前可视区域的数据，而非整个数据集

```js
import React from "react";
import { FixedSizeList as List } from "react-window";

const data = Array.from({ length: 10000000 }, (_, i) => `Item ${i + 1}`);

const Row = ({ index, style }) => (
  <div style={style}> {data[index]} </div>
);

export default function App() {
  return (
    <List
      height={500} // 可视区域高度
      itemCount={data.length} // 数据总量
      itemSize={35} // 每项高度
      width="100%" // 列表宽度
    >
      {Row}
    </List>
  );
}
```

## 二、分页加载（Server-Side Pagination）

分页是最常见的解决方案，通过服务端或客户端每次只加载一定数量的数据，而不是一次性加载全部数据

```js
<div id="data-container"></div>
<button id="load-more-btn">加载更多</button>

<script>
  let currentPage = 1; // 当前页数
  const pageSize = 100; // 每页数据条数
  const totalDataCount = 10000000; // 总数据条数（假设）

  function fetchData(page, size) {
    return new Promise((resolve) => {
      // 模拟从后端获取分页数据
      setTimeout(() => {
        const data = Array.from({ length: size }, (_, i) => `Item ${(page - 1) * size + i + 1}`);
        resolve(data);
      }, 500); // 模拟网络延迟
    });
  }

  async function loadMoreData() {
    if ((currentPage - 1) * pageSize >= totalDataCount) {
      alert("已加载所有数据");
      return;
    }

    const data = await fetchData(currentPage, pageSize);
    const container = document.getElementById("data-container");

    data.forEach((item) => {
      const div = document.createElement("div");
      div.textContent = item;
      container.appendChild(div);
    });

    currentPage++;
  }

  document.getElementById("load-more-btn").addEventListener("click", loadMoreData);
  loadMoreData(); // 页面加载时自动加载第一页数据
</script>
```

## 三、分片渲染（Chunk Rendering）

如果数据量较大，可以将渲染分成小片段，分批插入 DOM，以避免一次性操作阻塞主线程

```js
<div id="data-container"></div>

<script>
  const totalItems = 10000000; // 数据总量
  const batchSize = 1000; // 每批渲染的数量
  const container = document.getElementById("data-container");

  function renderChunk(startIndex, endIndex) {
    const fragment = document.createDocumentFragment();

    for (let i = startIndex; i < endIndex; i++) {
      const div = document.createElement("div");
      div.textContent = `Item ${i + 1}`;
      fragment.appendChild(div);
    }

    container.appendChild(fragment);
  }

  function renderData() {
    let startIndex = 0;

    function renderNextBatch() {
      if (startIndex >= totalItems) return;

      const endIndex = Math.min(startIndex + batchSize, totalItems);
      renderChunk(startIndex, endIndex);
      startIndex = endIndex;

      requestAnimationFrame(renderNextBatch); // 使用 requestAnimationFrame 分批渲染
    }

    renderNextBatch();
  }

  renderData();
</script>
```

## 四、Canvas 绘制表格

当表格数据非常庞大时，可以使用 Canvas 绘制表格内容，避免操作大量 DOM 节点

```js
<canvas id="table-canvas" width="800" height="400" style="border: 1px solid #ccc;"></canvas>

<script>
  const canvas = document.getElementById("table-canvas");
  const ctx = canvas.getContext("2d");

  const totalRows = 10000000;
  const rowHeight = 30;
  const visibleRows = canvas.height / rowHeight;
  const columnWidths = [100, 200, 500]; // 每列宽度

  function drawTable(startRow) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < visibleRows; i++) {
      const rowIndex = startRow + i;

      // 绘制背景
      ctx.fillStyle = rowIndex % 2 === 0 ? "#f9f9f9" : "#ffffff";
      ctx.fillRect(0, i * rowHeight, canvas.width, rowHeight);

      // 绘制文字
      ctx.fillStyle = "#000000";
      ctx.fillText(`Row ${rowIndex + 1}`, 10, (i + 1) * rowHeight - 10);
      ctx.fillText(`Name ${rowIndex + 1}`, columnWidths[0] + 10, (i + 1) * rowHeight - 10);
      ctx.fillText(`Description ${rowIndex + 1}`, columnWidths[0] + columnWidths[1] + 10, (i + 1) * rowHeight - 10);

      // 绘制分隔线
      ctx.strokeStyle = "#cccccc";
      ctx.beginPath();
      ctx.moveTo(0, (i + 1) * rowHeight);
      ctx.lineTo(canvas.width, (i + 1) * rowHeight);
      ctx.stroke();
    }
  }

  canvas.addEventListener("scroll", () => {
    const scrollTop = canvas.scrollTop;
    const startRow = Math.floor(scrollTop / rowHeight);
    drawTable(startRow);
  });

  // 初始渲染
  drawTable(0);
</script>
```

## 五、Canvas + Tile 技术

Tile 技术是一种分块渲染策略，将整个表格分成小块（tiles），按需加载和绘制，避免一次性渲染大量数据

```js
<canvas id="tableCanvas" width="800" height="600" style="border: 1px solid #ccc;"></canvas>

<script>
  const canvas = document.getElementById("tableCanvas");
  const ctx = canvas.getContext("2d");

  // 表格配置
  const totalRows = 10000000; // 总行数
  const totalCols = 10; // 总列数
  const rowHeight = 30; // 行高
  const colWidth = 100; // 列宽
  const tileRows = 50; // 每块包含的行数
  const tileCols = 5; // 每块包含的列数

  // 可见区域配置
  const visibleTilesX = Math.ceil(canvas.width / (tileCols * colWidth));
  const visibleTilesY = Math.ceil(canvas.height / (tileRows * rowHeight));

  function drawTile(startRow, startCol) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < tileRows; i++) {
      const rowIndex = startRow + i;

      for (let j = 0; j < tileCols; j++) {
        const colIndex = startCol + j;

        // 绘制单元格背景
        ctx.fillStyle = (rowIndex + colIndex) % 2 === 0 ? "#f0f0f0" : "#ffffff";
        ctx.fillRect(colIndex * colWidth, i * rowHeight, colWidth, rowHeight);

        // 绘制文本内容
        ctx.fillStyle = "#000";
        ctx.fillText(
          `R${rowIndex}C${colIndex}`,
          colIndex * colWidth + 10,
          i * rowHeight + 20
        );

        // 绘制边框
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(colIndex * colWidth, i * rowHeight, colWidth, rowHeight);
      }
    }
  }

  function updateCanvas(scrollTop, scrollLeft) {
    const startTileRow = Math.floor(scrollTop / (tileRows * rowHeight));
    const startTileCol = Math.floor(scrollLeft / (tileCols * colWidth));
    drawTile(startTileRow * tileRows, startTileCol * tileCols);
  }

  canvas.addEventListener("scroll", (e) => {
    const scrollTop = e.target.scrollTop;
    const scrollLeft = e.target.scrollLeft;
    updateCanvas(scrollTop, scrollLeft);
  });

  // 初始化
  updateCanvas(0, 0);
</script>
```


## 六、Skia + WebAssembly 技术

Skia 是一个高效的 2D 图形库，广泛用于浏览器（Chrome）、Flutter 等框架中。通过 WebAssembly，可以将 Skia 集成到浏览器中，提供高性能表格渲染

```js
// Skia 可以通过一些现成的 WebAssembly 包来使用，例如 CanvasKit（Skia 的 WASM 实现）
<script src="https://unpkg.com/@google/canvaskit-wasm/bin/full/canvaskit.js"></script>

<canvas id="skiaCanvas" width="800" height="600"></canvas>

<script>
  const canvas = document.getElementById("skiaCanvas");
  let CanvasKit, surface, skCanvas;

  async function loadSkia() {
    CanvasKit = await CanvasKitInit({
      locateFile: (file) =>
        `https://unpkg.com/@google/canvaskit-wasm/bin/full/${file}`,
    });

    surface = CanvasKit.MakeCanvasSurface(canvas);
    skCanvas = surface.getCanvas();

    drawTable();
  }

  function drawTable() {
    const paint = new CanvasKit.SkPaint();
    paint.setColor(CanvasKit.Color4f(0.9, 0.9, 0.9, 1));
    paint.setStyle(CanvasKit.PaintStyle.Fill);

    const textPaint = new CanvasKit.SkPaint();
    textPaint.setColor(CanvasKit.BLACK);
    textPaint.setStyle(CanvasKit.PaintStyle.Fill);
    textPaint.setAntiAlias(true);

    const rowHeight = 30;
    const colWidth = 100;

    // 绘制表格内容
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 8; col++) {
        const x = col * colWidth;
        const y = row * rowHeight;

        // 绘制单元格背景
        skCanvas.drawRect(
          CanvasKit.LTRBRect(x, y, x + colWidth, y + rowHeight),
          paint
        );

        // 绘制文字
        skCanvas.drawText(
          `R${row + 1}C${col + 1}`,
          x + 10,
          y + 20,
          textPaint
        );
      }
    }

    surface.flush();
  }

  loadSkia();
</script>
```


## 总结

|方案 |优势 |适用场景|
| :-- | :-- | :-- |
|虚拟滚动|	渲染性能极高，仅加载可视区域数据|大量数据，动态滚动显示|
|分页加载|	减少内存占用，用户体验好|分页展示需求明显|
|Canvas 绘制表格|极高性能，但不支持 HTML 表格功能	|极大数据量，表格功能要求简单|
|大数据表格库|功能丰富，支持多种交互|企业级需求，注重用户体验|


|技术|优势|劣势|适用场景|
| :-- | :-- | :-- |:-- |
|Canvas + Tile|	高效分块渲染，兼容性好|	实现复杂，需要精细滚动管理|	高性能表格或滚动场景|
|Skia + WebAssembly|	性能极高，支持复杂绘图|	WebAssembly 兼容性问题，依赖外部库|	超高性能或跨平台绘制需求|
|Canvas + Skia|	综合优势，性能与灵活性兼具|	初期开发复杂度高|	超大数据量，动态表格场景|
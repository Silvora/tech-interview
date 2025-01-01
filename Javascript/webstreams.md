---
title: Web Streams是什么？
date: 2024-12-28 15:33:09
categories: 
- JavaScript
---

# 面试官：Web Streams是什么？



## 一、什么是流?

如名称所示，流就像水流一样，会持续性地从一段流动到另一端，只有当上游停止输入时，才会断流。而在浏览器中流会将你想要的资源分成一个个小的分块，然后按位处理它。

实际上，流无处不在，例如看视频时不用完整下载完才可以播放，而是可以边缓冲区边播，又或者我们看到的图像逐渐地显示。

但曾经这些对于 `JavaScript` 是不可用的。以前，如果我们想要处理某种资源（如视频、文本文件等），我们必须下载完整的文件，等待它反序列化成适当的格式，然后在完整地接收到所有的内容后再进行处理。

`Web Streams API` 最初是在 `2017` 年左右开始在浏览器中得到支持的。它被设计为一个标准 `API`，用于处理数据流，类似于 `Node.js` 中的 `Streams API`，但更加现代和统一。`Web Streams API` 包括 `ReadableStream`、`WritableStream` 和 `TransformStream`，它们可以用于实现复杂的数据流处理逻辑。


## 二、fetch使用

```js
const textArea = document.getElementById("app"); // textView 展示内容
const fetchFunction = async () => {
    const url = "/data.json";
    const res = await fetch("/data.json", {
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
        credentials: "include",
    });
    // 我们可以通过打印发现,res.body是一个可读流,那么是可以进行分块读取的
    console.log(res.body);
    console.time("fetch流式耗时");
    const reader = res.body.getReader();
    // 需要将字节数组解码成文字
    const decoder = new TextDecoder();
    // 不断循环解析块内容，并且设置进内容区
    while (true) {
        // done代表是否读完，布尔值 value代表当前读到哪一块，是一个字节数组
        const { done, value } = await reader.read(
        console.log(done, `当前块的大小: ${value.byteLength}`
        if (done === true) {
            // 完成全量响应解析，中断解析
            break;
        }
        console.timeEnd("fetch流式耗时"); // fetch流式耗时: 
        const decodeText = decoder.decode(value);
        textArea.innerText = decodeText;
    }
};
fetchFunction();

```


#### 使用ajax方案

用于兼容不支持`fetch`的浏览器方案，因为`ajax`的`onprogress`方法的回调每次都不是返回当前块，而是返回一个包含当前块内容以及之前块内容的块。所以需要添加一个变量，用来记录上次切割结束的位置，使其每次回调都做切割处理，保证和`fetch`一样返回当前块，用于流式数据展示

```js
// index.html截取部分核心代码
const fetchFunction = async () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    let lastProcessedIndex = 0; // 记录上次处理的数据片段位置
    xhr.onloadstart = () => {
        // 计时
        console.time("ajax流式耗时");
    };
    xhr.onprogress = function (event) {
        if (event.lengthComputable) {
            const loaded = event.loaded;
            const total = event.total;
            const progress = (loaded / total) * 100;
            console.log(`Progress: ${progress}%`);
        }
        const responseData = event.target.response;
        // 每次返回的都得包含当前切片和之前切片的数据，所以需要记录上次处理位置，处理新的数据片段
        processNewData(responseData);
    };
  
    function processNewData(accumulatedData) {
        // 检查是否有新的数据片段需要处理
        if (lastProcessedIndex < accumulatedData.length) {
            // 从已经处理过的整块中截取新的数据片段
            const newData = accumulatedData.substring(lastProcessedIndex);
            console.timeEnd("ajax流式耗时"); // ajax流式耗时: 2882.178955078125 ms
            // 在这里处理 newData，例如添加到 textarea 中
            textArea.value += newData;
            // 更新上次处理的位置
            lastProcessedIndex = accumulatedData.length;
        }
    }
    xhr.onerror = function () {
        console.error("Error:", xhr.statusText);
    };
    xhr.send();
}

```

优缺点对比选用:
- 流式获取能更快让响应数据得到处理
- 流式获取的响应快慢会受网络状态、返回数据量体积的影响，非常适合大体量数据和网络状态差的情况下使用
- 流式获取不太适合需要序列格式化内容返回，比如`json`只有部分返回的话，解析`JSON.parse()`会报错
- 流式获取兼容良好，也可以通过封装ajax来兼容不支持fetch的浏览器


## 三、ReadableStream API

`ReadableStream` 是 `JavaScript` 中的一个接口，表示一个可读取的数据流。它提供了一种从数据源（如网络请求、文件等）读取数据的方式，可以逐个读取数据并进行处理。这种逐块读取的方式对于处理大文件或实时数据非常有效，避免了将整个文件一次性加载到内存中。


```js
new ReadableStream(underlyingSource, queuingStrategy)

// underlyingSource：用于定义流的行为

// queuingStrategy：定义流的队列策略

```

#### underlyingSource(用于定义流的行为)
- `start (controller)` 可选: 当对象被构造时立刻调用该方法。支持异步，异步时需返回一个 `promise`，表明成功或失败。其形参`controller` 是一个 `ReadableStreamDefaultController` 或 `ReadableByteStreamController`，具体是谁根据类型而定，反正就是一个拥有`3`个方法`（close、enqueue、error）`的流控制器，可以通过控制器的`enquene`方法把数据添加到流里面

- `pull (controller)` 可选: 当流的内部队列不满时，内部会自动重复调用这个方法，直到队列补满。如果 `pull()` 返回一个 `promise`，那么它将不会再被调用，直到 `promise` 完成;如果 `promise` 失败，该流将会出现错误。其形参跟`start`上的是一致的。

- `cancel (reason)` 可选: 当流被取消时调用此方法。该方法应该做任何必要的事情来释放对流的访问。 如果这个过程是异步的，它可以返回一个 `promise`，表明成功或失败。原因参数包含一个 `DOMString`，它描述了流被取消的原因。

- `type` 可选: 该属性控制正在处理的可读类型的流。如果它包含一个设置为 `bytes` 的值，则传递的控制器对象将是一个 `ReadableByteStreamController`，能够处理 `BYOB`（带你自己的缓冲区）/字节流。如果未包含，则传递的控制器将为 `ReadableStreamDefaultController`

- `autoAllocateChunkSize` 可选: 对于字节流，开发人员可以使用正整数值设置 `autoAllocateChunkSize` 以打开流的自动分配功能。启用此功能后，流实现将自动分配一个具有给定整数大小的 `ArrayBuffer`，并调用底层源代码，就好像消费者正在使用 `BYOB reader` 一样。

#### queuingStrategy(定义流的队列策略)

- `highWaterMark` 可选: 非负整数 - 这定义了在应用背压之前可以包含在内部队列中的块的总数。当队列达到这个阈值时，流将停止从源获取数据，直到消费者从队列中取出一些数据。

- `size(chunk)` 可选: 是一个函数，形参chunk表示每个分块使用的大小（以字节为单位），通用用于帮助确定何时达到 `highWaterMark`。


#### 代码示例
```js
const stream = new ReadableStream({
  start(controller) {
    interval = setInterval(() => {
      let string = randomChars();
      // Add the string to the stream
      controller.enqueue(string);
      // show it on the screen
      let listItem = document.createElement("li");
      listItem.textContent = string;
      list1.appendChild(listItem);
    }, 1000);
    button.addEventListener("click", function () {
      clearInterval(interval);
      fetchStream();
      controller.close();
    });
  },
  pull(controller) {
    // We don't really need a pull in this example
  },
  cancel() {
    // This is called if the reader cancels,
    // so we should stop generating strings
    clearInterval(interval);
  },
});

```

#### 实例方法

`ReadableStream`的实力一共有`5`个实例方法和`1`个静态方法。具体如下：

- `from()`：可以用于将可迭代或异步可迭代对象包装为可读流，包括数组、集合、`promise` 数组、异步生成器、`ReadableStream`、`Node.js` 可读流，等等

- `cancel`：用于在不再需要来自它的任何数据的情况下（即使仍有排队等待的数据块）完全结束一个流。调用 `cancel` 后该数据丢失，并且流不再可读。为了仍然可以读这些数据块而不完全结束这个流，你应该使用 `ReadableStreamDefaultController.close()`

- `getReader`：创建一个 `reader`，并将流锁定。只有当前 `reader` 将流释放后，其他 `reader` 才能使用

- `pipeThrough`：提供了一种链式的方式，将当前流通过转换流或者其他任何一对可写/可读的流进行管道传输

- `pipeTo`：通过管道将当前的 `ReadableStream` 中的数据传递给给定的 `WritableStream` 并且返回一个 `Promise`，`promise` 在传输成功完成时兑现，在遇到任何错误时则会被拒绝

- `tee`：对当前的可读流进行拷贝


#### 总结
优势:
- 高效处理大数据： 逐块读取数据，避免内存溢出
- 实时数据处理： 可以实时处理不断产生的数据
- 异步操作： 使用 `Promise` 和异步函数，避免阻塞主线程
- 灵活控制： 可以通过 `controller` 对象控制流的各个方面，如暂停、恢复、错误处理等


使用场景:
- 文件上传下载： 大文件分块上传下载
- 网络请求： 处理大规模的网络响应数据
- 实时数据流： 处理 `WebSocket`、`Server-Sent Events` 等实时数据
- 生成器： 可以将生成器函数转换为 `ReadableStream`


## 四、ReadableStream 使用

在流式处理中，背压`（Backpressure）`是一种机制，用于处理数据生产者（即数据源）和消费者（即数据处理者）之间的速率不匹配问题。当数据以比消费者处理速度更快的速率产生时，背压机制可以防止系统过载，并确保数据消费者不会因为数据泛滥而崩溃。

背压的工作原理：
- 速率控制：背压允许消费者根据其处理能力向生产者发出信号，表明其能够处理数据的速率
- 缓冲：当生产者的数据产生速率超过消费者的处理速率时，数据会被临时存储在缓冲区中
- 暂停/恢复数据流：如果缓冲区满了，消费者可以向生产者发出信号，请求其暂停发送数据，直到缓冲区有足够空间。这可以通过各种方式实现，例如减少 ReadableStream 的内部队列大小或使用流控制协议

在 `Web Streams API` 中的背压:

`Web Streams API` 通过 `ReadableStream` 和 `WritableStream` 内置了背压机制。以下是背压在 `Web Streams` 中的实现方式：

- `highWaterMark`：这是一个设置在流构造函数中的参数，定义了内部队列可以包含的数据块的最大数量。当队列达到这个阈值时，流将停止从源获取数据，直到消费者从队列中取出一些数据
- `size()` 函数：这是队列策略的一部分，用于定义每个数据块的大小。这个函数帮助确定何时达到 highWaterMark
- `ReadableStreamDefaultController`：控制器中的 `desiredSize` 属性可以动态地反映当前消费者需要多少数据。如果 `desiredSize` 为负数，生产者将停止推送数据，直到 `desiredSize` 变为非负数

背压是处理数据流的关键机制，特别是在以下情况下：
- 网络`I/O`：在网络请求中，服务器可能以比客户端处理速度更快的速度发送数据
- 文件`I/O`：读取大型文件时，磁盘I/O可能比内存处理速度快
- 数据处理：在数据处理应用中，数据转换或分析的速度可能跟不上数据的接收速度

通过背压，开发者可以构建更加健壮和高效的数据流应用，确保即使在数据速率波动的情况下，应用也能稳定运行



## 总结
`ReadableStream`在使用过程有什么需要注意的:
- 内存管理：如果不正确地处理数据块，可能会导致内存使用过高。需要确保在数据处理完成后适时地释放内存
- 流的关闭：忘记关闭流可能导致资源泄露。在使用完流之后，应该调用 `controller.close()` 来关闭流
- 错误处理：流可能会遇到错误情况，例如网络请求失败或数据格式错误。需要在代码中添加错误处理逻辑，使用 `controller.error()` 方法来处理这些情况
- 背压管理：如果生产者（数据源）的数据产生速率远大于消费者（数据处理者）的处理速率，可能会导致背压问题。需要合理配置 `highWaterMark` 和 `size` 函数来管理内部队列的大小
- 数据同步：在处理来自不同源的多个 `ReadableStream` 时，同步数据块的顺序可能会变得复杂
- 并发流：同时处理多个流时，需要管理并发读取和写入操作，以避免竞态条件和数据不一致的问题
- 数据完整性：在流式传输过程中，需要确保数据块的完整性，特别是在处理二进制数据或需要解码的数据时
- 取消流操作：如果需要取消流操作，应该调用 `ReadableStream.cancel()` 方法，并在 `cancel` 回调中处理取消逻辑
- 兼容性问题：虽然大多数现代浏览器支持 `ReadableStream`，但仍需检查目标环境的兼容性，并在必要时使用 `polyfills`
- 性能优化：对于大型数据流，需要考虑性能优化，例如使用 `Web Workers` 来处理数据，避免阻塞主线程
- 编码问题：在处理文本数据时，需要注意字符编码问题，特别是在从二进制数据解码为文本时
- API 使用错误：由于 `ReadableStream API` 相对复杂，可能会出现使用错误，例如错误地调用 `enqueue` 和 `close` 方法
- 数据类型处理：对于不同类型的数据（如文本、`JSON`、二进制数据等），需要采用适当的处理方法

应用场景:
- 网络请求响应处理： 使用 `fetch API` 进行网络请求时，响应体可能是一个 `ReadableStream`。这允许应用以流式传输的方式逐步读取响应数据，而不是一次性加载整个响应体
- 文件上传和下载： 在处理大文件上传或下载时，`ReadableStream` 可以用于分块读取或写入文件数据，从而优化内存使用并提高处理速度
- 实时数据流： 在需要处理实时数据流的应用中，如股票行情更新或实时通讯，`ReadableStream` 可以用于持续接收和处理数据
- 视频和音频流： 对于视频点播或直播服务，`ReadableStream` 可以用于实现视频或音频数据的流式传输和播放
- 日志文件处理： 在服务器或应用程序生成大量日志数据时，可以使用 `ReadableStream` 来逐步读取和分析日志文件，实现实时监控和报警
- 数据转换和处理： 在需要对数据进行转换或处理的应用中，如将 `CSV` 数据转换为 `JSON` 格式，`ReadableStream` 可以逐步读取、转换并输出数据
- 图像和图表的生成： 对于动态生成图像或图表的应用，`ReadableStream` 可以用于将生成的图像数据逐步传输给客户端
- 数据库查询结果： 在执行数据库查询时，如果结果集很大，可以使用 `ReadableStream` 来逐步读取查询结果，避免一次性加载过多数据
- `Web` 字节流操作： 在 `WebGL` 或 `WebAssembly` 等技术中，`ReadableStream` 可以用于读取和处理字节流数据
- 服务端分页： 在服务端分页的场景中，`ReadableStream` 可以用于实现服务器端的分页逻辑，逐页读取数据并发送给客户端
- `API` 响应流： 当 `API` 需要返回大量数据时，可以利用 `ReadableStream` 实现响应流，客户端可以逐步接收数据，实现懒加载
- 多阶段数据处理： 在需要多阶段数据处理的业务流程中，`ReadableStream` 可以用于在不同阶段之间传递数据流，实现复杂的数据处理逻辑

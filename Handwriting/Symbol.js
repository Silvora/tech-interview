// createSymbol 函数：这个函数返回一个工厂函数，用于创建 symbol。

// symbolRegistry 对象：用于存储已经创建的 symbol，确保相同的 description 返回相同的 symbol。

// symbol 对象：每个 symbol 是一个唯一的对象，并且重写了 toString 方法，使其返回类似于原生 Symbol 的字符串表示。

// 这个模拟实现并不能完全替代原生的 Symbol，因为原生的 Symbol 是不可变的、唯一的，并且可以用于对象属性的键。这个模拟实现只是一个简单的近似。

// 原生的 Symbol 是 JavaScript 引擎内置的，无法通过纯 JavaScript 代码完全模拟其行为。
function createSymbol(description) {
    // 使用一个对象来存储所有的 symbol
    const symbolRegistry = {};
  
    // 返回一个唯一的对象作为 symbol
    return function(description) {
      // 如果 description 已经存在，直接返回对应的 symbol
      if (symbolRegistry[description]) {
        return symbolRegistry[description];
      }
  
      // 创建一个新的对象作为 symbol
      const symbol = Object.create(null);
      symbol.toString = () => `Symbol(${description})`;
  
      // 将 symbol 存入 registry
      symbolRegistry[description] = symbol;
  
      return symbol;
    };
  }
  
  // 使用示例
  const MySymbol = createSymbol();
  
  const sym1 = MySymbol('foo');
  const sym2 = MySymbol('bar');
  const sym3 = MySymbol('foo');
  
  console.log(sym1.toString()); // 输出: Symbol(foo)
  console.log(sym2.toString()); // 输出: Symbol(bar)
  console.log(sym3.toString()); // 输出: Symbol(foo)
  
  console.log(sym1 === sym3); // 输出: true
  console.log(sym1 === sym2); // 输出: false
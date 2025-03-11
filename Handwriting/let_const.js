// let 声明的变量具有块级作用域，且不能在同一作用域内重复声明。我们可以使用 IIFE 来模拟块级作用域。
// ES6
{
  let x = 10;
  console.log(x); // 10
}
console.log(x); // ReferenceError: x is not defined

// ES5 模拟
(function () {
  var x = 10;
  console.log(x); // 10
})();
console.log(x); // ReferenceError: x is not defined




// const 声明的变量也具有块级作用域，且不能重新赋值。我们可以通过 Object.defineProperty 来模拟常量的不可变性。
// ES6
{
  const y = 20;
  console.log(y); // 20
  // y = 30; // TypeError: Assignment to constant variable.
}
console.log(y); // ReferenceError: y is not defined

// ES5 模拟
(function () {
  var _y = 20;
  Object.defineProperty(window, "y", {
    get: function () {
      return _y;
    },
    set: function () {
      throw new TypeError("Assignment to constant variable.");
    },
  });
  console.log(y); // 20
  // y = 30; // TypeError: Assignment to constant variable.
})();
console.log(y); // ReferenceError: y is not defined

/**
 * 防抖函数
 * @param fn 需要防抖执行的原函数
 * @param delay 延迟时间（毫秒）
 * @returns 返回一个新的函数，该函数在停止调用 delay 毫秒后才会执行原函数
 */
// <T> 定义了一个泛型，表示传入的函数类型。这样 TypeScript 就能知道原函数的参数是什么
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  // 用于存储定时器的 ID
  // ReturnType<typeof setTimeout> 是为了兼容 Node.js 和浏览器环境（一个是对象，一个是数字）
  let timeoutId: ReturnType<typeof setTimeout>;

  // 返回一个新的函数，这个函数的参数类型 (...args) 和原函数 fn 的参数类型 (Parameters<T>) 一致
  return (...args: Parameters<T>) => {
    // 1. 如果之前已经设定过定时器，先清除它（取消上一次的执行计划）
    clearTimeout(timeoutId);

    // 2. 重新设定一个新的定时器，在 delay 毫秒后执行原函数
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

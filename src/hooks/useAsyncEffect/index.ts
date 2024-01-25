import {DependencyList, useEffect} from "react";
import {isFunction} from "../../../utils";

// 判断是否是 AsyncGenerator
function isAsyncGenerator(
  val: AsyncGenerator<void, void, void> | Promise<void>
): val is AsyncGenerator<void, void, void> {
  // Symbol.asyncIterator: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator
  // Symbol.asyncIterator 符号指定了一个对象的默认异步迭代器。如果一个对象设置了这个属性，它就是异步可迭代对象，可用于 for await...of 循环。
  return isFunction(val[Symbol.asyncIterator]);
}

const useAsyncEffect = (effect: () => AsyncGenerator<void, void, void> | Promise<void>, deps?: DependencyList) => {
  useEffect(() => {
    const e = effect();
    let cancelled = false;
    // 定义异步函数
    async function execute() {
      if (isAsyncGenerator(e)) {
        while (true) {
          // 如果是 Generator 异步函数，则通过 next() 的方式执行
          const result = await e.next();
          // Generator function 全部执行完成，或者当前的 effect 被清理，则停止继续往下执行
          if (result.done || cancelled) {
            break;
          }
        }
      } else {
        await e;
      }
    }
    // 执行函数
    execute();
    return () => {
      // 当前 effect 已被清理
      cancelled = true;
    }
  }, deps);
}

export default useAsyncEffect;


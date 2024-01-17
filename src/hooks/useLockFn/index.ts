import {useCallback, useRef} from "react";

const useLockFn = <P extends any[] = any[], V = any>(fn: (...args: P) => Promise<V>) => {
  // 是否正处于一个锁中，即异步请求正在进行
  const lockRef = useRef(false);

  return useCallback(async (...args: P) => {
    // 请求正在进行，直接返回
    if (lockRef.current) return;
    // 上锁，表示请求正在进行
    lockRef.current = true;
    try {
      // 执行异步请求
      const ret = await fn(...args);
      // 请求完毕，竞态锁状态设置为 false
      lockRef.current = false;
      // 返回
      return ret;
    } catch (e) {
      // 请求失败，竞态锁状态设置为 false
      lockRef.current = false;
      // 抛出错误
      throw e;
    }
  }, [fn]);
};

export default useLockFn;

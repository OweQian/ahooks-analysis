import { useCallback, useEffect, useRef } from "react";
import useLatest from "@/hooks/useLatest";
import { isNumber } from "../../../utils";

interface Handle {
  id: number | ReturnType<typeof setInterval>;
}

const setRafInterval = (callback: () => void, delay: number = 0): Handle => {
  // 如果不支持 requestAnimationFrame API，则改用 setInterval
  if (typeof requestAnimationFrame === typeof undefined) {
    return {
      id: setInterval(callback, delay),
    };
  }
  // 初始化开始时间
  let start = Date.now();
  // 初始化 handle
  const handle: Handle = {
    id: 0,
  };
  // 定义动画函数
  const loop = () => {
    const current = Date.now();
    // 当前时间 - 开始时间 >= delay，则执行 callback 并重置开始时间
    if (current - start >= delay) {
      callback();
      start = Date.now();
    }
    // 重置 handle，递归调用 requestAnimationFrame，请求下一帧（：此处请注意与 useRafTimeout 的区别
    handle.id = requestAnimationFrame(loop);
  };
  // 启动动画
  handle.id = requestAnimationFrame(loop);
  // 返回 handle
  return handle;
};

const cancelAnimationFrameIsNotDefined = (
  t: any
): t is ReturnType<typeof setInterval> => {
  return typeof cancelAnimationFrame === typeof undefined;
};

const clearRafInterval = (handle: Handle) => {
  // 不支持 cancelAnimationFrame API，则通过 clearInterval 清除
  if (cancelAnimationFrameIsNotDefined(handle.id)) {
    return clearInterval(handle.id);
  }
  // 使用 cancelAnimationFrame API 清除
  cancelAnimationFrame(handle.id);
};

const useRafInterval = (
  fn: () => void,
  delay: number | undefined,
  options?: {
    immediate?: boolean;
  }
) => {
  const immediate = options?.immediate;

  const fnRef = useLatest(fn);
  const timerRef = useRef<Handle>();

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearRafInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    // delay 不是数字或 delay 的值小于 0，直接返回，停止定时器
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    // 立即执行一次回调函数
    if (immediate) {
      fnRef.current();
    }
    // 开启新的定时器
    timerRef.current = setRafInterval(() => {
      fnRef.current();
    }, delay);
    // 通过 useEffect 的返回清除机制，清除定时器，避免内存泄露
    return () => {
      if (timerRef.current) {
        clearRafInterval(timerRef.current);
      }
    };
  }, [delay]);

  return clear;
};

export default useRafInterval;

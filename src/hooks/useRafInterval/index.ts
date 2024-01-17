import useLatest from "@/hooks/useLatest";
import {useCallback, useEffect, useRef} from "react";
import {isNumber} from "../../../utils";

interface Handle {
  id: number | NodeJS.Timer;
}

const setRafInterval = (callback: () => void, delay: number = 0): Handle => {
  // 如果不支持 requestAnimationFrame API，则改用 setInterval
  if (typeof requestAnimationFrame === typeof undefined) {
    return {
      id: setInterval(callback, delay),
    };
  }
  // 开始时间
  let start = new Date().getTime();
  const handle: Handle = {
    id: 0,
  };
  // 定义动画函数
  const loop = () => {
    const current = new Date().getTime();
    // 当前时间 - 开始时间，大于等于 delay，则执行 callback 并重置开始时间
    if (current - start >= delay) {
      callback();
      start = new Date().getTime();
    }
    // 递归调用 requestAnimationFrame
    handle.id = requestAnimationFrame(loop);
  };
  // 启动动画
  handle.id = requestAnimationFrame(loop);
  return handle;
};

const cancelAnimationFrameIsNotDefined = (t: any): t is NodeJS.Timer => {
  return typeof cancelAnimationFrame === typeof undefined;
}

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
  },
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
    // 当设置值为 undefined 时会停止计时器
    if (!isNumber(delay) || delay < 0) return;
    // 立即执行
    if (immediate) {
      fnRef.current();
    }
    // 开启新的定时器
    timerRef.current = setRafInterval(() => {
      fnRef.current();
    }, delay);
    // 变更依赖项时，清除旧的定时器
    // 通过 useEffect 的返回清除机制，开发者不需要关注清除定时器的逻辑，避免内存泄露
    return () => {
      if (timerRef.current) {
        clearRafInterval(timerRef.current);
      }
    };
  }, [delay]);

  return clear;
}

export default useRafInterval;

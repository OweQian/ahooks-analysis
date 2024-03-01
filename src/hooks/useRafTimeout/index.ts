import { useCallback, useEffect, useRef } from "react";
import useLatest from "@/hooks/useLatest";
import { isNumber } from "../../../utils";

interface Handle {
  id: number | ReturnType<typeof setTimeout>;
}

const setRafTimeout = (callback: () => void, delay: number = 0): Handle => {
  // 如果不支持 requestAnimationFrame API，则改用 setTimeout
  if (typeof requestAnimationFrame === typeof undefined) {
    return {
      id: setTimeout(callback, delay),
    };
  }
  // 初始化开始时间
  let startTime = Date.now();
  // 初始化 handle
  const handle: Handle = {
    id: 0,
  };
  // 定义动画函数
  const loop = () => {
    const current = Date.now();
    // 当前时间 - 开始时间 >= delay，则执行 callback
    if (current - startTime >= delay) {
      callback();
    } else {
      // 否则，请求下一帧（：此处请注意与 useRafInterval 的区别
      handle.id = requestAnimationFrame(loop);
    }
  };
  // 启动动画
  handle.id = requestAnimationFrame(loop);
  // 返回 handle
  return handle;
};

const cancelAnimationFrameIsNotDefined = (
  t: any
): t is ReturnType<typeof setTimeout> => {
  return typeof cancelAnimationFrame === typeof undefined;
};

const clearRafTimeout = (handle: Handle) => {
  // 不支持 cancelAnimationFrame API，则通过 clearTimeout 清除
  if (cancelAnimationFrameIsNotDefined(handle.id)) {
    return clearTimeout(handle.id);
  }
  // 使用 cancelAnimationFrame API 清除
  cancelAnimationFrame(handle.id);
};

const useRafTimeout = (fn: () => void, delay: number | undefined) => {
  const fnRef = useLatest(fn);
  const timerRef = useRef<Handle>();

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearRafTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    // delay 不是数字或 delay 的值小于 0，直接返回，停止定时器
    if (!isNumber(delay) || delay < 0) return;
    // 开启新的定时器
    timerRef.current = setRafTimeout(() => {
      fnRef.current();
    }, delay);
    // 通过 useEffect 的返回清除机制，清除定时器，避免内存泄露
    return () => {
      if (timerRef.current) {
        clearRafTimeout(timerRef.current);
      }
    };
  }, [delay]);

  return clear;
};

export default useRafTimeout;

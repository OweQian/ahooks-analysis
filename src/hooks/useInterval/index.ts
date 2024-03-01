import { useCallback, useEffect, useRef } from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";
import { isNumber } from "../../../utils";

const useInterval = (
  fn: () => void,
  delay?: number,
  options: { immediate?: boolean } = {}
) => {
  const timerCallback = useMemoizedFn(fn);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 暴露清除定时器的方法
  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    // delay 不是数字或 delay 的值小于 0，直接返回，停止定时器
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    // 立即执行一次回调函数
    if (options.immediate) {
      timerCallback();
    }
    // 开启新的定时器
    timerRef.current = setInterval(timerCallback, delay);
    // 通过 useEffect 的返回清除机制，清除定时器，避免内存泄露
    return clear;
  }, [delay, options.immediate]);

  return clear;
};

export default useInterval;

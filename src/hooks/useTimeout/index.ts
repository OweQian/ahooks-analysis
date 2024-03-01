import { useCallback, useEffect, useRef } from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";
import { isNumber } from "../../../utils";

const useTimeout = (fn: () => void, delay?: number) => {
  const timerCallback = useMemoizedFn(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 暴露清除定时器的方法
  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    // delay 不是数字或 delay 的值小于 0，直接返回，停止定时器
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    // 开启新的定时器
    timerRef.current = setTimeout(timerCallback, delay);
    // 通过 useEffect 的返回清除机制，清除定时器，避免内存泄露
    return clear;
  }, [delay]);

  return clear;
};

export default useTimeout;

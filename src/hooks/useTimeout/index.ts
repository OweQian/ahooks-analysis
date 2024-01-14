import useMemoizedFn from "@/hooks/useMemoizedFn";
import {useCallback, useEffect, useRef} from "react";
import {isNumber} from "../../../utils";

const useTimeout = (fn: () => void, delay?: number) => {
  const timerCallback = useMemoizedFn(fn);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  // 暴露清除定时器的方法
  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    // 当设置值为 undefined 时会停止计时器
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    // 开启新的定时器
    timerRef.current = setTimeout(timerCallback, delay);
    // 变更依赖项时，清除旧的定时器
    // 通过 useEffect 的返回清除机制，开发者不需要关注清除定时器的逻辑，避免内存泄露
    return clear;
  }, [delay]);

  return clear;
};

export default useTimeout;

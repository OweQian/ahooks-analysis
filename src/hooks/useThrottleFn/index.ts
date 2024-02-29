import { throttle } from "lodash-es";
import { useMemo } from "react";
import useLatest from "@/hooks/useLatest";
import type { ThrottleOptions } from "../useThrottle/throttleOptions";
import useUnmount from "@/hooks/useUnmount";
import { isFunction } from "../../../utils";
import isDev from "../../../utils/isDev";

type noop = (...args: any[]) => any;

const useThrottleFn = <T extends noop>(fn: T, options?: ThrottleOptions) => {
  if (isDev) {
    if (!isFunction) {
      console.error(
        `useThrottleFn expected parameter is a function, got ${typeof fn}`
      );
    }
  }

  const fnRef = useLatest(fn);

  // 默认 1000 毫秒
  const wait = options?.wait ?? 1000;

  const throttled = useMemo(
    () =>
      // 调用 lodash 的 throttle 方法
      // https://www.lodashjs.com/docs/lodash.throttle
      throttle(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options
      ),
    []
  );

  // 卸载时取消延迟的函数调用
  useUnmount(() => {
    throttled.cancel();
  });

  return {
    // 节流函数
    run: throttled,
    // 取消延迟的函数调用
    cancel: throttled.cancel,
    // 立即调用
    flush: throttled.flush,
  };
};

export default useThrottleFn;

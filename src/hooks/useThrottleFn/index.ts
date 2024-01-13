import useUnmount from "@/hooks/useUnmount";
import type {ThrottleOptions} from '../useThrottle/throttleOptions';
import isDev from "../../../utils/isDev";
import useLatest from "@/hooks/useLatest";
import {isFunction} from "../../../utils";
import {useMemo} from "react";
import {throttle} from "lodash-es";

type noop = (...args: any[]) => any;

const useThrottleFn = <T extends noop>(fn: T, options?: ThrottleOptions) => {
  if (isDev) {
    if (!isFunction) {
      console.error(`useThrottleFn expected parameter is a function, got ${typeof fn}`);
    }
  }

  const fnRef = useLatest(fn);

  // 默认 1000 毫秒
  const wait = options?.wait ?? 1000;

  const throttled = useMemo(() =>
    // 调用 lodash 的 throttle 方法
    // https://www.lodashjs.com/docs/lodash.throttle
    throttle(
      (...args: Parameters<T>): ReturnType<T> => {
        return fnRef.current(...args);
      },
      wait,
      options
    ), []);

  // 卸载时取消
  useUnmount(() => {
    throttled.cancel();
  });

  return {
    // 触发执行 fn，函数参数将会传递给 fn
    run: throttled,
    // 取消当前节流
    cancel: throttled.cancel,
    // 立即调用当前节流函数
    flush: throttled.flush,
  }
}

export default useThrottleFn;

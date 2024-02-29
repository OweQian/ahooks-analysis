import { debounce } from "../../../utils/lodash-polyfill";
import { useMemo } from "react";
import type { DebounceOptions } from "../useDebounce/debounceOptions";
import useLatest from "@/hooks/useLatest";
import useUnmount from "@/hooks/useUnmount";
import { isFunction } from "../../../utils";
import isDev from "../../../utils/isDev";

type noop = (...args: any[]) => any;

const useDebounceFn = <T extends noop>(fn: T, options?: DebounceOptions) => {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(
        `useDebounceFn expected parameter is a function, got ${typeof fn}`
      );
    }
  }

  const fnRef = useLatest(fn);

  // 默认 1000 毫秒
  const wait = options?.wait ?? 1000;

  const debounced = useMemo(
    () =>
      // 调用 lodash 的 debounce 方法
      // https://www.lodashjs.com/docs/lodash.debounce#_debouncefunc-wait0-options
      debounce(
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
    debounced.cancel();
  });

  return {
    // 防抖函数
    run: debounced,
    // 取消延迟的函数调用
    cancel: debounced.cancel,
    // 立即调用
    flush: debounced.flush,
  };
};

export default useDebounceFn;

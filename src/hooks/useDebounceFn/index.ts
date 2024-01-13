import type {DebounceOptions} from '../useDebounce/debounceOptions';
import isDev from "../../../utils/isDev";
import {isFunction} from "../../../utils";
import useLatest from "@/hooks/useLatest";
import {useMemo} from "react";
import useUnmount from "@/hooks/useUnmount";
import {debounce} from "../../../utils/lodash-polyfill";

type noop = (...args: any[]) => any;

const useDebounceFn = <T extends noop>(fn: T, options?: DebounceOptions) => {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useDebounceFn expected parameter is a function, got ${typeof fn}`);
    }
  }

  const fnRef = useLatest(fn);

  // 默认 1000 毫秒
  const wait = options?.wait ?? 1000;

  const debounced = useMemo(() =>
    // 调用 lodash 的 debounce 方法
    // https://www.lodashjs.com/docs/lodash.debounce#_debouncefunc-wait0-options
    debounce(
      (...args: Parameters<T>): ReturnType<T> => {
        return fnRef.current(...args);
      },
      wait,
      options,
    )
  , []);

  // 卸载时取消
  useUnmount(() => {
    debounced.cancel();
  });

  return {
    // 触发执行 fn，函数参数将会传递给 fn
    run: debounced,
    // 取消当前防抖
    cancel: debounced.cancel,
    // 立即调用当前防抖函数
    flush: debounced.flush,
  };
}

export default useDebounceFn;


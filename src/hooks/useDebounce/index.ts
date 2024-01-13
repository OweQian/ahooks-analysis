import type {DebounceOptions} from './debounceOptions';
import {useEffect, useState} from "react";
import useDebounceFn from "@/hooks/useDebounceFn";

const useDebounce = <T>(value: T, options?: DebounceOptions) => {
  const [debounced, setDebounced] = useState(value);

  // 依赖 useDebounceFn
  const { run } = useDebounceFn(() => {
    setDebounced(value);
  }, options);

  // 监听 value 变化执行防抖函数，更新 debounced 状态
  useEffect(() => {
    run();
  }, [value]);

  return debounced;
}

export default useDebounce;


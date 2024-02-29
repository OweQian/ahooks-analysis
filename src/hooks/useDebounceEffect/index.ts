import { useEffect, useState } from "react";
import type { DependencyList, EffectCallback } from "react";
import type { DebounceOptions } from "../useDebounce/debounceOptions";
import useDebounceFn from "@/hooks/useDebounceFn";
import useUpdateEffect from "@/hooks/useUpdateEffect";

const useDebounceEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
  options?: DebounceOptions
) => {
  // 设置 flag 标识
  const [flag, setFlag] = useState({});

  // 对 flag 标识设置防抖功能
  const { run } = useDebounceFn(() => {
    setFlag({});
  }, options);

  // 监听 deps，调用 run 函数更新 flag 标识
  useEffect(() => {
    return run();
  }, deps);

  // 监听 flag 标识的变化，执行 effect 回调函数
  useUpdateEffect(effect, [flag]);
};

export default useDebounceEffect;

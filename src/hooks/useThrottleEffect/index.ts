import { useEffect, useState } from "react";
import type { DependencyList, EffectCallback } from "react";
import type { ThrottleOptions } from "../useThrottle/throttleOptions";
import useThrottleFn from "@/hooks/useThrottleFn";
import useUpdateEffect from "@/hooks/useUpdateEffect";

const useThrottleEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
  options?: ThrottleOptions
) => {
  // 设置 flag 标识
  const [flag, setFlag] = useState({});

  // 对 flag 标识设置节流功能
  const { run } = useThrottleFn(() => {
    setFlag({});
  }, options);

  // 监听 deps，调用 run 函数更新 flag 标识
  useEffect(() => {
    return run();
  }, deps);

  // 监听 flag 标识的变化，执行 effect 回调函数
  useUpdateEffect(effect, [flag]);
};

export default useThrottleEffect;

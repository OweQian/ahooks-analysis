import type {DependencyList, EffectCallback} from "react";
import {ThrottleOptions} from "../useThrottle/throttleOptions";
import useThrottleFn from "@/hooks/useThrottleFn";
import useUpdateEffect from "@/hooks/useUpdateEffect";
import {useEffect, useState} from "react";

const useThrottleEffect = (effect: EffectCallback, deps?: DependencyList, options?: ThrottleOptions) => {
  // 通过设置 flag 标识依赖，只有 flag 改变时，才会触发 useUpdateEffect 中的回调
  const [flag, setFlag] = useState({});

  // 节流函数
  const { run } = useThrottleFn(() => {
    setFlag({});
  }, options);

  // 监听 deps，中间包一层增加节流功能
  useEffect(() => {
    return run();
  }, deps);

  // flag 变化执行 effect
  useUpdateEffect(effect, [flag]);
}

export default useThrottleEffect;

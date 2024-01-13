import type {DependencyList, EffectCallback} from "react";
import {DebounceOptions} from "../useDebounce/debounceOptions";
import useUpdateEffect from "@/hooks/useUpdateEffect";
import {useEffect, useState} from "react";
import useDebounceFn from "@/hooks/useDebounceFn";


const useDebounceEffect = (effect: EffectCallback, deps?: DependencyList, options?: DebounceOptions) => {
  // 通过设置 flag 标识依赖，只有 flag 改变时，才会触发 useUpdateEffect 中的回调
  const [flag, setFlag] = useState({});

  // 防抖函数
  const { run } = useDebounceFn(() => {
    setFlag({});
  }, options);

  // 监听 deps，中间包一层增加防抖功能
  useEffect(() => {
    return run();
  }, deps);

  // flag 变化执行 effect
  useUpdateEffect(effect, [flag]);
};

export default useDebounceEffect;

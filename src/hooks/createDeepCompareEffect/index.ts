import { useRef } from "react";
import type { DependencyList, useEffect, useLayoutEffect } from "react";
import { depsEqual } from "../../../utils/depsEqual";

type EffectHookType = typeof useEffect | typeof useLayoutEffect;
type createUpdateEffect = (hook: EffectHookType) => EffectHookType;

const createDeepCompareEffect: createUpdateEffect =
  (hook) => (effect, deps) => {
    // 通过 useRef 存储上一次的依赖项
    const ref = useRef<DependencyList>();
    // 创建一个信号值，用于触发 useEffect/useLayoutEffect 中的回调
    const signalRef = useRef<number>(0);

    // 判断最新的依赖项和上一次的依赖项是否相等
    if (deps === undefined || !depsEqual(deps, ref.current)) {
      // 不相等则更新信号值
      ref.current = deps;
      signalRef.current += 1;
    }

    // 信号值更新触发回调
    hook(effect, [signalRef.current]);
  };

export default createDeepCompareEffect;

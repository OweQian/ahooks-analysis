import {DependencyList, useEffect, useLayoutEffect, useRef} from "react";
import {depsEqual} from "../../../utils/depsEqual";

type EffectHookType = typeof useEffect | typeof useLayoutEffect;
type createUpdateEffect = (hook: EffectHookType) => EffectHookType;

const createDeepCompareEffect: createUpdateEffect = (hook) => (effect, deps) => {
  // 通过 useRef 保存上一次的依赖的值
  const ref = useRef<DependencyList>();
  const signalRef = useRef<number>(0);

  // 判断最新的依赖和旧的区别
  // 如果不相等，则变更 signalRef.current，从而触发 useEffect/useLayoutEffect 中的回调
  if (deps === undefined || !depsEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  hook(effect, [signalRef.current]);
};

export default createDeepCompareEffect;

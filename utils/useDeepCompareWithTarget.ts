import {DependencyList, EffectCallback, useRef} from "react";
import {BasicTarget} from "./domTarget";
import {depsEqual} from "./depsEqual";
import useEffectWithTarget from "./useEffectWithTarget";

/**
 * 深度比较（对象值只比较属性）
 * */
const useDeepCompareEffectWithTarget = (effect: EffectCallback, deps: DependencyList, target: BasicTarget<any> | BasicTarget<any>[]) => {
  const ref = useRef<DependencyList>();
  const signalRef = useRef<number>(0);

  if (!depsEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  useEffectWithTarget(effect, [signalRef.current], target);
};

export default useDeepCompareEffectWithTarget;

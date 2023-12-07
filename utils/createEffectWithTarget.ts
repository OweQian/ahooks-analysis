import {DependencyList, EffectCallback, useEffect, useLayoutEffect, useRef} from "react";
import {BasicTarget, getTargetElement} from "./domTarget";
import depsAreSame from './depsAreSame';
import useUnmount from "@/hooks/useUnmount";

const createEffectWithTarget = (useEffectType: typeof useEffect | typeof useLayoutEffect) => {
  /**
   *
   * @param effect
   * @param deps
   * @param target target should compare ref.current vs ref.current, dom vs dom, ()=>dom vs ()=>dom
   */
  return (effect: EffectCallback, deps: DependencyList, target: BasicTarget<any> | BasicTarget<any>[]) => {
    // 首次挂载
    const hasInitRef = useRef(false);

    // target element 数组
    const lastElementRef = useRef<(Element | null)[]>([]);
    // 依赖项数组
    const lastDepsRef = useRef<DependencyList>([]);

    // 清除副作用函数
    const unLoadRef = useRef<any>();

    useEffectType(() => {
      const targets = Array.isArray(target) ? target : [target];
      const els = targets.map(item => getTargetElement(item));

      if (!hasInitRef.current) {
        hasInitRef.current = true;

        lastElementRef.current = els;
        lastDepsRef.current = deps;
        unLoadRef.current = effect();
        return;
      }

      if (els.length !== lastElementRef.current.length || !depsAreSame(els, lastElementRef.current) || !depsAreSame(deps, lastDepsRef.current)) {
        unLoadRef.current?.(); // 清除副作用

        lastElementRef.current = els;
        lastDepsRef.current = deps;
        unLoadRef.current = effect();
      }
    });

    useUnmount(() => {
      unLoadRef.current?.(); // 清除副作用
      hasInitRef.current = false;
    })
  };
}

export default createEffectWithTarget;

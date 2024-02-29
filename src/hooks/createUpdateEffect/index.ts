import { useRef } from "react";
import type { useEffect, useLayoutEffect } from "react";

type EffectHookType = typeof useEffect | typeof useLayoutEffect;

export const createUpdateEffect: (hook: EffectHookType) => EffectHookType =
  (hook) => (effect, deps) => {
    // 初始化一个标识符，判断组件是否已挂载，初始值为 false
    const isMounted = useRef<boolean>(false);

    // for react-refresh
    hook(() => {
      // 组件卸载置为 false
      return () => {
        isMounted.current = false;
      };
    }, []);

    hook(() => {
      // 首次执行，置为 true
      if (!isMounted.current) {
        isMounted.current = true;
      } else {
        // 只有标识符为 true 时（组件更新），执行回调函数
        return effect();
      }
    }, deps);
  };

export default createUpdateEffect;

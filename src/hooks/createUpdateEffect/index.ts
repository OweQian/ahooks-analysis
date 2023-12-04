import { useRef } from 'react';
import type { useEffect, useLayoutEffect } from 'react';

type EffectHookType = typeof useEffect | typeof useLayoutEffect;

export const createUpdateEffect = (hook: EffectHookType): EffectHookType => (effect, deps) => {
  // 初始化一个标识符，初始值为 false
  const isMounted = useRef<boolean>(false);

  hook(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  hook(() => {
    // 首次执行，置为 true
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      // 只有标识符为 true 时，才执行回调函数
      return effect();
    }
  }, deps);
};

export default createUpdateEffect;

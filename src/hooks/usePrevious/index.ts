import { useRef } from 'react';

export type ShouldUpdateFunc<T> = (prev: T | undefined, next: T) => boolean;

const defaultShouldUpdate = <T>(a?: T, b?: T) => !Object.is(a, b);

const usePrevious = <T>(state: T, shouldUpdate: ShouldUpdateFunc<T> = defaultShouldUpdate): T | undefined => {
  /**
   * 维护两个状态 和 curRef（保存当前状态）
   * prevRef: 保存上一次的状态
   * curRef: 保存当前状态
   * */
  const prevRef = useRef<T>();
  const curRef = useRef<T>();

  /**
   * 使用 shouldUpdate 判断是否发生变化，默认通过 Object.is 判断
   * */
  if (shouldUpdate(curRef.current, state)) {
    // 状态发生变化，更新 prevRef 的值为上一个 curRef
    prevRef.current = curRef.current;
    // 更新 curRef 为当前的状态
    curRef.current = state;
  }

  return prevRef.current;
};

export default usePrevious;

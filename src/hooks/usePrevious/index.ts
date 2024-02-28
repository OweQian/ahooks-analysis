import { useRef } from "react";

export type ShouldUpdateFunc<T> = (prev: T | undefined, next: T) => boolean;

const defaultShouldUpdate = <T>(a?: T, b?: T) => !Object.is(a, b);

const usePrevious = <T>(
  state: T,
  shouldUpdate: ShouldUpdateFunc<T> = defaultShouldUpdate
): T | undefined => {
  /**
   * 维护两个状态 prevRef 和 curRef
   * prevRef: 上一次的状态值
   * curRef: 当前的状态值
   * */
  const prevRef = useRef<T>();
  const curRef = useRef<T>();

  /**
   * 使用 shouldUpdate 判断是否发生变化，默认通过 Object.is 判断
   * */
  // 状态发生变化
  if (shouldUpdate(curRef.current, state)) {
    // 手动更新 prevRef 的值为上一个状态值
    prevRef.current = curRef.current;
    // 手动更新 curRef 的值为最新的状态值
    curRef.current = state;
  }

  // 返回上一次的状态值
  return prevRef.current;
};

export default usePrevious;

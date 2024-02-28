import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import useUnmount from "@/hooks/useUnmount";

function useRafState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>];
function useRafState<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>
];

function useRafState<S>(initialState?: S | (() => S)) {
  const ref = useRef(0);
  const [state, setState] = useState(initialState);

  const setRafState = useCallback((value: SetStateAction<S | undefined>) => {
    // 取消上一次的 requestAnimationFrame
    cancelAnimationFrame(ref.current);

    // 重新通过 requestAnimationFrame 控制 setState 的执行时机
    ref.current = requestAnimationFrame(() => {
      setState(value);
    });
  }, []);

  useUnmount(() => {
    // 组件卸载时，取消 requestAnimationFrame，避免内存泄露
    cancelAnimationFrame(ref.current);
  });

  return [state, setRafState] as const;
}

export default useRafState;

import {Dispatch, SetStateAction, useCallback, useRef, useState} from "react";
import useUnmount from "@/hooks/useUnmount";

function useRafState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
function useRafState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

function useRafState<S>(initialState?: S | (() => S)) {
  const ref = useRef(0);

  const [state, setState] = useState(initialState);

  const setRafState = useCallback((value: S | ((prevState: S) => S)) => {
    // 取消上一次的 setRafState 操作
    cancelAnimationFrame(ref.current);

    // 重新通过 requestAnimationFrame 控制 setState 的执行时机
    ref.current = requestAnimationFrame(() => {
      setState(value);
    });
  }, []);

  useUnmount(() => {
    // 页面卸载时，取消操作，避免内存泄露
    cancelAnimationFrame(ref.current);
  })
  return [state, setRafState] as const;
}

export default useRafState;

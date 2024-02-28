import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import useUnmountedRef from "@/hooks/useUnmountedRef";

function useSafeState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>];

function useSafeState<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>
];

function useSafeState<S>(initialState?: S | (() => S)) {
  // 组件是否卸载
  const unmountedRef = useUnmountedRef();
  const [state, setState] = useState(initialState);

  const setCurrentState = useCallback(
    (currentState: SetStateAction<S | undefined>) => {
      // 如果组件已经卸载，则停止更新
      if (unmountedRef.current) return;
      // 否则更新状态
      setState(currentState);
    },
    []
  );

  return [state, setCurrentState] as const;
}

export default useSafeState;

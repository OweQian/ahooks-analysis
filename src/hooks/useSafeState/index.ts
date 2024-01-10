import {Dispatch, SetStateAction, useCallback, useState} from "react";
import useUnmountedRef from "@/hooks/useUnmountedRef";

function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

function useSafeState<S>(initialState?: S | (() => S)) {
  // 判断组件是否卸载
  const unmountedRef = useUnmountedRef();

  const [state, setState] = useState(initialState);

  const setCurrentState = useCallback((currentState) => {
    // 如果组件已经卸载，则停止更新
    if (unmountedRef.current) return;
    setState(currentState);
  }, []);

  return [state, setCurrentState] as const;
}

export default useSafeState;


import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import useLatest from "@/hooks/useLatest";

type GetStateAction<S> = () => S;

function useGetState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>, GetStateAction<S>];
function useGetState<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
  GetStateAction<S | undefined>
];

function useGetState<S>(initialState?: S) {
  const [state, setState] = useState(initialState);
  // 记录最新的 state 值
  const stateRef = useLatest(state);

  // 暴露一个 getState 方法获取到最新的
  const getState = useCallback(() => stateRef.current, []);

  return [state, setState, getState];
}

export default useGetState;

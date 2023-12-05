import {Dispatch, SetStateAction, useCallback, useRef, useState} from "react";

type GetStateAction<S> = () => S;

function useGetState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>, GetStateAction<S>];
function useGetState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>, GetStateAction<S | undefined>];

function useGetState<S>(initialState?: S | (() => S)) {
  const [state, setState] = useState(initialState);

  // 通过 useRef 记录最新的 state 的值
  const stateRef = useRef(state)
  stateRef.current = state;

  // 暴露一个 getState 方法获取到最新的
  const getState = useCallback(() => stateRef.current, []);

  return [state, setState, getState];
}

export default useGetState;

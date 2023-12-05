import {Dispatch, SetStateAction, useState} from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";

type ResetState = () => void;

const useResetState = <S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>, ResetState] => {
  const [state, setState] = useState(initialState);

  // 暴露一个 resetState 方法重置 state
  const resetState = useMemoizedFn(() => {
    setState(initialState);
  });

  return [state, setState, resetState];
}

export default useResetState;

import {isFunction} from "../../../utils";
import {useEffect} from "react";
import useLatest from "@/hooks/useLatest";

const useUnmount = (fn: () => void) => {
  if (!isFunction(fn)) {
    console.error(`useUnmount expected parameter is a function, but got ${typeof fn}`)
  }

  const fnRef = useLatest(fn);

  useEffect(() => () => fnRef.current?.(), []);
}

export default useUnmount;

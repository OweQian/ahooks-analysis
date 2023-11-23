import {isFunction} from "../../../utils";
import {useEffect} from "react";

const useMount = (fn: () => void) => {
  if (!isFunction(fn)) {
    console.error(`useMount expected parameter is a function, but got ${typeof fn}`)
  }

  useEffect(() => {
    fn?.();
  }, []);
}

export default useMount;

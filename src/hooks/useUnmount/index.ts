import { isFunction } from "../../../utils";
import isDev from "../../../utils/isDev";
import { useEffect } from "react";
import useLatest from "@/hooks/useLatest";

const useUnmount = (fn: () => void) => {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(
        `useUnmount expected parameter is a function, but got ${typeof fn}`
      );
    }
  }

  const fnRef = useLatest(fn);
  // 组件卸载执行函数
  useEffect(() => () => fnRef.current?.(), []);
};

export default useUnmount;

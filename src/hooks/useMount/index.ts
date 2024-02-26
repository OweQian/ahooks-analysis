import { isFunction } from "../../../utils";
import { useEffect } from "react";

const useMount = (fn: () => void) => {
  if (!isFunction(fn)) {
    console.error(
      `useMount expected parameter is a function, but got ${typeof fn}`
    );
  }
  // useEffect 的 deps 为空，只会在组件初始化时执行
  // 单纯在 useEffect 基础上封装了一层
  useEffect(() => {
    fn?.();
  }, []);
};

export default useMount;

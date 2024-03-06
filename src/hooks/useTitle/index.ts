import { useEffect, useRef } from "react";
import useUnmount from "@/hooks/useUnmount";
import isBrowser from "../../../utils/isBrowser";

export interface Options {
  restoreOnUnmount?: boolean;
}

const DEFAULT_OPTIONS: Options = {
  restoreOnUnmount: false,
};

const useTitle = (title: string, options: Options = DEFAULT_OPTIONS) => {
  // 上一个页面标题
  const titleRef = useRef(isBrowser ? document.title : "");

  useEffect(() => {
    // 通过 document.title 设置页面标题
    document.title = title;
  }, [title]);

  useUnmount(() => {
    // 组件卸载时，恢复上一个页面标题
    if (options.restoreOnUnmount) {
      document.title = titleRef.current;
    }
  });
};

export default useTitle;

import {useEffect, useRef} from "react";
import isBrowser from "../../../utils/isBrowser";
import useUnmount from "@/hooks/useUnmount";

export interface Options {
  restoreOnUnmount?: boolean;
}

const DEFAULT_OPTIONS: Options = {
  restoreOnUnmount: false,
};

const useTitle = (title: string, options: Options = DEFAULT_OPTIONS) => {
  const titleRef = useRef(isBrowser ? document.title : '');

  useEffect(() => {
    // 通过 document.title 设置
    document.title = title;
  }, [title]);

  useUnmount(() => {
    // 组件卸载后，恢复上一次的 title
    if (options.restoreOnUnmount) {
      document.title = titleRef.current;
    }
  });
};

export default useTitle;

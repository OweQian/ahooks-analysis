import {useEffect, useRef} from "react";
import type { Plugin } from '../types';
import useUnmount from "@/hooks/useUnmount";
import limit from "../utils/limit";
import subscribeFocus from "../utils/subscribeFocus";

const useRefreshOnWindowFocusPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { refreshOnWindowFocus, focusTimespan = 5000 },
) => {
  // 清除订阅事件的函数
  const unsubscribeRef = useRef<() => void>();

  const stopSubscribe = () => {
    // 执行清除订阅事件的函数
    unsubscribeRef.current?.();
  };

  /**
   * options.refreshOnWindowFocus、options.focusTimespan 支持动态变化
   * */
  useEffect(() => {
    // options.refreshOnWindowFocus 为 true，在屏幕重新获取焦点或重新显示时，重新发起请求
    // (: 默认自上一次请求后回到页面的时间间隔大于 5000ms，才重新发起请求
    if (refreshOnWindowFocus) {
      // 根据 focusTimespan，判断是否进行请求
      const limitRefresh = limit(fetchInstance.refresh.bind(fetchInstance), focusTimespan);
      // 存放在订阅事件列表中
      unsubscribeRef.current = subscribeFocus(() => {
        limitRefresh();
      });
    }
    return () => {
      stopSubscribe();
    };
  }, [refreshOnWindowFocus, focusTimespan]);

  useUnmount(() => {
    stopSubscribe();
  });

  return {};
};

export default useRefreshOnWindowFocusPlugin;

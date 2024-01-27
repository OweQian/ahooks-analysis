import type {Plugin, Timeout} from '../types';
import {useRef} from "react";

const useLoadingDelayPlugin: Plugin<any, any[]> = (fetchInstance, { loadingDelay, ready }) => {
  const timerRef = useRef<Timeout>();

  if (!loadingDelay) {
    return {};
  }

  // 清除定时器
  const cancelTimout = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return {
    // 请求前调用
    onBefore: () => {
      cancelTimout();

      // 通过 setTimeout 实现延迟 loading 变为 true 的时间
      if (!ready) {
        timerRef.current = setTimeout(() => {
          fetchInstance.setState({
            loading: true,
          });
        }, loadingDelay)
      }

      // 不管是手动还是非手动，先在请求前把 loading 置为 false
      return {
        loading: false,
      }
    },
    onFinally: () => {
      cancelTimout();
    },
    onCancel: () => {
      cancelTimout();
    }
  }
};
export default useLoadingDelayPlugin;

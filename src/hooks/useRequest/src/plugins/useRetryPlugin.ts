import type {Plugin, Timeout} from '../types';
import {useRef} from "react";

const useRetryPlugin: Plugin<any, any[]> = (fetchInstance, { retryCount, retryInterval}) => {
  const timerRef = useRef<Timeout>();
  // 记录 retry 的次数
  const countRef = useRef(0);

  // 标记是否由重试触发
  const triggerByRetry = useRef(false);

  if (!retryCount) {
    return {};
  }

  return {
    /**
     * 避免 useRequest 重新执行，导致请求重新发起
     * 在 onBefore 里做一些重置处理，以防和上一次的 retry 定时器撞车
     * */
    onBefore: () => {
      // 不是由重试触发，重置 count
      if (!triggerByRetry.current) {
        countRef.current = 0;
      }
      // 重置 triggerByRetry 为 false
      triggerByRetry.current = false;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    onSuccess: () => {
      // 重置为 0
      countRef.current = 0;
    },
    onError: () => {
      countRef.current += 1;
      // 重试的次数小于设置的次数
      // 或者 retryCount 设置为 -1，无限次重试
      if (retryCount === -1 || countRef.current <= retryCount) {
        // Exponential backoff
        // 如果不设置，默认采用简易的指数退避算法，取 1000 * 2 ** retryCount，也就是第一次重试等待 2s，第二次重试等待 4s，以此类推，如果大于 30s，则取 30s
        const timeout = retryInterval ?? Math.min(1000 * 2 ** countRef.current, 30000);
        timerRef.current = setTimeout(() => {
          // triggerByRetry 置为 true，保证重试次数不重置
          triggerByRetry.current = true;
          // 重新请求
          fetchInstance.refresh();
        }, timeout);
      } else {
        // 重置为 0
        countRef.current = 0;
      }
    },
    onCancel: () => {
      // 重置为 0
      countRef.current = 0;
      // 清除定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
  };
};

export default useRetryPlugin;

import type {Plugin} from '../types';
import throttle from "lodash/throttle";
import {useRef, useMemo, useEffect} from "react";
import type { DebouncedFunc, ThrottleSettings } from "lodash";

/**
 * 函数劫持，加入节流逻辑
 * loadash throttle: 创建一个节流函数，在 wait 秒内最多执行 func 一次的函数。
 * https://www.lodashjs.com/docs/lodash.throttle
 * */
const useThrottlePlugin: Plugin<any, any[]> = (fetchInstance, {
  throttleWait,
  throttleLeading,
  throttleTrailing,
}) => {
  const throttledRef = useRef<DebouncedFunc<any>>();

  const options = useMemo(() => {
    const ret: ThrottleSettings = {};
    if (throttleLeading !== undefined) {
      ret.leading = throttleLeading;
    }
    if (throttleTrailing !== undefined) {
      ret.trailing = throttleTrailing;
    }
    return ret;
  }, [throttleLeading, throttleTrailing]);

  useEffect(() => {
    if (throttleWait) {
      // 保存原函数
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      // 使用 lodash 的 throttle
      // 该函数提供一个 cancel 方法取消延迟的函数调用
      throttledRef.current = throttle(
        (callback) => {
          callback();
        },
        throttleWait,
        options,
      );

      // 函数劫持，改写 runAsync 方法，使其具有节流能力
      // throttle runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          throttledRef.current?.(() => {
            // 执行原函数
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        // cancel 掉节流函数
        throttledRef.current?.cancel();
        // 还原原函数
        fetchInstance.runAsync = _originRunAsync;
      };
    }
  }, [throttleWait, options]);

  if (!throttleWait) {
    return {};
  }

  return {
    onCancel: () => {
      throttledRef.current?.cancel();
    },
  };
};

export default useThrottlePlugin;

import type {Plugin} from '../types';
import debounce from "lodash/debounce";
import {useRef, useMemo, useEffect} from "react";
import type { DebouncedFunc, DebounceSettings } from "lodash";

/**
 * 函数劫持，加入防抖逻辑
 * loadash debounce: 创建一个 debounced（防抖动）函数，该函数会从上一次被调用后，延迟 wait 毫秒后调用 func 方法。
 * https://www.lodashjs.com/docs/lodash.debounce#_debouncefunc-wait0-options
 * */
const useDebouncePlugin: Plugin<any, any[]> = (fetchInstance, {
  debounceWait,
  debounceLeading,
  debounceTrailing,
  debounceMaxWait,
}) => {
  const debouncedRef = useRef<DebouncedFunc<any>>();

  const options = useMemo(() => {
    const ret: DebounceSettings = {};
    if (debounceLeading !== undefined) {
      ret.leading = debounceLeading;
    }
    if (debounceTrailing !== undefined) {
      ret.trailing = debounceTrailing;
    }
    if (debounceMaxWait !== undefined) {
      ret.maxWait = debounceMaxWait;
    }
    return ret;
  }, [debounceLeading, debounceTrailing, debounceMaxWait]);

  useEffect(() => {
    if (debounceWait) {
      // 保存原函数
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      // 使用 lodash 的 debounce
      // 该函数提供一个 cancel 方法取消延迟的函数调用
      debouncedRef.current = debounce(
        (callback) => {
          callback();
        },
        debounceWait,
        options,
      );

      // 函数劫持，改写 runAsync 方法，使其具有防抖能力
      // debounce runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          debouncedRef.current?.(() => {
            // 执行原函数
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        // cancel 掉防抖函数
        debouncedRef.current?.cancel();
        // 还原原函数
        fetchInstance.runAsync = _originRunAsync;
      };
    }
  }, [debounceWait, options]);

  if (!debounceWait) {
    return {};
  }

  return {
    onCancel: () => {
      debouncedRef.current?.cancel();
    },
  };
};

export default useDebouncePlugin;

import useUpdateEffect from "@/hooks/useUpdateEffect";
import {useRef} from "react";
import type { Plugin } from '../types';

// support refreshDeps & ready
const useAutoRunPlugin: Plugin<any, any[]> = (fetchInstance, {
  manual,
  ready = true,
  defaultParams = [],
  refreshDeps = [],
  refreshDepsAction,
}) => {
  const hasAutoRun = useRef(false);
  hasAutoRun.current = false;

  /**
   * Ready
   * useUpdateEffect 等同于 useEffect，但会忽略首次执行，只在依赖更新时执行
   * */
  useUpdateEffect(() => {
    // 自动请求模式并且 ready 值为 true
    if (!manual && ready) {
      hasAutoRun.current = true;
      // 执行请求
      fetchInstance.run(...defaultParams);
    }
  }, [ready]);

  /**
   * 依赖刷新
   * */
  useUpdateEffect(() => {
    if (hasAutoRun.current) {
      return;
    }
    // 自动请求模式
    if (!manual) {
      hasAutoRun.current = true;
      // 自定义依赖数组变化时的请求行为
      if (refreshDepsAction) {
        refreshDepsAction()
      } else {
        // 调用 refresh 方法，实现刷新重复上一次请求的效果
        fetchInstance.refresh();
      }
    }
  }, [...refreshDeps]);

  return {
    // 在 onBefore 阶段，当 ready 值为 false 时，返回 stopNow
    onBefore: () => {
      if (!ready) {
        return {
          stopNow: true,
        }
      }
    }
  }
};

export default useAutoRunPlugin;

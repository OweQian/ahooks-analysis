import {BasicTarget, getTargetElement} from "../../../utils/domTarget";
import useLatest from "@/hooks/useLatest";
import useDeepCompareEffectWithTarget from "../../../utils/useDeepCompareWithTarget";

const useMutationObserver = (callback: MutationCallback, target: BasicTarget, options: MutationObserverInit = {}): void => {
  const callbackRef = useLatest(callback);

  useDeepCompareEffectWithTarget(() => {
    // 需要观察变动的节点
    const element = getTargetElement(target);
    if (!element) {
      return;
    }

    // 创建一个观察器实例并传入回调函数
    const observer = new MutationObserver(callbackRef.current);

    // 根据配置开始观察目标节点
    observer.observe(element, options);

    // 停止观察
    return () => {
      observer.disconnect();
    };
  }, [options], target);
};

export default useMutationObserver;

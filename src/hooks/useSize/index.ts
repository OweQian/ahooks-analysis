import ResizeObserver from 'resize-observer-polyfill';
import {getTargetElement} from "../../../utils/domTarget";
import type {BasicTarget} from "../../../utils/domTarget";
import useRafState from "@/hooks/useRafState";
import useIsomorphicLayoutEffectWithTarget from "../../../utils/useIsomorphicLayoutEffectWithTarget";

type Size = { width: number, height: number };

const useSize = (target: BasicTarget): Size | undefined => {
  const [state, setState] = useRafState(() => {
    // 获取当前目标元素
    const el = getTargetElement(target);
    return el ? { width: el.clientWidth, height: el.clientHeight } : undefined;
  });

  useIsomorphicLayoutEffectWithTarget(() => {
    // 获取当前目标元素
    const el = getTargetElement(target);

    if (!el) {
      return;
    }

    /**
     * 使用 ResizeObserver API 监听对应目标的尺寸变化
     * 新建一个观察者，传入一个当尺寸发生变化时的回调函数
     * entries 是 ResizeObserverEntry 的数组，包含两个属性：
     * ResizeObserverEntry.contentRect: 包含尺寸信息（x, y, width, height, top, right, left, bottom)
     * ResizeObserverEntry.target: 目标对象，即当前观察到尺寸变化的元素
     * */
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const { clientWidth, clientHeight } = entry.target;
        setState({width: clientWidth, height: clientHeight});
      })
    });

    // 监听目标元素
    resizeObserver.observe(el);

    return () => {
      // 销毁
      resizeObserver.disconnect();
    };
  }, [], target);

  return state;
}

export default useSize;

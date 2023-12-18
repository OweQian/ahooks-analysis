/**
 * intersection-observer polyfill 处理
 * */
import 'intersection-observer';
import {BasicTarget} from "../../../utils/domTarget";
import { getTargetElement } from "../../../utils/domTarget";
import {useState} from "react";
import useEffectWithTarget from "../../../utils/useEffectWithTarget";

type CallbackType = (entry: IntersectionObserverEntry) => void;

export interface Options {
  rootMargin?: string;
  root?: BasicTarget;
  threshold?: number | number[];
  callback?: CallbackType;
}

const useInViewport = (target: BasicTarget | BasicTarget[], options?: Options) => {
  const { callback, ...option } = options || {};

  const [state, setState] = useState<boolean>();
  const [ratio, setRatio] = useState<number>();

  useEffectWithTarget(() => {
    const targets = Array.isArray(target) ? target : [target];
    /**
     * 移除所有的 false 类型的元素
     * */
    const els = targets.map((element) => getTargetElement(element)).filter(Boolean);

    if (!els) {
      return;
    }

    /**
     * 创建交叉观察器
     * */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          /**
           * 查看条目是否代表当前与根相交的元素
           * */
          setRatio(entry.intersectionRatio);
          /**
           * 返回比例值
           * */
          setState(entry.isIntersecting);
          /**
           * 执行回调
           * */
          callback?.(entry);
        }
      },
      {
        ...option,
        root: getTargetElement(options?.root),
      },
    );

    /**
     * 定位要观察的元素，可以是多个元素
     * */
    els.forEach(el => {
      if (el) {
        observer.observe(el);
      }
    });

    return (() => {
      observer.disconnect();
    });
  }, [options?.rootMargin, options?.threshold, callback], target);
  return [state, ratio] as const;
};

export default useInViewport;

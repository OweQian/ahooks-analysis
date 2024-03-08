/**
 * intersection-observer polyfill 处理
 * */
import "intersection-observer";
import { useState } from "react";
import type { BasicTarget } from "../../../utils/domTarget";
import { getTargetElement } from "../../../utils/domTarget";
import useEffectWithTarget from "../../../utils/useEffectWithTarget";

type CallbackType = (entry: IntersectionObserverEntry) => void;

export interface Options {
  rootMargin?: string;
  threshold?: number | number[];
  root?: BasicTarget<Element>;
  callback?: CallbackType;
}

const useInViewport = (
  target: BasicTarget | BasicTarget[],
  options?: Options
) => {
  const { callback, ...option } = options || {};

  const [state, setState] = useState<boolean>();
  const [ratio, setRatio] = useState<number>();

  useEffectWithTarget(
    () => {
      const targets = Array.isArray(target) ? target : [target];
      const els = targets
        .map((element) => getTargetElement(element))
        .filter(Boolean);

      if (!els.length) {
        return;
      }

      /**
       * 创建交叉观察器
       * */
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            /**
             * 返回比例值
             * */
            setRatio(entry.intersectionRatio);
            /**
             * 查看条目是否代表当前与根相交的元素
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
        }
      );

      /**
       * 监控多个元素
       * */
      els.forEach((el) => observer.observe(el!));

      return () => {
        observer.disconnect();
      };
    },
    [options?.rootMargin, options?.threshold, callback],
    target
  );
  return [state, ratio] as const;
};

export default useInViewport;

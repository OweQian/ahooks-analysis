import type { MutableRefObject } from "react";
import { isFunction } from "./index";
import isBrowser from "./isBrowser";

type TargetValue<T> = T | undefined | null;

/**
 * HTMLElement 和 Element 是用于表示 HTML 元素和 DOM 元素的接口
 * Window 和 Document 则是用于表示浏览器窗口和文档对象的接口
 */
type TargetType = HTMLElement | Element | Window | Document;

export type BasicTarget<T extends TargetType = Element> =
  | (() => TargetValue<T>)
  | TargetValue<T>
  | MutableRefObject<TargetValue<T>>;

export function getTargetElement<T extends TargetType>(
  target: BasicTarget<T>,
  defaultElement?: T
): TargetValue<T> {
  if (!isBrowser) {
    return undefined;
  }

  if (!target) {
    return defaultElement;
  }

  let targetElement: TargetValue<T>;

  // 函数
  if (isFunction(target)) {
    targetElement = target();
    // ref 对象
  } else if ("current" in target) {
    targetElement = target.current;
  } else {
    targetElement = target;
  }

  return targetElement;
}

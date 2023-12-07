import { isFunction } from "./index";
import isBrowser from "./isBrowser";
import {MutableRefObject} from "react";

type TargetValue<T> = T | undefined | null;

type TargetType = HTMLElement | Element | Window | Document;

export type BasicTarget<T extends TargetType = Element> =
  | (() => TargetValue<T>)
  | TargetValue<T>
  | MutableRefObject<TargetValue<T>>;

export function getTargetElement<T extends TargetType>(target: BasicTarget<T>, defaultElement?: T): TargetValue<T> {
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
  } else if ('current' in target) {
    targetElement = target.current;
  } else {
    targetElement = target;
  }

  return targetElement;
}

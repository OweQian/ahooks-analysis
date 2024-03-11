import { useState } from "react";
import type { BasicTarget } from "../../../utils/domTarget";
import useEventListener from "@/hooks/useEventListener";

export interface Options {
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onChange?: (isFocusWithin: boolean) => void;
}

/**
 * focusin、focusout、focus、blur 都是与用户输入焦点相关的事件
 * focusin、focusout 在元素或其子元素获得或失去焦点时触发（冒泡到祖先元素）
 * focus、blur 只在元素自身获得或失去焦点时触发
 * */
const useFocusWithin = (target: BasicTarget, options?: Options) => {
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const { onFocus, onBlur, onChange } = options || {};

  useEventListener(
    "focusin",
    (e: FocusEvent) => {
      if (!isFocusWithin) {
        onFocus?.(e);
        onChange?.(true);
        setIsFocusWithin(true);
      }
    },
    {
      target,
    }
  );

  useEventListener(
    "focusout",
    (e: FocusEvent) => {
      /**
       * e.currentTarget 表示当前正在处理事件的元素，即绑定了 focusout 事件监听器的元素
       * e.relatedTarget 表示与事件相关的目标元素，即导致元素失去焦点的元素
       * 在 focusout 事件中，表示 e.relatedTarget 获取了焦点的新元素，如果焦点移出了文档，则为 null
       * */
      if (
        isFocusWithin &&
        !(e.currentTarget as Element)?.contains?.(e.relatedTarget as Element)
      ) {
        onBlur?.(e);
        onChange?.(false);
        setIsFocusWithin(false);
      }
    },
    {
      target,
    }
  );
  return isFocusWithin;
};

export default useFocusWithin;

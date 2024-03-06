import { useCallback, useState } from "react";
import useLatest from "@/hooks/useLatest";
import { isFunction } from "../../../utils";

interface EventTarget<U> {
  target: {
    value: U;
  };
}

export interface Options<T, U> {
  initialValue?: T;
  transformer?: (value: U) => T;
}

const useEventTarget = <T, U = T>(options?: Options<T, U>) => {
  const { initialValue, transformer } = options || {};

  const [value, setValue] = useState(initialValue);

  // 自定义回调值的转化
  const transformerRef = useLatest(transformer);

  // 重置函数
  const reset = useCallback(() => setValue(initialValue), []);

  // 表单控件值发生变化时的回调
  const onChange = useCallback((e: EventTarget<U>) => {
    // 获取 e.target.value
    const _value = e.target.value;
    // 判断自定义回调值的转化配置项是否存在并且为函数
    if (isFunction(transformerRef.current)) {
      return setValue(transformerRef.current(_value));
    }
    // no transformer => U and T should be the same
    return setValue(_value as unknown as T);
  }, []);

  return [
    value,
    {
      onChange,
      reset,
    },
  ] as const;
};

export default useEventTarget;

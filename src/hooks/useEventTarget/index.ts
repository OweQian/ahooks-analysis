import {useCallback, useState} from "react";
import useLatest from "@/hooks/useLatest";
import {isFunction} from "../../../utils";

export interface Options<T, U> {
  initialValue?: T;
  transformer?: (value: U) => T;
}

const useEventTarget = <T, U>(options?: Options<T, U>) => {
  const { initialValue, transformer } = options || {};

  const [value, setValue] = useState(initialValue);

  // 自定义转换函数
  const transformerRef = useLatest(transformer);

  const reset = useCallback(() => setValue(initialValue), []);

  const onChange = useCallback((e: EventTarget<U>) => {
    // 获取 e.target.value 的值，并进行设置
    const _value = e.target.value;
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
    }
  ] as const;
}

export default useEventTarget;

import { useState } from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";
import useUpdateEffect from "@/hooks/useUpdateEffect";
import { isFunction, isUndef } from "../../../utils";

export type SetState<S> = S | ((prevState?: S) => S);

export interface Options<T> {
  defaultValue?: T | (() => T);
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onError?: (error: unknown) => void;
}

export const createUseStorageState = (
  getStorage: () => Storage | undefined
) => {
  function useStorageState<T>(key: string, options: Options<T> = {}) {
    let storage: Storage | undefined;
    const { onError = (e) => console.error(e) } = options;

    /**
     * 🐞
     * getStorage 可以返回 localStorage/sessionStorage/undefined
     * 当 cookie 被 disabled 时，访问不了 localStorage/sessionStorage
     * */
    // https://github.com/alibaba/hooks/issues/800
    try {
      storage = getStorage();
    } catch (e) {
      onError(e);
    }

    // 支持自定义序列化方法，默认 JSON.stringify
    const serializer = (value: T): string => {
      if (options.serializer) {
        return options.serializer(value);
      }
      return JSON.stringify(value);
    };

    // 支持自定义反序列化方法，默认 JSON.parse
    const deserializer = (value: string): T => {
      if (options.deserializer) {
        return options.deserializer(value);
      }
      return JSON.parse(value);
    };

    const getStoredValue = () => {
      try {
        const raw = storage?.getItem(key);
        if (raw) {
          return deserializer(raw);
        }
      } catch (e) {
        onError(e);
      }

      // options.defaultValue 默认值处理
      if (isFunction(options.defaultValue)) {
        return (options.defaultValue as () => T)();
      }
      return options.defaultValue;
    };

    const [state, setState] = useState(getStoredValue);

    // key 更新时执行
    useUpdateEffect(() => {
      setState(getStoredValue());
    }, [key]);

    const updateState = (value?: SetState<T>) => {
      // 如果为函数，则取执行后结果；否则，直接取值
      const currentState = isFunction(value) ? value(state) : value;
      setState(currentState);

      // 如果是值为 undefined，则 removeItem
      if (isUndef(currentState)) {
        storage?.removeItem(key);
      } else {
        try {
          // setItem
          storage?.setItem(key, serializer(currentState));
        } catch (e) {
          console.error(e);
        }
      }
    };

    return [state, useMemoizedFn(updateState)] as const;
  }

  return useStorageState;
};

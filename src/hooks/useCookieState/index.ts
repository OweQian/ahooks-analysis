import Cookies from 'js-cookie';
import { useState } from 'react';
import useMemoizedFn from '../useMemoizedFn';
import { isFunction, isString } from "../../../utils";

export type State = string | undefined;

export interface Options extends Cookies.CookieAttributes {
  defaultValue?: State | (() => State);
}

function useCookieState(cookieKey: string, options: Options = {}) {
  const [state, setState] = useState<State>(() => {
    // 本地 Cookie 已有 cookieKey 对应的 cookie 值，则直接返回
    const cookieValue = Cookies.get(cookieKey);

    if (isString(cookieValue)) return cookieValue;

    // 定义 Cookie 默认值，但不同步到本地 Cookie
    if (isFunction(options.defaultValue)) {
      return options.defaultValue();
    }

    return options.defaultValue;
  });

  const updateState = useMemoizedFn(
    (
      newValue: State | ((prevState: State) => State),
      newOptions: Cookies.CookieAttributes = {},
    ) => {
      // setState 可以更新 cookie options，会与 useCookieState 设置的 options 进行 merge 操作
      const { defaultValue, ...restOptions } = { ...options, ...newOptions };
      // 判断传入的值，如果是函数，则取执行后返回的结果，否则直接取该值
      const value = isFunction(newValue) ? newValue(state) : newValue;

      setState(value);

      // 如果值为 undefined，则清除 cookie。否则，调用 js-cookie 的 set 方法
      if (value === undefined) {
        Cookies.remove(cookieKey);
      } else {
        Cookies.set(cookieKey, value, restOptions);
      }
    },
  );

  return [state, updateState] as const;
}

export default useCookieState;

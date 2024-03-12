import { useMemo, useRef } from "react";
import type { SetStateAction } from "react";
import { isFunction } from "../../../utils";
import useMemoizedFn from "../useMemoizedFn";
import useUpdate from "../useUpdate";

export interface Options<T> {
  defaultValue?: T;
  defaultValuePropName?: string;
  valuePropName?: string;
  trigger?: string;
}

export type Props = Record<string, any>;

export interface StandardProps<T> {
  value: T;
  defaultValue?: T;
  onChange: (val: T) => void;
}

function useControllableValue<T = any>(
  props: StandardProps<T>
): [T, (v: SetStateAction<T>) => void];
function useControllableValue<T = any>(
  props?: Props,
  options?: Options<T>
): [T, (v: SetStateAction<T>, ...args: any[]) => void];
function useControllableValue<T = any>(
  props: Props = {},
  options: Options<T> = {}
) {
  const {
    defaultValue,
    defaultValuePropName = "defaultValue",
    valuePropName = "value",
    trigger = "onChange",
  } = options;

  const value = props[valuePropName] as T;
  // 如果 props 中存在值的属性名，则为受控组件
  const isControlled = props.hasOwnProperty(valuePropName);

  // 初始值
  const initialValue = useMemo(() => {
    // 受控组件
    if (isControlled) {
      return value;
    }
    // props defaultValue
    if (props.hasOwnProperty(defaultValuePropName)) {
      return props[defaultValuePropName];
    }
    // options defaultValue
    return defaultValue;
  }, []);

  const stateRef = useRef(initialValue);

  // 如果是受控组件，则由外部传入的 value 来更新 state
  if (isControlled) {
    stateRef.current = value;
  }

  const update = useUpdate();

  function setState(v: SetStateAction<T>, ...args: any[]) {
    const r = isFunction(v) ? v(stateRef.current) : v;

    // 如果是非受控组件，则手动更新状态，强制组件重新渲染
    if (!isControlled) {
      stateRef.current = r;
      update();
    }
    // 触发 trigger
    if (props[trigger]) {
      props[trigger](r, ...args);
    }
  }

  return [stateRef.current, useMemoizedFn(setState)] as const;
}

export default useControllableValue;

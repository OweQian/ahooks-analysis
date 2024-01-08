import {useState} from "react";
import {isNumber} from "../../../utils";
import useMemoizedFn from "@/hooks/useMemoizedFn";

export interface Options {
  min?: number;
  max?: number;
}

export interface Actions {
  inc: (delta?: number) => void;
  dec: (delta?: number) => void;
  set: (value: number | ((c: number) => number)) => void;
  reset: () => void;
}

export type ValueParam = number | ((c: number) => number);

/**
 * 获取目标数值
 * 必须大于等于 min
 * 小于等于 max
 * */
function getTargetValue(val: number, options: Options = {}) {
  const { min, max } = options;
  let target = val;
  if (isNumber(max)) {
    target = Math.min(max, target);
  }
  if (isNumber(min)) {
    target = Math.max(min, target);
  }
  return target;
}

const useCounter = (initialValue: number = 0, options: Options = {}) => {
  const { min, max } = options;

  const [current, setCurrent] = useState(() => {
    return getTargetValue(initialValue, {
      min,
      max,
    });
  });

  // 设置值，参数可以为 number 或 函数
  const setValue = (value: ValueParam) => {
    setCurrent((c) => {
      const target = isNumber(value) ? value : value(c);
      return getTargetValue(target, {
        max,
        min,
      });
    });
  };

  // 加，默认加 1
  const inc = (delta: number = 1) => {
    setValue(c => c + delta);
  };

  // 减，默认减 1
  const dec = (delta: number = 1) => {
    setValue(c => c - delta);
  };

  // 设置 current
  const set = (value: ValueParam) => {
    setValue(value);
  };

  // 重置为默认值
  const reset = () => {
    setValue(initialValue);
  };

  return [
    current,
    {
      inc: useMemoizedFn(inc),
      dec: useMemoizedFn(dec),
      set: useMemoizedFn(set),
      reset: useMemoizedFn(reset),
    }
  ] as const;
}

export default useCounter;

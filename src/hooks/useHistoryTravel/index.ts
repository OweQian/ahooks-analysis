import {useRef, useState} from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";
import {isNumber} from "../../../utils";

/**
 * past - 过去的状态队列
 * future - 未来的状态队列
 * present - 当前状态
 * */
interface IData<T> {
  present?: T;
  past: T[];
  future: T[];
}

// 获取 current 值的下标
const dumpIndex = <T>(step: number, arr: T[]) => {
  // step 大于 0 表示前进，小于 0 表示后退
  let index = step > 0 ? step - 1 : arr.length + step;
  if (index >= arr.length - 1) {
    index = arr.length - 1;
  }
  if (index < 0) {
    index = 0;
  }
  return index;
};

/**
 * 将传入的 targetArr，根据 step，分成当前状态、过去的状态队列、未来的状态队列
 * 比如前进，出参为 2 和 [1,2,3,4]，得到的结果是 { _current: 2, _before: [1], _after: [3,4] }
 * 比如后退，出参为 -1，[1,2,3,4]，得到的结果是 { _current: 4, _before: [1, 2, 3], _after: [] }
 * */
const split = <T>(step: number, targetArr: T[]) => {
  const index = dumpIndex(step, targetArr);
  return {
    _current: targetArr[index],
    _before: targetArr.slice(0, index),
    _after: targetArr.slice(index + 1),
  }
}

const useHistoryTravel = <T>(initialValue?: T, maxLength: number = 0) => {
  const [history, setHistory] = useState<IData<T | undefined>>({
    present: initialValue,
    past: [],
    future: [],
  });

  const { present, past, future } = history;

  const initialValueRef = useRef(initialValue);

  /**
   * 重置
   * 重置到初始值，或提供一个新的初始值
   * */
  const reset = (...params: any[]) => {
    const _initial = params.length > 0 ? params[0] : initialValueRef.current;
    initialValueRef.current = _initial;

    setHistory({
      present: _initial,
      past: [],
      future: [],
    })
  };

  /**
   * 更新
   * */
  const updateValue = (val: T) => {
    // 以前的旧状态队列和 present 合并到新的旧状态队列
    const _past = [...past, present];
    // 判断 maxLength，超过最大长度后将删除旧状态队列中的第一个记录
    const maxLengthNum = isNumber(maxLength) ? maxLength : Number(maxLength);
    if (maxLengthNum > 0 && _past.length > maxLengthNum) {
      _past.splice(0, 1);
    }
    setHistory({
      present: val,
      past: _past,
      future: [], // 新状态队列置为空
    })
  };

  /**
   * 前进，默认前进一步
   * */
  const _forward = (step: number = 1) => {
    if (future.length === 0) {
      return;
    }

    const { _before, _current, _after } = split(step, future);
    setHistory({
      // 以前的旧状态队列、present、_before 合并到新的旧状态队列
      past: [...past, present, ..._before],
      present: _current,
      future: _after,
    })
  };

  /**
   * 后退，默认后退一步
   * */
  const _backward = (step: number = -1) => {
    if (past.length === 0) {
      return;
    }

    const { _before, _current, _after } = split(step, past);
    setHistory({
      past: _before,
      present: _current,
      // 以前的新状态队列、present、_after 合并到新的新状态队列
      future: [..._after, present, ...future],
    })
  };

  // 跳到第几步，最终调用 _forward 和 _backward
  const go = (step: number) => {
    const stepNum = isNumber(step) ? step : Number(step);
    if (stepNum === 0) {
      return;
    }
    if (stepNum > 0) {
      return _forward(stepNum);
    }
    _backward(stepNum);
  };

  return {
    value: present,
    backLength: past.length,
    forwardLength: future.length,
    setValue: useMemoizedFn(updateValue),
    go: useMemoizedFn(go),
    back: useMemoizedFn(() => {
      go(-1);
    }),
    forward: useMemoizedFn(() => {
      go(1);
    }),
    reset: useMemoizedFn(reset),
  }
};

export default useHistoryTravel;

import { useState } from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";

const useSet = <K>(initialValue?: Iterable<K>) => {
  // 默认值
  const getInitValue = () => new Set(initialValue);
  const [set, setSet] = useState<Set<K>>(getInitValue);

  // 添加元素
  const add = (key: K) => {
    if (set.has(key)) return;
    setSet((prevSet) => {
      const temp = new Set(prevSet);
      temp.add(key);
      return temp;
    });
  };

  // 移除元素
  const remove = (key: K) => {
    if (!set.has(key)) return;
    setSet((prevSet) => {
      const temp = new Set(prevSet);
      temp.delete(key);
      return temp;
    });
  };

  // 重置为默认值
  const reset = () => setSet(getInitValue());

  return [
    set,
    {
      add: useMemoizedFn(add),
      remove: useMemoizedFn(remove),
      reset: useMemoizedFn(reset),
    },
  ] as const;
};

export default useSet;

import {useState} from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";

const useSet = <K>(initialValue?: Iterable<K>) => {
  // 传入默认的 Set 参数
  const getInitValue = () => new Set(initialValue as Set<K>);

  const [set, setSet] = useState<Set<K>>(getInitValue);

  // 添加
  const add = useMemoizedFn((key: K) => {
    if (set.has(key)) return;
    setSet(prevSet => {
      const temp = new Set(prevSet);
      temp.add(key);
      return temp;
    })
  });

  // 移除
  const remove = useMemoizedFn((key: K) => {
    if (!set.has(key)) return;
    setSet(prevSet => {
      const temp = new Set(prevSet);
      temp.delete(key);
      return temp;
    })
  });

  // 重置
  const reset = useMemoizedFn(() => {
    setSet(getInitValue())
  });

  return [
    set,
    {
      add,
      remove,
      reset,
    }
  ];
}

export default useSet;

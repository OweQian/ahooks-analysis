import { useState } from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";

const useMap = <K, T>(initialValue?: Iterable<readonly [K, T]>) => {
  // 初始值
  const getInitValue = () => new Map(initialValue);
  const [map, setMap] = useState<Map<K, T>>(getInitValue);

  // 添加元素
  const set = (key: K, entry: T) => {
    setMap((prev) => {
      const temp = new Map(prev);
      temp.set(key, entry);
      return temp;
    });
  };

  // 生成一个新的 Map 对象
  const setAll = (newMap: Iterable<readonly [K, T]>) => {
    setMap(new Map(newMap));
  };

  // 移除元素
  const remove = (key: K) => {
    setMap((prev) => {
      const temp = new Map(prev);
      temp.delete(key);
      return temp;
    });
  };

  // 重置为默认值
  const reset = () => setMap(getInitValue());

  // 获取元素
  const get = (key: K) => map.get(key);

  return [
    map,
    {
      set: useMemoizedFn(set),
      setAll: useMemoizedFn(setAll),
      remove: useMemoizedFn(remove),
      reset: useMemoizedFn(reset),
      get: useMemoizedFn(get),
    },
  ] as const;
};

export default useMap;

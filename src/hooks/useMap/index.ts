import {useState} from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";

const useMap = <K, V>(initialValue?: Iterable<readonly [K, V]>) => {
  // 传入默认的 Map 参数
  const getInitValue = () => new Map(initialValue as Map<K, V>);

  const [map, setMap] = useState<Map<K, V>>(getInitValue);

  // 添加
  const set = useMemoizedFn((key: K, value: V) => {
    setMap(prevMap => {
      const temp = new Map(prevMap);
      temp.set(key, value);
      return temp;
    })
  });

  // 生成一个新的 Map 对象
  const setAll = useMemoizedFn((newMap: Iterable<readonly [K, V]>) => {
    setMap(new Map(newMap));
  });

  // 获取
  const get = useMemoizedFn((key: K) => map.get(key));

  // 移除
  const remove = useMemoizedFn((key: K) => {
    setMap(prevMap => {
      const temp = new Map(prevMap);
      temp.delete(key);
      return temp;
    })
  });

  // 重置
  const reset = useMemoizedFn(() => {
    setMap(getInitValue())
  });

  return [
    map,
    {
      set,
      setAll,
      get,
      remove,
      reset
    }
  ];
}

export default useMap;

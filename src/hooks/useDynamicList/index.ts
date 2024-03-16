/**
 * Array.prototype.splice()
 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
 * const months = ['Jan', 'March', 'April', 'June'];
 * months.splice(1, 0, 'Feb'); // 从索引 1 位置开始，不删除元素，插入 ’Feb‘
 * // Inserts at index 1
 * console.log(months);
 * // Expected output: Array ["Jan", "Feb", "March", "April", "June"]

 * months.splice(4, 1, 'May'); // 从索引 4 位置开始，删除一个元素，并插入 'May'
 * // Replaces 1 element at index 4
 * console.log(months);
 * // Expected output: Array ["Jan", "Feb", "March", "April", "May"]
 */

import { useCallback, useRef, useState } from "react";

const useDynamicList = <T>(initialList: T[] = []) => {
  // 计数
  const counterRef = useRef(-1);

  // uuid list
  const keyList = useRef<number[]>([]);

  // 根据 index 为某个元素设置 uuid
  const setKey = useCallback((index: number) => {
    counterRef.current += 1;
    keyList.current.splice(index, 0, counterRef.current);
  }, []);

  // 当前列表
  const [list, setList] = useState(() => {
    initialList.forEach((_, index) => {
      setKey(index);
    });
    return initialList;
  });

  // 重新设置 list 的值
  const resetList = useCallback((newList: T[]) => {
    keyList.current = [];
    setList(() => {
      newList.forEach((_, index) => {
        setKey(index);
      });
      return newList;
    });
  }, []);

  // 在指定位置插入元素
  const insert = useCallback((index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 0, item);
      setKey(index);
      return temp;
    });
  }, []);

  // 获得某个元素的 uuid
  const getKey = useCallback((index: number) => keyList.current[index], []);

  // 获得某个 key 的index
  const getIndex = useCallback(
    (key: number) => keyList.current.findIndex((ele) => ele === key),
    []
  );

  // 在指定位置插入多个元素
  const merge = useCallback((index: number, items: T[]) => {
    setList((l) => {
      const temp = [...l];
      items.forEach((_, i) => {
        setKey(index + i);
      });
      temp.splice(index, 0, ...items);
      return temp;
    });
  }, []);

  // 替换指定元素
  const replace = useCallback((index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp[index] = item;
      return temp;
    });
  }, []);

  // 删除指定元素
  const remove = useCallback((index: number) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 1);

      // remove keys if necessary
      try {
        keyList.current.splice(index, 1);
      } catch (e) {
        console.error(e);
      }
      return temp;
    });
  }, []);

  // 移动元素
  const move = useCallback((oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }
    setList((l) => {
      const newList = [...l];
      // 根据 oldIndex 把元素过滤掉
      const temp = newList.filter((_, index: number) => index !== oldIndex);
      // 根据 newIndex 把过滤掉的元素插入进去
      temp.splice(newIndex, 0, newList[oldIndex]);

      // move keys if necessary
      try {
        const keyTemp = keyList.current.filter(
          (_, index: number) => index !== oldIndex
        );
        keyTemp.splice(newIndex, 0, keyList.current[oldIndex]);
        keyList.current = keyTemp;
      } catch (e) {
        console.error(e);
      }

      return temp;
    });
  }, []);

  // 在列表末尾添加元素
  const push = useCallback((item: T) => {
    setList((l) => {
      setKey(l.length);
      return l.concat([item]);
    });
  }, []);

  // 移除末尾元素
  const pop = useCallback(() => {
    // remove keys if necessary
    try {
      keyList.current = keyList.current.slice(0, keyList.current.length - 1);
    } catch (e) {
      console.error(e);
    }

    setList((l) => l.slice(0, l.length - 1));
  }, []);

  // 在列表起始位置添加元素
  const unshift = useCallback((item: T) => {
    setList((l) => {
      setKey(0);
      return [item].concat(l);
    });
  }, []);

  // 移除起始位置元素
  const shift = useCallback(() => {
    // remove keys if necessary
    try {
      keyList.current = keyList.current.slice(1, keyList.current.length);
    } catch (e) {
      console.error(e);
    }
    setList((l) => l.slice(1, l.length));
  }, []);

  // 校准排序
  const sortList = useCallback(
    (result: T[]) =>
      result
        .map((item, index) => ({ key: index, item })) // add index into obj
        .sort((a, b) => getIndex(a.key) - getIndex(b.key)) // sort based on the index of table
        .filter((item) => !!item.item) // remove undefined(s)
        .map((item) => item.item), // retrive the data
    []
  );

  return {
    list,
    insert,
    merge,
    replace,
    remove,
    getKey,
    getIndex,
    move,
    push,
    pop,
    unshift,
    shift,
    sortList,
    resetList,
  };
};

export default useDynamicList;

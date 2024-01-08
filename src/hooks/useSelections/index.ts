import {useMemo, useState} from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";

const useSelections = <T>(items: T[], defaultSelected: T[] = []) => {
  // 维护被选中的数组
  const [selected, setSelected] = useState<T[]>(defaultSelected);

  // 维护被选中的 Set 集合
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // 判断是否选中
  const isSelected = (item: T) => selectedSet.has(item);

  // 选择单个元素
  const select = (item: T) => {
    selectedSet.add(item);
    // Array.from 将 Set 转换成数组
    return setSelected(Array.from(selectedSet));
  }

  // 取消选择单个元素
  const unSelect = (item: T) => {
    selectedSet.delete(item);
    return setSelected(Array.from(selectedSet));
  }

  // 反选单个元素
  const toggle = (item: T) => {
    if (isSelected(item)) {
      unSelect(item);
    } else {
      select(item);
    }
  }

  // 选择全部元素
  const selectAll = () => {
    items.forEach(o => {
      selectedSet.add(o);
    });
    setSelected(Array.from(selectedSet));
  }

  // 取消选择全部元素
  const unSelectAll = () => {
    items.forEach(o => {
      selectedSet.delete(o);
    });
    setSelected(Array.from(selectedSet));
  }

  // 是否一个都没有选择
  const noneSelected = useMemo(() => items.every(o => !selectedSet.has(o)), [items, selectedSet]);

  // 是否全选
  const allSelected = useMemo(() => items.every(o => selectedSet.has(o)) && !noneSelected, [items, selectedSet, noneSelected]);

  // 是否半选
  const partiallySelected = useMemo(() => !noneSelected && !allSelected, [noneSelected, allSelected]);

  // 反选全部元素
  const toggleAll = () => {
    allSelected ? unSelectAll() : selectAll();
  }

  return {
    selected,
    noneSelected,
    allSelected,
    partiallySelected,
    setSelected,
    isSelected,
    select: useMemoizedFn(select),
    unSelect: useMemoizedFn(unSelect),
    toggle: useMemoizedFn(toggle),
    selectAll: useMemoizedFn(selectAll),
    unSelectAll: useMemoizedFn(unSelectAll),
    toggleAll: useMemoizedFn(toggleAll),
  } as const;
}

export default useSelections;

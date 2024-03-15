import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import useEventListener from "../useEventListener";
import useUpdateEffect from "../useUpdateEffect";
import useLatest from "../useLatest";
import useSize from "../useSize";
import useMemoizedFn from "../useMemoizedFn";
import { getTargetElement } from "utils/domTarget";
import type { BasicTarget } from "utils/domTarget";
import { isNumber } from "utils";

type ItemHeight<T> = (index: number, data: T) => number;

export interface Options<T> {
  containerTarget: BasicTarget;
  wrapperTarget: BasicTarget;
  itemHeight: number | ItemHeight<T>;
  overscan?: number;
}

const useVirtualList = <T = any>(list: T[], options: Options<T>) => {
  const { containerTarget, wrapperTarget, itemHeight, overscan = 5 } = options;

  const itemHeightRef = useLatest(itemHeight);

  // 外部容器尺寸
  const size = useSize(containerTarget);

  // 标记滚动是否由滚动函数触发
  const scrollTriggerByScrollToFunc = useRef(false);

  // 当前需要展示的列表内容
  const [targetList, setTargetList] = useState<{ index: number; data: T }[]>(
    []
  );

  // 内部容器样式
  const [wrapperStyle, setWrapperStyle] = useState<CSSProperties>({});

  // 根据滚动位置计算偏移量
  const getOffset = (scrollTop: number) => {
    if (isNumber(itemHeightRef.current)) {
      return Math.floor(scrollTop / itemHeightRef.current) + 1;
    }
    let sum = 0;
    let offset = 0;
    for (let i = 0; i < list.length; i++) {
      const height = itemHeightRef.current(i, list[i]);
      sum += height;
      if (sum >= scrollTop) {
        offset = i;
        break;
      }
    }
    return offset + 1;
  };

  // 根据容器高度和起始索引计算可见的列表项数量
  const getVisibleCount = (containerHeight: number, fromIndex: number) => {
    if (isNumber(itemHeightRef.current)) {
      return Math.ceil(containerHeight / itemHeightRef.current);
    }
    let sum = 0;
    let endIndex = 0;
    for (let i = fromIndex; i < list.length; i++) {
      const height = itemHeightRef.current(i, list[i]);
      sum += height;
      endIndex = i;
      if (sum >= containerHeight) {
        break;
      }
    }
    return endIndex - fromIndex;
  };

  // 根据索引计算顶部的高度，前面所有列表项的高度总和
  const getDistanceTop = (index: number) => {
    if (isNumber(itemHeightRef.current)) {
      const height = index * itemHeightRef.current;
      return height;
    }
    const height = list
      .slice(0, index)
      .reduce(
        (sum, _, i) =>
          sum + (itemHeightRef.current as ItemHeight<T>)(i, list[i]),
        0
      );
    return height;
  };

  // 内部容器的高度
  const totalHeight = useMemo(() => {
    if (isNumber(itemHeightRef.current)) {
      return list.length * itemHeightRef.current;
    }
    return list.reduce(
      (sum, _, index) =>
        sum + (itemHeightRef.current as ItemHeight<T>)(index, list[index]),
      0
    );
  }, [list]);

  // 计算可见范围内的列表项，并设置内部容器的高度和样式
  const calculateRange = () => {
    const container = getTargetElement(containerTarget);

    if (container) {
      const { scrollTop, clientHeight } = container;

      // 根据 scrollTop 计算已经 "滚过" 多少项
      const offset = getOffset(scrollTop);
      // 根据外部容器可视高度和当前的开始索引，计算外部容器能承载的项数
      const visibleCount = getVisibleCount(clientHeight, offset);

      // 根据 overscan (视区上、下额外展示的 DOM 节点数量) 计算开始索引和结束索引
      const start = Math.max(0, offset - overscan);
      const end = Math.min(list.length, offset + visibleCount + overscan);

      // 根据开始索引计算其距离最开始的距离
      const offfsetTop = getDistanceTop(start);

      // 设置内部容器的 height 和 marginTop
      setWrapperStyle({
        height: totalHeight - offfsetTop + "px",
        marginTop: offfsetTop + "px",
      });

      setTargetList(
        list.slice(start, end).map((ele, index) => ({
          data: ele,
          index: index + start,
        }))
      );
    }
  };

  // 监听容器尺寸、原列表项变化，变化时重新计算
  useEffect(() => {
    if (!size?.width || !size?.height) {
      return;
    }
    calculateRange();
  }, [size?.width, size?.height, list]);

  // 监听外部容器 scroll 事件
  useEventListener(
    "scroll",
    (e) => {
      // 如果滚动是由滚动函数触发，则不需要重新计算
      if (scrollTriggerByScrollToFunc.current) {
        scrollTriggerByScrollToFunc.current = false;
        return;
      }
      e.preventDefault();
      calculateRange();
    },
    {
      target: containerTarget,
    }
  );

  // 将 wrapperStyle 应用到内部容器
  useUpdateEffect(() => {
    const wrapper = getTargetElement(wrapperTarget) as HTMLElement;
    if (wrapper) {
      Object.keys(wrapperStyle).forEach(
        (key) => (wrapper.style[key] = wrapperStyle[key])
      );
    }
  }, [wrapperStyle]);

  // 快速滚动到指定 index
  const scrollTo = (index: number) => {
    const container = getTargetElement(containerTarget);
    if (container) {
      scrollTriggerByScrollToFunc.current = true;
      container.scrollTop = getDistanceTop(index);
      calculateRange();
    }
  };

  return [targetList, useMemoizedFn(scrollTo)] as const;
};

export default useVirtualList;

import { useRef } from "react";
import useLatest from "../useLatest";
import useMount from "../useMount";
import { isString } from "utils";
import type { BasicTarget } from "utils/domTarget";
import { getTargetElement } from "utils/domTarget";
import useEffectWithTarget from "utils/useEffectWithTarget";

export interface Options {
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: (event: React.DragEvent) => void;
  dragImage?: {
    image: string | Element;
    offsetX?: number;
    offsetY?: number;
  };
}

const useDrag = <T>(data: T, target: BasicTarget, options: Options = {}) => {
  // 额外的配置项
  const optionsRef = useLatest(options);
  // 拖拽的内容
  const dataRef = useLatest(data);
  // 拖拽过程中跟随鼠标指针的图像元素
  const imageElementRef = useRef<Element>();

  const { dragImage } = optionsRef.current;

  useMount(() => {
    // 判断 dragImage.image 的类型，将其存储在 imageElementRef.current 中
    if (dragImage?.image) {
      const { image } = dragImage;

      if (isString(image)) {
        // 如果是字符串，创建对应的图片元素
        const imageElement = new Image();

        imageElement.src = image;
        imageElementRef.current = imageElement;
      } else {
        imageElementRef.current = image;
      }
    }
  });

  useEffectWithTarget(
    () => {
      const targetElement = getTargetElement(target);
      if (!targetElement?.addEventListener) {
        return;
      }

      const onDragStart = (event: React.DragEvent) => {
        // 开始拖拽的回调
        optionsRef.current.onDragStart?.(event);
        // 设置拖拉事件中带有的数据
        event.dataTransfer.setData("custom", JSON.stringify(dataRef.current));

        // 设置拖拽过程中跟随鼠标指针的图像
        if (dragImage?.image && imageElementRef.current) {
          // 鼠标相对于图片的偏移量
          const { offsetX = 0, offsetY = 0 } = dragImage;

          event.dataTransfer.setDragImage(
            imageElementRef.current,
            offsetX,
            offsetY
          );
        }
      };

      const onDragEnd = (event: React.DragEvent) => {
        // 结束拖拽的回调
        optionsRef.current.onDragEnd?.(event);
      };

      // 设置元素可拖拽
      targetElement.setAttribute("draggable", "true");

      // 注册开始拖拽事件监听器
      targetElement.addEventListener("dragstart", onDragStart as any);
      // 注册结束拖拽事件监听器
      targetElement.addEventListener("dragend", onDragEnd as any);

      return () => {
        // 组件卸载清除事件监听器
        targetElement.removeEventListener("dragstart", onDragStart as any);
        targetElement.removeEventListener("dragend", onDragEnd as any);
      };
    },
    [],
    target
  );
};

export default useDrag;

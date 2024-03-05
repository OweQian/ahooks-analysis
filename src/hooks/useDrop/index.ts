import React, { useRef } from "react";
import useLatest from "../useLatest";
import type { BasicTarget } from "utils/domTarget";
import { getTargetElement } from "utils/domTarget";
import useEffectWithTarget from "utils/useEffectWithTarget";

export interface Options {
  onFiles?: (files: File[], event?: React.DragEvent) => void;
  onUri?: (url: string, event?: React.DragEvent) => void;
  onDom?: (content: any, event?: React.DragEvent) => void;
  onText?: (text: string, event?: React.ClipboardEvent) => void;
  onDragEnter?: (event?: React.DragEvent) => void;
  onDragOver?: (event?: React.DragEvent) => void;
  onDragLeave?: (event?: React.DragEvent) => void;
  onDrop?: (event?: React.DragEvent) => void;
  onPaste?: (event?: React.ClipboardEvent) => void;
}

// 处理文件、文字和网址的拖放和粘贴事件
const useDrop = <T>(target: BasicTarget, options: Options = {}) => {
  // 额外的配置项
  const optionsRef = useLatest(options);

  // https://stackoverflow.com/a/26459269
  // 跟踪拖拽进入的目标元素
  const dragEnterTarget = useRef<any>();

  useEffectWithTarget(
    () => {
      const targetElement = getTargetElement(target);
      if (!targetElement?.addEventListener) {
        return;
      }

      // 处理拖放和粘贴事件传输的数据，根据数据类型调用对应的回调函数
      const onData = (
        dataTransfer: DataTransfer,
        event: React.DragEvent | React.ClipboardEvent
      ) => {
        const uri = dataTransfer.getData("text/uri-list");
        const dom = dataTransfer.getData("custom");

        // 拖拽/粘贴自定义 DOM 节点的回调
        if (dom && optionsRef.current.onDom) {
          let data = dom;
          try {
            data = JSON.parse(dom);
          } catch (e) {
            data = dom;
          }
          optionsRef.current.onDom(data, event as React.DragEvent);
          return;
        }

        // 拖拽/粘贴链接的回调
        if (uri && optionsRef.current.onUri) {
          optionsRef.current.onUri(uri, event as React.DragEvent);
          return;
        }

        // 拖拽/粘贴文件的回调
        if (
          dataTransfer.files &&
          dataTransfer.files.length &&
          optionsRef.current.onFiles
        ) {
          optionsRef.current.onFiles(
            Array.from(dataTransfer.files),
            event as React.DragEvent
          );
          return;
        }

        // 拖拽/粘贴文字的回调
        if (
          dataTransfer.items &&
          dataTransfer.items.length &&
          optionsRef.current.onText
        ) {
          dataTransfer.items[0].getAsString((text) => {
            optionsRef.current.onText!(text, event as React.ClipboardEvent);
          });
        }
      };

      // 拖拽进入
      const onDragEnter = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        dragEnterTarget.current = event.target;
        optionsRef.current.onDragEnter?.(event);
      };

      // 拖拽悬停
      const onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        optionsRef.current.onDragOver?.(event);
      };

      // 拖拽离开
      const onDragLeave = (event: React.DragEvent) => {
        if (event.target === dragEnterTarget.current) {
          optionsRef.current.onDragLeave?.(event);
        }
      };

      // 放置
      const onDrop = (event: React.DragEvent) => {
        event.preventDefault();
        onData(event.dataTransfer, event);
        optionsRef.current.onDrop?.(event);
      };

      // 粘贴
      const onPaste = (event: React.ClipboardEvent) => {
        onData(event.clipboardData, event);
        optionsRef.current.onPaste?.(event);
      };

      targetElement.addEventListener("dragenter", onDragEnter as any);
      targetElement.addEventListener("dragover", onDragOver as any);
      targetElement.addEventListener("dragleave", onDragLeave as any);
      targetElement.addEventListener("drop", onDrop as any);
      targetElement.addEventListener("paste", onPaste as any);
      return () => {
        targetElement.removeEventListener("dragenter", onDragEnter as any);
        targetElement.removeEventListener("dragover", onDragOver as any);
        targetElement.removeEventListener("dragleave", onDragLeave as any);
        targetElement.removeEventListener("drop", onDrop as any);
        targetElement.removeEventListener("paste", onPaste as any);
      };
    },
    [],
    target
  );
};

export default useDrop;

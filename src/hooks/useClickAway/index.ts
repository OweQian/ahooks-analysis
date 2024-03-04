import useLatest from "@/hooks/useLatest";
import type { BasicTarget } from "../../../utils/domTarget";
import { getTargetElement } from "../../../utils/domTarget";
import getDocumentOrShadow from "../../../utils/getDocumentOrShadow";
import useEffectWithTarget from "../../../utils/useEffectWithTarget";

type DocumentEventKey = keyof DocumentEventMap;

const useClickAway = <T extends Event = Event>(
  // 触发函数
  onClickAway: (event: T) => void,
  // DOM 节点或 Ref，支持数组
  target: BasicTarget | BasicTarget[],
  // 指定要监听的事件，支持数组
  eventName: DocumentEventKey | DocumentEventKey[] = "click"
) => {
  const onClickAwayRef = useLatest(onClickAway);

  useEffectWithTarget(
    () => {
      const handler = (event: any) => {
        const targets = Array.isArray(target) ? target : [target];
        if (
          targets.some((item) => {
            // 判断点击的 DOM Target 是否在定义的 DOM 元素（列表）中
            const targetElement = getTargetElement(item);
            return !targetElement || targetElement.contains(event.target);
          })
        ) {
          return;
        }
        // 触发点击事件
        onClickAwayRef.current(event);
      };

      // 事件代理 - 代理到 shadow root 或 document
      const documentOrShadow = getDocumentOrShadow(target);

      // 事件列表
      const eventNames = Array.isArray(eventName) ? eventName : [eventName];

      // 事件监听
      eventNames.forEach((event) =>
        documentOrShadow.addEventListener(event, handler)
      );

      return () => {
        // 组件卸载时清除事件监听
        eventNames.forEach((event) =>
          documentOrShadow.removeEventListener(event, handler)
        );
      };
    },
    Array.isArray(eventName) ? eventName : [eventName],
    target
  );
};

export default useClickAway;

import {BasicTarget, getTargetElement} from "../../../utils/domTarget";
import useLatest from "@/hooks/useLatest";
import {useRef} from "react";
import useEffectWithTarget from "../../../utils/useEffectWithTarget";
import isBrowser from "../../../utils/isBrowser";

type EventType = MouseEvent | TouchEvent;
export interface Options {
  delay?: number;
  moveThreshold?: { x?: number; y?: number; };
  onClick?: (event: EventType) => void;
  onLongPressEnd?: (event: EventType) => void;
}

/**
 * 判断是否支持 touch 事件
 * 如果支持，则监听 touchstart - 触摸开始、touchend - 触摸结束、touchmove - 触摸移动 事件
 * 如果不支持，则监听 mousedown - 按下鼠标、mouseup - 松开鼠标、mousemove - 鼠标移动、mouseleave - 鼠标离开元素 事件
 * */
const touchSupported =
  isBrowser &&
  // @ts-ignore
  ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch));

const useLongPress = (
  onLongPress: (event: EventType) => void,
  target: BasicTarget,
  { delay = 20, moveThreshold, onClick, onLongPressEnd }: Options = {},
) => {
  const onLongPressRef = useLatest(onLongPress);
  const onClickRef = useLatest(onClick);
  const onLongPressEndRef = useLatest(onLongPressEnd);

  const timeRef = useRef<ReturnType<typeof setTimeout>>();
  const isTriggeredRef = useRef(false);
  const pervPositionRef = useRef({x: 0, y: 0});
  const hasMoveThreshold = !!(
    (moveThreshold?.x && moveThreshold.x > 0) ||
    (moveThreshold?.y && moveThreshold.y > 0)
  );

  useEffectWithTarget(() => {
    const targetElement = getTargetElement(target);
    if (!targetElement?.addEventListener) {
      return;
    }

    function getClientPosition (event: EventType) {
      if (event instanceof TouchEvent) {
        return {
          clientX: event.touches[0].clientX,
          clientY: event.touches[0].clientY,
        };
      }

      if (event instanceof MouseEvent) {
        return {
          clientX: event.clientX,
          clientY: event.clientY,
        };
      }

      console.warn('Unsupported event type');

      return { clientX: 0, clientY: 0 };
    }

    const overThreshold = (event: EventType) => {
      const { clientX, clientY } = getClientPosition(event);
      const offsetX = Math.abs(clientX - pervPositionRef.current.x);
      const offsetY = Math.abs(clientY - pervPositionRef.current.y);

      return !!(
        (moveThreshold?.x && offsetX > moveThreshold.x) ||
        (moveThreshold?.y && offsetY > moveThreshold.y)
      );
    }

    const onStart = (event: EventType) => {
      if (hasMoveThreshold) {
        // 按下后计算 clientX, clientY
        const { clientX, clientY } = getClientPosition(event);
        pervPositionRef.current.x = clientX;
        pervPositionRef.current.y = clientY;
      }

      // 设置定时器
      timeRef.current = setTimeout(() => {
        onLongPressRef.current(event);
        // 只有定时器执行完，isTriggeredRef.current 才会设置为 true，触发长按事件
        isTriggeredRef.current = true;
      }, delay);
    }

    const onMove = (event: EventType) => {
      // 按下后移动，如果超出移动阈值，则不触发长按事件
      if (timeRef.current && overThreshold(event)) {
        clearTimeout(timeRef.current);
        timeRef.current = undefined;
      }
    }

    const onEnd = (event: EventType, shouldTriggerClick: boolean = false) => {
      // clear 开始的定时器
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }

      // 判断是否达到长按时间（即触发过长按事件）
      if (isTriggeredRef.current) {
        onLongPressEndRef.current?.(event);
      }

      // 是否触发 onClick 事件，只有 timeRef 定时器执行过，isTriggeredRef.current 才为 true
      if (shouldTriggerClick && !isTriggeredRef.current && onClickRef.current) {
        onClickRef.current(event);
      }

      isTriggeredRef.current = false;
    }

    const onEndWithClick = (event: EventType) => onEnd(event, true);

    /**
     * 不支持 touch 事件
     * */
    if (!touchSupported) {
      targetElement.addEventListener('mousedown', onStart);
      targetElement.addEventListener('mouseup', onEndWithClick);
      targetElement.addEventListener('mouseleave', onEnd);
      if (hasMoveThreshold) targetElement.addEventListener('mousemove', onMove);
    } else {
      targetElement.addEventListener('touchstart', onStart);
      targetElement.addEventListener('touchend', onEndWithClick);
      if (hasMoveThreshold) targetElement.addEventListener('touchmove', onMove);
    }

    return () => {
      // 清除定时器
      if (timeRef.current) {
        clearTimeout(timeRef.current);
        isTriggeredRef.current = false;
      }
      // 清除监听
      if (!touchSupported) {
        targetElement.removeEventListener('mousedown', onStart);
        targetElement.removeEventListener('mouseup', onEndWithClick);
        targetElement.removeEventListener('mouseleave', onEnd);
        if (hasMoveThreshold) targetElement.removeEventListener('mousemove', onMove);
      } else {
        targetElement.removeEventListener('touchstart', onStart);
        targetElement.removeEventListener('touchend', onEndWithClick);
        if (hasMoveThreshold) targetElement.removeEventListener('touchmove', onMove);
      }
    }
  }, [], target);
};

export default useLongPress;

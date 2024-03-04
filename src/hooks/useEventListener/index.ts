import useLatest from "../useLatest";
import type { BasicTarget } from "../../../utils/domTarget";
import { getTargetElement } from "../../../utils/domTarget";
import useEffectWithTarget from "../../../utils/useEffectWithTarget";

type noop = (...p: any) => void;

export type Target = BasicTarget<HTMLElement | Element | Window | Document>;

type Options<T extends Target = Target> = {
  target?: T;
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
};

// 重载
function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options?: Options<HTMLElement>
): void;
function useEventListener<K extends keyof ElementEventMap>(
  eventName: K,
  handler: (ev: ElementEventMap[K]) => void,
  options?: Options<Element>
): void;
function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (ev: DocumentEventMap[K]) => void,
  options?: Options<Document>
): void;
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (ev: WindowEventMap[K]) => void,
  options?: Options<Window>
): void;
function useEventListener(
  eventName: string,
  handler: noop,
  options: Options
): void;

function useEventListener(
  eventName: string,
  handler: noop,
  options: Options = {}
) {
  const handleRef = useLatest(handler);

  useEffectWithTarget(
    () => {
      const targetElement = getTargetElement(options?.target, window);
      // 判断是否支持 addEventListener
      if (!targetElement?.addEventListener) {
        return;
      }

      const eventListener = (event: Event) => {
        return handleRef.current?.(event);
      };

      // 为指定元素添加事件监听器
      targetElement.addEventListener(eventName, eventListener, {
        // 指定事件是否在捕获阶段进行处理
        capture: options.capture,
        // 指定事件是否只触发一次
        once: options.once,
        // 指定事件处理函数是否不会调用 preventDefault()
        passive: options.passive,
      });

      // 移除事件监听器
      return () => {
        targetElement.removeEventListener(eventName, eventListener, {
          capture: options.capture,
        });
      };
    },
    [eventName, options.once, options.capture, options.passive],
    options.target
  );
}

export default useEventListener;

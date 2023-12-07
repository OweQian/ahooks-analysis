import useLatest from '../useLatest';
import {BasicTarget, getTargetElement} from "../../../utils/domTarget";
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
function useEventListener<K extends keyof HTMLElementEventMap>(eventName: K, handler: (ev: HTMLElementEventMap[K]) => void, options?: Options<HTMLElement>): void;
function useEventListener<K extends keyof ElementEventMap>(eventName: K, handler: (ev: ElementEventMap[K]) => void, options?: Options<Element>): void;
function useEventListener<K extends keyof DocumentEventMap>(eventName: K, handler: (ev: DocumentEventMap[K]) => void, options?: Options<Document>): void;
function useEventListener<K extends keyof WindowEventMap>(eventName: K, handler: (ev: WindowEventMap[K]) => void, options?: Options<Window>): void;
function useEventListener(eventName: string, handler: noop, options: Options): void;

function useEventListener(eventName: string, handler: noop, options: Options = {}) {
  const handleRef = useLatest(handler);

  useEffectWithTarget(() => {

    const targetElement = getTargetElement(options?.target as BasicTarget, window);
    // 判断是否支持 addEventListener
    if (!targetElement?.addEventListener) {
      return;
    }

    const eventListener = (event: Event) => {
      return handleRef.current?.(event);
    };

    // 监听事件
    targetElement.addEventListener(eventName, eventListener, {
      // listener 会在该类型的事情捕获阶段传播到该 EventTarget 时触发
      capture: options.capture,
      // listener 在添加之后最多只调用一次。如果是 true，listener 会在其被调用之后自动移除
      once: options.once,
      // 设置为 true 时，表示 listener 永远不会调用 preventDefault。如果 listener 仍然调用了这个函数，客户端将会忽略它并抛出一个控制台警告
      passive: options.passive,
    });

    // 移除事件
    return () => {
      targetElement.removeEventListener(eventName, eventListener, {
        capture: options.capture,
      });
    };
  }, [eventName, options.once, options.capture, options.passive], options.target);
}

export default useEventListener;

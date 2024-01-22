import {useEffect, useRef} from "react";

type Subscription<T> = (val: T) => void;

export class EventEmitter<T> {
  // 存放事件列表
  private subscriptions = new Set<Subscription<T>>();

  // 推送事件
  emit = (val: T) => {
    // 触发订阅器列表中所有事件
    for (const subscription of this.subscriptions) {
      subscription(val);
    }
  };

  // 订阅事件
  useSubscription = (callback: Subscription<T>) => {
    const callbackRef = useRef<Subscription<T>>();
    callbackRef.current = callback;
    useEffect(() => {
      // 待订阅事件
      function subscription(val: T) {
        if (callbackRef.current) {
          callbackRef.current(val);
        }
      }
      // 添加到订阅事件队列中
      this.subscriptions.add(subscription);
      return () => {
        // 卸载时移除
        this.subscriptions.delete(subscription);
      };
    }, []);
  };
}

const useEventEmitter = <T = void>() => {
  const ref = useRef<EventEmitter<T>>();

  if (!ref.current) {
    ref.current = new EventEmitter();
  }

  return ref.current;
};

export default useEventEmitter;

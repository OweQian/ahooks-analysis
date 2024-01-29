import isDocumentVisible from "@/hooks/useRequest/src/utils/isDocumentVisible";
import isBrowser from "../../../../../utils/isBrowser";

type Listener = () => void;

// 全局变量，维护一个事件队列，存放订阅的事件
const listeners: Listener[] = [];

// 订阅事件
function subscribe(listener: Listener) {
  listeners.push(listener);
  // 返回取消订阅函数
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    listeners.splice(index, 1);
  };
}

if (isBrowser) {
  const revalidate = () => {
    // document 不可见，直接返回
    if (!isDocumentVisible()) return;
    // document 可见，执行所有的事件
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  };

  // 监听 visibilitychange 事件
  window.addEventListener('visibilitychange', revalidate, false);
}

export default subscribe;

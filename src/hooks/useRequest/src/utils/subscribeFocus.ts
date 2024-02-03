import isBrowser from "../../../../../utils/isBrowser";
import isDocumentVisible from "../utils/isDocumentVisible";
import isOnline from "../utils/isOnline";

type Listener = () => void;

// 全局变量，维护一个事件队列，存放订阅的事件
const listeners: Listener[] = [];

// 订阅事件
function subscribe(listener: Listener) {
  listeners.push(listener);
  // 返回取消订阅函数
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

if (isBrowser) {
  const revalidate = () => {
    // document 不可见，或者断网时，直接返回
    if (!isDocumentVisible() || !isOnline()) return;
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  };
  // 监听 visibilitychange 事件
  window.addEventListener('visibilityChange', revalidate, false);
  // 监听 focus 事件
  window.addEventListener('focus', revalidate, false);
}

export default subscribe;

type Listener = (data: any) => void;

// 全局变量，维护一个事件队列，存放订阅的事件
const listeners: Record<string, Listener[]> = {};

// 触发某个属性(cacheKey)的所有事件
const trigger = (key: string, data: any) => {
  if (listeners[key]) {
    listeners[key].forEach(item => item(data));
  }
};

// 订阅事件
const subscribe = (key: string, listener: Listener) => {
  // 每个属性(cacheKey)维护一个事件列表
  if (!listeners[key]) {
    listeners[key] = [];
  }

  listeners[key].push(listener);

  // 返回清除订阅函数
  return function unsubscribe() {
    const index = listeners[key].indexOf(listener);
    listeners[key].splice(index, 1);
  };
};

export { trigger, subscribe };


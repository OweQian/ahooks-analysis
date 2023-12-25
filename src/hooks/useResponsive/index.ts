import isBrowser from "../../../utils/isBrowser";
import {useEffect, useState} from "react";

type ResponsiveConfig = Record<string, number>;
type ResponsiveInfo = Record<string, boolean>;

type Subscriber = () => void;

// 全局订阅器
const subscribers = new Set<Subscriber>();

// 全局响应式信息对象
let info: ResponsiveInfo;

// 默认响应式断点配置
let responsiveConfig: ResponsiveConfig = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

let listening = false;

// 根据当前屏幕宽度与配置做比较，计算新的响应式信息对象
function calculate () {
  const width = window.innerWidth;
  const newInfo = {} as ResponsiveInfo;
  let shouldUpdate = false;
  for (const key of Object.keys(responsiveConfig)) {
    // 如果宽度大于配置值，则为 true
    newInfo[key] = width >= responsiveConfig[key];
    if (newInfo[key] !== info[key]) {
      shouldUpdate = true;
    }
  }
  // 如果有更新，则更新 info 的值，性能优化
  if (shouldUpdate) {
    info = newInfo;
  }
}

// resize 事件回调函数
function handleResize () {
  const oldInfo = info;
  // 计算新的响应式信息对象
  calculate();
  // 假如没有更新，直接返回
  if (oldInfo === info) return;
  // 遍历订阅者集合，依次执行订阅者的回调函数
  for (const subscriber of subscribers) {
    subscriber();
  }
}

// 设置响应式信息配置
export const configResponsive = (config: ResponsiveConfig) => {
  responsiveConfig = config;
  if (info) calculate();
}

export const useResponsive = () => {
  // listening 避免每个组件都监听 resize 事件，全局只需要拥有一个监听事件即可
  if (isBrowser && !listening) {
    info = {};
    calculate();
    // 监听 resize 事件
    window.addEventListener('resize', handleResize);
    listening = true;
  }

  const [state, setState] = useState<ResponsiveInfo>(info);

  useEffect(() => {
    if (!isBrowser) return;
    // listening 避免每个组件都监听 resize 事件，全局只需要拥有一个监听事件即可
    // In React 18's StrictMode, useEffect perform twice, resize listener is remove, so handleResize is never perform.
    // https://github.com/alibaba/hooks/issues/1910
    if (!listening) {
      window.addEventListener('resize', handleResize);
    }

    const subscriber = () => setState(info);

    subscribers.add(subscriber);

    return () => {
      // 组件销毁取消订阅
      subscribers.delete(subscriber);
      // 当全局订阅器不再有订阅器，则移除 resize
      if (subscribers.size === 0) {
        window.removeEventListener('resize', handleResize);
        // 移除 resize 方法
        listening = false;
      }
    }
  }, []);

  return state;
};


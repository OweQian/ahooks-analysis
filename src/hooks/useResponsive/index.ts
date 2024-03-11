import isBrowser from "../../../utils/isBrowser";
import { useEffect, useState } from "react";

type Subscriber = () => void;

// 全局订阅器
const subscribers = new Set<Subscriber>();

type ResponsiveConfig = Record<string, number>;
type ResponsiveInfo = Record<string, boolean>;

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

// resize 事件回调函数
function handleResize() {
  const oldInfo = info;
  // 计算新的响应式信息对象
  calculate();
  // 没有更新，直接返回
  if (oldInfo === info) return;
  // 遍历订阅者集合，执行回调
  for (const subscriber of subscribers) {
    subscriber();
  }
}

// 用来避免每个组件都监听 resize 事件，全局只需要拥有一个监听事件即可
let listening = false;

// 根据当前视窗可见宽度和响应式断点配置，计算新的响应式信息对象
function calculate() {
  const width = window.innerWidth;
  const newInfo = {} as ResponsiveInfo;
  let shouldUpdate = false;
  for (const key of Object.keys(responsiveConfig)) {
    // 如果视窗可视宽度大于响应式断点配置值，则置为 true
    newInfo[key] = width >= responsiveConfig[key];
    if (newInfo[key] !== info[key]) {
      shouldUpdate = true;
    }
  }
  // 如果有更新，则更新 info 的值
  if (shouldUpdate) {
    info = newInfo;
  }
}

// 自定义响应式断点配置函数
export const configResponsive = (config: ResponsiveConfig) => {
  responsiveConfig = config;
  if (info) calculate();
};

export const useResponsive = () => {
  if (isBrowser && !listening) {
    info = {};
    calculate();
    // 监听 resize 事件
    window.addEventListener("resize", handleResize);
    listening = true;
  }

  const [state, setState] = useState<ResponsiveInfo>(info);

  useEffect(() => {
    if (!isBrowser) return;

    // In React 18's StrictMode, useEffect perform twice, resize listener is remove, so handleResize is never perform.
    // https://github.com/alibaba/hooks/issues/1910
    if (!listening) {
      window.addEventListener("resize", handleResize);
    }

    const subscriber = () => {
      setState(info);
    };

    // 添加订阅
    subscribers.add(subscriber);

    return () => {
      // 取消订阅
      subscribers.delete(subscriber);
      // 当全局订阅器为空，则清除 resize 事件监听器
      if (subscribers.size === 0) {
        window.removeEventListener("resize", handleResize);
        // listening 置为 false
        listening = false;
      }
    };
  }, []);

  return state;
};

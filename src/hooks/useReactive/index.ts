import { useRef } from "react";
import { isPlainObject } from "lodash-es";
import useCreation from "@/hooks/useCreation";
import useUpdate from "@/hooks/useUpdate";

// k:v 原对象:代理过的对象
const proxyMap = new WeakMap();
// k:v 代理过的对象:原对象
const rawMap = new WeakMap();

function observer<T extends Record<string, any>>(
  initialVal: T,
  cb: () => void
): T {
  const existingProxy = proxyMap.get(initialVal);

  // 添加缓存 防止重新构建proxy
  if (existingProxy) {
    return existingProxy;
  }

  // 防止代理已经代理过的对象
  // https://github.com/alibaba/hooks/issues/839
  if (rawMap.has(initialVal)) {
    return initialVal;
  }

  // 代理对象，定义拦截对代理对象的操作方法
  const proxy = new Proxy<T>(initialVal, {
    // 访问代理对象的属性时触发
    get(target, key, receiver) {
      // 获取目标对象上指定的属性的值
      const res = Reflect.get(target, key, receiver);

      // https://github.com/alibaba/hooks/issues/1317
      const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
      // 属性不可读且不可写，直接返回原始的属性值
      if (!descriptor?.configurable && !descriptor?.writable) {
        return res;
      }

      // Only proxy plain object or array,
      // otherwise it will cause: https://github.com/alibaba/hooks/issues/2080
      // 属性值是普通对象或数组，调用 observer 方法对其观察，并返回观察后的结果；否则直接返回原始的属性值
      return isPlainObject(res) || Array.isArray(res) ? observer(res, cb) : res;
    },
    // 给代理对象的属性赋值时触发
    set(target, key, val) {
      const ret = Reflect.set(target, key, val);
      cb();
      return ret;
    },
    // 删除代理对象的属性时触发
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key);
      cb();
      return ret;
    },
  });

  proxyMap.set(initialVal, proxy);
  rawMap.set(proxy, initialVal);

  return proxy;
}

function useReactive<S extends Record<string, any>>(initialState: S): S {
  const update = useUpdate();
  const stateRef = useRef<S>(initialState);

  const state = useCreation(() => {
    return observer(stateRef.current, () => {
      update();
    });
  }, []);

  return state;
}

export default useReactive;

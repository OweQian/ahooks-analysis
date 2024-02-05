import {useRef} from "react";
import type {Plugin} from '../types';
import { setCache, getCache } from '../utils/cache';
import type { CachedData } from "../utils/cache";
import useUnmount from "@/hooks/useUnmount";
import useCreation from "@/hooks/useCreation";
import {subscribe, trigger} from "../utils/cacheSubscribe";
import {getCachePromise, setCachePromise} from "../utils/cachePromise";

const useCachePlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    cacheKey,
    cacheTime = 5 * 60 * 1000,
    staleTime = 0,
    setCache: customSetCache,
    getCache: customGetCache,
  }
) => {
  const unSubscribeRef = useRef<() => void>();

  const currentPromiseRef = useRef<Promise<any>>();

  // 缓存数据
  const _setCache = (key: string, cachedData: CachedData) => {
    // 有自定义设置缓存配置，优先使用自定义缓存
    if (customSetCache) {
      customSetCache(cachedData);
    } else {
      // 调用 cache utils 中的 setCache 函数
      setCache(key, cacheTime, cachedData);
    }
    // 触发 key 的所有事件。如果 key 相同，就可以共享缓存的数据
    trigger(key, cachedData.data);
  };

  const _getCache = (key: string, params: any[] = []) => {
    // 有自定义获取缓存配置，优先使用自定义缓存
    if (customGetCache) {
      return customGetCache(params);
    }
    // 调用 cache utils 中的 getCache 函数
    return getCache(key);
  };

  // 初始化逻辑
  useCreation(() => {
    if (!cacheKey) {
      return;
    }

    // get data from cache when init
    const cacheData = _getCache(cacheKey);
    if (cacheData && Object.hasOwnProperty.call(cacheData, 'data')) {
      // 直接使用缓存中的 data 和 params 进行替代，返回结果
      fetchInstance.state.data = cacheData.data;
      fetchInstance.state.params = cacheData.params;
      // staleTime 为 -1 或还存在于新鲜时间内，则设置 loading 为 false
      if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
        fetchInstance.state.loading = false;
      }
    }

    // subscribe same cachekey update, trigger update
    // 订阅同一个 cacheKey 的更新。假如两个都是用的同一个 cacheKey，它们的内容可以全局同享
    unSubscribeRef.current = subscribe(cacheKey, (data) => {
      fetchInstance.setState({ data });
    })
  }, []);

  useUnmount(() => {
    unSubscribeRef.current?.();
  });

  if (!cacheKey) {
    return {};
  }

  return {
    // 请求前
    onBefore: (params) => {
      // 获取缓存
      const cacheData = _getCache(cacheKey, params);

      if (!cacheData || !Object.hasOwnProperty.call(cacheData, 'data')) {
        return {};
      }

      // staleTime 为 -1 或还存在于新鲜时间内，直接返回，不需要重新请求
      // If the data is fresh, stop request
      if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
        return {
          loading: false,
          data: cacheData?.data,
          error: undefined,
          returnNow: true, // 控制直接返回
        };
      } else {
        // If the data is stale, return data, and request continue
        return {
          data: cacheData?.data,
          error: undefined,
        };
      }
    },
    // 请求阶段，缓存 promise。保证在同一时间点，采用了同一个 cacheKey 的请求只有一个请求被发起
    onRequest: (service, args) => {
      // 查看 promise 有没有缓存
      // 假如 promise 已经执行完成，则为 undefined。也就是没有同样 cacheKey 在执行。
      let servicePromise = getCachePromise(cacheKey);

      // If has servicePromise, and is not trigger by self, then use it
      // 如果有 servicePromise，并且不等于之前自己触发的请求，那么就使用它
      if (servicePromise && servicePromise !== currentPromiseRef.current) {
        return { servicePromise };
      }

      // 执行请求
      servicePromise = service(...args);
      // 保存本次触发的 promise 值
      currentPromiseRef.current = servicePromise;
      // 设置 promise 缓存
      setCachePromise(cacheKey, servicePromise);
      return { servicePromise };
    },
    // 请求成功
    onSuccess: (data, params) => {
      if (cacheKey) {
        // cancel subscribe, avoid trigger self
        // 取消订阅，避免触发到自己
        unSubscribeRef.current?.();
        // 缓存数据
        _setCache(cacheKey, {
          data,
          params,
          time: new Date().getTime(),
        });
        // resubscribe
        // 重新订阅以获取更新后的数据
        unSubscribeRef.current = subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
    // 手动修改 data
    onMutate: (data) => {
      if (cacheKey) {
        // cancel subscribe, avoid trigger self
        unSubscribeRef.current?.();
        _setCache(cacheKey, {
          data,
          params: fetchInstance.state.params,
          time: new Date().getTime(),
        });
        // resubscribe
        unSubscribeRef.current = subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
  };
};

export default useCachePlugin;

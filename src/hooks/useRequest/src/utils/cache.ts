type Timer = ReturnType<typeof setTimeout>;
type CachedKey = string | number;

export interface CachedData<TData = any, TParams = any> {
  data: TData;
  params: TParams;
  time: number;
}
interface RecordData extends CachedData {
  timer: Timer | undefined;
}

// 通过 map 结构进行缓存
const cache = new Map<CachedKey, RecordData>();

// 设置缓存
const setCache = (key: CachedKey, cacheTime: number, cachedData: CachedData) => {
  // 是否已存在
  const currentCache = cache.get(key);
  // 如果存在，则先清除
  if (currentCache?.timer) {
    clearTimeout(currentCache.timer);
  }

  let timer: Timer | undefined = undefined;

  // 如果设置为 -1，则表示缓存数据永不过期
  if (cacheTime > -1) {
    // if cache out, clear it
    timer = setTimeout(() => {
      cache.delete(key);
    }, cacheTime);
  }

  // 设置缓存
  cache.set(key, {
    ...cachedData,
    timer,
  });
};

// 获取缓存
const getCache = (key: CachedKey) => {
  return cache.get(key);
};

// 清空缓存
const clearCache = (key?: string | string[]) => {
  if (key) {
    // 支持清空单个缓存，或一组缓存
    const cacheKeys = Array.isArray(key) ? key : [key];
    cacheKeys.forEach((cacheKey) => cache.delete(cacheKey));
  } else {
    // 如果 cacheKey 为空，则清空所有缓存数据
    cache.clear();
  }
};

export { getCache, setCache, clearCache };

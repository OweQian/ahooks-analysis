type CachedKey = string | number;

const cachePromise = new Map<CachedKey, Promise<any>>();

const getCachePromise = (cacheKey: CachedKey) => {
  return cachePromise.get(cacheKey);
};

const setCachePromise = (cacheKey: CachedKey, promise: Promise<any>) => {
  // 应该缓存相同的 promise，不能是 promise.finally
  // Should cache the same promise, cannot be promise.finally
  // 因为 promise.finally 会改变 promise 的引用
  // Because the promise.finally will change the reference of the promise
  cachePromise.set(cacheKey, promise);

  // 监听 promise 状态，promise 成功或被拒绝，从缓存中删除对应的 cacheKey
  promise
    .then(res => {
      // 在 then 和 cache 中都将 promise 缓存删除
      cachePromise.delete(cacheKey);
      return res;
    })
    .catch(() => {
      // 在 then 和 cache 中都将 promise 缓存删除
      cachePromise.delete(cacheKey);
    });
};

export { getCachePromise, setCachePromise };


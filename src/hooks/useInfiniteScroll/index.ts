import { useMemo, useState } from "react";
import type { Data, InfiniteScrollOptions, Service } from "./types";
import useRequest from "../useRequest";
import useMemoizedFn from "../useMemoizedFn";
import useUpdateEffect from "../useUpdateEffect";
import useEventListener from "../useEventListener";
import { getTargetElement } from "utils/domTarget";
import { getClientHeight, getScrollHeight, getScrollTop } from "utils/rect";

const useInfiniteScroll = <TData extends Data>(
  service: Service<TData>,
  options: InfiniteScrollOptions<TData> = {}
) => {
  const {
    // 父级容器
    target,
    // 是否有最后一页的判断逻辑
    isNoMore,
    // 下拉自动加载，距离底部距离阈值
    threshold = 100,
    // 变化后，会自动触发 reload
    reloadDeps = [],
    manual,
    onBefore,
    onSuccess,
    onError,
    onFinally,
  } = options;

  // 聚合后的数据
  const [finalData, setFinalData] = useState<TData>();
  // 加载更多 loading
  const [loadingMore, setLoadingMore] = useState(false);

  const { loading, error, run, runAsync, cancel } = useRequest(
    // 入参，将上次请求返回的数据整合到新的参数中
    async (lastData?: TData) => {
      const currentData = await service(lastData);
      // 首次请求，直接设置
      if (!lastData) {
        setFinalData({
          ...currentData,
          list: [...(currentData.list ?? [])],
        });
      } else {
        setFinalData({
          ...currentData,
          list: [...(lastData.list ?? []), ...currentData.list],
        });
      }
      return currentData;
    },
    {
      manual,
      onFinally: (_, d, e) => {
        // 设置 loadingMore 为 false
        setLoadingMore(false);
        onFinally?.(d, e);
      },
      onBefore: () => onBefore?.(),
      onSuccess: (d) => {
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          scrollMethod();
        });
        onSuccess?.(d);
      },
      onError: (e) => onError?.(e),
    }
  );

  // 是否没有更多数据了，配置 options.isNoMore 后生效
  const noMore = useMemo(() => {
    if (!isNoMore) return false;
    return isNoMore(finalData);
  }, [finalData]);

  // 同步加载更多
  const loadMore = useMemoizedFn(() => {
    if (noMore) return;
    setLoadingMore(true);
    run(finalData);
  });

  // 异步加载更多
  const loadMoreAsync = useMemoizedFn(() => {
    if (noMore) return Promise.reject();
    setLoadingMore(true);
    return runAsync(finalData);
  });

  // 同步加载第一页数据
  const reload = () => {
    setLoadingMore(false);
    return run();
  };

  // 异步加载第一页数据
  const reloadAsync = () => {
    setLoadingMore(false);
    return runAsync();
  };

  // 监听 reloadDeps，变化后，自动触发 reload
  useUpdateEffect(() => {
    run();
  }, [...reloadDeps]);

  // 滚动
  const scrollMethod = () => {
    let el = getTargetElement(target);
    if (!el) {
      return;
    }

    el = el === document ? document.documentElement : el;

    const scrollTop = getScrollTop(el);
    const scrollHeight = getScrollHeight(el);
    const clientHeight = getClientHeight(el);

    // 判断滚动条是否到达底部或即将到达底部
    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      // 加载更多
      loadMore();
    }
  };

  // 监听滚动事件
  useEventListener(
    "scroll",
    () => {
      if (loading || loadingMore) {
        return;
      }
      scrollMethod();
    },
    { target }
  );

  return {
    data: finalData,
    loaading: !loadMore && loading,
    loadingMore,
    error,
    noMore,

    loadMore,
    loadMoreAsync,
    reload: useMemoizedFn(reload),
    reloadAsync: useMemoizedFn(reloadAsync),
    mutate: setFinalData,
    cancel,
  };
};

export default useInfiniteScroll;

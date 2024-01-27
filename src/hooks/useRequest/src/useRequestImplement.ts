import type {Options, Plugin, Result, Service} from './types';
import isDev from "../../../../utils/isDev";
import useLatest from "@/hooks/useLatest";
import useUpdate from "@/hooks/useUpdate";
import useCreation from "@/hooks/useCreation";
import useUnmount from "@/hooks/useUnmount";
import useMemoizedFn from "@/hooks/useMemoizedFn";
import useMount from "@/hooks/useMount";
import Fetch from "./Fetch";

function useRequestImplement<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options: Options<TData, TParams> = {},
  plugins: Plugin<TData, TParams>[] = [],
) {
  const { manual = false, ...rest } = options;

  if (isDev) {
    if (options.defaultParams && !Array.isArray(options.defaultParams)) {
      console.warn(`expected defaultParams is array, got ${typeof options.defaultParams}`);
    }
  }

  const fetchOptions = {
    manual,
    ...rest,
  };

  // service 实例
  const serviceRef = useLatest(service);

  const update = useUpdate();

  // 保证请求实例不会发生变化
  const fetchInstance = useCreation(() => {
    // 执行 某个 plugin 的 onInit 方法，初始化状态值
    const initState = plugins.map(p => p?.onInit?.(fetchOptions)).filter(Boolean);

    // 返回请求实例
    return new Fetch<TData, TParams>(
      serviceRef,
      fetchOptions,
      // 强制组件重新渲染
      update,
      Object.assign({}, ...initState),
    )
  }, []);

  fetchInstance.options = fetchOptions;
  // run all plugins hooks
  fetchInstance.pluginImpls = plugins.map(p => p(fetchInstance, fetchOptions));

  useMount(() => {
    // 默认 false，在初始化时自动执行 service
    if (!manual) {
      const params = fetchInstance.state.params || options.defaultParams || [];
      fetchInstance.run(...params);
    }
  });

  useUnmount(() => {
    // 组件卸载 取消
    fetchInstance.cancel();
  });

  // useRequest 返回值
  return {
    loading: fetchInstance.state.loading,
    data: fetchInstance.state.data,
    error: fetchInstance.state.error,
    params: fetchInstance.state.params || [],
    cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
    refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
    refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
    run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
    runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
    mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)),
  } as Result<TData, TParams>;
}

export default useRequestImplement;

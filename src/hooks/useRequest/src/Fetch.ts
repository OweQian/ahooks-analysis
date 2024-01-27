/* eslint-disable @typescript-eslint/no-parameter-properties */
import type { MutableRefObject } from 'react';
import type { FetchState, Options, PluginReturn, Service, Subscribe } from './types';
import {isFunction} from "../../../../utils";

/**
 * 插件化机制
 * 只负责完成整体流程的功能，额外的功能都交给插件去实现
 * 符合职责单一原则：一个 Plugin 只负责一件事，相互之间不相关，可维护性高、可测试性强
 * 符合深模块的软件设计理念。https://www.cnblogs.com/hhelibeb/p/10708951.html
 * 总结：对一个复杂功能的抽象，可以尽可能保证对外接口简单。内部实现需要遵循单一职责的原则，通过类似插件化的机制，细化拆分组件 / hook，从而提升组件可维护性、可测试性。
 * */
export default class Fetch<TData, TParams extends any[]> {
  // 插件执行后返回的方法列表
  pluginImpls: PluginReturn<TData, TParams>[];
  // 计数器(锁)
  count: number = 0;

  // 状态值 - 几个重要的数据
  state: FetchState<TData, TParams> = {
    loading: false,
    params: undefined,
    data: undefined,
    error: undefined,
  };

  constructor(
    // 请求示例 ref
    public serviceRef: MutableRefObject<Service<TData, TParams>>,
    public options: Options<TData, TParams>,
    // 订阅-更新函数
    public subscribe: Subscribe,
    // 初始状态值
    public initState: Partial<FetchState<TData, TParams>> = {},
  ) {
    this.state = {
      ...this.state,
      loading: !options.manual, // 非手动，loading 设为 true
      ...initState,
    };
  }

  // 更新状态函数
  setState(s: Partial<FetchState<TData, TParams>> = {}) {
    this.state = {
      ...this.state,
      ...s,
    };
    // 更新，通知 useRequestImplement 组件重新渲染，获取到最新状态值
    this.subscribe();
  }

  // 执行特定阶段的插件方法，包含了一个请求从开始到结束的生命周期（：Mutate 除外
  runPluginHandler(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {
    // @ts-ignore
    const r = this.pluginImpls.map((i) => i[event]?.(...rest)).filter(Boolean);
    // 返回值
    return Object.assign({}, ...r);
  }

  // 执行请求的核心方法！！！
  // 如果设置了 options.manual = true，则 useRequest 不会默认执行，需要通过 run 或者 runAsync 来触发执行。
  // runAsync 是一个返回 Promise 的异步函数，如果使用 runAsync 来调用，则意味着你需要自己捕获异常。
  async runAsync(...params: TParams): Promise<TData> {
    // 计数器（锁），cancel 请求需要
    this.count += 1;
    const currentCount = this.count;

    // 请求前
    const {
      stopNow = false,
      returnNow = false,
      ...state
    } = this.runPluginHandler('onBefore', params);

    // stop request
    if (stopNow) {
      return new Promise(() => {});
    }

    this.setState({
      // loading
      loading: true,
      params,
      ...state,
    });

    // return now
    // 立即返回，与缓存策略有关
    if (returnNow) {
      return Promise.resolve(state.data);
    }

    // options 的 onBefore 回调
    this.options.onBefore?.(params);

    // 执行请求
    try {
      // replace service
      // 与缓存策略有关，如果有 cache 的 service 实例，则直接使用缓存的实例
      let { servicePromise } = this.runPluginHandler('onRequest', this.serviceRef.current, params);

      if (!servicePromise) {
        servicePromise = this.serviceRef.current(...params);
      }

      const res = await servicePromise;

      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }

      // const formattedResult = this.options.formatResultRef.current ? this.options.formatResultRef.current(res) : res;

      // 更新状态
      this.setState({
        data: res,
        error: undefined,
        loading: false,
      });

      // options 的 onSuccess 回调
      this.options.onSuccess?.(res, params);

      // plugin 的 Onsuccess 事件
      this.runPluginHandler('onSuccess', res, params);

      // options 的 onFinally 回调
      this.options.onFinally?.(params, res, undefined);

      if (currentCount === this.count) {
        // plugin 的 onFinally 事件
        this.runPluginHandler('onFinally', params, res, undefined);
      }

      return res;
      // 异常捕获
    } catch (error) {
      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }

      // 更新状态
      this.setState({
        error,
        loading: false,
      });

      // options 的 onError 回调
      this.options.onError?.(error, params);

      // plugin 的 onError 事件
      this.runPluginHandler('onError', error, params);

      // options 的 onFinally 回调
      this.options.onFinally?.(params, undefined, error);

      // plugin 的 onFinally 事件
      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, undefined, error);
      }

      // 抛出异常
      throw error;
    }
  }

  // run 同步函数，其内部调用了 runAsync 方法
  run(...params: TParams) {
    this.runAsync(...params).catch((error) => {
      if (!this.options.onError) {
        console.error(error);
      }
    });
  }

  // 取消当前正在进行的请求
  cancel() {
    // 设置 this.count + 1，在 runAsync 的执行过程中，通过判断 currentCount !== this.count，达到取消请求的目的
    this.count += 1;
    this.setState({
      loading: false,
    });

    // 执行 plugin 的 onCancel
    this.runPluginHandler('onCancel');
  }

  // 使用上一次的 params，重新调用 run
  refresh() {
    // @ts-ignore
    this.run(...(this.state.params || []));
  }

  // 使用上一次的 params，重新调用 runAsync
  refreshAsync() {
    // @ts-ignore
    return this.runAsync(...(this.state.params || []));
  }

  // 修改 data
  mutate(data?: TData | ((oldData?: TData) => TData | undefined)) {
    const targetData = isFunction(data) ? data(this.state.data) : data;
    this.runPluginHandler('onMutate', targetData);
    this.setState({
      data: targetData,
    });
  }
}

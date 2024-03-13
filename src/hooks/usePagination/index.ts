import { useMemo } from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";
import useRequest from "@/hooks/useRequest";

import type {
  Data,
  PaginationOptions,
  PaginationResult,
  Params,
  Service,
} from "./types";

/**
 * 基于 useRequest，封装了常见的分页逻辑
 * */
const usePagination = <TData extends Data, TParams extends Params>(
  service: Service<TData, TParams>,
  options: PaginationOptions<TData, TParams> = {}
) => {
  const { defaultPageSize = 10, defaultCurrent = 1, ...rest } = options;

  // // service 约定返回的数据结构为 { total: number, list: Item[] }
  const result = useRequest(service, {
    // service 的默认参数为 { current: number, pageSize: number }
    defaultParams: [{ current: defaultCurrent, pageSize: defaultPageSize }],
    // refreshDeps 变化，会重置 current 到第一页，并重新发起请求
    refreshDepsAction: () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      changeCurrent(1);
    },
    ...rest,
  });

  const { current = 1, pageSize = defaultPageSize } = result.params[0] || {};

  // 计算总条数
  const total = result.data?.total || 0;
  // 计算总页数
  const totalPage = useMemo(
    () => Math.ceil(total / pageSize),
    [pageSize, total]
  );

  /**
   * c: current
   * p: pageSize
   * */
  const onChange = (c: number, p: number) => {
    let toCurrent = c < 0 ? 1 : c;
    const toPageSize = p <= 0 ? 1 : p;
    // 根据 total 和传入的 pageSize 计算当前总页数
    const tempTotalPage = Math.ceil(total / toPageSize);
    // 如果当前总页数小于当前要跳转的 current，需要将 current 赋值为当前总页数
    if (toCurrent > tempTotalPage) {
      toCurrent = Math.max(1, tempTotalPage);
    }

    const [oldPaginationParams = {}, ...restParams] = result.params || [];

    // 重新执行请求
    result.run(
      {
        ...oldPaginationParams,
        current: toCurrent,
        pageSize: toPageSize,
      },
      ...restParams
    );
  };

  const changeCurrent = (c: number) => {
    onChange(c, pageSize);
  };

  const changePageSize = (p: number) => {
    onChange(current, p);
  };

  // 额外返回 pagination 字段，包含所有分页信息，及操作分页的函数。
  return {
    ...result,
    pagination: {
      current,
      pageSize,
      total,
      totalPage,
      onChange: useMemoizedFn(onChange),
      changeCurrent: useMemoizedFn(changeCurrent),
      changePageSize: useMemoizedFn(changePageSize),
    },
  } as PaginationResult<TData, TParams>;
};

export default usePagination;

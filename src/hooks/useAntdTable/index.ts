import { useEffect, useRef, useState } from "react";
import useMemoizedFn from "../useMemoizedFn";
import usePagination from "../usePagination";
import useUpdateEffect from "../useUpdateEffect";

import type {
  Antd4ValidateFields,
  AntdTableOptions,
  AntdTableResult,
  Data,
  Params,
  Service,
} from "./types";

const useAntdTable = <TData extends Data, TParams extends Params>(
  service: Service<TData, TParams>,
  options: AntdTableOptions<TData, TParams> = {}
) => {
  const {
    // form 实例
    form,
    // 默认表单类型
    defaultType = "simple",
    // 默认参数，第一项为分页数据，第二项为表单数据
    defaultParams,
    manual = false,
    refreshDeps = [],
    ready = true,
    ...rest
  } = options;

  // 分页
  const result = usePagination<TData, TParams>(service, {
    manual: true,
    ...rest,
    onSuccess(...args) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      runSuccessRef.current = true;
      rest.onSuccess?.(...args);
    },
  });

  const { params = [], run } = result;

  const cacheFormTableData = params[2] || ({} as any);

  const [type, setType] = useState(cacheFormTableData?.type || defaultType);

  const allFormDataRef = useRef<Record<string, any>>({});
  const defaultDataSourceRef = useRef([]);
  const runSuccessRef = useRef(false);

  // 判断是否为 antd v4
  const isAntdV4 = !!form?.getInternalHooks;

  // get current active field values
  // 获取表单值
  const getActiveFieldValues = () => {
    if (!form) {
      return {};
    }

    // antd v4
    if (isAntdV4) {
      return form.getFieldsValue(null, () => true);
    }

    // antd v3
    const allFieldsValue = form.getFieldsValue();
    const activeFieldsValue = {};
    Object.keys(allFieldsValue).forEach((key: string) => {
      if (form.getFieldInstance ? form.getFieldInstance(key) : true) {
        activeFieldsValue[key] = allFieldsValue[key];
      }
    });
    return activeFieldsValue;
  };

  // 校验表单
  const validateFields = (): Promise<Record<string, any>> => {
    if (!form) {
      return Promise.resolve({});
    }

    const activeFieldsValue = getActiveFieldValues();
    const fields = Object.keys(activeFieldsValue);

    // antd v4
    if (isAntdV4) {
      return (form.validateFields as Antd4ValidateFields)(fields);
    }

    // antd v3
    return new Promise((resolve, reject) => {
      form.validateFields(fields, (errors, values) => {
        if (errors) {
          reject(errors);
        } else {
          resolve(values);
        }
      });
    });
  };

  // 重置表单
  const restoreForm = () => {
    if (!form) {
      return;
    }

    // antd v4
    if (isAntdV4) {
      return form.setFieldsValue(allFormDataRef.current);
    }

    // antd v3
    const activeFieldsValue = {};
    Object.keys(allFormDataRef.current).forEach((key) => {
      if (form.getFieldInstance ? form.getFieldInstance(key) : true) {
        activeFieldsValue[key] = allFormDataRef.current[key];
      }
    });
    form.setFieldsValue(activeFieldsValue);
  };

  // 修改表单类型
  const changeType = () => {
    // 获取表单值
    const activeFieldsValue = getActiveFieldValues();
    // 修改表单值
    allFormDataRef.current = {
      ...allFormDataRef.current,
      ...activeFieldsValue,
    };
    setType((t) => (t === "simple" ? "advance" : "simple"));
  };

  // change search type, restore form data
  // 修改 type，重置 form 表单数据
  useUpdateEffect(() => {
    if (!ready) {
      return;
    }
    restoreForm();
  }, [type]);

  const _submit = (initPagination?: TParams[0]) => {
    if (!ready) {
      return;
    }

    setTimeout(() => {
      // 表单校验
      validateFields()
        .then((values = {}) => {
          // 分页逻辑
          const pagination = initPagination || {
            pageSize: options.defaultPageSize || 10,
            ...(params?.[0] || {}),
            current: 1,
          };
          // 如果没有 form，直接根据分页逻辑进行请求
          if (!form) {
            // @ts-ignore
            run(pagination);
            return;
          }

          // 获取到当前所有的 form Data
          // record all form data
          allFormDataRef.current = {
            ...allFormDataRef.current,
            ...values,
          };

          // @ts-ignore
          run(pagination, values, {
            allFormData: allFormDataRef.current,
            type,
          });
        })
        .catch((err) => err);
    });
  };

  // 重置表单
  const reset = () => {
    if (form) {
      form.resetFields();
    }

    _submit({
      ...(defaultParams?.[0] || {}),
      pageSize:
        options.defaultPageSize || options.defaultParams?.[0]?.pageSize || 10,
      current: 1,
    });
  };

  // 提交表单
  const submit = (e?: any) => {
    e?.preventDefault?.();
    _submit(
      runSuccessRef.current
        ? undefined
        : {
            pageSize:
              options.defaultPageSize ||
              options.defaultParams?.[0]?.pageSize ||
              10,
            current: 1,
            ...(defaultParams?.[0] || {}),
          }
    );
  };

  // 分页、排序、筛选变化时触发
  const onTableChange = (
    pagination: any,
    filters: any,
    sorter: any,
    extra: any
  ) => {
    const [oldPaginationParams, ...restParams] = params || [];
    run(
      // @ts-ignore
      {
        ...oldPaginationParams,
        current: pagination.current,
        pageSize: pagination.pageSize,
        filters,
        sorter,
        extra,
      },
      ...restParams
    );
  };

  // init
  useEffect(() => {
    // if has cache, use cached params. ignore manual and ready.
    if (params.length > 0) {
      allFormDataRef.current = cacheFormTableData?.allFormData || {};
      restoreForm();
      // @ts-ignore
      run(...params);
      return;
    }

    if (!manual && ready) {
      allFormDataRef.current = defaultParams?.[1] || {};
      restoreForm();
      _submit(defaultParams?.[0]);
    }
  }, []);

  // refresh & ready change on the same time
  const hasAutoRun = useRef(false);
  hasAutoRun.current = false;

  // ready 状态变化时的副作用
  useUpdateEffect(() => {
    if (!manual && ready) {
      hasAutoRun.current = true;
      if (form) {
        form.resetFields();
      }
      allFormDataRef.current = defaultParams?.[1] || {};
      restoreForm();
      _submit(defaultParams?.[0]);
    }
  }, [ready]);

  // 依赖项变化时的副作用
  useUpdateEffect(() => {
    if (hasAutoRun.current) {
      return;
    }

    if (!ready) {
      return;
    }

    if (!manual) {
      hasAutoRun.current = true;
      result.pagination.changeCurrent(1);
    }
  }, [...refreshDeps]);

  return {
    ...result,
    tableProps: {
      dataSource: result.data?.list || defaultDataSourceRef.current,
      loading: result.loading,
      onChange: useMemoizedFn(onTableChange),
      pagination: {
        current: result.pagination.current,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total,
      },
    },
    search: {
      submit: useMemoizedFn(submit),
      type,
      changeType: useMemoizedFn(changeType),
      reset: useMemoizedFn(reset),
    },
  } as AntdTableResult<TData, TParams>;
};

export default useAntdTable;

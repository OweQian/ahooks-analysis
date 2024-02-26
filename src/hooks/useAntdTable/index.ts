
import type {AntdTableOptions, Data, Params, Service} from './type';
import usePagination from "@/hooks/usePagination";
import {useRef, useState} from "react";

const useAntdTable = <TData extends Data, TParams extends Params>(
  service: Service<TData, TParams>,
  options: AntdTableOptions<TData, TParams> = {},
) => {
  const {
    form,
    defaultType = 'simple',
    defaultParams,
    manual = false,
    refreshDeps = [],
    ready = true,
    ...rest
  } = options;

  const result = usePagination<TData, TParams>(service, {
    manual: true,
    ...rest,
    onSuccess(...args) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      runSuccessRef.current = true;
      rest.onSuccess?.(...args);
    }
  });

  const { params = [], run } = result;

  const cacheFormTableData = params[2] || ({} as any);

  const [type, setType] = useState(cacheFormTableData?.type || defaultType);

  const allFormDataRef = useRef<Record<string, any>>({});
  const defaultDataSourceRef = useRef([]);
  const runSuccessRef = useRef(false);

  const isAntdV4 = !!form?.getInternalHooks;

  // get current active field values
  const getActiveFieldValues = () => {
    if (!form) {
      return {};
    }

    // antd4
    if (isAntdV4) {}
  }

}

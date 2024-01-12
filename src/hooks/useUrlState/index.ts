import queryString from 'query-string';
import type {ParseOptions, StringifyOptions} from "query-string";
import * as tmp from 'react-router';
import useUpdate from "@/hooks/useUpdate";
import {useMemo, useRef} from "react";
import useMemoizedFn from "@/hooks/useMemoizedFn";

// ignore waring `"export 'useNavigate' (imported as 'rc') was not found in 'react-router'`
const rc = tmp as any;

/**
 * navigateMode: 状态变更时切换 history 的方式
 * parseOptions: query-string parse 的配置
 * stringifyOptions: query-string stringify 的配置
 * */
export interface Options {
  navigateMode?: 'push' | 'replace';
  parseOptions?: ParseOptions;
  stringifyOptions?: StringifyOptions;
}

const baseParseConfig: ParseOptions = {
  parseNumbers: false,
  parseBooleans: false,
};

const baseStringifyConfig: ParseOptions = {
  parseNumbers: false,
  parseBooleans: false,
};

type UrlState = Record<string, any>;

const useUrlState = <S extends UrlState = UrlState>(initialState?: S | (() => S), options?: Options) => {
  type State = Partial<{[key in keyof S]: any}>;

  const { navigateMode = 'push', parseOptions, stringifyOptions} = options || {};

  const mergedParseOptions = { ...baseParseConfig, ...parseOptions };
  const mergedStringifyOptions = { ...baseStringifyConfig, ...stringifyOptions };

  // 返回表示当前 URL 的 location 对象
  // https://reactrouter.com/en/main/hooks/use-location
  const location = rc.useLocation();

  // 浏览器的曾经在标签页或者框架里访问的会话历史记录
  // https://v5.reactrouter.com/web/api/Hooks/usehistory
  // react-router v5
  const history = rc.useHistory?.();

  // https://reactrouter.com/en/main/hooks/use-navigate
  // react-router v6
  const navigate = rc.useNavigate?.();

  // 强制渲染函数
  const update = useUpdate();

  // 初始状态对象
  const initialStateRef = useRef(typeof initialState === 'function' ? (initialState as () => S)() : initialState || {});

  // 从 URL 中解析查询参数对象
  const queryFromUrl = useMemo(() => {
    return queryString.parse(location.search, mergedParseOptions);
  }, [location.search]);

  // 组合查询参数对象
  // 多状态管理（拆分）
  const targetQuery: State = useMemo(() => {
    return {
      ...initialStateRef.current,
      ...queryFromUrl,
    }
  }, [queryFromUrl]);

  // 设置 url 状态
  const setState = (s: React.SetStateAction<State>) => {
    // 根据传入的 s，获取到新的状态 newQuery，支持 function 方式
    const newQuery = typeof s === 'function' ? s(targetQuery) : s;

    // 如果 setSate 后，search 没变化，就需要 update 来触发一次更新
    // update 和 history 的更新会合并，不会造成多次更新
    update();

    // state 属性，用于存储与当前位置相关的状态
    if (history) {
      history[navigateMode]({
        hash: location.hash,
        search: queryString.stringify({...queryFromUrl, ...newQuery}, mergedStringifyOptions) || '?',
      }, location.state);
    }
    if (navigate) {
      navigate({
        hash: location.hash,
        search: queryString.stringify({...queryFromUrl, ...newQuery}, mergedStringifyOptions) || '?',
      }, {
        replace: navigateMode === 'replace',
        state: location.state,
      })
    }
  }

  return [targetQuery, useMemoizedFn(setState)] as const;
};

export default useUrlState;

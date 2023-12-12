import {useEffect, useRef, useState} from "react";

type JsOptions = {
  type: 'js',
  js?: Partial<HTMLScriptElement>,
  keepWhenUnused?: boolean,
};

type CssOptions = {
  type: 'css',
  css?: Partial<HTMLStyleElement>,
  keepWhenUnused?: boolean;
};

type DefaultOptions = {
  type?: never,
  js?: Partial<HTMLScriptElement>,
  css?: Partial<HTMLStyleElement>,
  keepWhenUnused?: boolean;
};

export type Options = JsOptions | CssOptions | DefaultOptions;

export type Status = 'unset' | 'loading' | 'ready' | 'error';

interface loadResult {
  ref: Element;
  status: Status;
}

// {[path]: count}
// remove external when no used
const EXTERNAL_USED_COUNT: Record<string, number> = {};

const loadingScript = (path: string, props = {}): loadResult => {
  // 判断是否已经有 JS 资源
  const script = document.querySelector(`script[src="${path}"]`);

  // 没有，则创建
  if (!script) {
    const newScript = document.createElement('script');
    newScript.src = path;

    // 设置属性
    Object.keys(props).forEach(key => {
      newScript[key] = props[key];
    });

    // 更新状态
    newScript.setAttribute('data-status', 'loading');
    // 在 body 标签中插入
    document.body.appendChild(newScript);

    return {
      ref: newScript,
      status: 'loading',
    };
  }

  // 有则直接返回，并取 data-status 中的值
  return {
    ref: script,
    status: (script.getAttribute('data-status') as Status) || 'ready',
  }
};

const loadCss = (path: string, props = {}): loadResult => {
  // 判断是否已经有 CSS 资源
  const css = document.querySelector(`link[href="${path}"]`);

  // 没有，则创建
  if (!css) {
    const newCss = document.createElement('link');

    newCss.rel = 'stylesheet';
    newCss.href = path;

    // 设置属性
    Object.keys(props).forEach(key => {
      newCss[key] = props[key];
    });

    /**
     * 在旧版本的 IE 浏览器中，hideFocus 属性用于控制元素在获得焦点时是否显示虚拟框
     * relList 是一个新的属性，允许开发者访问和操作元素的 rel 属性列表
     * 如果条件满足，将 newCss 元素的 rel 属性设置为 preload(预加载)
     * 将 newCss 元素的 as 属性设置为 'style'，告诉浏览器这是一个样式表资源
     * */
    // IE9+
    const isLegacyIECss = 'hideFocus' in newCss;
    // use preload in IE Edge (to detect load errors)
    if (isLegacyIECss && newCss.relList) {
      newCss.rel = 'preload';
      newCss.as = 'style';
    }

    // 更新状态
    newCss.setAttribute('data-status', 'loading');
    // 在 head 标签中插入
    document.head.appendChild(newCss);

    return {
      ref: css,
      status: 'loading',
    }
  }

  // 有则直接返回，并取 data-status 中的值
  return {
    ref: css,
    status: (css.getAttribute('data-status') as Status) || 'ready',
  }
};

const useExternal = (path?: string, options?: Options) => {
  const [status, setStatus] = useState<Status>(path ? 'loading' : 'unset');

  const ref = useRef<Element>();

  useEffect(() => {
    if (!path) {
      setStatus('unset');
      return;
    }

    // 处理路径
    const pathname = path.replace(/[|#].*$/, '');

    // 判断是 CSS 类型
    if (options?.type === 'css' || (!options?.type && /(^css!|\.css$)/.test(pathname))) {
      const result = loadCss(path, options?.css);
      ref.current = result.ref;
      setStatus(result.status);
      // 判断是 JS 类型
    } else if (options?.type === 'js' || (!options?.type && /(^js!|\.js$)/.test(pathname))) {
      const result = loadingScript(path, options?.js);
      ref.current = result.ref;
      setStatus(result.status);
    } else {
      console.error(
        "Cannot infer the type of external resource, and please provide a type ('js' | 'css'). " +
        'Refer to the https://ahooks.js.org/hooks/dom/use-external/#options',
      );
    }

    if (!ref.current) {
      return;
    }

    // 记录资源引用数量
    if (EXTERNAL_USED_COUNT[path] === undefined) {
      EXTERNAL_USED_COUNT[path] = 1;
    } else {
      EXTERNAL_USED_COUNT[path] += 1;
    }

    const handler = (event: Event) => {
      // 判断和设置加载状态
      const targetStatus = event.type === 'load' ? 'ready' : 'error';
      ref.current?.setAttribute('data-status', targetStatus);
      setStatus(targetStatus);
    };

    // / 监听文件加载情况
    ref.current.addEventListener('load', handler);
    ref.current.addEventListener('error', handler);
    return () => {
      // 清除副作用
      ref.current?.removeEventListener('load', handler);
      ref.current?.removeEventListener('error', handler);

      EXTERNAL_USED_COUNT[path] -= 1;

      // 在不持有资源的引用后，从 DOM 中移除 element
      if (EXTERNAL_USED_COUNT[path] === 0 && !options?.keepWhenUnused) {
        ref.current?.remove();
      }

      ref.current = undefined;
    }
  }, [path]);

  return status;
};

export default useExternal;

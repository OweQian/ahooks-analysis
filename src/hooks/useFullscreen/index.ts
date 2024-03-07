import { useEffect, useRef, useState } from "react";
import screenfull from "screenfull";
import useLatest from "@/hooks/useLatest";
import useMemoizedFn from "@/hooks/useMemoizedFn";
import type { BasicTarget } from "../../../utils/domTarget";
import { getTargetElement } from "../../../utils/domTarget";
import { isBoolean } from "../../../utils";

export interface PageFullscreenOptions {
  className?: string;
  zIndex?: number;
}

export interface Options {
  onExit?: () => void;
  onEnter?: () => void;
  pageFullscreen?: boolean | PageFullscreenOptions;
}

const useFullscreen = (target: BasicTarget, options?: Options) => {
  const { onExit, onEnter, pageFullscreen = false } = options || {};

  // 设置 className 和 zIndex 的默认值
  const { className = "ahooks-page-fullscreen", zIndex = 999999 } =
    isBoolean(pageFullscreen) || !pageFullscreen ? {} : pageFullscreen;

  // 当前是否处于全屏状态
  const getIsFullscreen = () =>
    screenfull.isEnabled &&
    !!screenfull.element &&
    screenfull.element === getTargetElement(target);

  const onExitRef = useLatest(onExit);
  const onEnterRef = useLatest(onEnter);

  const [state, setState] = useState(getIsFullscreen);
  // 引用当前的全屏状态
  const stateRef = useRef(getIsFullscreen());

  // 根据全屏状态调用相应的回调函数
  const invokeCallback = (fullscreen: boolean) => {
    if (fullscreen) {
      onEnterRef.current?.();
    } else {
      onExitRef.current?.();
    }
  };

  // 更新全屏状态，触发相应的回调函数
  const updateFullscreenState = (fullscreen: boolean) => {
    if (stateRef.current !== fullscreen) {
      invokeCallback(fullscreen);
      setState(fullscreen);
      stateRef.current = fullscreen;
    }
  };

  // 监听全屏状态变化，更新全屏状态
  const onScreenfullChange = () => {
    const fullscreen = getIsFullscreen();
    updateFullscreenState(fullscreen);
  };

  // 切换页面全屏状态
  const togglePageFullscreen = (fullscreen: boolean) => {
    const el = getTargetElement(target);
    if (!el) {
      return;
    }

    let styleElem = document.getElementById(className);

    // 全屏
    if (fullscreen) {
      el.classList.add(className);

      // 全屏样式
      if (!styleElem) {
        styleElem = document.createElement("style");
        styleElem.setAttribute("id", className);
        styleElem.textContent = `
          .${className} {
            position: fixed; left: 0; top: 0; right: 0; bottom: 0;
            width: 100% !important; height: 100% !important;
            z-index: ${zIndex};
          }
        `;
        el.appendChild(styleElem);
      }
    } else {
      // 退出全屏
      el.classList.remove(className);

      if (styleElem) {
        styleElem.remove();
      }
    }

    // 更新全屏状态
    updateFullscreenState(fullscreen);
  };

  // 进入全屏状态
  const enterFullscreen = () => {
    const el = getTargetElement(target);

    if (!el) {
      return;
    }

    // 页面全屏
    if (pageFullscreen) {
      togglePageFullscreen(true);
      return;
    }
    // 元素全屏
    if (screenfull.isEnabled) {
      try {
        screenfull.request(el);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 退出全屏状态
  const exitFullscreen = () => {
    const el = getTargetElement(target);

    if (!el) {
      return;
    }

    // 页面退出全屏
    if (pageFullscreen) {
      togglePageFullscreen(false);
      return;
    }
    // 元素退出全屏
    if (screenfull.isEnabled && screenfull.element === el) {
      screenfull.exit();
    }
  };

  // 切换全屏状态
  const toggleFullscreen = () => {
    if (state) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  useEffect(() => {
    // 当前环境是否支持全屏或页面已经处于全屏
    if (!screenfull.isEnabled || pageFullscreen) {
      return;
    }

    // 监听全屏状态变化
    screenfull.on("change", onScreenfullChange);

    return () => {
      // 取消对全屏状态变化的监听
      screenfull.off("change", onScreenfullChange);
    };
  }, []);

  return [
    state,
    {
      enterFullscreen: useMemoizedFn(enterFullscreen),
      exitFullscreen: useMemoizedFn(exitFullscreen),
      toggleFullscreen: useMemoizedFn(toggleFullscreen),
      isEnabled: screenfull.isEnabled,
    },
  ] as const;
};

export default useFullscreen;

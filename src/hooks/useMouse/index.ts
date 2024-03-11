import useRafState from "@/hooks/useRafState";
import useEventListener from "@/hooks/useEventListener";
import type { BasicTarget } from "../../../utils/domTarget";
import { getTargetElement } from "../../../utils/domTarget";

/**
 * screenX: 距离显示器左侧的距离（屏幕）
 * screenY: 距离显示器顶部的距离（屏幕）
 * clientX: 距离当前视窗左侧的距离（视窗）
 * clientY: 距离当前视窗顶部的距离（视窗）
 * pageX: 距离完整页面左侧的距离（clientX + 文档在水平方向上已经滚动的像素数）
 * pageY: 距离完整页面顶部的距离（clientY + 文档在垂直方向上已经滚动的像素数）
 * elementX: 距离指定元素左侧的距离
 * elementY: 距离指定元素顶部的距离
 * elementH: 指定元素的高
 * elementW: 指定元素的宽
 * elementPosX: 指定元素距离完整页面左侧的距离（：left + window.pageXOffset)
 * elementPosY: 指定元素距离完整页面顶部的距离（：top + window.pageYOffset)
 * window.pageXOffset: 表示文档在水平方向上已经滚动的像素数
 * window.pageYOffset: 表示文档在垂直方向上已经滚动的像素数
 * */

export interface CursorState {
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  elementX: number;
  elementY: number;
  elementH: number;
  elementW: number;
  elementPosX: number;
  elementPosY: number;
}

const initState: CursorState = {
  screenX: NaN,
  screenY: NaN,
  clientX: NaN,
  clientY: NaN,
  pageX: NaN,
  pageY: NaN,
  elementX: NaN,
  elementY: NaN,
  elementH: NaN,
  elementW: NaN,
  elementPosX: NaN,
  elementPosY: NaN,
};

const useMouse = (target?: BasicTarget) => {
  const [state, setState] = useRafState(initState);

  // 监听 mousemove
  useEventListener(
    "mousemove",
    (event: MouseEvent) => {
      const { screenX, screenY, clientX, clientY, pageX, pageY } = event;
      const newState = {
        screenX,
        screenY,
        clientX,
        clientY,
        pageX,
        pageY,
        elementX: NaN,
        elementY: NaN,
        elementH: NaN,
        elementW: NaN,
        elementPosX: NaN,
        elementPosY: NaN,
      };

      const targetElement = getTargetElement(target);
      if (targetElement) {
        // 获取目标元素的位置信息
        const { left, top, width, height } =
          targetElement.getBoundingClientRect();
        // 计算鼠标相对于目标元素的位置信息
        newState.elementPosX = left + window.pageXOffset;
        newState.elementPosY = top + window.pageYOffset;
        newState.elementX = pageX - newState.elementPosX;
        newState.elementY = pageY - newState.elementPosY;
        newState.elementH = height;
        newState.elementW = width;
      }
      setState(newState);
    },
    {
      target: () => document,
    }
  );

  return state;
};

export default useMouse;

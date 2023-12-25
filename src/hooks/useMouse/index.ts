import {BasicTarget, getTargetElement} from "../../../utils/domTarget";
import useRafState from "@/hooks/useRafState";
import useEventListener from "@/hooks/useEventListener";

/**
 * screenX: 距离显示器左侧的距离（电脑屏幕）
 * screenY: 距离显示器顶部的距离（电脑屏幕）
 * clientX: 距离当前视窗左侧的距离（浏览器窗口）
 * clientY: 距离当前视窗顶部的距离（浏览器窗口）
 * pageX: 距离完整页面左侧的距离（clientX + 横向滚动条距离）
 * pageY: 距离完整页面顶部的距离（clientY + 横向滚动条距离）
 * elementH: 指定元素的高
 * elementW: 指定元素的宽
 * elementPosX: 指定元素距离完整页面左侧的距离（：left + window.pageXOffset)
 * elementPosY: 指定元素距离完整页面顶部的距离（：left + window.pageYOffset)
 * elementX: 距离指定元素左侧的距离
 * elementY: 距离指定元素顶部的距离
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
}

const useMouse = (target?: BasicTarget) => {
  const [state, setState] = useRafState(initState);

  // 监听 mousemove
  useEventListener(
    'mousemove',
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
        // 目标元素的大小及其相对于当前视窗的位置
        const { left, top, width, height } = targetElement.getBoundingClientRect();
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
  )

  return state;
};

export default useMouse;

import {BasicTarget, getTargetElement} from "../../../utils/domTarget";
import {useRef, useState} from "react";
import useEffectWithTarget from "../../../utils/useEffectWithTarget";

interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  height: number;
  width: number;
}

export interface State extends Rect {
  text: string;
}

const initRect: Rect = {
  top: NaN,
  left: NaN,
  bottom: NaN,
  right: NaN,
  height: NaN,
  width: NaN,
};

const initState: State = {
  text: '',
  ...initRect,
};

function getRectFromSelection(selection: Selection | null): Rect {
  if (!selection) {
    return initRect;
  }

  // rangeCount readonly 返回该选区所包含的连续范围的数量
  if (selection.rangeCount < 1) {
    return initRect;
  }

  // getRangeAt() 方法返回一个包含当前选区内容的区域对象
  // index 指定需要被处理的子级编号（从 0 开始），如果该数值被错误的赋予了大于或等于 rangeCount 结果的数字，将会产生错误
  const range = selection.getRangeAt(0);

  // range.getBoundingClientRect() 返回一个 DOMRect 对象，其绑定了 Range 的整个内容
  const {height, width, top, left, right, bottom} = range.getBoundingClientRect();
  return {
    height,
    width,
    top,
    left,
    right,
    bottom,
  }
}
const useTextSelection = (target?: BasicTarget<Document | Element>): State => {
  const [state, setState] = useState(initState);

  const stateRef = useRef(state);
  const isInRangeRef = useRef(false);
  stateRef.current = state;

  useEffectWithTarget(() => {
    // 获取目标元素
    const el = getTargetElement(target, document);
    if (!el) {
      return;
    }

    // 鼠标松开时触发回调，获取选取的文本及位置信息
    const mouseupHandler = () => {
      let selObj: Selection | null = null;
      let text = '';
      let rect = initRect;
      if (!window.getSelection) return;
      selObj = window.getSelection();
      // toString() 方法返回当前选区的纯文本内容
      text = selObj ? selObj.toString() : '';

      if (text && isInRangeRef.current) {
        rect = getRectFromSelection(selObj);
        setState({...state, text, ...rect});
      }
    };

    // 鼠标按下时触发回调，重置状态、清除选区
    const mousedownHandler = (e) => {
      // 如果按下的是右键，则立即返回，这样选中的数据就不会被清空
      if (e.button === 2) return;

      if (!window.getSelection) return;

      // 重置状态
      if (stateRef.current.text) {
        setState({...initState});
      }
      isInRangeRef.current = false;

      // 清除选区
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getSelection
      // 返回一个 Selection 对象，表示用户选择的文本范围或光标的当前位置
      const selObj = window.getSelection();
      if (!selObj) return;
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Selection/removeAllRanges
      // Selection.removeAllRanges() 方法会将所有的区域都从选取中移除，只留下 anchorNode 和focusNode 属性并将其设置为 null
      // anchorNode readonly 返回该选区起点所在的节点
      // focusNode readonly 返回该选区终点所在的节点
      selObj.removeAllRanges();

      // 检查元素 el 是否包含鼠标事件的目标元素
      isInRangeRef.current = el.contains(e.target);
    };

    // 监听 mouseup 和 mousedown
    el.addEventListener('mouseup', mouseupHandler);
    document.addEventListener('mousedown', mousedownHandler);

    return () => {
      el.removeEventListener('mouseup', mouseupHandler);
      document.removeEventListener('mousedown', mousedownHandler);
    }
  }, [], target);

  return state;
};

export default useTextSelection;
